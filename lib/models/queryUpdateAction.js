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
 *
 * Modified by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */
'use strict';

var util = require('util'),
    //events = require('events'),
    logger = require('logops'),
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    //keystone = require('./keystone'),
    alarm = require('../alarm'),
    errors = {},
    //tokens = {},
    //newTokenEventName = 'new_token',
    //MAX_LISTENERS = 10e3,
    metrics = require('./metrics'),
    //URL = require('url').URL,
    NGSI = require('ngsijs');

function buildQueryOptions(action, event) {
    var options,
        attr,
        parameterTypeGiven = action.parameters.type !== undefined;

    // Options detail:
    // https://conwetlab.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22__anchor

    action.parameters.id = action.parameters.id || '${id}';
    action.parameters.type = action.parameters.type || '${type}';
    action.parameters.isPattern = action.parameters.isPattern || 'false';

    action.parameters.attributes = action.parameters.attributes || [];

    // old format, with only one attribute to update
    if (action.parameters.name) {
        action.parameters.attributes.push({
            name: action.parameters.name,
            value: action.parameters.value,
            type: action.parameters.attrType
        });
    }
    options = {
        id: myutils.expandVar(action.parameters.id, event),
        isPattern: myutils.expandVar(action.parameters.isPattern, event)
    };
    if (action.parameters.actionType) {
        options.actionType = myutils.expandVar(action.parameters.actionType, event);
    }
    options.attributes = [];
    for (var i = 0; i < action.parameters.attributes.length; i++) {
        attr = {
            name: myutils.expandVar(action.parameters.attributes[i].name, event),
            value: myutils.expandVar(action.parameters.attributes[i].value, event)
        };

        //The portal does not provide 'type' for attribute, "plain" rules could
        if (action.parameters.attributes[i].type !== undefined) {
            attr.type = myutils.expandVar(action.parameters.attributes[i].type, event);
        }
        options.attributes.push(attr);
    }

    if (event.type !== undefined || parameterTypeGiven) {
        options.type = myutils.expandVar(action.parameters.type, event);
    }
    logger.info('query options %j', options);
    return options;
}

/**
 * Process NGSIv2 action do request option Params
 *
 * @param action The request update action information
 * @param event The doIt event information
 *
 * @return changes object
 */
function processOptionParams(action, event) {
    // Default id -> last event ID
    action.parameters.id = action.parameters.id || '${id}';
    // Default type -> last event Type
    action.parameters.type = action.parameters.type || '${type}';

    action.parameters.attributes = action.parameters.attributes || [];

    var changes = {};
    action.parameters.attributes.forEach(function(attr) {
        // Direct value for Text, DateTime, and others. Apply expandVar for strings
        let theValue = myutils.expandVar(attr.value, event);
        let theType = myutils.expandVar(attr.type, event);
        // Metadata should be null or object
        let theMeta = attr.metadata;
        var date;

        switch (theType) {
            case 'Text':
                theValue = theValue.toString();
                break;
            case 'Number':
                theValue = parseFloat(theValue);
                break;
            case 'Boolean':
                if (typeof theValue === 'string') {
                    theValue = theValue.toLowerCase().trim() === 'true';
                }
                break;
            case 'DateTime':
                if (parseInt(theValue).toString() === theValue) {
                    // Parse String with number (timestamp__ts in Perseo events)
                    theValue = parseInt(theValue);
                }
                date = new Date(theValue);
                theValue = isNaN(date.getTime()) ? theValue : date.toISOString();
                break;
            case 'None':
                theValue = null;
                break;
        }
        var key = myutils.expandVar(attr.name, event);
        changes[key] = {
            value: theValue,
            type: theType
        };
        if (attr.metadata !== undefined) {
            changes[key].metadata = theMeta;
        }
    });
    changes.id = myutils.expandVar(action.parameters.id, event);
    changes.type = myutils.expandVar(action.parameters.type, event);

    return changes;
}

/**
 * Manage update action request for NGSv2 request
 *
 * @param action The request update action information
 * @param event The doIt event information
 * @param callback The update action request Callback
 *
 * @return changes object
 */
function doRequestV2(action, event, token, callback) {
    var options = {
        service: event.service,
        servicepath: event.subservice
    };
    if (token !== null) {
        options.headers = {};
        options.headers[constants.AUTH_HEADER] = token;
    }

    var connection = new NGSI.Connection(config.orion.URL, options);

    var changes = buildQueryOptions(action, event);

    // TBD:
    // 1. make query

    connection.v2.listEntities(changes, { upsert: true }).then(
        (response) => {
            //metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
            alarm.release(alarm.ORION);

            logger.info('full query response: %j', response);

            // TODO:
            response.foreach(function(p) {
                logger.info('entity to update: %j', p);

                changes = processOptionParams(action, p);
                logger.info('changes %j for update action: %j', changes, action);

                metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);

                // 2. apply update to earch result
                connection.v2.createEntity(changes, { upsert: true }).then(
                    (response) => {
                        //metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
                        alarm.release(alarm.ORION);
                        callback(null, response);
                    },
                    (error) => {
                        //metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
                        alarm.raise(alarm.ORION, null, error);
                        callback(error, null);
                    }
                ); // createEntity
            }); // for each

            callback(null, response);
        },
        (error) => {
            //metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
            alarm.raise(alarm.ORION, null, error);
            callback(error, null);
        }
    );
}

function doIt(action, event, callback) {
    try {
        return doRequestV2(action, event, null, callback);
    } catch (ex) {
        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildQueryOptions = buildQueryOptions;

/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.OrionError = function OrionError(msg) {
        this.name = 'ORION_AXN_ERROR';
        this.message = 'Orion error ' + (msg || '');
        this.httpCode = 404;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
