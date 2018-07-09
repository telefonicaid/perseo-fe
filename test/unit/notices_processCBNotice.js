'use strict';

var should = require('should');
var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

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


describe('Notices', function() {
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
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], attrType);
                should.equal(noticeResult[attrKey], attrValue);
                done();
            });
        });

        it('should accept simple notice using geo:point type', function(done) {

            var parseLocation2GeoJSONMock = sinon.spy(function() {
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
                'parseLocation2GeoJSON': parseLocation2GeoJSONMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], locType);
                should.equal(noticeResult[attrKey], locValue);
                should.equal(noticeResult[attrKey + '__lat'], lat);
                should.equal(noticeResult[attrKey + '__lon'], long);
                should.equal(noticeResult[attrKey + '__x'], x);
                should.equal(noticeResult[attrKey + '__y'], y);
                expect(parseLocation2GeoJSONMock).to.have.been.calledOnceWith(locValue);
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
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], dateType);
                should.equal(noticeResult[attrKey], dateValue);
                should.equal(noticeResult[attrKey + '__ts'], 1528018286296);
                should.equal(noticeResult[attrKey + '__day'], 3);
                should.equal(noticeResult[attrKey + '__month'], 6);
                should.equal(noticeResult[attrKey + '__year'], 2018);
                should.equal(noticeResult[attrKey + '__hour'], 11);
                should.equal(noticeResult[attrKey + '__minute'], 31);
                should.equal(noticeResult[attrKey + '__second'], 26);
                expect(parseDateMock).to.have.been.calledOnceWith(dateValue);
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
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], attrType);
                should.equal(noticeResult[attrKey], attrValue);
                should.not.exist(noticeResult[attrKey + '__metadata__' + at + '__type']);
                should.equal(noticeResult[attrKey + '__metadata__' + at], metaAtVal);
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
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], attrType);
                should.equal(noticeResult[attrKey], attrValue);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__type'], dateType);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__ts'], 1528018286296);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__day'], 3);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__month'], 6);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__year'], 2018);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__hour'], 11);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__minute'], 31);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__second'], 26);
                expect(parseDateMock).to.have.been.calledOnceWith(dateValue);
                done();
            });
        });

        it('should fail when contains Id As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'id';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.IdAsAttribute);
            should.equal(noticeResult.name, 'ID_ATTRIBUTE');
            should.equal(noticeResult.message, 'id as attribute ' + JSON.stringify(noticeExample.contextResponses[0]
                                                                                        .contextElement.attributes[0]));
            should.equal(noticeResult.httpCode, 400);
        });

        it('should fail when contains Type As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'type';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.TypeAsAttribute);
            should.equal(noticeResult.name, 'TYPE_ATTRIBUTE');
            should.equal(noticeResult.message, 'type as attribute ' + JSON.stringify(noticeExample.contextResponses[0]
                .contextElement.attributes[0]));
            should.equal(noticeResult.httpCode, 400);
        });

        // Weird functionality
        it('should accept notices and parse value as location when exist an attribute named location in metadata',
            function(done) {

                // this feature does not seem to make sense
                var at = 'location';
                var parseLocation2GeoJSONMock = sinon.spy(function() {
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
                    'parseLocation2GeoJSON': parseLocation2GeoJSONMock
                })(function () {
                    noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                        'name':  at,
                        'value': locValue,
                        'type': locType
                    }];
                    var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                    should.equal(noticeResult.noticeId, mockedUid);
                    should.equal(noticeResult.noticeTS, mockedDateMilis);
                    should.equal(noticeResult.id, id);
                    should.equal(noticeResult.type, type);
                    should.equal(noticeResult.subservice, subservice);
                    should.equal(noticeResult.service, service);
                    should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                    should.equal(noticeResult[attrKey + '__type'], attrType);
                    should.equal(noticeResult[attrKey], attrValue);
                    should.equal(noticeResult[attrKey + '__metadata__' + at], locValue);
                    should.equal(noticeResult[attrKey + '__metadata__' + at + '__type'], locType);

                    // This attributes not should be metadata???
                    should.equal(noticeResult[attrKey + '__lat'], lat);
                    should.equal(noticeResult[attrKey + '__lon'], long);
                    should.equal(noticeResult[attrKey + '__x'], x);
                    should.equal(noticeResult[attrKey + '__y'], y);
                    //should.equal(noticeResult[attrKey + '__metadata__' + at + '__lat'], lat);
                    //should.equal(noticeResult[attrKey + '__metadata__' + at + '__lon'], long);
                    //should.equal(noticeResult[attrKey + '__metadata__' + at + '__x'], x);
                    //should.equal(noticeResult[attrKey + '__metadata__' + at + '__y'], y);

                    // Why call parselocation with the attribute value and not with location metadata attribute?
                    //expect(parseLocation2GeoJSONMock).to.have.been.calledOnceWith(locValue);
                    expect(parseLocation2GeoJSONMock).to.have.been.calledOnceWith(attrValue);
                    done();
                });
            }
        );
        /* why NGSIv1 dont parse metadata geo:points? only parseocation when 'name' is 'location'.
        it('should accept notice using geo:point metadata type', function(done) {

            var at = 'theMetaAttribute';
            var parseLocation2GeoJSONMock = sinon.spy(function() {
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
                'parseLocation2GeoJSON': parseLocation2GeoJSONMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                    'name':  at,
                    'value': locValue,
                    'type': locType
                }];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                should.equal(noticeResult.noticeId, mockedUid);
                should.equal(noticeResult.noticeTS, mockedDateMilis);
                should.equal(noticeResult.id, id);
                should.equal(noticeResult.type, type);
                should.equal(noticeResult.subservice, subservice);
                should.equal(noticeResult.service, service);
                should.equal(noticeResult.isPattern, 'false'); // why not boolean??
                should.equal(noticeResult[attrKey + '__type'], attrType);
                should.equal(noticeResult[attrKey], attrValue);
                should.equal(noticeResult[attrKey + '__metadata__' + at], locValue);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__type'], locType);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__lat'], lat);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__lon'], long);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__x'], x);
                should.equal(noticeResult[attrKey + '__metadata__' + at + '__y'], y);
                expect(parseLocation2GeoJSONMock).to.have.been.calledOnceWith(locValue);
                done();
            });
        });*/

        it('should catch correctly errors',
            function(done) {

                var error = new Error('fake error');
                var parseLocation2GeoJSONMock = sinon.stub().throws(error);
                var logErrorMock = sinon.spy(
                    function(notice) {}
                );
                notices.__with__({
                    'uuid.v1': uuidMock,
                    'Date.now': dateNowMock,
                    'parseLocation2GeoJSON': parseLocation2GeoJSONMock,
                    'myutils.logErrorIf': logErrorMock
                })(function () {
                    noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                    noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                    var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                    noticeResult.should.be.instanceof(notices.errors.InvalidNotice);
                    should.equal(noticeResult.name, 'INVALID_NOTICE');
                    should.equal(noticeResult.message, 'invalid notice format ' + JSON.stringify(noticeExample));
                    should.equal(noticeResult.httpCode, 400);
                    expect(parseLocation2GeoJSONMock).to.throw(Error);
                    expect(parseLocation2GeoJSONMock).to.have.been.calledWith(locValue);
                    // Checking logError
                    expect(logErrorMock).to.have.been.calledOnceWith();
                    done();
                });
            }
        );

        it('should fail parsing invalid location attribute', function(done) {

            var error = new notices.errors.InvalidLocation('fake error');
            var parseLocation2GeoJSONMock = sinon.spy(function() {
                return error;
            });
            notices.__with__({
                'uuid.v1': uuidMock,
                'Date.now': dateNowMock,
                'parseLocation2GeoJSON': parseLocation2GeoJSONMock
            })(function () {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                noticeResult.should.be.instanceof(notices.errors.InvalidLocation);
                should.equal(noticeResult.name, 'INVALID_LOCATION');
                should.equal(noticeResult.message, error.message);
                should.equal(noticeResult.httpCode, 400);
                expect(parseLocation2GeoJSONMock).to.have.been.calledWith(locValue);
                done();
            });
        });

    });
});