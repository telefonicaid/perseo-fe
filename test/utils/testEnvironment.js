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

var async = require('async'),
    app = require('../../lib/perseo'),
    fakeServer,
    utilsT = require('../utils/utilsT'),
    logger = require('logops');

logger.format = logger.formatters.pipe;
function commonBeforeEach(done) {
    utilsT.configTest();
    utilsT.setServerCallback(null);
    async.series(
        [
            function(callback) {
                utilsT.dropRules(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropRules', err);
                    }
                    return callback(err);
                });
            },
            function(callback) {
                utilsT.dropExecutions(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropExecutions', err);
                    }
                    return callback(err);
                });
            },
            function(callback) {
                utilsT.dropEntities(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropEntities', err);
                    }
                    return callback(err);
                });
            },
            function(callback) {
                utilsT.fakeHttpServer(function(err, server) {
                    fakeServer = server;
                    utilsT.setServerCode(200);
                    utilsT.setServerMessage('All right again!');
                    if (err) {
                        console.log('ERROR utilsT.fakeHttpServer', err);
                    }
                    callback(err);
                });
            },
            function(callback) {
                app.start(function(err) {
                    if (err) {
                        console.log('ERROR app.start', err);
                    }
                    callback(err);
                });
            },
        ],
        done
    );
}
function commonAfterEach(done) {
    async.series(
        [
            function(callback) {
                utilsT.dropRules(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropRules', err);
                    }
                    callback(err);
                });
            },
            function(callback) {
                utilsT.dropExecutions(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropExecutions', err);
                    }
                    return callback(err);
                });
            },
            function(callback) {
                utilsT.dropEntities(function(err) {
                    if (err) {
                        console.log('ERROR utilsT.dropEntities', err);
                    }
                    return callback(err);
                });
            },
            function(callback) {
                app.stop(function(err) {
                    if (err) {
                        console.log('ERROR app.stop', err);
                    }
                    callback(err);
                });
            },
            function(callback) {
                fakeServer.close(function(err) {
                    if (err) {
                        console.log('ERROR fakeServer.close', err);
                    }
                    callback(err);
                });
            },
        ],
        done
    );
}

module.exports.commonAfterEach = commonAfterEach;
module.exports.commonBeforeEach = commonBeforeEach;
