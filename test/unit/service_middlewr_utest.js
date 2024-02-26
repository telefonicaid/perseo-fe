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
    service = require('../../lib/middleware/service');
var logger = require('logops');

describe('service middleware', function() {
    var serviceHeader = 'fiware-service',
        camelWord = 'camelCaseWord';
    describe('#service()', function() {
        it('should transform to lower case', function() {
            var req = { headers: {}, logger: logger },
                err;
            req.headers[serviceHeader] = camelWord;
            err = service.checkServiceHeaders(req);
            should.not.exist(err);
            should.equal(req.service, camelWord.toLowerCase());
        });
    });
    describe('#subservice()', function() {
        var subserviceHeader = 'fiware-servicepath',
            camelWord = '/camelCaseWord';
        it('should not transform to lower case', function() {
            var req = { headers: {}, logger: logger },
                err;
            req.headers[subserviceHeader] = camelWord;
            err = service.checkServiceHeaders(req);
            should.not.exist(err);
            should.equal(req.subservice, camelWord);
        });
    });
});
