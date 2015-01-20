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

var async = require('async'),
    should = require('should'),
    clients = require('../utils/clients'),
    utilsT = require('../utils/utilsT'),
    testEnv = require('../utils/testEnvironment');

describe('Notices', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PosNotice()', function() {
        it('Good notices should be good', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_notices');
            async.eachSeries(cases, function(c, callback) {
                clients.PostNotice(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
        it('Invalid JSON should be an error', function(done) {
            var cases = ['', '{', '[1,2,]'];
            async.eachSeries(cases, function(c, callback) {
                clients.PostNotice(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 400);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });

        it('Core endpoint is not working should be an error', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_notices');
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            async.eachSeries(cases, function(c, callback) {
                clients.PostNotice(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 500);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
});

