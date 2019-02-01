/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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
    notices = require('../../lib/models/notices');

describe('Notices', function() {
    describe('#parseLocation()', function() {
        it('should return latitude, longitude with a valid location', function() {
            var cases = [
                [0, 0],
                [41.89193, 12.51133],
                [40.4165, -3.70256],
                [-33.45694, -70.64827],
                [-75.10194, 123.39528],
                [53.386944, -2.919444]
            ];
            // Be careful with precision errors

            cases.forEach(function(c) {
                var str = ' ' + c[0] + ', ' + c[1],
                    location = notices.ParseLocation(str);

                should.exist(location);
                location.should.not.be.instanceof(Error);
                should.equal(location.lat, c[0]);
                should.equal(location.lon, c[1]);
            });
        });

        it('should return error with invalid format', function() {
            var cases = ['', 'I got a gal, named Sue, she knows just what to do', '!!'];

            cases.forEach(function(c) {
                var err = notices.ParseLocation(c);

                should.exist(err);
                err.should.be.instanceof(notices.errors.InvalidLocation);
            });
        });

        it('should return error with invalid latitude', function() {
            var cases = [' x, 0', ', 12.5113300', '10e512, -3.7025600', '-10e512, 123.3952800'];

            cases.forEach(function(c) {
                var err = notices.ParseLocation(c);

                should.exist(err);
                err.should.be.instanceof(notices.errors.InvalidLatitude);
            });
        });

        it('should return error with invalid longitude', function() {
            var cases = ['0, x', '12.5113300, ', '3.7025600, 10e512', '123.3952800, -10e512'];

            cases.forEach(function(c) {
                var err = notices.ParseLocation(c);

                should.exist(err);
                err.should.be.instanceof(notices.errors.InvalidLongitude);
            });
        });
    });
});
