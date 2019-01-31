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
    myutils = require('../../lib/myutils');

describe('Myutils', function() {
    describe('#ExpandVar()', function() {
        describe('When there are not variables', function() {
            it('should return the same string passed', function() {
                var str = 'a string without vars',
                    map = { without: 'XXXX', vars: 'YYYYY' },
                    newStr;
                newStr = myutils.expandVar(str, map);
                should.exist(newStr);
                newStr.should.be.equal(str);
            });
        });
    });
    describe('#RequestHelper()', function() {
        describe('When there is a network problem', function() {
            it('should return error', function(done) {
                var host = 'incredibleifthishostexistsicantbelievemyeyes.io';
                var url = 'http://' + host;
                myutils.requestHelper('get', { url: url }, function(error) {
                    should.exist(error);
                    error.host.should.be.equal(host);
                    error.code.should.be.equal('ENOTFOUND');
                });
                done();
            });
        });
    });
});
