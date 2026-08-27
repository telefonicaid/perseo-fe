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
    var file = fs.readFileSync(fileName);

    return JSON.parse(file);
}

function loadDirExamples(filepath) {
    var files = fs.readdirSync(filepath),
        objects = [],
        elementPath;

    files.forEach(function(element) {
        elementPath = path.join(filepath, element);

        objects.push({
            filename: elementPath,
            object: loadExample(elementPath)
        });
    });

    return objects;
}

/**
 * Executes a Promise-based operation and exposes its result through
 * the callback API expected by the legacy test suite.
 *
 * @param {Function} operation Async operation to execute.
 * @param {Function} callback Node-style callback.
 */
function executeWithCallback(operation, callback) {
    Promise.resolve()
        .then(operation)
        .then(function(result) {
            callback(null, result);
        })
        .catch(function(error) {
            callback(error);
        });
}

function remove(collection, callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.mongo.url)
            .then(function(c) {
                client = c;

                return client
                    .db()
                    .collection(collection)
                    .deleteMany({});
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function dropRules(callback) {
    remove(config.collections.rules, callback);
}

function dropExecutions(callback) {
    remove(config.collections.executions, callback);
}

function dropCollection(collection, callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.mongo.url)
            .then(function(c) {
                client = c;

                return client
                    .db()
                    .collection(collection)
                    .drop();
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function dropRulesCollection(callback) {
    dropCollection(config.collections.rules, callback);
}

function dropExecutionsCollection(callback) {
    dropCollection(config.collections.executions, callback);
}

function createRulesCollection(callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.mongo.url)
            .then(function(c) {
                client = c;

                return client
                    .db()
                    .collection(config.collections.rules)
                    .createIndex(
                        { name: 1 },
                        {
                            unique: true,
                            w: 'majority'
                        }
                    );
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function addRule(rule, callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.mongo.url)
            .then(function(connectedClient) {
                client = connectedClient;

                return client
                    .db()
                    .collection(config.collections.rules)
                    .insertOne(rule);
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function createEntitiesCollection(tenant, callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.orionDb.url)
            .then(function(c) {
                client = c;

                return client
                    .db(config.orionDb.prefix + '-' + tenant)
                    .collection(config.orionDb.collection)
                    .createIndex(
                        { modDate: 1 },
                        {
                            unique: true,
                            w: 'majority'
                        }
                    );
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function dropEntities(callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.orionDb.url)
            .then(function(c) {
                client = c;

                return client
                    .db(config.orionDb.prefix + '-' + config.DEFAULT_SERVICE)
                    .collection(config.orionDb.collection)
                    .deleteMany({});
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function addEntity(tenant, entity, callback) {
    executeWithCallback(function() {
        var client;

        return MongoClient.connect(config.orionDb.url)
            .then(function(connectedClient) {
                client = connectedClient;

                return client
                    .db(config.orionDb.prefix + '-' + tenant)
                    .collection(config.orionDb.collection)
                    .insertOne(entity);
            })
            .finally(function() {
                if (client) {
                    return client.close();
                }
            });
    }, callback);
}

function configTest() {
    config.mongo.url = 'mongodb://localhost:27017/perseo_testing';
    config.endpoint.port = 9182;

    config.perseoCore.noticesURL = 'http://localhost:' + fakeServerPort;

    config.perseoCore.rulesURL = 'http://localhost:' + fakeServerPort;

    /*
     * This is necessary for SMS actions.
     * The configuration for a working server must be present from the
     * beginning so the actions module takes it into account.
     */
    config.sms.URL = 'http://localhost:' + fakeServerPort;

    config.logLevel = 'fatal';
    config.nextCore = {};

    config.orionDb.url = 'mongodb://localhost:27017/test';
    config.orionDb.prefix = 'oriontest';

    /*
     * Do not refresh in the middle of a long test.
     */
    config.perseoCore.interval = 10 * 60e3;

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
            var body = '';

            req.on('data', function(data) {
                body += data.toString();
            });

            req.on('end', function() {
                if (fakeServerCallback) {
                    fakeServerCallback(req, res, body);
                } else {
                    res.writeHead(fakeServerCode, {
                        'Content-Type': 'text/plain'
                    });

                    res.end(fakeServerMessage);
                }
            });
        })
        .listen(fakeServerPort, function() {
            cb(null, server);
        });

    server.on('error', function(error) {
        cb(error);
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
