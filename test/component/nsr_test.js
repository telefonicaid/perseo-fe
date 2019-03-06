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
    utilsT = require('../utils/utilsT'),
    testEnv = require('../utils/testEnvironment'),
    clients = require('../utils/clients'),
    executionsStore = require('../../lib/models/executionsStore'),
    DEFAULT_SERVICE = 'unknownt',
    DEFAULT_SUBSERVICE = '/';

describe('Entity', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#alertFunc()', function() {
        var entities = [
                {
                    _id: { id: 'eA', servicePath: DEFAULT_SUBSERVICE, type: 'type e1' },
                    attrs: {
                        at: { value: 1, modDate: 0 },
                        other: { value: 'this is a value', modDate: 0 }
                    }
                },
                {
                    _id: { id: 'eB', servicePath: DEFAULT_SUBSERVICE, type: '' },
                    attrs: {
                        at: { value: 2, modDate: Date.now() / 1000 - 30 * 60 }
                    }
                },
                {
                    _id: { id: 'eC', servicePath: DEFAULT_SUBSERVICE },
                    attrs: {
                        at: { value: 3, modDate: -1 }
                    }
                }
            ],
            checkInterval = 1,
            rule = utilsT.loadExample('./test/data/no_signal/generic_nonsignal.json');

        // This is not correct, it does not affect actions module
        //      utilsT.getConfig().sms.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
        // We must start with the fake server in the initial configuration
        this.timeout(2 * checkInterval * 60e3);
        it('should return silent entities', function(done) {
            var start = Date.now();
            async.series(
                [
                    function(cb) {
                        utilsT.createEntitiesCollection.bind({}, DEFAULT_SERVICE),
                            async.eachSeries(entities, utilsT.addEntity.bind({}, DEFAULT_SERVICE), cb);
                    },
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(cb) {
                        // wait checker set at AddNSRule to wake up, created by POST of VR
                        setTimeout(cb, 1.25 * checkInterval * 60e3);
                    },
                    function(cb) {
                        async.eachSeries(
                            entities,
                            function(entity) {
                                executionsStore.LastTime(
                                    {
                                        event: {
                                            service: DEFAULT_SERVICE,
                                            subservice: DEFAULT_SUBSERVICE,
                                            ruleName: rule.name,
                                            id: entity._id.id
                                        },
                                        action: { index: 0 }
                                    },
                                    function(error, time) {
                                        should.not.exist(error);
                                        time.should.not.be.equal(0);
                                        time.should.be.greaterThan(start);
                                        return cb();
                                    }
                                );
                            },
                            cb
                        );
                    }
                ],
                function(err, results) {
                    // asserts
                    done(err);
                }
            );
        });
    });
});
