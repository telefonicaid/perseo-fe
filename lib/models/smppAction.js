/*
 * Copyright 2017 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of perseo-fe
 *
 * perseo-fe is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * perseo-fe is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with perseo-fe.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[contacto@tid.es]
 */
'use strict';

var logger = require('logops'),
    config = require('../../config'),
    myutils = require('../myutils'),
    smpp = require('smpp'),
    alarm = require('../alarm'),
    metrics = require('./metrics');

function buildSMPPOptions(action, event) {
    var options = {
        text: myutils.expandVar(action.template, event, true),
        to: myutils.expandVar(action.parameters.to, event, false) // it is expected be string number
    };
    if (action.parameters.smpp) {
        options.smpp = {};
        if (action.parameters.smpp.from) {
            options.smpp.from = myutils.expandVar(action.parameters.smpp.from, event, true);
        }
        if (action.parameters.smpp.host) {
            options.smpp.host = myutils.expandVar(action.parameters.smpp.host, event, true);
        }
        if (action.parameters.smpp.port) {
            options.smpp.port = myutils.expandVar(action.parameters.smpp.port, event, true);
        }
        if (action.parameters.smpp.systemid) {
            options.smpp.systemid = myutils.expandVar(action.parameters.smpp.systemid, event, true);
        }
        if (action.parameters.smpp.password) {
            options.smpp.password = myutils.expandVar(action.parameters.smpp.password, event, true);
        }
    }
    return options;
}

function doIt(action, event, callback) {
    let session;
    let callbackCalled = false;

    const safeCallback = (err, result) => {
        if (!callbackCalled) {
            callbackCalled = true;
            callback(err, result);
        }
    };

    try {
        const options = buildSMPPOptions(action, event);
        const from = (options.smpp && options.smpp.from) || config.smpp.from;
        const msg = {
            to: options.to,
            message: options.text,
            from: from
        };

        metrics.IncMetrics(event.service, event.subservice, metrics.actionSMPP);

        const lookupPDUStatusKey = (pduCommandStatus) => {
            for (const k in smpp.errors) {
                if (smpp.errors[k] === pduCommandStatus) return k;
            }
            return null;
        };

        const sendSMPP = (from, toList, text) => {
            let recipients = [];
            // Normalice several formats for field "to"
            if (Array.isArray(toList)) {
                recipients = toList;
            } else if (typeof toList === 'string') {
                // Split by , or ; and remove blanks
                recipients = toList
                    .split(/[,;]+/)
                    .map((num) => num.trim())
                    .filter((num) => num.length > 0);
            } else {
                recipients = [String(toList)];
            }
            logger.debug('SMPP SMS from: %s, to: %j, text: %s', from, recipients, text);
            const sendOne = (to) =>
                new Promise((resolve, reject) => {
                    // eslint-disable-next-line camelcase
                    session.submit_sm(
                        {
                            source_addr_ton: 1,
                            source_addr_npi: 1,
                            destination_addr_ton: 1,
                            destination_addr_npi: 1,
                            source_addr: from.toString(),
                            destination_addr: to.toString(),
                            short_message: text
                        },
                        function(pdu) {
                            if (pdu.command_status === 0) {
                                logger.info('Message to %s successfully sent (id: %s)', to, pdu.message_id);
                                metrics.IncMetrics(event.service, event.subservice, metrics.okActionSMPP);
                                alarm.release(alarm.SMPP);
                                resolve({ to, status: 'sent', id: pdu.message_id });
                            } else {
                                const statusKey = lookupPDUStatusKey(pdu.command_status);
                                logger.warn('Message to %s not successfully sent, status %s', to, statusKey);
                                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
                                alarm.raise(alarm.SMPP);
                                reject(new Error(`SMPP send failed to ${to}: ${statusKey || pdu.command_status}`));
                            }
                        }
                    );
                });

            Promise.allSettled(recipients.map(sendOne))
                .then((results) => {
                    const failed = results.filter((r) => r.status === 'rejected');
                    if (failed.length > 0) {
                        const errorMessages = failed.map((f) => f.reason.message).join('; ');
                        safeCallback(new Error(`Some messages failed: ${errorMessages}`));
                    } else {
                        safeCallback(null, results.map((r) => r.value));
                    }
                })
                .catch((err) => {
                    safeCallback(err);
                });
        };

        const host = (options.smpp && options.smpp.host) || config.smpp.host;
        const port = (options.smpp && options.smpp.port) || config.smpp.port;
        logger.debug('SMPP session host: %s, port: %s', host, port);

        session = new smpp.Session({ host, port });

        session.on('connect', function() {
            const systemid = (options.smpp && options.smpp.systemid) || config.smpp.systemid;
            const password = (options.smpp && options.smpp.password) || config.smpp.password;

            logger.debug('SMPP session on connect system_id: %s', systemid);
            session.bind_transceiver({ system_id: systemid, password: password }, function(pdu) {
                if (pdu.command_status === 0) {
                    logger.info('SMPP successfully bound');
                    sendSMPP(from, options.to, options.text);
                } else {
                    const statusKey = lookupPDUStatusKey(pdu.command_status);
                    logger.warn('SMPP bind failed, status %s', statusKey);
                    metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
                    safeCallback(new Error(`SMPP bind failed: ${statusKey || pdu.command_status}`));
                }
            });
        });

        session.on('error', function(error) {
            logger.error('SMPP error %j', error);
            metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
            alarm.raise(alarm.SMPP);
            safeCallback(error);
        });

        session.on('close', function() {
            logger.debug('SMPP disconnected');
            if (!callbackCalled) {
                safeCallback(new Error('SMPP connection closed unexpectedly'));
            }
        });
    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
        safeCallback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildSMPPOptions = buildSMPPOptions;
