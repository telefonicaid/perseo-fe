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

var myutils = require('../myutils'),
    logger = require('logops'),
    metrics = require('./metrics');

function buildPostOptions(action, event) {
    var options = {
        method: action.parameters.method || 'post',
        url: myutils.expandVar(action.parameters.url, event),
        qs: myutils.expandObject(action.parameters.qs, event),
        headers: myutils.expandObject(action.parameters.headers, event)
    };

    if (action.parameters.json) {
        options.json = myutils.expandObject(action.parameters.json, event);
    } else if (action.template) {
        options.text = myutils.expandVar(action.template, event, true);
    } else {
        //Added default else clause
        return options;
    }

    return options;
}
function doIt(action, event, callback) {
    try {
        var options, requestOptions;

        options = buildPostOptions(action, event);
        requestOptions = {
            url: options.url,
            qs: options.qs,
            headers: options.headers
        };
        if (options.json) {
            requestOptions.json = true;
            requestOptions.body = options.json;
        } else if (options.text) {
            // According with https://github.com/request/request#requestoptions-callback
            // Must be a Buffer, String or ReadStream. So we stringify **anything
            // which is not a string yet** (see issue #763)
            const textIsString = (typeof options.text === 'string' || options.text instanceof String);
            requestOptions.body = textIsString ? options.text : JSON.stringify(options.text);
        } else {
            //Added default else clause
            logger.debug('doIt() - Default else clause');
        }

        metrics.IncMetrics(event.service, event.subservice, metrics.actionHttpPost);
        logger.debug('requestOptions %j ', requestOptions);
        myutils.requestHelper(options.method.toLowerCase(), requestOptions, function(err, data) {
            if (err) {
                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionHttpPost);
            } else {
                metrics.IncMetrics(event.service, event.subservice, metrics.okActionHttpPost);
            }

            myutils.logErrorIf(err, options.url);
            logger.info('%s %j', options.url, data);
            return callback(err, data);
        });
    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionHttpPost);

        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildPostOptions = buildPostOptions;
