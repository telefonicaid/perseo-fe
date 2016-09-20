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
    logger = require('logops');

function expandObject(templateObj, dictionary) {
    var res = {};
    if (templateObj && typeof templateObj === 'object') {
        Object.keys(templateObj).forEach(function(key) {
            res[myutils.expandVar(key, dictionary)] = myutils.expandVar(templateObj[key], dictionary);
        });
    }
    return res;
}

function buildPostOptions(action, event) {
    return {
        method: action.parameters.method || 'post',
        text: myutils.expandVar(action.template, event),
        url: myutils.expandVar(action.parameters.url, event),
        qs: expandObject(action.parameters.qs, event),
        headers: expandObject(action.parameters.headers, event)
    };
}
function doIt(action, event, callback) {
    var options;

    options = buildPostOptions(action, event);
    myutils.requestHelper(options.method.toLowerCase(), {
        url: options.url,
        body: options.text,
        qs: options.qs,
        headers: options.headers
    }, function(err, data) {
        myutils.logErrorIf(err, options.url);
        logger.info('%s %j', options.url, data);
        return callback(err, data);
    });
}

module.exports.doIt = doIt;
module.exports.buildPostOptions = buildPostOptions;

