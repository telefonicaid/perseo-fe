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
    events = require('events'),
    logger = require('logops'),
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    keystone = require('./keystone'),
    alarm = require('../alarm'),
    errors = {},
    tokens = {},
    newTokenEventName = 'new_token',
    MAX_LISTENERS = 10e3,
    metrics = require('./metrics'),
    NGSI = require('ngsijs');

function getCachedToken(service, subservice, name) {
    var emitter;

    if (tokens[service] === undefined) {
        tokens[service] = {};
    }
    if (tokens[service][subservice] === undefined) {
        tokens[service][subservice] = {};
    }
    if (tokens[service][subservice][name] === undefined) {
        emitter = new events.EventEmitter();
        emitter.setMaxListeners(MAX_LISTENERS);
        tokens[service][subservice][name] = { token: null, generating: false, emitter: emitter };
    }
    return tokens[service][subservice][name];
}

function generateToken(trust, cached) {
    cached.generating = true;
    logger.info('start generating token with trust %s', trust);
    // Here we call KeyStone to generate a token, we'll entry into the event loop
    keystone.getToken(trust, function(error, token) {
        if (!error) {
            cached.token = token;
            logger.info('token generated successfully');
        } else {
            cached.token = null;
        }
        cached.generating = false;
        cached.emitter.emit(newTokenEventName, error, token);
    });
}

function buildQueryOptionsParams(action, event) {
    var filter = {};

    Object.keys(action.parameters.filter).forEach(function(key) {
        filter[key] = myutils.expandVar(action.parameters.filter[key], event, true);
    });

    // Translate filter with geojsonpolygon -> georel, geometry, coords
    if (
        filter.geojsonpolygon !== undefined &&
        filter.geojsonpolygon.features[0].geometry.type.toLowerCase() === 'polygon' &&
        Array.isArray(filter.geojsonpolygon.features[0].geometry.coordinates[0])
    ) {
        filter.georel = 'coveredBy';
        filter.geometry = 'polygon';
        filter.coords = '';
        for (var coord of filter.geojsonpolygon.features[0].geometry.coordinates[0]) {
            filter.coords += coord[1] + ',' + coord[0] + ';';
        }
        filter.coords = filter.coords.slice(0, -1);
        delete filter.geojsonpolygon;
    }
    logger.debug('filter built: %j', filter);
    return filter;
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
    action.parameters.type = action.parameters.type || '${type}' || 'None';

    action.parameters.attributes = action.parameters.attributes || [];

    var changes = {};
    // old format, with only one attribute to update
    if (action.parameters.name) {
        action.parameters.attributes.push({
            name: action.parameters.name,
            value: action.parameters.value,
            type: action.parameters.attrType
        });
    }
    action.parameters.attributes.forEach(function(attr) {
        // Direct value for Text, DateTime, and others. Apply expandVar for strings
        let theValue = myutils.expandVar(attr.value, event, true);
        let theType = myutils.expandVar(attr.type, event, true);
        // Metadata should be null or object
        let theMeta = attr.metadata;

        if (config.castTypes) {
            // Cast using NGSIv2 types
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
                default:
                //Nothing to do
            }
        }
        var key = myutils.expandVar(attr.name, event, true);
        changes[key] = {
            value: theValue,
            type: theType
        };
        if (attr.metadata !== undefined) {
            changes[key].metadata = theMeta;
        }
    });
    changes.id = myutils.expandVar(action.parameters.id, event, true);
    changes.type = myutils.expandVar(action.parameters.type, event, true);
    logger.debug('processOptionParams changes: %j', changes);
    return changes;
}

/**
 * Process NGSIv2 action do request option Params
 *
 * @param action The request update action information
 * @param entity NGSI entity
 *
 * @return options object
 */
