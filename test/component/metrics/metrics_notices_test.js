/*
 * Copyright 2017 Telefonica Investigación y Desarrollo, S.A.U
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
    clients = require('../../utils/clients'),
    utilsT = require('../../utils/utilsT'),
    testEnv = require('../../utils/testEnvironment'),
    metrics = require('../../../lib/models/metrics');

describe('Metrics', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    // This test contains more thoughtful checks than expected, as a double-check
    // Most of them are general and to be included in a general test for metrics.
    // The others KPI tests won't check the sums, existence, ... as the logic is common for all of them.

    describe('#Notices', function() {
        it('Good notices should be counted', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_notices');
            metrics.GetDecorated(true); // reset value
            async.eachSeries(cases, function(c, callback) {
                clients.PostNotice(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                should.exists(m);

                // sum
                should.exists(m.sum);
                should.equal(m.sum.incomingTransactions, cases.length);
                should.equal(m.sum.incomingTransactionsErrors, 0);
                should.equal(m.sum.notifications, cases.length);
                should.equal(m.sum.okNotifications, cases.length);
                should.equal(m.sum.failedNotifications, 0);

                // services sum
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.equal(m.services.unknownt.sum.incomingTransactions, cases.length);
                should.equal(m.services.unknownt.sum.incomingTransactionsErrors, 0);
                should.equal(m.services.unknownt.sum.notifications, cases.length);
                should.equal(m.services.unknownt.sum.okNotifications, cases.length);
                should.equal(m.services.unknownt.sum.failedNotifications, 0);

                // subservice

                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];
                should.equal(msub.incomingTransactions, cases.length);
                should.equal(msub.incomingTransactionsErrors, 0);
                should.equal(msub.notifications, cases.length);
                should.equal(msub.okNotifications, cases.length);
                should.equal(msub.failedNotifications, 0);

                done();
            });
        });
        it('bad notices should count as errors', function(done) {
            var cases = ['', '{', '[1,2,]'];
            metrics.GetDecorated(true); // reset value
            async.eachSeries(cases, function(c, callback) {
                clients.PostNotice(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 400);
                    return callback(null);
                });
            }, function(error) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                should.exists(m);
                should.equal(m.sum.incomingTransactions, cases.length);
                should.equal(m.sum.incomingTransactionsErrors, cases.length);
                should.equal(m.sum.notifications, cases.length);
                should.equal(m.sum.okNotifications, 0);
                should.equal(m.sum.failedNotifications, cases.length);

                // services sum
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.equal(m.services.unknownt.sum.incomingTransactions, cases.length);
                should.equal(m.services.unknownt.sum.incomingTransactionsErrors, cases.length);
                should.equal(m.services.unknownt.sum.notifications, cases.length);
                should.equal(m.services.unknownt.sum.okNotifications, 0);
                should.equal(m.services.unknownt.sum.failedNotifications, cases.length);

                // subservice

                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];
                should.equal(msub.incomingTransactions, cases.length);
                should.equal(msub.incomingTransactionsErrors, cases.length);
                should.equal(msub.notifications, cases.length);
                should.equal(msub.okNotifications, 0);
                should.equal(msub.failedNotifications, cases.length);
                done();
            });
        });
    });
});

