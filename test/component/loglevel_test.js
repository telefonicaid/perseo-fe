/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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
    async = require('async'),
    clients = require('../utils/clients'),
    testEnv = require('../utils/testEnvironment');

describe('LogLevel', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PutLoglevel()', function() {
        it('should return ok for  valid log levels', function(done) {
            var levels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
            async.eachSeries(levels, function(level, callback) {
                clients.PutLogLevel(level, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
        it('should return bad request for invalid log levels', function(done) {
            var levels = ['FANTASTIC', 'error', '', 'x'];
            async.eachSeries(levels, function(level, callback) {
                clients.PutLogLevel(level, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 400);
                    data.should.have.property('body');
                    data.body.should.have.property('error', 'invalid log level');
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
    describe('#GetLoglevel()', function() {
        it('should return the current log level', function(done) {
            var levels = ['FATAL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
            async.eachSeries(levels, function(level, callback) {
                clients.PutLogLevel(level, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    clients.GetLogLevel(function(error, response) {
                        should.not.exist(error);
                        response.should.have.property('statusCode', 200);
                        response.should.have.property('body');
                        response.body.should.have.property('level', level);
                        callback(null);
                    });

                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
});

