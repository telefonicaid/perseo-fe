/*
 * Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
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

// Conf based on
//   https://pdihub.hi.inet/ep/iot_ansible/tree/master/roles/iot.acdc
//   https://pdihub.hi.inet/ep/iot_ansible/blob/master/group_vars/production/iotacdc.yml

'use strict';

var util = require('util'),
    logger = require('logops'),
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
        //msg = {to: ['tel:' + options.to], message: options.text, from: config.smpp.from};

        //metrics.IncMetrics(event.service, event.subservice, metrics.actionSMS);


        // ----------------------------------------------------------------
        // Taken from
        //   http://kalapun.com/posts/working-with-sms-via-smpp-in-nodejs/


        function connectSMPP() {
            console.log('smpp reconnecting');
            session.connect();
        }

        function lookupPDUStatusKey(pduCommandStatus) {
            for (var k in smpp.errors) {
                if (smpp.errors[k] == pduCommandStatus) {
                    return k;
                }
            }
        }

        function sendSMPP(from, to, text) {
            // in this example, from & to are integers
            // We need to convert them to String
            // and add `+` before

            from = '+' + from.toString();
            to   = '+' + to.toString();

            session.submit_sm({
                source_addr:      from,
                destination_addr: to,
                short_message:    text
            }, function(pdu) {
                console.log('sms pdu status', lookupPDUStatusKey(pdu.command_status));
                if (pdu.command_status == 0) {
                    // Message successfully sent
                    console.log(pdu.message_id);
                }
            });
        }

        var session = new smpp.Session(
            {
                host: config.smpp.host,
                port: config.smpp.port                
            });

        // We will track connection state for re-connecting
        var didConnect = false; 

        session.on('connect', function(){
            didConnect = true;

            session.bind_transceiver({
                system_id: config.smpp.system_id,
                password: config.smpp.password
            }, function(pdu) {
                console.log('pdu status', lookupPDUStatusKey(pdu.command_status));
                if (pdu.command_status == 0) {
                    console.log('Successfully bound');
                    sendSMPP(config.smpp.from, options.to, options.text);
                    
                }
            });
        });


        session.on('close', function(){
            console.log('smpp disconnected');
            if (didConnect) {
                connectSMPP();
            }
        });

        session.on('error', function(error){
            console.log('smpp error', error);
            didConnect = false;
        });

        // ----------------------------------------------------------------
        
    } catch (ex) {
        //metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMS);

        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildSMSOptions = buildSMSOptions;

