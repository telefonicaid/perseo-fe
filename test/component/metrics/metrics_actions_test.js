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

var
    async = require('async'),
    should = require('should'),
    util = require('util'),
    clients = require('../../utils/clients'),
    utilsT = require('../../utils/utilsT'),
    testEnv = require('../../utils/testEnvironment'),
    metrics = require('../../../lib/models/metrics'),
    URL = require('url').URL;

describe('Metrics', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PostAction()', function() {
       it('should count fired valid actions', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_actions');
            metrics.GetDecorated(true); // reset metrics
            async.eachSeries(cases, function(c, callback) {
                clients.PostAction(c.object, function(error, data) {
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

                should.equal(m.services.unknownt.sum.firedRules, cases.length);

                return done();
            });
        });

        it('should increment successful sms', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json');
            utilsT.getConfig().sms.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
            metrics.GetDecorated(true); // reset metrics
            async.series([
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

                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;

                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionSMS, 1);
                            should.equal(m.services.unknownt.sum.okActionSMS, 1);
                            should.equal(m.services.unknownt.sum.failedActionSMS, 0);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 0);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

        it('should increment error for failed sms', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json');
            utilsT.getConfig().sms.URL = '';
            metrics.GetDecorated(true); // reset metrics
            async.series([
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

                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionSMS, 1);
                            should.equal(m.services.unknownt.sum.okActionSMS, 0);
                            should.equal(m.services.unknownt.sum.failedActionSMS, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 1);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

        it('should increment a successful action for update', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_update.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_update.json');
            utilsT.getConfig().orion.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
            metrics.GetDecorated(true); // reset metrics
            async.series([
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
                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionEntityUpdate, 1);
                            should.equal(m.services.unknownt.sum.okActionEntityUpdate, 1);
                            should.equal(m.services.unknownt.sum.failedActionEntityUpdate, 0);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 0);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });
        it('should increment a failed for update', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_update.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_update.json');
            utilsT.getConfig().orion.URL = new URL('http://inventedurl.notexists.com');
            metrics.GetDecorated(true); // reset metrics
            async.series([
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
                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionEntityUpdate, 1);
                            should.equal(m.services.unknownt.sum.okActionEntityUpdate, 0);
                            should.equal(m.services.unknownt.sum.failedActionEntityUpdate, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 1);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

        it('should increment successful post', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_post.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_post.json');
            metrics.GetDecorated(true); // reset metrics
            rule.action.parameters.url = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
            async.series([
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
                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionHttpPost, 1);
                            should.equal(m.services.unknownt.sum.okActionHttpPost, 1);
                            should.equal(m.services.unknownt.sum.failedActionHttpPost, 0);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 0);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

        it('should increment error for failed post', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_post.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_post.json');
            metrics.GetDecorated(true); // reset metrics
            rule.action.parameters.url = '';
            async.series([
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
                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionHttpPost, 1);
                            should.equal(m.services.unknownt.sum.okActionHttpPost, 0);
                            should.equal(m.services.unknownt.sum.failedActionHttpPost, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 1);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

        //
        // Missing case for successful email ... needed a SMTP fake server
        //
        // it('should increment successful email', function(done) {...}

        it('should increment error for failed email', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_email.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_email.json');
            utilsT.getConfig().smtp.host = 'averyfarwayhosthatnotexist';
            metrics.GetDecorated(true); // reset metrics
            async.series([
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

                        setTimeout(function() {
                            var m = metrics.GetDecorated(true), msub;
                            should.exists(m);
                            should.exists(m.services);
                            should.exists(m.services.unknownt);
                            should.exists(m.services.unknownt.subservices);
                            should.exists(m.services.unknownt.subservices['/']);
                            msub = m.services.unknownt.subservices['/'];

                            should.equal(m.services.unknownt.sum.actionEmail, 1);
                            should.equal(m.services.unknownt.sum.okActionEmail, 0);
                            should.equal(m.services.unknownt.sum.failedActionEmail, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactions, 1);
                            should.equal(m.services.unknownt.sum.outgoingTransactionsErrors, 1);
                            return callback();
                        }, 50);
                    });
                }
            ], done);
        });

    });
});
