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
    config = require('../config'),
    rulesCollection = require('../config').collections.rules,
    executionsCollection = require('../config').collections.executions,
    myutils = require('./myutils'),
    logger = require('logops'),
    database,
    orionDb,
    delay = config.checkDB.delay,
    reportInterval = config.checkDB.reportInterval,
    lastErrorTrace = 0;

function pingAux(db, callback) {
    db.command({ping: 1}, function(err, result) {
        myutils.logErrorIf(err, 'ping');
        return callback(err, result);
    });
}

function getDbAux(url, callback) {
    var client = require('mongodb').MongoClient,
        dbErrorFunc, checkDbHealthFunc;
    client.connect(url, function(err, db) {
        if (err) {
            myutils.logErrorIf(err, 'connect');
            return callback(err, null);
        }
        dbErrorFunc = function dbErrorFunc(err) {
            var now = Date.now();
            db.perseoDetectedError = true;
            if (lastErrorTrace + reportInterval < now) {
                myutils.logErrorIf(err, 'database error ' + url);
                lastErrorTrace = now;
            }
            db.perseoDetectedError = true;
        };
        db.on('error', dbErrorFunc);
        db.on('disconnected', dbErrorFunc);
        db.on('parseError', dbErrorFunc);
        db.on('timeout', dbErrorFunc);
        checkDbHealthFunc = function checkDbHealth() {
            pingAux(db, function() {
                if (db.perseoDetectedError) {
                    logger.info('database ping done: ' + url);
                    db.perseoDetectedError = false;
                }
                setTimeout(checkDbHealthFunc, delay);
            });
        };
        setTimeout(checkDbHealthFunc, delay);
        return callback(null, db);
    });
}
function getDb(callback) {
    getDbAux(config.mongo.url, function cb(err, db) {
        database = db;
        callback(err, db);
    });
}
function getOrionDb(callback) {
    getDbAux(config.orionDb.url, function cb(err, db) {
        orionDb = db;
        callback(err, db);
    });
}

function ensureIndex(collection, fields, callback) {
    database.collection(collection, function(err, collection) {
        myutils.logErrorIf(err, collection);
        collection.ensureIndex(fields, {unique: true}, function(err, indexName) {
            myutils.logErrorIf(err, 'ensureIndex ' + collection);
            callback(err, indexName);
        });
    });
}
function ensureIndexTTL(collection, fields, ttl, callback) {
    database.collection(collection, function(err, collection) {
        myutils.logErrorIf(err, collection);
        collection.ensureIndex(fields, {expireAfterSeconds: ttl}, function(err, indexName) {
            myutils.logErrorIf(err, 'ensureIndex ' + collection);
            callback(err, indexName);
        });
    });
}

function setUp(cbSU) {
    async.parallel([
        ensureIndex.bind(null, rulesCollection, {name: 1, subservice: 1, service: 1}),
        ensureIndexTTL.bind(null, executionsCollection, {lastTime: 1}, config.executionsTTL)
    ], cbSU);
}

function closeAux(db, callback) {
    db.close(function(err) {
        myutils.logErrorIf(err, 'close');
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
    pingAux(database, callback);
};

/**
 * orionPing sends a ping command to Orion database and returns the result or an error in the callback function.
 *
 *  @param {function}       callback function(error, commandResult)
 */
module.exports.orionPing = function(callback) {
    pingAux(orionDb, callback);
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
