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

var
    async = require('async'),
    should = require('should'),
    util = require('util'),
    clients = require('../utils/clients'),
    utilsT = require('../utils/utilsT'),
    testEnv = require('../utils/testEnvironment'),
    EventEmitter = require('events').EventEmitter,
    updateDone = new EventEmitter();

describe('Auth', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#UpdateAction()', function() {
        it('should return ok with using a trust token', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_update_trust.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_update_trust.json');
            utilsT.getConfig().authentication.host = 'localhost';
            utilsT.getConfig().authentication.port = utilsT.fakeHttpServerPort;
            utilsT.getConfig().orion.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
            updateDone.once('updated_renew', done);
            updateDone.once('updated_first', function(error) {
                if (error) {
                    return done(error);
                }
                async.series([
                    function(callback) {
                        var respCodes = [401, 201, 200];
                        utilsT.setServerCallback(function(req, resp) {
                            resp.writeHead(respCodes.shift(),
                                {'x-subject-token': 'thisIsAnAccessToken2'});
                            resp.end('ok');
                            if (respCodes.length === 0) { // all requests done
                                updateDone.emit('updated_renew', null);
                            }
                        });
                        return callback();
                    },
                    function(callback) {
                        clients.PostAction(action, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 200);
                            return callback();
                        });
                    }
                ], function(error) {
                    if (error) {
                        return done(error);
                    }
                });
            });
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                },
                function(callback) {
                    var respCodes = [201, 200];
                    utilsT.setServerCallback(function(req, resp) {
                        resp.writeHead(respCodes.shift(),
                            {'x-subject-token': 'thisIsAnAccessToken'});
                        resp.end('ok');
                        if (respCodes.length === 0) { // all requests done
                            updateDone.emit('updated_first', null);
                        }
                    });
                    return callback();
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                }
            ], function(error) {
                if (error) {
                    return done(error);
                }
            });
        });
    });
});
