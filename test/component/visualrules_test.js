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
    testEnv = require('../utils/testEnvironment');

describe('VisualRules', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#PostVR()', function() {
        it('should return ok when posting good rules', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            async.eachSeries(
                cases,
                function(c, callback) {
                    clients.PostVR(c.object, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 201);
                        return callback(null);
                    });
                },
                function(error) {
                    should.not.exist(error);
                    return done();
                }
            );
        });
        it('should return error when posting bad rules', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/bad_vrs');
            async.eachSeries(
                cases,
                function(c, callback) {
                    clients.PostVR(c.object, function(error, data) {
                        should.not.exist(error);
                        data.should.have.property('statusCode', 400);
                        return callback(null);
                    });
                },
                function(error) {
                    should.not.exist(error);
                    return done();
                }
            );
        });
        it('should return an error when core-endpoint is not working', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            async.eachSeries(
                cases,
                function(c, callback) {
                    if (c.object.text) {
                        clients.PostVR(c.object, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                    } else {
                        return callback(null);
                    }
                },
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            async.series(
                [
                    utilsT.dropRulesCollection,
                    function(callback0) {
                        async.eachSeries(
                            cases,
                            function(c, callback) {
                                clients.PostVR(c.object, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 500);
                                    return callback(null);
                                });
                            },
                            function(error) {
                                should.not.exist(error);
                                callback0();
                            }
                        );
                    }
                ],
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
    });
    describe('#DeletetVR()', function() {
        it('should return ok when deleting a nonexistent rule', function(done) {
            clients.DeleteVR('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 204);
                return done();
            });
        });
        it('should return ok when deleting an existent rule', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        clients.DeleteVR(rule.name, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 204);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when core-endpoint is not working', function(done) {
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            clients.DeleteVR('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                return done();
            });
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            async.series(
                [
                    utilsT.dropRulesCollection,
                    function(callback0) {
                        async.eachSeries(
                            cases,
                            function(c, callback) {
                                clients.DeleteVR(c.object.name, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 500);
                                    return callback(null);
                                });
                            },
                            function(error) {
                                should.not.exist(error);
                                callback0();
                            }
                        );
                    }
                ],
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
    });
    describe('#GetVR()', function() {
        it('should return not found when getting a nonexistent rule', function(done) {
            clients.GetVR('a very strange rule to exist', function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 404);
                return done();
            });
        });
        it('should return a rule when it exists', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        clients.GetVR(rule.name, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 200);
                            data.should.have.property('body');
                            data.body.should.have.property('data');
                            should.not.exist(data.body.error);
                            should.deepEqual(data.body.data, rule);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            async.series(
                [
                    utilsT.dropRulesCollection,
                    function(callback0) {
                        async.eachSeries(
                            cases,
                            function(c, callback) {
                                clients.GetVR(c.object.name, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 500);
                                    return callback(null);
                                });
                            },
                            function(error) {
                                should.not.exist(error);
                                callback0();
                            }
                        );
                    }
                ],
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
    });
    describe('#GetAllVR()', function() {
        it('should return ok when getting an empty rule set', function(done) {
            clients.GetAllVR(function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 200);
                return done();
            });
        });
        it('should return a rule when it exists', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        clients.GetAllVR(function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 200);
                            data.should.have.property('body');
                            data.body.should.have.property('data');
                            should.not.exist(data.body.error);
                            should.deepEqual(data.body.data[0], rule);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when something goes wrong in database', function(done) {
            async.series(
                [
                    utilsT.dropRulesCollection,
                    function(callback) {
                        clients.GetAllVR(function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback(null);
                        });
                    }
                ],
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
    });

    describe('#PutVR()', function() {
        it('should return error when updating a nonexistent rule', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            clients.PutVR('a very strange rule to exist', rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 404);
                return done();
            });
        });
        it('should return ok when updating an existent rule', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        clients.PutVR(rule.name, rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 200);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when updating an rule without name', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        delete rule.name;
                        clients.PutVR('anothernameshouldnotbestored', rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 400);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when updating an invalid rule', function(done) {
            var goodRule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json'),
                badRule = utilsT.loadExample('./test/data/bad_vrs/not_supported_action.json');
            async.series(
                [
                    function(callback) {
                        clients.PostVR(goodRule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        clients.PutVR(goodRule.name, badRule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 400);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
        it('should return an error when core-endpoint is not working', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json');
            utilsT.setServerCode(400);
            utilsT.setServerMessage('what a pity!');
            clients.PutVR(rule.name, rule, function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 400);
                return done();
            });
        });
        it('should return an error when something goes wrong in database', function(done) {
            var cases = utilsT.loadDirExamples('./test/data/good_vrs');
            async.series(
                [
                    utilsT.dropRulesCollection,
                    function(callback0) {
                        async.eachSeries(
                            cases,
                            function(c, callback) {
                                clients.PutVR(c.object.name, c.object, function(error, data) {
                                    should.not.exist(error);
                                    data.should.have.property('statusCode', 500);
                                    return callback(null);
                                });
                            },
                            function(error) {
                                should.not.exist(error);
                                callback0();
                            }
                        );
                    }
                ],
                function(error) {
                    should.not.exist(error);
                    done();
                }
            );
        });
        it('should not save a VR not compiled by core', function(done) {
            var rule = utilsT.loadExample('./test/data/good_vrs/visual_rule_1.json'),
                originalID = 'ORIGINAL_ID';
            async.series(
                [
                    function(callback) {
                        // Set mark for tracking a possible change after update
                        rule.cards[0].id = originalID;
                        clients.PostVR(rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 201);
                            return callback(null);
                        });
                    },
                    function(callback) {
                        // new version of the rule
                        rule.cards[0].id = 'MOFIFIED_VR';
                        // simulate a compile error
                        utilsT.setServerCode(500);
                        utilsT.setServerMessage('what a pity!');
                        clients.PutVR(rule.name, rule, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 500);
                            return callback();
                        });
                    },
                    // The rule is the first version
                    function(callback) {
                        clients.GetVR(rule.name, function(error, data) {
                            should.not.exist(error);
                            data.should.have.property('statusCode', 200);
                            data.body.data.cards[0].id.should.be.equal(originalID);
                            return callback();
                        });
                    }
                ],
                done
            );
        });
    });
});