function processUpdateOptionParams(action, entity, event) {
    action.parameters.attributes = action.parameters.attributes || [];

    var options = {};
    action.parameters.attributes.forEach(function(attr) {
        let theValue = myutils.expandVar(attr.value, event, true);
        let theType = myutils.expandVar(attr.type, event, true);

        // Metadata should be null or object
        let theMeta = attr.metadata;

        if (config.castTypes) {
            // Cast using NGSIv2 types
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
        }
        var key = myutils.expandVar(attr.name, event, true);
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
 * Get NGSIjs connection
 *
 * @param action The request update action information
 * @param event NGSI event
 * @param token IDM token
 *
 * @return connection object
 */
function getUpdateConnection(connection, action, event, token) {
    var options = {
        service: event.service,
        servicepath: event.subservice,
        headers: {}
    };
    var pep = false;
    if (action.parameters.service !== undefined) {
        options.service = myutils.expandVar(action.parameters.service, event, true);
        pep = true;
    }
    if (action.parameters.subservice !== undefined) {
        options.servicepath = myutils.expandVar(action.parameters.subservice, event, true);
        pep = true;
    }
    // token headers
    if (token !== null) {
        options.headers[constants.AUTH_HEADER] = token;
    }
    logger.debug('ngsijs options: %j', options);
    if (pep) {
        connection = new NGSI.Connection(config.pep.URL, options);
    }
    return connection;
}

/**
 * Classical updateAction with filter
 *
 * @param queryOptions filter
 * @param action The request update action information
 * @param event NGSI event
 * @param token IDM token
 * @param connection connection object
 *
 */
function doUpdateActionWithFilter(queryOptions, action, event, token, connection, callback) {
    // QueryOptions could contain: count, limit, offset
    //  count (Boolean; default: false): Request total count
    //  limit (Number; default: 20): This option allow you to specify the maximum number of
    //         entities you want to receive from the server
    //  offset (Number; default: 0): Allows you to skip a given number of elements at the beginning
    logger.debug('doUpdateActionWithFilter called with queryOptions: %j', queryOptions);
    var currentOffset = queryOptions.offset ? queryOptions.offset : 0;

    // Ensure update with filter (list + update) is performed to all possible results (#455)
    queryOptions.count = true;
    queryOptions.offset = currentOffset;
    logger.debug('doUpdateActionWithFilter iterateAll overwrites queryOptions: %j', queryOptions);

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

            logger.debug('full query response (v2.listEntities): %j', response);

            var changes = {
                actionType: 'append',
                entities: []
            };

            if (action.parameters.actionType !== undefined) {
                changes.actionType = myutils.expandVar(action.parameters.actionType, event, true);
            }

            if (response && response.results) {
                // Process response (array of entities)
                response.results.forEach(function(entity) {
                    var updateOptions = processUpdateOptionParams(action, entity, event, true);
                    changes.entities.push(updateOptions);
                }); // For each
            }
            var currentCount = changes.entities.length;
            metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);
            //
            // 2. Apply update to all entities in a batch
            //
            if (currentCount > 0) {
                logger.debug('entities to update: %j', changes);
                connection = getUpdateConnection(connection, action, event, token);
                connection.v2.batchUpdate(changes).then(
                    (updateResponse) => {
                        // Entities updated successfully
                        // response.correlator transaction id associated with the server response
                        logger.info('response OK v2.batchUpdate %s entities: %j', currentCount, updateResponse);
                        metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
                        alarm.release(alarm.ORION);
                        if (response.count) {
                            updateResponse.count = response.count;
                        }
                        if (response.offset) {
                            updateResponse.offset = response.offset;
                        }
                        if (currentCount + response.offset < response.count) {
                            queryOptions.offset += currentCount;
                            logger.debug('doUpdateActionWithFilter again with new offset: %j', queryOptions);
                            doUpdateActionWithFilter(queryOptions, action, event, token, connection, callback);
                        } else {
                            callback(null, updateResponse);
                        }
                    },
                    (error) => {
                        // Error updating entities
                        // If the error was reported by Orion, error.correlator will be
                        // filled with the associated transaction id
                        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
                        logger.warn(
                            'error v2.batchUpdate: %j trying update entity %j after event %j',
                            error,
                            changes,
                            event
                        );
                        alarm.raise(alarm.ORION, null, error);
                        callback(error, null);
                    }
                ); // batchUpdate
            } else {
                logger.debug('no entities to update: %j', response);
                callback(null, response);
            }
        },
        (error) => {
            // Error retrieving entities
            // If the error was reported by Orion, error.correlator will be
            // filled with the associated transaction id
            metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
            logger.warn('error filtering %j with queryOptions: %j', error, queryOptions);
            alarm.raise(alarm.ORION, null, error);
            callback(error, null);
        }
    );
}

/**
 * Classical updateAction (without filter)
 *
 * @param action The request update action information
 * @param event NGSI event
 * @param token IDM token
 * @param connection connection object
 *
 */
