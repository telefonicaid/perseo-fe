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

var async = require('async'),
    appContext = require('../appContext'),
    config = require('../../config'),
    entitiesCollectionName = require('../../config').orionDb.collection,
    myutils = require('../myutils'),
    constants = require('../constants'),
    logger = require('logops'),
    ngsi = require('ngsijs'),
    context = { op: 'entitiesStore', comp: constants.COMPONENT_NAME };

function orionServiceDb(service) {
    return appContext.OrionDb(config.orionDb.prefix + '-' + service);
}

function createFilter(ruleData, service, subservice, limit, offset) {
    var maxTimeDetection = ruleData.maxTimeDetection ? ruleData.maxTimeDetection : config.nonSignalMaxTimeDetection;
    var currentTime = Date.now() / 1000;
    var filter = {
        service: service,
        servicepath: subservice,
        type: ruleData.type,
        mq:
            ruleData.attribute +
            '.dateModified<' +
            (currentTime - ruleData.reportInterval).toString() +
            ';' +
            'temperature.dateModified>' +
            (currentTime / 1000 - maxTimeDetection).toString(),
        // TO DO: Use ruleData.maxTimeDetectionAttr and ruleData.reportIntervalAttr in query if possible (#824)
        // https://github.com/telefonicaid/fiware-orion/blob/master/doc/manuals/orion-api.md#simple-query-language
        // https://ficodes.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22
        limit: limit,
        offset: offset
    };
    if (ruleData.id) {
        filter.id = ruleData.id;
    } else if (ruleData.idRegexp) {
        filter.idPattern = ruleData.idRegexp;
    }
    return filter;
}

function createConnection(service, subservice) {
    var options = {
        service: service,
        servicepath: subservice
    };
    options.headers = {};
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

    return new ngsi.Connection(config.orion.URL, options);
}

function findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, accumulatedResults, callback) {
    connection.v2.listEntities(filter).then(
        (response) => {
            if (response.results) {
                response.results.forEach((entity) => {
                    logger.debug(context, 'silent entity %j', entity);
                    alterFunc(entity);
                    accumulatedResults.push(entity);
                });
            }
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(response.results));
            if (response.count > filter.limit + filter.offset) {
                filter.offset += filter.limit;
                findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, accumulatedResults, callback);
            } else {
                // Pass the count of entities to the callback
                callback(null, accumulatedResults, accumulatedResults.length);
            }
        },
        (error) => {
            logger.warn(context, ' error v2.listEntities: %j trying list entities using filter %j', error, filter);
            callback(error, null, null);
        }
    );
}

function findSilentEntitiesByAPI(service, subservice, ruleData, alterFunc, callback) {
    var limit = 20;
    var offset = 0;
    var connection = createConnection(service, subservice);
    var filter = createFilter(ruleData, service, subservice, limit, offset);

    logger.info(
        context,
        ' find silent entities by API ngsi using options %j and filter %j and rule %j',
        connection,
        filter,
        ruleData
    );

    var accumulatedResults = [];

    findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, accumulatedResults, callback);
}

function findSilentEntitiesByMongo(service, subservice, ruleData, alterFunc, callback) {
    var db,
        criterion = {};

    db = orionServiceDb(service);
    criterion['_id.servicePath'] = subservice;
    if (ruleData.id) {
        criterion['_id.id'] = ruleData.id;
    } else if (ruleData.idRegexp) {
        try {
            criterion['_id.id'] = new RegExp(ruleData.idRegexp);
        } catch (e) {
            return callback(e, null);
        }
    }
    if (ruleData.type) {
        criterion['_id.type'] = ruleData.type;
    }
    // Variable to store the count of entities
    var entityCount = 0;

    async.waterfall(
        [
            db.collection.bind(db, entitiesCollectionName, { strict: false }),
            function(col, cb) {
                var pipeline = [
                    {
                        $match: criterion
                    },
                    {
                        $addFields: {
                            currentTime: { $divide: [Date.now(), 1000] },
                            maxTimeDetection: {
                                $convert: {
                                    input: {
                                        $ifNull: [
                                            '$attrs.' + ruleData.maxTimeDetectionAttr + '.value',
                                            ruleData.maxTimeDetection !== undefined
                                                ? ruleData.maxTimeDetection
                                                : config.nonSignalMaxTimeDetection
                                        ]
                                    },
                                    to: 'double',
                                    onError: config.nonSignalMaxTimeDetection,
                                    onNull: config.nonSignalMaxTimeDetection
                                }
                            },
                            reportInterval: {
                                $convert: {
                                    input: {
                                        $ifNull: [
                                            '$attrs.' + ruleData.reportIntervalAttr + '.value',
                                            ruleData.reportInterval
                                        ]
                                    },
                                    to: 'double',
                                    onError: ruleData.reportInterval,
                                    onNull: ruleData.reportInterval
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $lt: [
                                            '$attrs.' + ruleData.attribute + '.modDate',
                                            { $subtract: ['$currentTime', '$reportInterval'] }
                                        ]
                                    },
                                    {
                                        $gt: [
                                            '$attrs.' + ruleData.attribute + '.modDate',
                                            { $subtract: ['$currentTime', '$maxTimeDetection'] }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ];
                logger.debug(context, 'findSilentEntities service %s pipeline: %j ', service, pipeline);
                col.aggregate(pipeline).toArray(function(err, results) {
                    if (err) {
                        return cb(err, null);
                    }
                    results.forEach(function(one) {
                        logger.debug(context, 'silent entity %j', one._id);
                        alterFunc(one);
                        // Increment the count of entities
                        entityCount++;
                    });
                    cb(null, 'silent ones count ' + entityCount);
                });
            }
        ],
        function(err, result) {
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(result));
            return callback(err, result, entityCount);
        }
    );
}

function findSilentEntities(service, subservice, ruleData, alterFunc, callback) {
    var hrstart = process.hrtime();
    var method = !config.nonSignalByAPI ? 'findSilentEntitiesByMongo' : 'findSilentEntitiesByAPI';

    var timedCallback = function(err, result, entityCount) {
        var hrend = process.hrtime(hrstart);

        logger.info(context, ' %s has found %d entities in (hr): %d ms', method, entityCount, hrend[1] / 1000000);

        callback(err, result, entityCount);
    };
    if (!config.nonSignalByAPI) {
        return findSilentEntitiesByMongo(service, subservice, ruleData, alterFunc, timedCallback);
    } else {
        return findSilentEntitiesByAPI(service, subservice, ruleData, alterFunc, timedCallback);
    }
}

module.exports.FindSilentEntities = findSilentEntities;
module.exports.findSilentEntitiesByAPI = findSilentEntitiesByAPI;
module.exports.findSilentEntitiesByMongo = findSilentEntitiesByMongo;
module.exports.findSilentEntitiesByAPIWithPagination = findSilentEntitiesByAPIWithPagination;
module.exports.createConnection = createConnection;
module.exports.createFilter = createFilter;
