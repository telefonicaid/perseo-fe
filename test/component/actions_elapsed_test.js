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
    EXEC_GRACE_PERIOD = 1000;

describe('Actions elapsed', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#action.Do()', function() {
        var executedActions;

        it('should serialize actions, executing only one when there is an elapsed condition,' +
            ' even when arriving "together"', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/time_card.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json'),
                date = new Date();
            action.ev.id += date.getTime();
            utilsT.getConfig().sms.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);


            async.series([
                function(callback) {
                    clients.PostVR(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 201);

                        utilsT.setServerCallback(function(req, resp) {
                            executedActions++;
                            resp.end('ok ' + executedActions + ' executedActions');
                        });
                        executedActions = 0;
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        setTimeout(callback, EXEC_GRACE_PERIOD);
                    });
                },
                function(callback) {
                    executedActions.should.be.equal(1);
                    return callback(null);
                }
            ], done);
        });

    });
});

