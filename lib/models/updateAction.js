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
    URL = require('url').URL,
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
    logger.info('start generating token');
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

function buildUpdateOptions(action, event) {
    var options,
        attr,
        parameterTypeGiven = action.parameters.type !== undefined;

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

    return options;
}

function buildQueryOptionsParams(action, event) {
    var filter;

    // Options detail:
    // https://conwetlab.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22__anchor

    action.parameters.filter = action.parameters.filter || '${filter}';

    filter = myutils.expandVar(action.parameters.filter, event);

    logger.debug('filter built: %j', filter);
    return filter;
}

function doRequest(action, event, token, callback) {
    var subservice, service, headers, options, updateOrion;

    subservice = event.subservice;
    service = event.service;

    options = buildUpdateOptions(action, event);

    updateOrion = {
        contextElements: [
            {
                isPattern: options.isPattern,
                id: options.id,
                attributes: options.attributes
            }
        ],
        updateAction: 'APPEND'
    };
    if (options.actionType !== undefined) {
        updateOrion.updateAction = options.actionType;
    }

    if (options.type !== undefined) {
        updateOrion.contextElements[0].type = options.type;
    }

    headers = {
        Accept: 'application/json'
    };
    if (token !== null) {
        headers[constants.AUTH_HEADER] = token;
    }
    headers[constants.SUBSERVICE_HEADER] = subservice;
    headers[constants.SERVICE_HEADER] = service;

    metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);
    logger.debug('body to post %j ', updateOrion);
    myutils.requestHelper(
        'post',
        {
            url: new URL('v1/updateContext', config.orion.URL),
            body: updateOrion,
            json: true,
            headers: headers
        },
        function(err, data) {
            if (err) {
                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);

                alarm.raise(alarm.ORION, null, err);
            } else {
                metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);

                alarm.release(alarm.ORION);
            }
            if (!err && data.body && data.body.orionError) {
                err = new errors.OrionError(JSON.stringify(data.body.orionError));
            }
            callback(err, data);
        }
    );
}

function makeTokenListenerFunc(action, event, callback) {
    return function tokenHandlerFunc(error, token) {
        logger.debug('tokenHandlerFunc %s %s', error, token);
        if (error || !token) {
            return callback(error);
        } else {
            logger.debug('tokenHandlerFunc retrying with', token);
            return doRequest(action, event, token, function cbDoReqUpdAxn(error, data) {
                callback(error, data);
            });
        }
    };
}

function doItWithToken(action, event, callback) {
    var subservice, service, ruleName, cached, newTokenListener;

    subservice = event.subservice;
    service = event.service;
    ruleName = event.ruleName;
    newTokenListener = makeTokenListenerFunc(action, event, callback);

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
        doRequest(action, event, cached.token, function cbDoReqUpdAxn(error, data) {
            logger.debug('cbDoReqUpdAxn %s %s', error, data);
            // If authorization error, we should call generateToken and addListener to retry
            if (error && data.code === 401) {
                cached.emitter.once(newTokenEventName, newTokenListener);
                if (cached.generating === false) {
                    generateToken(action.parameters.trust, cached);
                }
            } else {
                return callback(error, data);
            }
        });
    }
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

    // check if filter in action
    if (action && action.parameters && action.parameters.filter) {
        // UpdateAction with filter
        logger.debug('action: %j, event: %j', action, event);

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
                    actionType: 'append',
                    entities: []
                };

                if (options.actionType !== undefined) {
                    changes.actionType.updateAction = options.actionType;
                }

                if (response && response.results) {
                    // Process response (array of entities)
                    response.results.forEach(function(entity) {
                        var updateOptions = processUpdateOptionParams(action, entity);
                        changes.entities.push(updateOptions);
                    }); // For each
                }

                logger.debug('entities to update: %j', changes);
                metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);
                //
                // 2. Apply update to all entities in a batch
                //
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
    } else {
        // classical updateAction (without filter)

        var changes = processOptionParams(action, event);
        metrics.IncMetrics(event.service, event.subservice, metrics.actionEntityUpdate);
        logger.debug('entity to update: %j', changes);
        connection.v2.createEntity(changes, { upsert: true }).then(
            (response) => {
                metrics.IncMetrics(event.service, event.subservice, metrics.okActionEntityUpdate);
                alarm.release(alarm.ORION);
                callback(null, response);
            },
            (error) => {
                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEntityUpdate);
                alarm.raise(alarm.ORION, null, error);
                callback(error, null);
            }
        );
    }
}

function doItWithTokenV2(action, event, callback) {
    var subservice, service, ruleName, cached, newTokenListener;

    subservice = event.subservice;
    service = event.service;
    ruleName = event.ruleName;
    newTokenListener = makeTokenListenerFunc(action, event, callback);

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
        doRequestV2(action, event, cached.token, function cbDoReqUpdAxn(error, data) {
            logger.debug('cbDoReqUpdAxn %s %s', error, data);
            // If authorization error, we should call generateToken and addListener to retry
            if (error && data.code === 401) {
                cached.emitter.once(newTokenEventName, newTokenListener);
                if (cached.generating === false) {
                    generateToken(action.parameters.trust, cached);
                }
            } else {
                return callback(error, data);
            }
        });
    }
}

function doIt(action, event, callback) {
    try {
        if (action.parameters.version === '2' || action.parameters.version === 2) {
            if (action.parameters.trust) {
                return doItWithTokenV2(action, event, callback);
            } else {
                return doRequestV2(action, event, null, callback);
            }
        } else if (action.parameters.trust) {
            return doItWithToken(action, event, callback);
        } else {
            return doRequest(action, event, null, callback);
        }
    } catch (ex) {
        return callback(ex);
    }
}

module.exports.doIt = doIt;
module.exports.buildUpdateOptions = buildUpdateOptions;

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
