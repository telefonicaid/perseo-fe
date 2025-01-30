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
    logger = require('logops'),
    config = require('../config'),
    rulesCollection = require('../config').collections.rules,
    executionsCollection = require('../config').collections.executions,
    myutils = require('./myutils'),
    constants = require('./constants'),
    alarm = require('./alarm'),
    mongodb = require('mongodb'),
    database,
    orionDb,
    delay = config.checkDB.delay,
    context = { comp: constants.COMPONENT_NAME, op: 'checkDB' };

function pingAux(db, component, callback) {
    db.command({ ping: 1 }, function(err, result) {
        if (err) {
            alarm.raise(component, context, err.message);
        } else {
            alarm.release(component, context, result);
        }
        return callback(err, result);
    });
}

function getDbAux(url, component, callback) {
    var client = mongodb.MongoClient,
        checkDbHealthFunc;

    client.connect(
        url,
        {
            // connectTimeoutMS is no longer supported in MongoDB 4.x
            // (see https://stackoverflow.com/q/72699235/1485926)
            // we keep connectTimeoutMS as configuration parameter, but
            // the driver parameters are now socketTimeoutMS and
            // serverSelectionTimeoutMS
            socketTimeoutMS: config.mongo.connectTimeoutMS,
            serverSelectionTimeoutMS: config.mongo.connectTimeoutMS
        },
        function(err, client) {
            if (err) {
                myutils.logErrorIf(err, 'connect', context);
                return callback(err, null);
            }

            const db = client.db();

            checkDbHealthFunc = function checkDbHealth() {
                pingAux(db, component, function(err, result) {
                    logger.debug('ping (%s) %j', component, err || result);
                });
            };
            setInterval(checkDbHealthFunc, delay);
            return callback(null, db, client);
        }
    );
}
function getDb(callback) {
    getDbAux(config.mongo.url, alarm.DATABASE, function cb(err, db, client) {
        database = db;
        callback(err, db, client);
    });
}
function getOrionDb(callback) {
    getDbAux(config.orionDb.url, alarm.DATABASE_ORION, function cb(err, db, client) {
        orionDb = db;
        callback(err, db, client);
    });
}

function ensureIndex(collection, fields, callback) {
    var col = database.collection(collection);
    col.createIndex(fields, { unique: true }, function(err, indexName) {
        myutils.logErrorIf(err, 'ensureIndex ' + collection, context);
        callback(err, indexName);
    });
}
function ensureIndexTTL(collection, fields, ttl, callback) {
    var col = database.collection(collection);
    col.createIndex(fields, { expireAfterSeconds: ttl }, function(err, indexName) {
        myutils.logErrorIf(err, 'ensureIndex ' + collection, context);
        callback(err, indexName);
    });
}

function setUp(cbSU) {
    async.parallel(
        [
            ensureIndex.bind(null, rulesCollection, {
                name: 1,
                subservice: 1,
                service: 1
            }),
            ensureIndexTTL.bind(null, executionsCollection, { lastTime: 1 }, config.executionsTTL)
        ],
        cbSU
    );
}

function closeAux(db, callback) {
    db.close(function(err) {
        myutils.logErrorIf(err, 'close', context);
        callback(err);
    });
}

/**
 * getDB returns a db connection to mongoDB or an error in the callback function.
 *
 * @param {function}       callback function(error, db)
 */
module.exports.getDb = getDb;

/**
 * getOrionDB returns a db connection to Orion's mongoDB or an error in the callback function.
 *
 * @param {function}       callback function(error, db)
 */
module.exports.getOrionDb = getOrionDb;
/**
 * ping sends a ping command to mongoDB and returns the result or an error in the callback function.
 *
 *  @param {function}       callback function(error, commandResult)
 */
module.exports.ping = function(callback) {
    pingAux(database, alarm.DATABASE, callback);
};

/**
 * orionPing sends a ping command to Orion database and returns the result or an error in the callback function.
 *
 *  @param {function}       callback function(error, commandResult)
 */
module.exports.orionPing = function(callback) {
    pingAux(orionDb, alarm.DATABASE_ORION, callback);
};

/**
 * setup ensures indexes on collections used by the application. It returns an error in the callback
 * function if something goes wrong.
 *
 *  @param {function}       callback function(error)
 */
module.exports.setUp = setUp;

/**
 * close closes connection with database. It returns an error in the callback
 * function if something goes wrong.
 *
 * @param {function}       callback function(error)
 */
module.exports.close = function(callback) {
    closeAux(database, callback);
};

/**
 * orionClose closes connection with Orion database. It returns an error in the callback
 * function if something goes wrong.
 *
 * @param {function}       callback function(error)
 */
module.exports.orionClose = function(callback) {
    closeAux(orionDb, callback);
};
