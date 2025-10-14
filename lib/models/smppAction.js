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
/* jshint camelcase: false */

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

/**
 * Normalize a phone number for SMPP submission and determine its TON/NPI.
 *
 * Automatically detects if the number is:
 *   - international (E.164),
 *   - national (within the same country),
 *   - or short code (service / network-specific).
 *
 * It also strips unwanted characters such as '+', '00', spaces, dots, or dashes.
 *
 * @param {string|number} input - The phone number to normalize.
 * @param {string} [defaultCountryCode='34'] - Default country code (e.g., '34' for Spain).
 * @returns {{ number: string, ton: number, npi: number, type: string }}
 *   - number: cleaned number (no '+', '00', spaces, etc.)
 *   - ton: Type of Number (1=International, 2=National, 3=Network specific, 5=Alphanumeric)
 *   - npi: Numbering Plan Indicator (1=ISDN/E.164)
 *   - type: 'international' | 'national' | 'short'
 */
function normalizeNumber(input, defaultCountryCode = config.smpp.defaultCountryCode) {
    if (!input) {
        logger.error('Empty or undefined phone number');
        throw new Error('Empty or undefined phone number');
    }

    let num = String(input).trim();

    // Remove spaces, hyphens, and dots
    num = num.replace(/[\s-.]/g, '');

    // Remove '+' or '00' prefixes (international indicators)
    if (num.startsWith('+')) {
        num = num.slice(1);
    }
    if (num.startsWith('00')) {
        num = num.slice(2);
    }

    // Initialize SMPP fields
    let ton, npi, type;

    if (/^\d{3,6}$/.test(num)) {
        // 3–6 digits → short code (e.g., service numbers like 1234)
        ton = 3; // Network specific
        npi = 1; // ISDN / E.164
        type = 'short';
    } else if (num.startsWith(defaultCountryCode)) {
        // Starts with country code → international format (E.164)
        ton = 1; // International
        npi = 1; // ISDN / E.164
        type = 'international';
    } else if (/^\d{8,9}$/.test(num)) {
        // 8–9 digits → likely national format
        ton = 2; // National
        npi = 1; // ISDN / E.164
        type = 'national';
        // Optional: prepend the default country code if your SMSC requires E.164 only
        // num = defaultCountryCode + num;
    } else {
        logger.error('`Unrecognized phone number format: %s', input);
        throw new Error(`Unrecognized phone number format: ${input}`);
    }
    return { number: num, ton, npi, type };
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

        metrics.IncMetrics(event.service, event.subservice, metrics.actionSMPP);

        const lookupPDUStatusKey = (pduCommandStatus) => {
            for (const k in smpp.errors) {
                if (smpp.errors[k] === pduCommandStatus) {
                    return k;
                }
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
                    try {
                        const fromInfo = normalizeNumber(from);
                        const toInfo = normalizeNumber(to);
                        logger.debug(
                            'SMPP sending from: %s (TON=%s) → to: %s (TON=%s), text: %s',
                            fromInfo.number,
                            fromInfo.ton,
                            toInfo.number,
                            toInfo.ton,
                            text
                        );
                        session.submit_sm(
                            {
                                source_addr_ton: fromInfo.ton,
                                source_addr_npi: fromInfo.npi,
                                source_addr: fromInfo.number,
                                destination_addr_ton: toInfo.ton,
                                destination_addr_npi: toInfo.npi,
                                destination_addr: toInfo.number,
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
                    } catch (err) {
                        logger.error('SMPP not sent: invalid number format (%s)', err.message);
                        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
                        alarm.raise(alarm.SMPP);
                        safeCallback(err);
                    }
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
