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


function buildSMSOptions(action, event) {
    return {
        text: myutils.expandVar(action.template, event),
        to: myutils.expandVar(action.parameters.to, event)
    };
}


function doIt(action, event, callback) {
    try {
        var options, msg;
        options = buildSMSOptions(action, event);
        msg = {to: ['tel:' + options.to], message: options.text, from: config.smpp.from};

        metrics.IncMetrics(event.service, event.subservice, metrics.actionSMPP);

        var connectSMPP = function() {
            logger.debug('smpp reconnecting');
            session.connect();
        };

        var lookupPDUStatusKey = function(pduCommandStatus) {
            for (var k in smpp.errors) {
                if (smpp.errors[k] === pduCommandStatus) {
                    return k;
                }
            }
            return null;
        };

        var sendSMPP = function(from, to, text) {
            /*jshint camelcase:false */

            from = from.toString();
            to = to.toString();
            logger.debug('smpp sms from: %s, to: %s, text: %s', from, to, text);

            session.submit_sm({
                source_addr: from,
                destination_addr: to,
                short_message: text
            }, function(pdu) {
                if (pdu.command_status === 0) {
                    // Message successfully sent
                    logger.info('Message %j successfully sent', pdu.message_id);
                    metrics.IncMetrics(event.service, event.subservice,
                                       metrics.okActionSMPP);
                    alarm.release(alarm.SMPP);
                } else {
                    logger.warn('Message not successfully sent');
                    logger.debug('sendSMPP submit_sm pdu status %s',
                                 lookupPDUStatusKey(pdu.command_status));
                    metrics.IncMetrics(event.service, event.subservice,
                                       metrics.failedActionSMPP);
                    alarm.raise(alarm.SMPP);
                }
            });
        };

        logger.debug('smpp session host: %s, port: %s',
                     config.smpp.host, config.smpp.port);
        var session = new smpp.Session({
                host: config.smpp.host,
                port: config.smpp.port
        });

        // We will track connection state for re-connecting
        var didConnect = false;

        session.on('connect', function() {
            /*jshint camelcase:false */
            didConnect = true;
            logger.debug('smpp session on connect system_id: %s, password: %s',
                         config.smpp.systemid, config.smpp.password);
            session.bind_transceiver({
                system_id: config.smpp.systemid,
                password: config.smpp.password
            }, function(pdu) {
                if (pdu.command_status === 0) {
                    logger.info('SMPP Successfully bound');
                    sendSMPP(config.smpp.from, options.to, options.text);
                } else {
                    logger.warn('SMPP not successfully bound');
                    logger.debug('SMPP bind pdu status: %s',
                                 lookupPDUStatusKey(pdu.command_status));
                    metrics.IncMetrics(event.service, event.subservice,
                                       metrics.failedActionSMPP);
                }
            });
        });

        session.on('close', function() {
            logger.debug('smpp disconnected');
            if (didConnect) {
                connectSMPP();
            }
        });

        session.on('error', function(error) {
            logger.error('smpp error %j', error);
            didConnect = false;
        });

        return callback;

    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMPP);
        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildSMSOptions = buildSMSOptions;

