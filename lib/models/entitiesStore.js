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
    ngsi = require('ngsijs');

function orionServiceDb(service) {
    return appContext.OrionDb(config.orionDb.prefix + '-' + service);
}

function createFilter(ruleData, service, subservice, limit, offset) {
    var filter = {
        service: service,
        servicepath: subservice,
        type: ruleData.type,
        mq: ruleData.attribute + '.dateModified<' + (Date.now() / 1000 - ruleData.reportInterval).toString(),
        options: 'count',
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
    // if (token !== null) {
    //     options.headers[constants.AUTH_HEADER] = token;
    // }
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

function findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, total, callback) {
    total = total || 0;
    var context = { op: 'checkNoSignal.findSilentEntitiesByAPI', comp: constants.COMPONENT_NAME };

    // https://ficodes.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22__anchor
    connection.v2.listEntities(filter).then(
        (response) => {
            // Entities retrieved successfully
            // response.correlator transaction id associated with the server response
            // response.limit contains the used page size
            // response.results is an array with the retrieved entities
            // response.offset contains the offset used in the request
            var count = 0;
            response.results.forEach((entity) => {
                logger.debug(context, 'silent entity %j', entity);
                alterFunc(entity);
                count++;
            });
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(response.results));
            // Add the count of this page to the total count
            total += count;
            // Check if there are more entities to retrieve
            if (response.count > filter.limit + filter.offset) {
                // Call the function again with updated offset
                filter.offset += filter.limit;
                findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, callback);
            } else {
                // Pass the total count to the callback
                callback(null, response.results, total);
            }
        },
        (error) => {
            logger.warn('error v2.listEntities: %j trying list entities using filter %j', error, filter);
            callback(error, null);
        }
    );
}

function findSilentEntitiesByAPI(service, subservice, ruleData, alterFunc, callback) {
    var limit = 20;
    var offset = 0;
    var connection = createConnection(service, subservice);
    var filter = createFilter(ruleData, service, subservice, limit, offset);

    logger.info(
        'find silent entities by API ngsi using options %j and filter %j and rule %j',
        connection,
        filter,
        ruleData
    );

    // Call the pagination function
    findSilentEntitiesByAPIWithPagination(connection, filter, alterFunc, (err, results, total) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
            // Logging the number of entities
            logger.info(context, 'Number of silent entities retrieved using findSilentEntitiesByAPI: %d', count);
        }
    });
}

function findSilentEntitiesByMongo(service, subservice, ruleData, alterFunc, callback) {
    var db,
        context = { op: 'checkNoSignal.findSilentEntitiesByMongo', comp: constants.COMPONENT_NAME },
        criterion = {};

    db = orionServiceDb(service);
    criterion['attrs.' + ruleData.attribute + '.modDate'] = {
        $lt: Date.now() / 1000 - ruleData.reportInterval
    };
    criterion['_id.servicePath'] = subservice;
    if (ruleData.id) {
        criterion['_id.id'] = ruleData.id;
    } else if (ruleData.idRegexp) {
        try {
            criterion['_id.id'] = new RegExp(ruleData.idRegexp);
        } catch (e) {
            return callback(e, null);
        }
    } else {
        //Added default else clause
        logger.debug('findSilentEntities() - Default else clause');
    }
    if (ruleData.type) {
        criterion['_id.type'] = ruleData.type;
    }
    logger.debug(context, 'findSilentEntities criterion %j', criterion);
    async.waterfall(
        [
            db.collection.bind(db, entitiesCollectionName, { strict: true }),
            function(col, cb) {
                var count = 0;
                col.find(criterion)
                    .batchSize(config.orionDb.batchSize)
                    .each(function(err, one) {
                        if (err) {
                            return cb(err, null);
                        }
                        if (one === null) {
                            //cursor exhausted
                            return cb(err, 'silent ones count ' + count);
                        }
                        logger.debug(context, 'silent entity %j', one._id);
                        alterFunc(one);
                        count++;
                    });
            }
        ],
        function(err, result) {
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(result));
            // Logging the number of entities
            logger.info(context, 'Number of silent entities retrieved using findSilentEntitiesByMongo: %d', count);
            return callback(err, result);
        }
    );
}

function findSilentEntities(service, subservice, ruleData, alterFunc, callback) {
    // Start the timer
    var hrstart = process.hrtime();

    // Function to be called when silent entities search is completed
    var timedCallback = function(err, result) {
        // Stop the timer
        var hrend = process.hrtime(hrstart);

        // Log the execution time in seconds and milliseconds
        logger.info('Execution time (hr): %dms', hrend[1] / 1000000);

        // Call the original callback
        callback(err, result);
    };
    if (!config.nonSignalByAPI) {
        logger.debug('Executing findSilentEntitiesByMongo');
        return findSilentEntitiesByMongo(service, subservice, ruleData, alterFunc, timedCallback);
    } else {
        logger.debug('Executing findSilentEntitiesByAPI');
        return findSilentEntitiesByAPI(service, subservice, ruleData, alterFunc, timedCallback);
    }
}

module.exports.FindSilentEntities = findSilentEntities;
module.exports.findSilentEntitiesByAPI = findSilentEntitiesByAPI;
module.exports.findSilentEntitiesByMongo = findSilentEntitiesByMongo;
module.exports.findSilentEntitiesByAPIWithPagination = findSilentEntitiesByAPIWithPagination;
module.exports.createConnection = createConnection;
module.exports.createFilter = createFilter;
