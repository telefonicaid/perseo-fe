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
chai.use(sinonChai);
chai.Should();

var id = 'sensor-1';
var type = 'tipeExample1';

var attrKey = 'Attr1';
var attrType = 'Number';
var attrValue = 122;

var subservice = '/test/notices/unit';
var service = 'utest';

var noticeExampleV1 = JSON.stringify({
    'subscriptionId': '5b311ccb29adb333f843b5f3',
    'originator': 'localhost',
    'contextResponses': [
        {
            'contextElement': {
                'id': id,
                'type': type,
                'isPattern': 'false',
                'attributes': [
                    {
                        'name': attrKey,
                        'type': attrType,
                        'value': attrValue
                    }
                ]
            }
        }
    ],
    'subservice': subservice,
    'service': service
});

var processCBNotice = notices.__get__('processCBNotice');

// Mocks
var mockedUid = 'MockedUID_';
var mockedDateMilis = 442796400000;
var uuidMock = sinon.spy(function () {
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


describe('Notices NGSIv1', function() {
    var noticeExample;
    beforeEach(function() {
        // Default
        noticeExample = JSON.parse(noticeExampleV1);
    });
    describe('#processCBNotice', function() {

        it('should accept simple notice using Number type', function(done) {

            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock
            })(function () {
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
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
                'parseLocation': parseLocationMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(locType);
                expect(noticeResult[attrKey]).to.equal(locValue);
                expect(noticeResult[attrKey + '__lat']).to.equal(lat);
                expect(noticeResult[attrKey + '__lon']).to.equal(long);
                expect(noticeResult[attrKey + '__x']).to.equal(x);
                expect(noticeResult[attrKey + '__y']).to.equal(y);
                parseLocationMock.should.have.been.calledWith(locValue);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept simple notice using DateTime type', function(done) {

            var parseDateMock = sinon.spy(function() {
                return {
                    'ts': 1528018286296,
                    'day': 3,
                    'month': 6,
                    'year': 2018,
                    'hour': 11,
                    'minute': 31,
                    'second': 26
                };
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                'parseDate': parseDateMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = dateType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = dateValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(dateType);
                expect(noticeResult[attrKey]).to.equal(dateValue);
                expect(noticeResult[attrKey + '__ts']).to.equal(1528018286296);
                expect(noticeResult[attrKey + '__day']).to.equal(3);
                expect(noticeResult[attrKey + '__month']).to.equal(6);
                expect(noticeResult[attrKey + '__year']).to.equal(2018);
                expect(noticeResult[attrKey + '__hour']).to.equal(11);
                expect(noticeResult[attrKey + '__minute']).to.equal(31);
                expect(noticeResult[attrKey + '__second']).to.equal(26);
                parseDateMock.should.have.been.calledWith(dateValue);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should accept notices including metadata without type', function(done) {

            var at = 'theMetaAttribute';
            var metaAtVal = 'mockedValue1234';
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                    'name':  at,
                    'value': metaAtVal
                }];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).not.exist;
                expect(noticeResult[attrKey + '__metadata__' + at]).to.equal(metaAtVal);
                done();
            });
        });

        it('should accept notice using DateTime metadata', function(done) {

            var at = 'theMetaAttribute';
            var parseDateMock = sinon.spy(function () {
                return {
                    'ts': 1528018286296,
                    'day': 3,
                    'month': 6,
                    'year': 2018,
                    'hour': 11,
                    'minute': 31,
                    'second': 26
                };
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                'parseDate': parseDateMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                    'name': at,
                    'value': dateValue,
                    'type': dateType
                }];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false'); // why not boolean??
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(dateType);
                expect(noticeResult[attrKey + '__metadata__' + at + '__ts']).to.equal(1528018286296);
                expect(noticeResult[attrKey + '__metadata__' + at + '__day']).to.equal(3);
                expect(noticeResult[attrKey + '__metadata__' + at + '__month']).to.equal(6);
                expect(noticeResult[attrKey + '__metadata__' + at + '__year']).to.equal(2018);
                expect(noticeResult[attrKey + '__metadata__' + at + '__hour']).to.equal(11);
                expect(noticeResult[attrKey + '__metadata__' + at + '__minute']).to.equal(31);
                expect(noticeResult[attrKey + '__metadata__' + at + '__second']).to.equal(26);
                parseDateMock.should.have.been.calledWith(dateValue);
                parseDateMock.should.be.calledOnce;
                done();
            });
        });

        it('should fail when contains Id As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'id';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.IdAsAttribute);
            expect(noticeResult.name).to.equal('ID_ATTRIBUTE');
            expect(noticeResult.message).to.equal('id as attribute ' + JSON.stringify(noticeExample.contextResponses[0]
                                                                                        .contextElement.attributes[0]));
            expect(noticeResult.httpCode).to.equal(400);
        });

        it('should fail when contains Type As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'type';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.TypeAsAttribute);
            expect(noticeResult.name).to.equal('TYPE_ATTRIBUTE');
            expect(noticeResult.message).to.equal('type as attribute ' + 
                                    JSON.stringify(noticeExample.contextResponses[0].contextElement.attributes[0]));
            expect(noticeResult.httpCode).to.equal(400);
        });

        // Weird functionality
        it('should accept notices and parse value as location when exist an attribute named location in metadata',
            function(done) {

                // this feature does not seem to make sense
                var at = 'location';
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
                    'parseLocation': parseLocationMock
                })(function () {
                    noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                        'name':  at,
                        'value': locValue,
                        'type': locType
                    }];
                    var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                    expect(noticeResult.noticeId).to.equal(mockedUid);
                    expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                    expect(noticeResult.id).to.equal(id);
                    expect(noticeResult.type).to.equal(type);
                    expect(noticeResult.subservice).to.equal(subservice);
                    expect(noticeResult.service).to.equal(service);
                    expect(noticeResult.isPattern).to.equal('false');
                    expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                    expect(noticeResult[attrKey]).to.equal(attrValue);
                    expect(noticeResult[attrKey + '__metadata__' + at]).to.equal(locValue);
                    expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(locType);
                    expect(noticeResult[attrKey + '__lat']).to.equal(lat);
                    expect(noticeResult[attrKey + '__lon']).to.equal(long);
                    expect(noticeResult[attrKey + '__x']).to.equal(x);
                    expect(noticeResult[attrKey + '__y']).to.equal(y);

                    // Why call parselocation with the attribute value and not with location metadata attribute?
                    parseLocationMock.should.have.been.calledWith(attrValue);
                    parseLocationMock.should.be.calledOnce;
                    done();
                });
            }
        );

        it('should catch correctly errors',
            function(done) {

                var error = new Error('fake error');
                var parseLocationMock = sinon.stub().throws(error);
                var logErrorMock = sinon.spy(
                    function(notice) {}
                );
                notices.__with__({
                    'uuid.v1': uuidMock,
                    'Date.now': dateNowMock,
                    'parseLocation': parseLocationMock,
                    'myutils.logErrorIf': logErrorMock
                })(function () {
                    noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                    noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                    var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                    noticeResult.should.be.instanceof(notices.errors.InvalidNotice);
                    expect(noticeResult.name).to.equal('INVALID_NOTICE');
                    expect(noticeResult.message).to.equal('invalid notice format ' + JSON.stringify(noticeExample));
                    expect(noticeResult.httpCode).to.equal(400);
                    expect(parseLocationMock).to.throw(Error);
                    expect(parseLocationMock).to.have.been.calledWith(locValue);
                    // Checking logError
                    logErrorMock.should.have.been.calledWith(noticeResult);
                    logErrorMock.should.be.calledOnce;
                    done();
                });
            }
        );

        it('should fail parsing invalid location attribute', function(done) {

            var error = new notices.errors.InvalidLocation('fake error');
            var parseLocationMock = sinon.spy(function() {
                return error;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                'parseLocation': parseLocationMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidLocation);
                expect(noticeResult.name).to.equal('INVALID_LOCATION');
                expect(noticeResult.message).to.equal(error.message);
                expect(noticeResult.httpCode).to.equal(400);
                parseLocationMock.should.have.been.calledWith(locValue);
                parseLocationMock.should.be.calledOnce;
                done();
            });
        });

    });
});
