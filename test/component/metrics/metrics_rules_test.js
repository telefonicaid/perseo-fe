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

    describe('#PostRule()', function() {
        it('should increment correct rules', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            metrics.GetDecorated(true); // reset value
            async.eachSeries(cases, function(c, callback) {
                clients.PostRule(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                should.exists(m);
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];

                should.equal(m.services.unknownt.sum.ruleCreation, cases.length);
                should.equal(m.services.unknownt.sum.okRuleCreation, cases.length);
                should.equal(m.services.unknownt.sum.failedRuleCreation, 0);

                return done();
            });
        });

        it('should increment an invalid rule creation', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_without_name.json');
            metrics.GetDecorated(true); // reset metrics
            clients.PostRule(rule, function(error, data) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                data.should.have.property('statusCode', 400);

                should.exists(m);
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];

                should.equal(m.services.unknownt.sum.ruleCreation, 1);
                should.equal(m.services.unknownt.sum.okRuleCreation, 0);
                should.equal(m.services.unknownt.sum.failedRuleCreation, 1);
                done();
            });
        });
    });

    describe('#DeletetRule()', function() {
        it('should be increment correct delete', function(done) {
            metrics.GetDecorated(true); // reset metrics
            clients.DeleteRule('a very strange rule to exist', function(error, data) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                data.should.have.property('statusCode', 200);

                should.exists(m);
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];

                should.equal(m.services.unknownt.sum.ruleDelete, 1);
                should.equal(m.services.unknownt.sum.okRuleDelete, 1);
                should.equal(m.services.unknownt.sum.failedRuleDelete, 0);
                return done();
            });
        });

        it('should increment problems deleting a rule', function(done) {
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            metrics.GetDecorated(true); // reset metrics
            clients.DeleteRule('a very strange rule to exist', function(error, data) {
                var m = metrics.GetDecorated(true), msub;
                should.not.exist(error);
                data.should.have.property('statusCode', 500);

                should.exists(m);
                should.exists(m.services);
                should.exists(m.services.unknownt);
                should.exists(m.services.unknownt.subservices);
                should.exists(m.services.unknownt.subservices['/']);
                msub = m.services.unknownt.subservices['/'];

                should.equal(m.services.unknownt.sum.ruleDelete, 1);
                should.equal(m.services.unknownt.sum.okRuleDelete, 0);
                should.equal(m.services.unknownt.sum.failedRuleDelete, 1);

                return done();
            });
        });
    });
});
