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
        describe('When there are not variables to expand', function() {
            it('should return the same string passed', function() {
                var str = 'a string without vars',
                    map = { without: 'XXXX', vars: 'YYYYY' },
                    newStr;
                newStr = myutils.expandVar(str, map);
                should.exist(newStr);
                newStr.should.be.equal(str);
            });
        });
        describe('When there is a variable which is a number to expand', function() {
            it('should return the number', function() {
                var str = '${a}',
                    map = { a: 23 },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal(23);
            });
        });
        describe('When there is a variable which is a string number to expand', function() {
            it('should return the number', function() {
                var str = '${a}',
                    map = { a: '23' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal(23);
            });
        });
        describe('When string and there is a variable which is a number to expand', function() {
            it('should return the string number', function() {
                var str = '"${a}"',
                    map = { a: 23 },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal('"23"');
            });
        });
        describe('When string and there is a variable which is a string number to expand', function() {
            it('should return the string number', function() {
                var str = '"${a}"',
                    map = { a: '23' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal('"23"');
            });
        });
        describe('When string and there is a variable which is a number to expand', function() {
            it('should return the string number', function() {
                var str = "'${a}'",
                    map = { a: 23 },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal("'23'");
            });
        });
        describe('When string and there is a variable which is a number to expand', function() {
            it('should return the string number', function() {
                var str = '${a}',
                    map = { a: 23 },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal(23);
            });
        });
        describe('When there is a variable which is a boolean to expand', function() {
            it('should return the boolean', function() {
                var str = '${a}',
                    map = { a: true },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal(true);
            });
        });
        describe('When there is a variable which is a string boolean to expand', function() {
            it('should return the boolean', function() {
                var str = '${a}',
                    map = { a: 'true' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal(true);
            });
        });
        describe('When there is a variable which is a string object to expand', function() {
            it('should return the object', function() {
                var str = '{"type":"Point"}',
                    map = { a: true },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.type.should.be.equal('Point');
            });
        });
        describe('When there is a variable which is a string object to expand', function() {
            it('should return the boolean', function() {
                var str = '${p}',
                    map = { p: { type: 'Point', coordinates: [11, 12] } },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.type.should.be.equal('Point');
                newStr.coordinates[0].should.be.equal(11);
                newStr.coordinates[1].should.be.equal(12);
            });
        });
        describe('When there is a variable which is a null to expand', function() {
            it('should return null', function() {
                var str = '${a}',
                    map = { a: null },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, null);
            });
        });
        describe('When there is a variable which is a string null to expand', function() {
            it('should return null', function() {
                var str = '${a}',
                    map = { a: 'null' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, null);
            });
        });
        describe('When there is a variable which is not expanded', function() {
            it('should return null', function() {
                var str = '${a}',
                    map = {},
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, null);
            });
        });
        describe('When string and there is a variable which is a null to expand', function() {
            it('should return "null"', function() {
                var str = '"${a}"',
                    map = { a: null },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, '"null"');
            });
        });
        describe('When string and there is a variable which is a string null to expand', function() {
            it('should return "null"', function() {
                var str = '"${a}"',
                    map = { a: 'null' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, '"null"');
            });
        });
        describe('When there is a variable which is a string to expand', function() {
            it('should return the string', function() {
                var str = '${a}',
                    map = { a: 'boniato' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal('boniato');
            });
        });
        describe('When there is not variable to expand', function() {
            it('should return the string', function() {
                var str = '${a}',
                    map = { b: 'boniato' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.equal(newStr, null);
            });
        });
        describe('When there is not some variables to expand', function() {
            it('should return the string', function() {
                var str = '${a} and ${b}',
                    map = { b: 'boniato' },
                    newStr;
                newStr = myutils.expandVar(str, map, true);
                should.exist(newStr);
                newStr.should.be.equal('null and boniato');
            });
        });
        describe('When there is a variable which is a string number to expand in a phone number', function() {
            it('should return the phone number', function() {
                var str = '${a}',
                    map = { a: '666123123' },
                    newStr;
                newStr = myutils.expandVar(str, map, false);
                should.exist(newStr);
                newStr.should.be.equal('666123123');
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
                    error.hostname.should.be.equal(host);
                    error.code.should.be.equal('ENOTFOUND');
                });
                done();
            });
        });
    });
});
