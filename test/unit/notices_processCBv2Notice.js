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
 * please contact with::[contacto@tid.es]
 *
 * Created by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */
'use strict';

var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.Should();
chai.use(sinonChai);

var id = 'sensor-1';
var type = 'tipeExample1';

var attrType = 'Number';
var attrValue = 122;

var subservice = '/test/notices/unit';
var service = 'utest';

var noticeExampleV2 = {
    subscriptionId: '5b311ccb29adb333f843b5f3',
    data: [
        {
            id: id,
            type: type
        }
    ],
    subservice: subservice,
    service: service
};
var attrKey = 'Attr1';
noticeExampleV2.data[0][attrKey] = {
    type: attrType,
    value: attrValue
};
noticeExampleV2 = JSON.stringify(noticeExampleV2);

var processCBv2Notice = notices.__get__('processCBv2Notice');

// Mocks
var mockedUid = 'MockedUID_';
var mockedDateMilis = 442796400000;
var uuidMock = sinon.spy(function() {
    return mockedUid;
});
var dateNowMock = sinon.spy(function() {
    return mockedDateMilis;
});

// Date
var dateType = 'DateTime';
var dateValue = '2018-06-03T09:31:26.296Z';

// Array
var arrayType = 'json';
var arrayValue = [1, 2, 3, 4];

// Object
var objectType = 'json';
var objectValue = { color: 'red' };

// Location
var locType = 'geo:point';
var lat = 40.418889;
var long = -3.691944;
var locValue = lat + ', ' + long;

var locType2 = 'geo:json';
var locValue2 = { type: 'Point', coordinates: [long, lat] };

var p1 = -3.763423;
var p2 = 40.419867;
var p3 = -3.552066;
var p4 = 40.448949;
var locType3 = 'geo:json';
var locValue3 = { type: 'LineString', coordinates: [[p1, p2], [p3, p4]] };

var q1 = -3.699893;
var q2 = 40.41087;
var q3 = -3.640863;
var q4 = 40.345617;
var q5 = -3.604573;
var q6 = 40.372574;
var q7 = -3.699893;
var q8 = 40.41087;
var locType4 = 'geo:json';
var locValue4 = { type: 'Polygon', coordinates: [[[q1, q2], [q3, q4], [q5, q6], [q7, q8]]] };

describe('Notices NGSIv2', function() {
    var noticeExample;
    beforeEach(function() {
        // Default
        noticeExample = JSON.parse(noticeExampleV2);
    });
    describe('#processCBv2Notice', function() {
        it('should accept simple notice using Number type', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                done();
            });
        });

        it('should accept simple notice using DateTime', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = dateType;
                noticeExample.data[0][attrKey].value = dateValue;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(dateType);
                expect(noticeResult[attrKey]).to.equal(dateValue);
                done();
            });
        });

        it('should accept simple notice using Array', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = arrayType;
                noticeExample.data[0][attrKey].value = arrayValue;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(arrayType);
                expect(noticeResult[attrKey]).to.equal(arrayValue);
                done();
            });
        });

        it('should accept simple notice using Object', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = objectType;
                noticeExample.data[0][attrKey].value = objectValue;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(objectType);
                expect(noticeResult[attrKey]).to.equal(objectValue);
                done();
            });
        });

        it('should accept simple notice using geo:point type', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = locType;
                noticeExample.data[0][attrKey].value = locValue;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey]).to.equal(locValue);
                done();
            });
        });

        it('should accept simple notice using geo:json type Point', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = locType2;
                noticeExample.data[0][attrKey].value = locValue2;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey]).to.equal(locValue2);
                expect(noticeResult[attrKey + '__type']).to.equal(locType2);
                done();
            });
        });

        it('should accept simple notice using geo:json type LineString', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = locType3;
                noticeExample.data[0][attrKey].value = locValue3;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey]).to.equal(locValue3);
                expect(noticeResult[attrKey + '__type']).to.equal(locType3);
                done();
            });
        });

        it('should accept simple notice using geo:json type Polygon', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.data[0][attrKey].type = locType4;
                noticeExample.data[0][attrKey].value = locValue4;
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey]).to.equal(locValue4);
                expect(noticeResult[attrKey + '__type']).to.equal(locType4);
                done();
            });
        });

        it('should accept notices including metadata without type', function(done) {
            var at = 'theAttribute';
            var metavalue = 'attMetaEXtraValue';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: metavalue
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).not.exist;
                expect(noticeResult[attrKey + '__metadata__' + at]).to.equal(metavalue);
                done();
            });
        });

        it('should accept notices including geo:point metadata', function(done) {
            var at = 'theAttribute';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: locValue,
                    type: locType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(locType);
                done();
            });
        });

        it('should accept notices including geo:json metadata type Point', function(done) {
            var at = 'theAttribute';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: locValue2,
                    type: locType2
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(locType2);
                done();
            });
        });

        it('should accept notices including DateTime metadata', function(done) {
            var at = 'theAttribute';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: dateValue,
                    type: dateType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal(false);
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(dateType);
                done();
            });
        });
    });

    describe('#Data types location and time', function() {
        var noticeExample;
        beforeEach(function() {
            // Default
            noticeExample = JSON.parse(noticeExampleV2);
        });
    });
});
