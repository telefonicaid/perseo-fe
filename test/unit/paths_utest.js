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
    paths = require('../../lib/models/paths');

describe('Paths', function() {

    describe('#validService()', function() {
        it('should return null with a valid service', function() {
            var cases = ['a', 'aa', new Array(50).join('x')];
            cases.forEach(function(c) {
                var err = paths.validService(c);
                should(err).not.exist;
            });
        });
        it('should return error with empty value', function() {
            var cases = [''];
            cases.forEach(function(c) {
                var err = paths.validService(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.EmptyComponent);
            });
        });
        it('should return error with too long values', function() {
            var cases = [new Array(52).join('x'), new Array(256).join('x'), new Array(2048).join('x')];
            cases.forEach(function(c) {
                var err = paths.validService(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.TooLong);
            });
        });
        it('should return error with invalid characters', function() {
            var cases = ['ñ', 'aaaaaa%bbbbb', 'q@q', 'aaaa?', 'a)s', '€asdadd'];
            cases.forEach(function(c) {
                var err = paths.validService(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.InvalidCharacter);
            });
        });
    });
    describe('#validServicePath()', function() {
        it('should return null with a valid subservice', function() {
            var cases = ['/', '/a/b/c', '/aa', new Array(50).join('x') + '/' + new Array(50).join('y')];
            cases.forEach(function(c) {
                var err = paths.validServicePath(c);
                should(err).not.exist;
            });
        });
        it('should return null with a right number of components', function() {
            var cases = [new Array(1).join('/x'), new Array(5).join('/x'), new Array(10).join('/x')];
            cases.forEach(function(c) {
                var err = paths.validServicePath(c);
                should(err).not.exist;
            });
        });
        it('should return null with a wrong number of components', function() {
            var cases = [new Array(11).join('/x'), new Array(15).join('/x'), new Array(1024).join('/x')];
            cases.forEach(function(c) {
                var err = paths.validServicePath(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.TooMany);
            });
        });
        it('should return error with empty value', function() {
            var cases = ['//'];
            cases.forEach(function(c) {
                var err = paths.validServicePath(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.EmptyComponent);
            });
        });
        it('should return error with too long values', function() {
            var cases = [new Array(52).join('x'), new Array(256).join('x'), new Array(2048).join('x')];
            cases.forEach(function(c) {
                c = '/' + c;
                var err = paths.validServicePath(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.TooLong);
            });
        });
        it('should return error with invalid characters', function() {
            var cases = ['ñ', 'aaaaaa%bbbbb', 'q@q', 'aaaa?', 'a)s', '€asdadd'];
            cases.forEach(function(c) {
                c = '/alskdjaslkj/' + c + '/klasjdlasjasl';
                var err = paths.validServicePath(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.InvalidCharacter);
            });
        });
        it('should return error with a no absolute path', function() {
            var cases = ['test45', 'test45_5', 'q/q', 'a/a/a/a'];
            cases.forEach(function(c) {
                var err = paths.validServicePath(c);
                should.exist(err);
                err.should.be.instanceof(paths.errors.AbsolutePath);
            });
        });
    });
});

