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
    NGSI = require('ngsijs');

function orionServiceDb(service) {
    return appContext.OrionDb(config.orionDb.prefix + '-' + service);
}

function findSilentEntitiesByAPI(service, subservice, ruleData, func, callback) {
    var context = { op: 'checkNoSignal.findSilentEntitiesByAPI', comp: constants.COMPONENT_NAME };

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
    var connection = new NGSI.Connection(config.orion.URL, options);

    var filter = {
        service: service,
        servicepath: subservice,
        type: ruleData.type,
        mq: ruleData.attribute + '.dateModified<' + (Date.now() / 1000 - ruleData.reportInterval).toString()
    };
    if (ruleData.id) {
        filter.id = ruleData.id;
    } else if (ruleData.idRegexp) {
        filter.idPattern = ruleData.idRegexp;
    }
    logger.debug(
        context,
        'find silent entities by API ngsi using options %j and filter %j and rule %j',
        options,
        filter,
        ruleData
    );
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
                func(entity);
                count++;
            });
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(response.results));
            callback(null, response.results);
        },
        (error) => {
            // Error retrieving entities
            // If the error was reported by Orion, error.correlator will be
            // filled with the associated transaction id
            logger.warn('error v2.listEntities: %j trying list entities using filter %j', error, filter);
            callback(error, null);
        }
    );
}

function findSilentEntitiesByMongo(service, subservice, ruleData, func, callback) {
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
                        func(one);
                        count++;
                    });
            }
        ],
        function(err, result) {
            logger.debug(context, 'findSilentEntities %s', myutils.firstChars(result));
            return callback(err, result);
        }
    );
}

function findSilentEntities(service, subservice, ruleData, func, callback) {
    if (!config.nonSignalByAPI) {
        return findSilentEntitiesByMongo(service, subservice, ruleData, func, callback);
    } else {
        return findSilentEntitiesByAPI(service, subservice, ruleData, func, callback);
    }
}

module.exports.FindSilentEntities = findSilentEntities;
module.exports.findSilentEntitiesByAPI = findSilentEntitiesByAPI;
module.exports.findSilentEntitiesByMongo = findSilentEntitiesByMongo;
