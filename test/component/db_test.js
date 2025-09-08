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

var should = require('should'),
    utilsT = require('../utils/utilsT'),
    db = require('../../lib/db');

describe('Db', function() {
    describe('#GetDB()', function() {
        var mongourl = '';
        var connectTimeoutMS;
        before(function() {
            mongourl = utilsT.getConfig().mongo.url;
            connectTimeoutMS = utilsT.getConfig().mongo.connectTimeoutMS;
            utilsT.getConfig().mongo.url = 'mongodb://ihopethisdoesnotexistpleeease:32321/perseo_testing';
            utilsT.getConfig().mongo.connectTimeoutMS = 200;
        });
        after(function() {
            utilsT.getConfig().mongo.url = mongourl;
            utilsT.getConfig().mongo.connectTimeoutMS = connectTimeoutMS;
        });
        it('should return an error when there is no database', function(done) {
            var errorReceived = false;
            
            // Add temporary handler for uncaught exceptions
            function uncaughtHandler(err) {
                if (err.message && err.message.includes('ihopethisdoesnotexistpleeease') && !errorReceived) {
                    errorReceived = true;
                    // Remove our handler
                    process.removeListener('uncaughtException', uncaughtHandler);
                    done(); // Test passes - we got the expected error
                }
            }
            
            process.on('uncaughtException', uncaughtHandler);
            
            // Set a timeout in case the error doesn't come
            var timeoutId = setTimeout(function() {
                if (!errorReceived) {
                    process.removeListener('uncaughtException', uncaughtHandler);
                    done(new Error('Expected MongoDB connection error was not received'));
                }
            }, 2000);
            
            db.getDb(function(error, database) {
                // In MongoDB 6.x, connection errors are thrown as uncaught exceptions
                // rather than passed to callbacks for certain types of connection failures
                if (error && !errorReceived) {
                    errorReceived = true;
                    clearTimeout(timeoutId);
                    process.removeListener('uncaughtException', uncaughtHandler);
                    should.exist(error);
                    should.not.exist(database);
                    done();
                }
            });
        });
    });
});
