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

var config = require('../../config'),
    myutils = require('../myutils'),
    logger = require('logops');

function doIt(action, event, callback) {
    var text, msg;

    text = myutils.expandVar(action.template, event);
    msg = {to: ['tel:' + action.parameters.to], message: text, from: config.sms.from};
    myutils.requestHelper('post', {
        url: config.sms.URL,
        json: msg,
        headers: {
            'User-Agent': 'request',
            'API_KEY': config.sms.API_KEY,
            'API_SECRET': config.sms.API_SECRET
        }}, function(err, data) {
        myutils.logErrorIf(err, config.sms.URL);
        logger.info('%s %j', config.sms.URL, data);
        return callback(err, data);
    });
}

module.exports.doIt = doIt;

