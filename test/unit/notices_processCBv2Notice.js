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

// Location
var locType = 'geo:point';
var lat = 40.418889;
var long = -3.691944;
var x = 441298.13043762115;
var y = 4474481.316254241;
var locValue = lat + ', ' + long;

var locType2 = 'geo:json';
var locValue2 = { type: 'Point', coordinates: [lat, long] };

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
                'uuid.v1': uuidMock,
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
            var parseDateMock = sinon.spy(function() {
                return {
                    a: 123,
                    b: 456
                };
            });

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseDate: parseDateMock
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
                expect(noticeResult[attrKey + '__a']).to.equal(123);
                expect(noticeResult[attrKey + '__b']).to.equal(456);
                parseDateMock.should.have.been.calledWith(dateValue);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept simple notice using geo:point type', function(done) {
            var parseLocationMock = sinon.spy(function() {
                return {
                    lat: lat,
                    lon: long,
                    x: x,
                    y: y
                };
            });

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
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
                expect(noticeResult[attrKey + '__type']).to.equal(locType);
                expect(noticeResult[attrKey + '__lat']).to.equal(lat);
                expect(noticeResult[attrKey + '__lon']).to.equal(long);
                expect(noticeResult[attrKey + '__x']).to.equal(x);
                expect(noticeResult[attrKey + '__y']).to.equal(y);
                parseLocationMock.should.have.been.calledWith(locValue);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept simple notice using geo:json type', function(done) {
            var parseLocationMock = sinon.spy(function() {
                return {
                    lat: lat,
                    lon: long,
                    x: x,
                    y: y
                };
            });

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
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
                //expect(noticeResult[attrKey]).to.equal(locValue2);
                expect(noticeResult[attrKey + '__type']).to.equal(locValue2.type);
                expect(noticeResult[attrKey + '__lat']).to.equal(lat);
                expect(noticeResult[attrKey + '__lon']).to.equal(long);
                expect(noticeResult[attrKey + '__x']).to.equal(x);
                expect(noticeResult[attrKey + '__y']).to.equal(y);
                expect(noticeResult[attrKey + '__coordinates__0']).to.equal(lat);
                expect(noticeResult[attrKey + '__coordinates__1']).to.equal(long);
                parseLocationMock.should.have.been.calledWith(locValue2.coordinates.toString());
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept simple notice using geo:json type LineString', function(done) {
            var parseLocationMock = sinon.spy(function() {
                return {};
            });

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
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
                expect(noticeResult[attrKey + '__type']).to.equal(locValue3.type);
                expect(noticeResult[attrKey + '__coordinates__0__0']).to.equal(p1);
                expect(noticeResult[attrKey + '__coordinates__0__1']).to.equal(p2);
                expect(noticeResult[attrKey + '__coordinates__1__0']).to.equal(p3);
                expect(noticeResult[attrKey + '__coordinates__1__1']).to.equal(p4);
                done();
            });
        });

        it('should accept simple notice using geo:json type Polygon', function(done) {
            var parseLocationMock = sinon.spy(function() {
                return {};
            });

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
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
                expect(noticeResult[attrKey + '__type']).to.equal(locValue4.type);
                expect(noticeResult[attrKey + '__coordinates__0__0__0']).to.equal(q1);
                expect(noticeResult[attrKey + '__coordinates__0__0__1']).to.equal(q2);
                expect(noticeResult[attrKey + '__coordinates__0__1__0']).to.equal(q3);
                expect(noticeResult[attrKey + '__coordinates__0__1__1']).to.equal(q4);
                expect(noticeResult[attrKey + '__coordinates__0__2__0']).to.equal(q5);
                expect(noticeResult[attrKey + '__coordinates__0__2__1']).to.equal(q6);
                expect(noticeResult[attrKey + '__coordinates__0__3__0']).to.equal(q7);
                expect(noticeResult[attrKey + '__coordinates__0__3__1']).to.equal(q8);
                done();
            });
        });

        it('should accept notices including metadata without type', function(done) {
            var at = 'theAttribute';
            var metavalue = 'attMetaEXtraValue';
            notices.__with__({
                'uuid.v1': uuidMock,
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
            var parseLocationMock = sinon.spy(function() {
                return {
                    lat: lat,
                    lon: long,
                    x: x,
                    y: y
                };
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
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
                expect(noticeResult[attrKey + '__metadata__' + at + '__lat']).to.equal(lat);
                expect(noticeResult[attrKey + '__metadata__' + at + '__lon']).to.equal(long);
                expect(noticeResult[attrKey + '__metadata__' + at + '__x']).to.equal(x);
                expect(noticeResult[attrKey + '__metadata__' + at + '__y']).to.equal(y);
                parseLocationMock.should.have.been.calledWith(locValue);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept notices including DateTime metadata', function(done) {
            var at = 'theAttribute';
            var parseDateMock = sinon.spy(function() {
                return {
                    ts: 1528018286296,
                    day: 3,
                    month: 6,
                    year: 2018,
                    hour: 11
                    // ...
                };
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseDate: parseDateMock
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
                expect(noticeResult[attrKey + '__metadata__' + at + '__ts']).to.equal(1528018286296);
                expect(noticeResult[attrKey + '__metadata__' + at + '__day']).to.equal(3);
                expect(noticeResult[attrKey + '__metadata__' + at + '__month']).to.equal(6);
                expect(noticeResult[attrKey + '__metadata__' + at + '__year']).to.equal(2018);
                expect(noticeResult[attrKey + '__metadata__' + at + '__hour']).to.equal(11);
                parseDateMock.should.have.been.calledWith(dateValue);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should fail parsing invalid DateTime metadata attribute', function(done) {
            var at = 'theMetaAttribute';
            var invalidMetaDate = '2018-96-03T09:31:26.296Z'; // invalid date for metadata
            var errorDateNotice = new notices.errors.InvalidDateTime(invalidMetaDate);
            var parseDateMock = sinon.spy(function() {
                return errorDateNotice;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseDate: parseDateMock
            })(function() {
                // Set Invalid DateType metadata attribute
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: invalidMetaDate,
                    type: dateType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidDateTime);
                expect(noticeResult.name).to.equal('INVALID_DATETIME');
                expect(noticeResult.message).to.equal(
                    'Invalid ' + dateType + ' attribute metadata: datetime is not valid ' + invalidMetaDate
                );
                expect(noticeResult.httpCode).to.equal(400);
                parseDateMock.should.have.been.calledWith(invalidMetaDate);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should fail parsing invalid DateTime attribute', function(done) {
            var invalidAttDate = '2018-08-32T09:31:26.296Z'; // invalid date for attribute
            var errorDateNotice = new notices.errors.InvalidDateTime(invalidAttDate);
            var parseDateMock = sinon.spy(function() {
                return errorDateNotice;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseDate: parseDateMock
            })(function() {
                // Set Invalid DateType attribute
                noticeExample.data[0].Attr1 = {
                    value: invalidAttDate,
                    type: dateType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidDateTime);
                expect(noticeResult.name).to.equal('INVALID_DATETIME');
                expect(noticeResult.message).to.equal(
                    'Invalid ' + dateType + ' attribute: datetime is not valid ' + invalidAttDate
                );
                expect(noticeResult.httpCode).to.equal(400);
                parseDateMock.should.have.been.calledWith(invalidAttDate);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should fail parsing invalid location attribute', function(done) {
            var invalidLoc = '47.418889, -3.691944, 12.123'; // invalid location for attribute
            var locError = new notices.errors.InvalidLocation(invalidLoc);
            var parseLocationMock = sinon.spy(function() {
                return locError;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
            })(function() {
                // Set Invalid location attribute
                noticeExample.data[0].Attr1 = {
                    value: invalidLoc,
                    type: locType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidLocation);
                expect(noticeResult.name).to.equal('INVALID_LOCATION');
                expect(noticeResult.message).to.equal(
                    'Invalid ' + locType + ' attribute: invalid location ' + invalidLoc
                );
                expect(noticeResult.httpCode).to.equal(400);
                parseLocationMock.should.have.been.calledWith(invalidLoc);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should fail parsing invalid location metadata attribute', function(done) {
            var at = 'theMetaAttribute';
            var invalidLoc = '47.418889, -3.691944, 12.123'; // invalid location for attribute
            var locError = new notices.errors.InvalidLocation(invalidLoc);
            var parseLocationMock = sinon.spy(function() {
                return locError;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock
            })(function() {
                // Set Invalid location metadata attribute
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: invalidLoc,
                    type: locType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidLocation);
                expect(noticeResult.name).to.equal('INVALID_LOCATION');
                expect(noticeResult.message).to.equal(
                    'Invalid ' + locType + ' attribute metadata: invalid location ' + invalidLoc
                );
                expect(noticeResult.httpCode).to.equal(400);
                parseLocationMock.should.have.been.calledWith(invalidLoc);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should handle exception correctly', function(done) {
            var at = 'theMetaAttribute';
            var error = new Error('fake error');
            var parseLocationMock = sinon.stub().throws(error);
            var logErrorMock = sinon.spy(function(notice) {});

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                parseLocation: parseLocationMock,
                'myutils.logErrorIf': logErrorMock
            })(function() {
                // Set location metadata attribute
                var meta = (noticeExample.data[0].Attr1.metadata = {});
                meta[at] = {
                    value: locValue,
                    type: locType
                };
                var noticeResult = processCBv2Notice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidV2Notice);
                expect(noticeResult.name).to.equal('INVALID_NGSIV2_NOTICE');
                expect(noticeResult.message).to.equal(
                    'invalid NGSIv2 notice format ' + error + ' (' + JSON.stringify(noticeExample) + ')'
                );
                expect(noticeResult.httpCode).to.equal(400);
                expect(parseLocationMock).to.throw(Error);
                expect(parseLocationMock).to.have.been.calledWith(locValue);
                // Checking logError
                logErrorMock.should.have.been.calledWith(noticeResult);
                logErrorMock.should.be.calledOnce;
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

        it('should fail parsing invalid location attributes', function() {
            var callback = function(e, request) {
                expect(e).exist;
                expect(request).not.exist;
                expect(e.httpCode).to.equal(400);
                expect(e.message[0]).to.equal('Invalid geo:point attribute: invalid location 47.41x8889, -3.691944, x');
                expect(e.message[1]).to.equal('Invalid geo:point attribute metadata: longitude is not valid NaN');
                expect(e.message[2]).to.equal(
                    'Invalid geo:point attribute metadata: invalid location Error: ' +
                        'Longitude must be in range [-180, 180).'
                );
                expect(e.message[3]).to.equal(
                    'Invalid geo:point attribute: invalid location Error: ' + 'Latitude must be in range [-90, 90).'
                );
                expect(e.message[4]).to.equal('Invalid geo:point attribute metadata: latitude is not valid NaN');
                expect(e.message[5]).to.equal('Invalid geo:point attribute: invalid location 4559');
            };
            noticeExample.data = [
                {
                    id: 'sensor-1',
                    type: 'tipeExample1',
                    Attr1: {
                        type: 'geo:point',
                        value: '47.41x8889, -3.691944, x',
                        metadata: {
                            metaAttr1: {
                                type: 'geo:point',
                                value: '47.55555, -ll3.333x-333'
                            }
                        }
                    }
                },
                {
                    id: 'sensor-2',
                    type: 'tipeExample2',
                    Attr1: {
                        type: 'geo:point',
                        value: '43.41x8889, -5.691944',
                        metadata: {
                            metaAttr1: {
                                type: 'geo:point',
                                value: '47.55555, -ll3.333x-333'
                            }
                        }
                    }
                },
                {
                    id: 'sensor-3',
                    type: 'tipeExample1',
                    Attr1: {
                        type: 'geo:point',
                        value: '47.418889, -3.691944',
                        metadata: {
                            metaAttr1: {
                                type: 'geo:point',
                                value: '47.55555, -333.333333'
                            }
                        }
                    }
                },
                {
                    id: 'sensor-4',
                    type: 'tipeExample1',
                    Attr1: {
                        type: 'geo:point',
                        value: '470.418889, -3.691944',
                        metadata: {}
                    }
                },
                {
                    id: 'sensor-5',
                    type: 'tipeExample2',
                    Attr1: {
                        type: 'geo:point',
                        value: '43.41x8889, -5.691944',
                        metadata: {
                            metaAttr1: {
                                type: 'geo:point',
                                value: 'x4x7x.5555x5-, -3.33333'
                            }
                        }
                    }
                },
                {
                    id: 'sensor-6',
                    type: 'tipeExample2',
                    Attr1: {
                        type: 'geo:point',
                        value: 4559,
                        metadata: {
                            metaAttr1: {
                                type: 'geo:point',
                                value: '47.55555, 3.33333'
                            }
                        }
                    }
                }
            ];
            noticeExample.subservice =
                '/test/notices/unit,/test/notices/unit,/test/notices/unit,' +
                '/test/notices/unit,/test/notices/unit,/test/notices/unit';
            notices.Do(noticeExample, callback);
        });
        it('should fail parsing invalid DateTime attributes', function() {
            var callback = function(e, request) {
                expect(e).exist;
                expect(request).not.exist;
                expect(e.httpCode).to.equal(400);
                expect(e.message[0]).to.equal(
                    'Invalid DateTime attribute metadata: datetime' + ' is not valid 2018-96-03T09:31:26.296Z'
                );
                expect(e.message[1]).to.equal(
                    'Invalid DateTime attribute: datetime' + ' is not valid 2018-08-32T09:31:26.296Z'
                );
            };
            noticeExample.data = [
                {
                    id: 'sensor-1',
                    type: 'tipeExample1',
                    Attr1: {
                        type: 'DateTime',
                        value: '2018-06-03T09:31:26.296Z',
                        metadata: {
                            metaAttr1: {
                                value: '2018-96-03T09:31:26.296Z',
                                type: 'DateTime'
                            }
                        }
                    }
                },
                {
                    id: 'sensor-2',
                    type: 'tipeExample2',
                    Attr1: {
                        type: 'DateTime',
                        value: '2018-08-32T09:31:26.296Z',
                        metadata: {
                            metaAttr1: {
                                value: '2018-06-03T09:31:26.296Z',
                                type: 'DateTime'
                            }
                        }
                    }
                }
            ];
            noticeExample.subservice = '/test/notices/unit,/test/notices/unit';
            notices.Do(noticeExample, callback);
        });
    });
});
