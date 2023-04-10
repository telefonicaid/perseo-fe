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
    utilsT = require('../utils/utilsT'),
    db = require('../../lib/db');

describe('Db', function() {
    describe('#GetDB()', function() {
        var mongourl = '';
        before(function() {
            mongourl = utilsT.getConfig().mongo.url;
            utilsT.getConfig().mongo.url = 'mongodb://ihopethisdoesnotexistpleeease:32321/perseo_testing';
        });
        after(function() {
            utilsT.getConfig().mongo.url = mongourl;
        });
        it('should return an error when there is no database', function(done) {
            db.getDb(function(error, database) {
                should.exist(error);
                should.not.exist(database);
                done();
            });
        });
    });
});
