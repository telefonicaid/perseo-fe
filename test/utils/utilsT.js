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
 * please contact with iot_support at tid dot es
 */

'use strict';

var fs = require('fs'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    config = require('../../config'),
    configTrust = require('../../configTrust.js').configTrust,
    fakeServerPort = 9753,
    fakeServerCode = 200,
    fakeServerMessage = 'All right',
    fakeServerCallback;

function loadExample(fileName) {
    var f = fs.readFileSync(fileName);
    return JSON.parse(f);
}

function loadDirExamples(filepath) {
    var files = fs.readdirSync(filepath),
        objects = [],
        elementPath;

    files.forEach(function(element) {
        elementPath = path.join(filepath, element);
        objects.push({ filename: elementPath, object: loadExample(elementPath) });
    });
    return objects;
}

function remove(collection, callback) {
    const connectPromise = MongoClient.connect(config.mongo.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            const col = client.db().collection(collection);

            col.deleteMany({})
                .then((result) => {
                    client.close();
                    return callback(null, result);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}

function dropRules(callback) {
    remove(config.collections.rules, callback);
}
function dropExecutions(callback) {
    remove(config.collections.executions, callback);
}

function dropCollection(collection, callback) {
    const connectPromise = MongoClient.connect(config.mongo.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            const col = client.db().collection(collection);
            col.drop()
                .then((result) => {
                    client.close();
                    return callback(null, result);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}
function dropRulesCollection(callback) {
    dropCollection(config.collections.rules, callback);
}
function dropExecutionsCollection(callback) {
    dropCollection(config.collections.executions, callback);
}

function createRulesCollection(callback) {
    const connectPromise = MongoClient.connect(config.mongo.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            const rules = client.db().collection(config.collections.rules);

            rules.createIndex({ name: 1 }, { unique: true, w: 'majority' })
                .then((indexName) => {
                    client.close();
                    return callback(null, indexName);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}

function addRule(rule, callback) {
    const connectPromise = MongoClient.connect(config.mongo.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            const rules = client.db().collection(config.collections.rules);

            rules.insertOne(rule)
                .then((result) => {
                    client.close();
                    return callback(null, result);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}

function createEntitiesCollection(tenant, callback) {
    const connectPromise = MongoClient.connect(config.orionDb.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            var db2 = client.db(config.orionDb.prefix + '-' + tenant);
            var rules = db2.collection(config.orionDb.collection);

            // We don't mind what fields have index in that collection
            rules.createIndex({ modDate: 1 }, { unique: true, w: 'majority' })
                .then((indexName) => {
                    client.close();
                    return callback(null, indexName);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}
function dropEntities(callback) {
    const connectPromise = MongoClient.connect(config.orionDb.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            var db2 = client.db(config.orionDb.prefix + '-' + config.DEFAULT_SERVICE);
            var coll = db2.collection(config.orionDb.collection);

            coll.deleteMany({})
                .then((result) => {
                    client.close();
                    return callback(null, result);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}
function addEntity(tenant, entity, callback) {
    const connectPromise = MongoClient.connect(config.orionDb.url, {
        socketTimeoutMS: config.mongo.connectTimeoutMS || 3000,
        serverSelectionTimeoutMS: config.mongo.connectTimeoutMS || 3000
    });

    connectPromise
        .then((client) => {
            var db2 = client.db(config.orionDb.prefix + '-' + tenant);
            var entities = db2.collection(config.orionDb.collection);

            entities.insertOne(entity)
                .then((result) => {
                    client.close();
                    return callback(null, result);
                })
                .catch((err) => {
                    client.close();
                    return callback(err);
                });
        })
        .catch((err) => {
            return callback(err);
        });
}
function configTest() {
    config.mongo.url = 'mongodb://localhost:27017/perseo_testing';
    config.endpoint.port = 9182;
    config.perseoCore.noticesURL = 'http://localhost:' + fakeServerPort;
    config.perseoCore.rulesURL = 'http://localhost:' + fakeServerPort;

    // This is necessary for SMS actions
    // The configuration for a working server must be present since the
    // beginning, for the module 'actions' taking it into account
    config.sms.URL = 'http://localhost:' + fakeServerPort;

    config.logLevel = 'fatal';
    config.nextCore = {};
    config.orionDb.url = 'mongodb://localhost:27017/test';
    config.orionDb.prefix = 'oriontest';
    config.perseoCore.interval = 10 * 60e3; //Do not refresh in the middle of a long test
    config.nonSignalMaxTimeDetection = 2592000;
}
function getConfig() {
    return config;
}

function getConfigTrust() {
    return configTrust;
}

function fakeHttpServer(cb) {
    var server = require('http')
        .createServer(function(req, res) {
            var body;
            req.on('data', function(data) {
                body += data;
            });
            req.on('end', function() {
                if (fakeServerCallback) {
                    fakeServerCallback(req, res, body);
                } else {
                    res.writeHead(fakeServerCode, { 'Content-Type': 'text/plain' });
                    res.end(fakeServerMessage);
                }
            });
        })
        .listen(fakeServerPort, function() {
            cb(null, server);
        });
}

module.exports.loadExample = loadExample;
module.exports.loadDirExamples = loadDirExamples;
module.exports.addRule = addRule;
module.exports.dropRules = dropRules;
module.exports.dropExecutions = dropExecutions;
module.exports.dropRulesCollection = dropRulesCollection;
module.exports.dropExecutionsCollection = dropExecutionsCollection;
module.exports.createRulesCollection = createRulesCollection;
module.exports.createEntitiesCollection = createEntitiesCollection;
module.exports.addEntity = addEntity;
module.exports.dropEntities = dropEntities;
module.exports.configTest = configTest;
module.exports.fakeHttpServer = fakeHttpServer;
module.exports.fakeHttpServerPort = fakeServerPort;
module.exports.setServerCode = function(code) {
    fakeServerCode = code;
};
module.exports.setServerMessage = function(msg) {
    fakeServerMessage = msg;
};
module.exports.setServerCallback = function(fxn) {
    fakeServerCallback = fxn;
};
module.exports.getConfig = getConfig;
module.exports.getConfigTrust = getConfigTrust;
