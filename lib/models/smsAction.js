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
'use strict';

var util = require('util'),
    logger = require('logops'),
    config = require('../../config'),
    myutils = require('../myutils'),
    alarm = require('../alarm'),
    metrics = require('./metrics');

function buildSMSOptions(action, event) {
    var options = {
        text: myutils.expandVar(action.template, event, true),
        to: myutils.expandVar(action.parameters.to, event, false) // it is expected be string number
    };
    if (action.parameters.sms) {
        options.sms = {};
        if (action.parameters.sms.URL) {
            options.sms.URL = myutils.expandVar(action.parameters.sms.URL, event, true);
        }
        if (action.parameters.sms.API_KEY) {
            options.sms.API_KEY = myutils.expandVar(action.parameters.sms.API_KEY, event, true);
        }
        if (action.parameters.sms.API_SECRET) {
            options.sms.API_SECRET = myutils.expandVar(action.parameters.sms.API_SECRET, event, true);
        }
        if (action.parameters.sms.from) {
            options.sms.from = myutils.expandVar(action.parameters.sms.from, event, true);
        }
    }
    return options;
}

function buildTo(to) {
    const splitChar = ' ';
    var tos = to.split(splitChar);
    var r = [];
    tos.forEach(function(dest) {
        r.push('tel:' + dest);
    });
    return r;
}

function doIt(action, event, callback) {
    try {
        var options, msg;
        options = buildSMSOptions(action, event);
        // Check sms options
        var from = config.sms.from;
        if (options.sms && options.sms.from) {
            from = options.sms.from;
        }
        var url = config.sms.URL;
        var apiKey = config.sms.API_KEY;
        var apiSecret = config.sms.API_SECRET;
        if (options.sms) {
            if (options.sms.URL) {
                url = options.sms.URL;
            }
            if (options.sms.API_KEY) {
                apiKey = options.sms.API_KEY;
            }
            if (options.sms.API_SECRET) {
                apiSecret = options.sms.API_SECRET;
            }
        }
        metrics.IncMetrics(event.service, event.subservice, metrics.actionSMS);

        var tos = buildTo(options.to);

        for (var singleto of tos) {
            msg = { to: [singleto], message: options.text, from: config.sms.from };
            myutils.requestHelper(
                'post',
                {
                    url: url,
                    json: true,
                    body: msg,
                    headers: {
                        'User-Agent': 'request',
                        API_KEY: apiKey,
                        API_SECRET: apiSecret
                    }
                },
                function(err, data) { // jshint ignore:line
                    myutils.logErrorIf(err, util.format('%s -> %s', url, msg.to));
                    if (err) {
                        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMS);
                        alarm.raise(alarm.SMS);
                    } else {
                        metrics.IncMetrics(event.service, event.subservice, metrics.okActionSMS);
                        alarm.release(alarm.SMS);
                    }
                    logger.info('smsAction.SendSMS done url:%s result:%j, msg: %j', url, err || data, msg);
                    if (tos[tos.length - 1] === singleto) {
                        // ensure callback is returned just one time
                        return callback(err, data);
                    }
                }
            );
        }
    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionSMS);

        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildSMSOptions = buildSMSOptions;
