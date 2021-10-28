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
    util = require('util'),
    request = require('request'),
    clients = require('../utils/clients'),
    utilsT = require('../utils/utilsT'),
    testEnv = require('../utils/testEnvironment'),
    config = require('../../config'),
    constants = require('../../lib/constants');

describe('Notices', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PosNotice()', function() {
        it('Good notices should be good', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_notices');
            async.eachSeries(
                cases,
                function(c, callback) {
                    clients.PostNotice(c.object, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
        it('Invalid JSON should be an error', function(done) {
            var cases = ['', '{', '[1,2,]'];
            async.eachSeries(
                cases,
                function(c, callback) {
                    clients.PostNotice(c.object, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 400);
                        return callback(null);
                    });
                },
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
        it('id as an attribute should be an error', function(done) {
            var n = utilsT.loadExample('./test/data/bad_notices/notice_id_as_attr.json');
            clients.PostNotice(n, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                return done();
            });
        });
        it('type as an attribute should be an error', function(done) {
            var n = utilsT.loadExample('./test/data/bad_notices/notice_type_as_attr.json');
            clients.PostNotice(n, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                return done();
            });
        });
        it('Core endpoint is not working should be an error', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_notices');
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            async.eachSeries(
                cases,
                function(c, callback) {
                    clients.PostNotice(c.object, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 400);
                        return callback(null);
                    });
                },
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
        it('several servicepaths should be OK', function(done) {
            var n = utilsT.loadExample('./test/data/notices_several_sp/several_servicepath.json'),
                options = {},
                data;
            options.headers = {};
            options.headers[constants.SERVICE_HEADER] = config.DEFAULT_SERVICE;
            options.headers[constants.SUBSERVICE_HEADER] = '/A,/B,/C';
            options.url = util.format(
                'http://%s:%s%s',
                config.endpoint.host,
                config.endpoint.port,
                config.endpoint.noticesPath
            );
            options.json = n;
            request.post(options, function localPostNotice(error, response, body) {
                should.not.exist(error);
                if (
                    response.headers['content-type'] === 'application/json; charset=utf-8' &&
                    typeof body === 'string'
                ) {
                    body = JSON.parse(body);
                }
                data = { statusCode: response.statusCode, body: body, headers: response.headers };
                data.should.have.property('statusCode', 200);
                return done();
            });
        });
    });
});
