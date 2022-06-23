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

var appContext = require('../appContext'),
    config = require('../../config'),
    entitiesCollectionName = require('../../config').orionDb.collection,
    myutils = require('../myutils'),
    constants = require('../constants'),
    logger = require('logops');

function orionServiceDb(service) {
    return appContext.OrionDb(config.orionDb.prefix + '-' + service);
}

function findSilentEntities(service, subservice, ruleData, func, callback) {
    var db,
        context = { op: 'checkNoSignal', comp: constants.COMPONENT_NAME },
        criterion = {};

    var cb = function(err, result) {
        logger.debug(context, 'findSilentEntities %s', myutils.firstChars(result));
        return callback(err, result);
    };

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

    myutils.collectionExists(db, entitiesCollectionName, function(exists) {
        if (!exists) {
            return cb('collection ' + entitiesCollectionName + ' does not exist');
        }

        var col = db.collection(entitiesCollectionName);

        var count = 0;
        col.find(criterion)
            .batchSize(config.orionDb.batchSize)
            .forEach(
                function(one) {
                    logger.debug(context, 'silent entity %j', one._id);
                    func(one);
                    count++;
                },
                function(err) {
                    if (err) {
                        return cb(err, null);
                    } else {
                        return cb(null, 'silent ones count ' + count);
                    }
                }
            );
    });
}

module.exports = {
    FindSilentEntities: findSilentEntities
};
