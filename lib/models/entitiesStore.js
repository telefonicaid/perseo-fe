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

var util = require('util'),
    async = require('async'),
    appContext = require('../appContext'),
    config = require('../../config'),
    entitiesCollectionName = require('../../config').orionDb.collection,
    myutils = require('../myutils'),
    logger = require('logops'),
    errors = {};

function orionServiceDb(service) {
    return appContext.OrionDb(config.orionDb.prefix + '-' + service);
}

function findSilentEntities(service, subservice, ruleData, func, callback) {
    var db,
        criterion = {};

    db = orionServiceDb(service);
    criterion.attrs = {
        '$elemMatch': {
            name: ruleData.attribute,
            modDate: {'$lt': (Date.now() / 1000 - ruleData.reportInterval)}
        }
    };
    criterion['_id.servicePath'] = subservice;
    if (ruleData.id) {
        criterion['_id.id'] = ruleData.id;
    } else if (ruleData.idRegexp) {
        try {
            criterion['_id.id'] = new RegExp(ruleData.idRegexp);
        }
        catch (e) {
            return callback(e, null);
        }
    }
    if (ruleData.type) {
        criterion['_id.type'] = ruleData.type;

    }
    logger.debug('findSilentEntities criterion %j', criterion);
    async.waterfall([
        db.collection.bind(db, entitiesCollectionName, {strict: true}),
        function(col, cb) {
            var count = 0;
            col.find(criterion).batchSize(config.orionDb.batchSize).each(function(err, one) {
                if (err) {
                    return cb(err, null);
                }
                if (one === null) { //cursor exhausted
                    return cb(err, 'silent ones count ' + count);
                }
                logger.debug('silent entity %j', one._id);
                func(one);
                count++;
            });
        }
    ], function(err, result) {
        logger.debug('findSilentEntities %s', myutils.firstChars(result));
        return callback(err, result);
    });
}

module.exports = {
    FindSilentEntities: findSilentEntities
};
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.Entities = function NotFoundRule(msg) {
        this.name = 'CB_ENTITY';
        this.message = 'CB entity ' + msg;
        this.httpCode = 500;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();

