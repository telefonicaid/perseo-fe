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
    testEnv = require('../utils/testEnvironment'),
    rules = require('../../lib/models/rules');

describe('Rules', function() {

    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PutRules', function() {
        it('should return OK when refeshing rules to core', function(done) {
            var ruleSet = utilsT.loadDirExamples('./test/data/good_rules');
            async.eachSeries(ruleSet, function(c, callback) {
                clients.PostRule(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                rules.Refresh(done);
            });
        });
    });

    describe('#PostRule()', function() {
        it('should return OK when a correct rule is POSTed', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            async.eachSeries(cases, function(c, callback) {
                clients.PostRule(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                return done();
            });
        });
        it('should return the same rule was POSTed', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json');
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.GetRule(rule.name, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        data.should.have.property('body');
                        data.body.data.should.have.property('name', rule.name);
                        data.body.data.should.have.property('text', rule.text);
                        return callback();
                    });
                }
            ], done);
        });
        it('should return an error if core endpoint is not working', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            async.eachSeries(cases, function(c, callback) {
                clients.PostRule(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 500);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule without name', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_without_name.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule without text', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_without_text.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule without action type', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_without_action_type.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule with unknown action', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_unknown_action.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule with update action and id attr', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_update_action_id_attr.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing a rule with update action and type attr', function(done) {
            var rule = utilsT.loadExample('./test/data/bad_rules/rule_update_action_type_attr.json');
            clients.PostRule(rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                done();
            });
        });
        it('should return BAD REQUEST when POSTing an existent rule', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_email.json');
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 400);
                        return callback(null);
                    });
                }
            ], done);
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            async.series([
                utilsT.dropRulesCollection,
                function(callback0) {
                    async.eachSeries(cases, function(c, callback) {
                        clients.PostRule(c.object, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                    }, function(error) {
                        should.not.exist(error);
                        callback0();
                    });
                }
            ], function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
    describe('#DeletetRule()', function() {
        it('should be OK to delete a nonexistent rule', function(done) {
            clients.DeleteRule('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 200);
                return done();
            });
        });
        it('should be OK to delete an existent rule', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json');
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.DeleteRule(rule.name, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                }
            ], done);
        });
        it('should return an error if core endpoint is not working', function(done) {
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            clients.DeleteRule('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 500);
                return done();
            });
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            async.series([
                utilsT.dropRulesCollection,
                function(callback0) {
                    async.eachSeries(cases, function(c, callback) {
                        clients.DeleteRule(c.object.name, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                    }, function(error) {
                        should.not.exist(error);
                        callback0();
                    });
                }
            ], function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
    describe('#GetRule()', function() {
        it('should return NOT FOUND when the rule does not exist', function(done) {
            clients.GetRule('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 404);
                return done();
            });
        });
        it('should return OK when the rule exist', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json');
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    clients.GetRule(rule.name, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                }
            ], done);

        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_rules');
            async.series([
                utilsT.dropRulesCollection,
                function(callback0) {
                    async.eachSeries(cases, function(c, callback) {
                        clients.GetRule(c.object.name, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                    }, function(error) {
                        should.not.exist(error);
                        callback0();
                    });
                }
            ], function(error) {
                should.not.exist(error);
                done();
            });
        });

    });
    describe('#GetAllRules()', function() {
        it('should return an empty set when there are no rules', function(done) {
            clients.GetAllRules(function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 200);
                return done();
            });
        });
        it('should return an error when something goes wrong in database', function(done) {
            async.series([
                utilsT.dropRulesCollection,
                function(callback) {
                        clients.GetAllRules(function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                }
            ], function(error) {
                should.not.exist(error);
                done();
            });
        });
    });
});