function doUpdateAction(action, event, token, connection, callback) {
    var changes = {
        actionType: 'append',
        entities: [processOptionParams(action, event)]
    };
    if (action.parameters.actionType !== undefined) {
        changes.actionType = myutils.expandVar(action.parameters.actionType, event, true);
    }
    metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);
    logger.debug('entity to update: %j', changes);
    connection = getUpdateConnection(connection, action, event, token);
    connection.v2.batchUpdate(changes).then(
        (response) => {
            // response.correlator transaction id associated with the server response
            logger.info('response OK v2.batchUpdate entities: %j', response);
            metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
            alarm.release(alarm.ORION);
            callback(null, response);
        },
        (error) => {
            metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
            logger.warn('error v2.batchUpdate: %j trying update entity %j after event %j', error, changes, event);
            alarm.raise(alarm.ORION, null, error);
            callback(error, null);
        }
    );
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
    options.headers = {};
    if (token !== null) {
        options.headers[constants.AUTH_HEADER] = token;
    }
    // Add correlator
    var domain = process.domain;
    if (domain && domain.context) {
        options.headers[constants.CORRELATOR_HEADER] = domain.context.corr;
        // Add other headers
        if (domain.context.srv && options.headers[constants.SERVICE_HEADER] === undefined) {
            options.headers[constants.SERVICE_HEADER] = domain.context.srv;
        }
        if (domain.context.subsrv && options.headers[constants.SUBSERVICE_HEADER] === undefined) {
            options.headers[constants.SUBSERVICE_HEADER] = domain.context.subsrv;
        }
        if (domain.context.from && options.headers[constants.REALIP_HEADER] === undefined) {
            options.headers[constants.REALIP_HEADER] = domain.context.from;
        }
    }
    var connection = new NGSI.Connection(config.orion.URL, options);
    logger.debug('action: %j, event: %j', action, event);

    // check if filter in action
    if (action && action.parameters && action.parameters.filter) {
        var queryOptions = buildQueryOptionsParams(action, event);
        doUpdateActionWithFilter(queryOptions, action, event, token, connection, callback);
    } else {
        doUpdateAction(action, event, token, connection, callback);
    }
}

function makeTokenListenerFunc(action, event, version, callback) {
    return function tokenHandlerFunc(error, token) {
        logger.debug('tokenHandlerFunc error:%s token:%s', error, token);
        if (error) {
            throw error;
        } else {
            logger.debug('tokenHandlerFunc retrying with %s', token);
            return doRequestV2(action, event, token, function cbDoReqUpdAxn(error, data) {
                callback(error, data);
            });
        }
    };
}

function doItWithToken(action, event, version, callback) {
    var subservice, service, ruleName, cached, newTokenListener;

    function cbDoReqUpdAxn(error, data) {
        logger.debug('cbDoReqUpdAxn %j %j', error, data);
        // If authorization error, we should call generateToken and addListener to retry
        if (
            (error && data && data.code === 401) || // v1 response
            (error && error.message && error.message.includes(401))
        ) {
            // v2 response using ngsijs
            cached.emitter.once(newTokenEventName, newTokenListener);
            if (cached.generating === false) {
                generateToken(action.parameters.trust, cached);
            }
        } else {
            return callback(error, data);
        }
    }

    subservice = event.subservice;
    service = event.service;
    ruleName = event.ruleName;
    newTokenListener = makeTokenListenerFunc(action, event, version, callback);

    cached = getCachedToken(service, subservice, ruleName);
    if (cached.token === null) {
        // First time token is generated from trust
        cached.emitter.once(newTokenEventName, newTokenListener);
        if (cached.generating === false) {
            logger.debug('generating token for %s %s %s', service, subservice, ruleName);
            generateToken(action.parameters.trust, cached);
        }
    } else if (cached.generating === true) {
        // In the middle of getting a new one
        logger.debug('waiting token to be generated %s %s %s', service, subservice, ruleName);
        cached.emitter.once(newTokenEventName, newTokenListener);
    } else {
        doRequestV2(action, event, cached.token, cbDoReqUpdAxn);
    }
}

function doIt(action, event, callback) {
    try {
        if (action.parameters.trust) {
            return doItWithToken(action, event, 2, callback);
        } else {
            return doRequestV2(action, event, null, callback);
        }
    } catch (ex) {
        return callback(ex);
    }
}

module.exports.doIt = doIt;

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
