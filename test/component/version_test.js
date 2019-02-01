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

var should = require('should'),
    fs = require('fs'),
    clients = require('../utils/clients'),
    testEnv = require('../utils/testEnvironment');

describe('Version', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#GetVersion()', function() {
        it('should return version in package.json', function(done) {
            var packageObj = JSON.parse(fs.readFileSync('package.json')),
                body,
                obj;
            clients.GetVersion(function(error, data) {
                should.not.exist(error);
                data.should.have.property('statusCode', 200);
                data.should.have.property('body');
                body = data.body;
                body.should.have.property('data');
                obj = body.data;
                obj.should.have.property('name', packageObj.name);
                obj.should.have.property('version', packageObj.version);
                return done();
            });
        });
    });
});
