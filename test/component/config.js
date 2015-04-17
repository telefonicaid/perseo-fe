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

function postRuleOK(done) {
    var cases = utilsT.loadDirExamples('./test/data/good_rules');
    utilsT.getConfig().nextCore = {};
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
}

function postNoticeOK(done) {
    var cases = utilsT.loadDirExamples('./test/data/good_notices');
    async.eachSeries(cases, function(c, callback) {
        clients.PostNotice(c.object, function(error, data) {
            should.not.exist(error);
            data.should.have.property('statusCode', 200);
            return callback(null);
        });
    }, function(error) {
        should.not.exist(error);
        done();
    });
}

describe('Config', function() {

    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#Without next core', function() {
        utilsT.getConfig().nextCore = undefined;
        it('should return OK when posting a rule', postRuleOK);
        it('should return OK when posting a notice', postNoticeOK);
    });
    describe('#With next core empty', function() {
        utilsT.getConfig().nextCore = {};
        it('should return OK when posting a rule', postRuleOK);
        it('should return OK when posting a notice', postNoticeOK);
    });
    describe('#With next core only for rules', function() {
        utilsT.getConfig().nextCore = {rulesURL: 'http://averyfarwayhost:1234'};
        it('should return OK when posting a rule', postRuleOK);
        it('should return OK when posting a notice', postNoticeOK);
    });
    describe('#With next core only for notices', function() {
        utilsT.getConfig().nextCore = {noticesURL: 'http://averyfarwayhost:1234'};
        it('should return OK when posting a rule', postRuleOK);
        it('should return OK when posting a notice', postNoticeOK);
    });
    describe('#With next core for notices and rules', function() {
        utilsT.getConfig().nextCore = {
            noticesURL: 'http://averyfarwayhost:1234',
            rulesURL: 'http://averyfarwayhost:1234'};
        it('should return OK when posting a rule', postRuleOK);
        it('should return OK when posting a notice', postNoticeOK);
    });
});

