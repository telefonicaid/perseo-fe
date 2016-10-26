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
    actions = require('../../lib/models/actions'),
    executionsStore = require('../../lib/models/executionsStore'),
    constants = require('../../lib/constants'),
    request = require('request'),
    config = require('../../config'),
    EXEC_GRACE_PERIOD = 500;

describe('Actions', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PostAction()', function() {
        it('should return ok with a valid action', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_actions');
            async.eachSeries(cases, function(c, callback) {
                clients.PostAction(c.object, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 200);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });

        it('should return ok with a valid action with a rule for sms', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json');
            utilsT.getConfig().sms.URL = 'http://thisshouldbenothingnotaCB';
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
                        return callback();
                    });
                }
            ], done);
        });

        it('should return ok with a valid action with a rule for update', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_update.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_update.json');
            utilsT.getConfig().orion.URL = 'http://thisshouldbenothingnotaCB';
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
                        return callback();
                    });
                }
            ], done);
        });
        it('should return ok with a valid action with a rule for email', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_email.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_email.json');
            utilsT.getConfig().smtp.host = 'averyfarwayhosthatnotexist';
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    utilsT.setServerCallback(function(req, resp) {
                        resp.end('ok');
                        return done();
                    });
                    callback();
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                }
            ], done);
        });
        it('should return ok with a valid action with a rule for post', function(done) {
            var rule = utilsT.loadExample('./test/data/good_rules/blood_rule_post.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_post.json');
            async.series([
                function(callback) {
                    clients.PostRule(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback(null);
                    });
                },
                function(callback) {
                    utilsT.setServerCallback(function(req, resp) {
                        resp.end('ok');
                        return done();
                    });
                    callback();
                },
                function(callback) {
                    clients.PostAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        return callback();
                    });
                }
            ], done);
        });
        it('should return an error if rule name is missing', function(done) {
            var cases = [
                {},
                {id: 'something'}
            ];
            async.eachSeries(cases, function(c, callback) {
                clients.PostAction(c, function(error, data) {
                    should.not.exist(error);
                    data.should.have.property('statusCode', 400);
                    return callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
        it('should return an error when executing an action without rule name', function(done) {
            var cases = [
                {},
                {id: 'something'}
            ];
            async.eachSeries(cases, function(c, callback) {
                actions.Do(c, function(error) {
                    should.exist(error);
                    callback(null);
                });
            }, function(error) {
                should.not.exist(error);
                done();
            });
        });
    });

    describe('#action.Do()', function() {
        var start = Date.now();

        it('should update execution time when an action with interval has been executed', function(done) {
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
                    executionsStore.LastTime({
                            'event': {
                                service: action.ev.service,
                                subservice: action.ev.subservice,
                                ruleName: rule.name,
                                id: action.ev.id
                            },
                            'action': {index: 0}
                        },

                        function(error, time) {
                            should.not.exist(error);
                            time.should.not.be.equal(0);
                            time.should.be.lessThan(Date.now());
                            time.should.be.greaterThan(start);
                            return callback();
                        });
                }
            ], done);
        });

       it('should not execute an action when has been executed too recently', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/time_card.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json'),
                lastTime = 0,
                date = new Date();
            action.ev.id += date.getTime();
            utilsT.getConfig().sms.URL = util.format('http://localhost:%s', utilsT.fakeHttpServerPort);
            async.series([
                function(callback) {
                    clients.PostVR(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 201);
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
                    executionsStore.LastTime({
                            'event': {
                                service: action.ev.service,
                                subservice: action.ev.subservice,
                                ruleName: rule.name,
                                id: action.ev.id
                            },
                            'action': {index: 0}
                        },
                        function(error, time) {
                            should.not.exist(error);
                            time.should.not.be.equal(0);
                            time.should.be.lessThan(Date.now());
                            time.should.be.greaterThan(start);
                            lastTime = time;
                            return callback();
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
                    executionsStore.LastTime({
                            'event': {
                                service: action.ev.service,
                                subservice: action.ev.subservice,
                                ruleName: rule.name,
                                id: action.ev.id
                            },
                            'action': {index: 0}
                        },
                        function(error, time) {
                            should.not.exist(error);
                            time.should.be.equal(lastTime);
                            return callback();
                        });
                }
            ], done);
        });

        it('should not execute an action when has been triggered with the same correlator', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/time_card.json'),
                action = utilsT.loadExample('./test/data/good_actions/action_sms.json');
            action.ev.id = Date.now(); // generate unique id for event source

            function postAction(action, callback) {
                var options = {};
                options.headers = {};
                options.headers[constants.SERVICE_HEADER] = config.DEFAULT_SERVICE;
                options.headers[constants.SUBSERVICE_HEADER] = config.DEFAULT_SUBSERVICE;
                options.headers[constants.CORRELATOR_HEADER] = 'thesamecorrelator';
                options.url = util.format('http://%s:%s%s', config.endpoint.host,
                    config.endpoint.port, config.endpoint.actionsPath);
                options.body = action;
                options.json = true;

                request.post(options, function cbPostAxnTest(error, response, body) {
                    if (error) {
                        return callback(error, null);
                    }
                    if (response.headers['content-type'] === 'application/json; charset=utf-8' &&
                        typeof body === 'string') {
                        body = JSON.parse(body);
                    }
                    return callback(error, {statusCode: response.statusCode, body: body, headers: response.headers});
                });
            }
            async.series([
                function(callback) {
                    clients.PostVR(rule, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 201);
                        return callback(null);
                    });
                },
                function(callback) {
                    postAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 200);
                        setTimeout(callback, EXEC_GRACE_PERIOD);
                    });
                },
                function(callback) {
                    postAction(action, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 500);
                        callback();
                    });
                }
            ], done);
        });
    });
});
