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

var async = require('async'),
    should = require('should'),
    clients = require('../utils/clients'),
    utilsT = require('../utils/utilsT'),
    testEnv = require('../utils/testEnvironment'),
    actions = require('../../lib/models/actions'),
    config = require('../../config');

describe('Actions', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PostAction()', function() {
        it('should not keep invalid actions in queue', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/error_in_axn_rules/'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json');

            async.eachSeries(
                cases,
                function(c, callbackES) {
                    var rule = c.object;
                    // To be sure it's the same name in rule and action
                    action.ruleName = rule.name;
                    action.ev.id = 'device_err_axn';
                    action.ev.type = 'type_err_axn';
                    async.series(
                        [
                            function(callback) {
                                clients.PostRule(rule, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 200);
                                    return callback(null);
                                });
                            },
                            function(callback) {
                                clients.PostAction(action, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 200);
                                    return callback();
                                });
                            },
                            function(callback) {
                                clients.PostAction(action, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 200);
                                    return callback();
                                });
                            },
                            function(callback) {
                                clients.PostAction(action, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 200);
                                    return callback();
                                });
                            },
                            function(callback) {
                                setTimeout(function() {
                                    var array = actions.getInProcessArray(
                                        config.DEFAULT_SERVICE,
                                        config.DEFAULT_SUBSERVICE,
                                        rule.name,
                                        action.ev.id,
                                        action.ev.type
                                    );
                                    // Should not be any action in queue
                                    should.equal(array.length(), 0);
                                    return callback();
                                }, 100);
                            }
                        ],
                        callbackES
                    );
                },
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
    });
});
