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
    logger = require('logops'),
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    alarm = require('../alarm'),
    errors = {},
    metrics = require('./metrics'),
    NGSI = require('ngsijs');

function buildQueryOptionsParams(action, event) {
    var filter;

    // Options detail:
    // https://conwetlab.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22__anchor

    action.parameters.filter = action.parameters.filter || '${filter}';

    filter = myutils.expandVar(action.parameters.filter, event);

    logger.debug('filter built: %j', filter);
    return filter;
}

/**
 * Process NGSIv2 action do request option Params
 *
 * @param action The request update action information
 * @param entity NGSI entity
 *
 * @return options object
 */
function processUpdateOptionParams(action, entity) {
    action.parameters.attributes = action.parameters.attributes || [];

    var options = {};
    action.parameters.attributes.forEach(function(attr) {
        // Direct value for Text, DateTime, and others. Apply expandVar for strings
        let theValue = attr.name in entity ? entity[attr.name].value : attr.value;
        let theType = attr.name in entity ? entity[attr.name].type : attr.type;
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
        var key = attr.name;
        options[key] = {
            value: theValue,
            type: theType
        };
        if (attr.metadata !== undefined) {
            options[key].metadata = theMeta;
        }
    });
    options.id = entity.id;
    options.type = entity.type;
    logger.debug('options built: %j', options);
    return options;
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

    logger.debug('action: %j', action);

    var queryOptions = buildQueryOptionsParams(action, event);

    //
    // 1. Make query with filter
    //
    connection.v2.listEntities(queryOptions).then(
        (response) => {
            // Entities retrieved successfully
            // response.results is an array with the retrieved entities
            // response.correlator transaction id associated with the server response
            // response.count contains the total number of entities selected
            //   by this query
            // response.offset contains the offset used in the request

            metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityFilter);
            alarm.release(alarm.ORION);

            logger.debug('full query response: %j', response);

            var changes = {
                actionType: 'APPEND',
                entities: []
            };

            if (options.actionType !== undefined) {
                changes.actionType.updateAction = options.actionType;
            }

            // Process response (array of entities)
            response.results.forEach(function(entity) {
                var updateOptions = processUpdateOptionParams(action, entity);
                changes.entities.push(updateOptions);
            }); // For each

            logger.debug('entities to update: %j', changes);
            metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);

            // 2. Apply update to all entities in a batch
            connection.v2.batchUpdate(changes, { upsert: true }).then(
                (response) => {
                    // Entities updated successfully
                    // response.correlator transaction id associated with the server response
                    logger.debug('response batchUpdate: %j', response);
                    metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
                    alarm.release(alarm.ORION);
                    callback(null, response);
                },
                (error) => {
                    // Error updating entities
                    // If the error was reported by Orion, error.correlator will be
                    // filled with the associated transaction id
                    metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
                    logger.warn('error batchUpdate%j', error);
                    alarm.raise(alarm.ORION, null, error);
                }
            ); // batchUpdate
        },
        (error) => {
            // Error retrieving entities
            // If the error was reported by Orion, error.correlator will be
            // filled with the associated transaction id
            metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
            logger.warn('error filtering %j', error);
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
module.exports.buildQueryOptionsParams = buildQueryOptionsParams;
module.exports.processUpdateOptionParams = processUpdateOptionParams;

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
