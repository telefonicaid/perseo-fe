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
    Twitter = require('twitter');

function doIt(action, event, callback) {
    var text,
    client = new Twitter({
        /*jshint -W106 */
        consumer_key: action.parameters.consumer_key,
        consumer_secret: action.parameters.consumer_secret,
        access_token_key: action.parameters.access_token_key,
        access_token_secret: action.parameters.access_token_secret
        /*jshint +W106 */
    });

    text = myutils.expandVar(action.template, event);

    client.post('statuses/update', {status: text}, function(err, params, response) {
        myutils.logErrorIf(err, err && err.data);
        logger.info('%s %j', 'twitter', params || err);
        return callback(err, params);
    });

}

module.exports.doIt = doIt;

