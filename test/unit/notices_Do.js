'use strict';

var should = require('should');
var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var noticeExampleV1 = JSON.stringify({
    'subscriptionId': '5b34e37052a01bc4c7e67c34',
    'originator': 'localhost',
    'contextResponses': [
        {
            'contextElement': {
                'type': 'tipeExample1',
                'isPattern': 'false',
                'id': 'sensor-1',
                'attributes': [
                    {
                        'name': 'Attr1',
                        'type': 'Number',
                        'value': '123'
                    }
                ]
            }
        }
    ],
    'subservice': '/test/notices/unit',
    'service': 'utest'
});

var noticeExampleV2 =  JSON.stringify({
    'subscriptionId': '5b311ccb29adb333f843b5f3',
    'data': [
        {
            'id': 'sensorv2-1',
            'type': 'tipeExamplev21',
            'Attr1': {
                'type': 'Number',
                'value': 122,
                'metadata': {}
            }
        }
    ],
    'subservice': '/test/notices/unitv2',
    'service': 'utestv2'
});

// Core mocks
var coreNotice1 = {
    'id': 'ent1',
    'type': 'Room',
    'service': 'utest',
    'subservice': '/test/notices/unit'
};

describe('Notices', function() {

    describe('#DoNotice', function() {
        var v1notice, v2notice;

        beforeEach(function () {
            v1notice = JSON.parse(noticeExampleV1);
            v2notice = JSON.parse(noticeExampleV2);
        });

        it('should accept NGSIv1 entities', function (done) {

            var postEvent = 'POST_EVENT';
            var alarmReleaseMock = sinon.spy(function () {});
            var processCBNoticeMock = sinon.spy(function () {
                return coreNotice1;
            });
            var requestWOMetricsMock = sinon.spy(
                function (method, option, callback) {
                    callback(null, {'httpCode': '200', 'message': 'all right'});
                }
            );
            notices.__with__({
                'processCBNotice': processCBNoticeMock,
                'myutils.requestHelperWOMetrics': requestWOMetricsMock,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.release': alarmReleaseMock,
                'alarm.POST_EVENT': postEvent
            })(function () {
                var callback = function (e, request) {
                    should.exist(request);
                    request.should.not.be.instanceof(Error);
                    should.equal(request.length, 1);
                    should.equal(request[0].httpCode, 200);
                    // Checking call to processCBNotice
                    expect(processCBNoticeMock).to.have.been.calledOnceWith('utest', '/test/notices/unit', v1notice, 0);
                    // Checking call to requestWOMetrics
                    var h = {'fiware-servicepath': '/test/notices/unit'};
                    expect(requestWOMetricsMock).to.have.been.calledOnceWith('post', {
                        url: 'http://mokedurl.org',
                        json: coreNotice1,
                        headers: h
                    });
                    expect(alarmReleaseMock).to.have.been.calledOnceWith(postEvent);
                    done();
                };
                notices.Do(v1notice, callback);
            });
        });

        it('should fail whith empty notice', function(done) {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'Empty notice is not valid ');
                should.equal(e.name, 'EMPTY_NOTICE');
                done();
            };
            notices.Do({}, callback);
        });

        it('should fail whith invalid subservice', function(done) {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'invalid notice format Subservice must be a comma-separated list of servicePath');
                done();
            };
            notices.Do({data:[], subservice:123}, callback);
        });

        it('should accept NGSIv2 entities', function(done) {

            var postEvent = 'POST_EVENT';
            var alarmReleaseMock = sinon.spy(function () {});
            var processCBv2NoticeMock = sinon.spy(function () {
                return coreNotice1;
            });
            var requestWOMetricsMock = sinon.spy(
                function (method, option, callback) {
                    callback(null, {'httpCode': '200', 'message': 'all right'});
                }
            );
            notices.__with__({
                'myutils.requestHelperWOMetrics': requestWOMetricsMock,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.release': alarmReleaseMock,
                'alarm.POST_EVENT': postEvent,
                'processCBv2Notice': processCBv2NoticeMock
            })(function () {
                var callback = function (e, request) {
                    should.exist(request);
                    request.should.not.be.instanceof(Error);
                    should.equal(request.length, 1);
                    should.equal(request[0].httpCode, 200);
                    // Checking call to processCBv2NoticeMock
                    expect(processCBv2NoticeMock).to.have.been.calledOnceWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    // Checking call to requestWOMetrics
                    var h = {'fiware-servicepath': '/test/notices/unit'};
                    expect(requestWOMetricsMock).to.have.been.calledOnceWith('post', {
                        url: 'http://mokedurl.org',
                        json: coreNotice1,
                        headers: h
                    });
                    expect(alarmReleaseMock).to.have.been.calledOnceWith(postEvent);
                    done();
                };
                notices.Do(v2notice, callback);
            });
        });

        it('should process Errors correctly', function(done) {

            var postEvent = 'POST_EVENT';
            var alarmReleaseMock = sinon.spy(function () {});
            var errorLocNotice = new notices.errors.InvalidLocation('Location_Mock');
            errorLocNotice.httpCode = 500;
            var processCBv2NoticeMock = sinon.spy(function () {
                return errorLocNotice;
            });
            var logErrorMock = sinon.spy();
            notices.__with__({
                'processCBv2Notice': processCBv2NoticeMock,
                'myutils.logErrorIf': logErrorMock,
                'alarm.POST_EVENT': postEvent,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.release': alarmReleaseMock,
            })(function () {
                var callback = function (e, request) {
                    should.not.exists(request);
                    should.exist(e);
                    // Check invalid Location error
                    should.equal(e.httpCode, 500);
                    should.equal(e.message, 'invalid location Location_Mock');
                    // Checking call to processCBv2Notice
                    expect(processCBv2NoticeMock).to.have.been.calledOnceWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    // Checking logError
                    expect(logErrorMock).to.have.been.calledOnceWith(errorLocNotice);
                    done();
                };
                notices.Do(v2notice, callback);
            });
        });

        it('should process Error from core', function(done) {

            var postEvent = 'POST_EVENT';
            var alarmRaiseMock = sinon.spy(function () {});
            var processCBv2NoticeMock = sinon.spy(function () {
                return coreNotice1;
            });
            var requestWOMetricsMock = sinon.spy(
                function (method, option, callback) {
                    callback('errorMock!');
                }
            );
            var logErrorMock = sinon.spy(
                function(notice) {}
            );
            notices.__with__({
                'myutils.requestHelperWOMetrics': requestWOMetricsMock,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.raise': alarmRaiseMock,
                'alarm.POST_EVENT': postEvent,
                'processCBv2Notice': processCBv2NoticeMock,
                'config.nextCore': {noticesURL: 'http://nextCoreMockURL'},
                'myutils.logErrorIf': logErrorMock,
            })(function () {
                var callback = function (e, request) {
                    should.exist(e);
                    should.not.exists(request);
                    should.equal(e.httpCode, 400);
                    // Checking call to processCBv2NoticeMock
                    expect(processCBv2NoticeMock).to.have.been.calledOnceWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    // Checking call to requestWOMetrics
                    var h = {'fiware-servicepath': '/test/notices/unit'};
                    should.equal(requestWOMetricsMock.calledTwice, true);
                    expect(requestWOMetricsMock).to.have.been.calledWith('post', {
                        url: 'http://mokedurl.org',
                        json: coreNotice1,
                        headers: h
                    });
                    expect(requestWOMetricsMock).to.have.been.calledWith('post', {
                        url: 'http://nextCoreMockURL',
                        json: coreNotice1,
                        headers: h
                    });
                    expect(alarmRaiseMock).to.have.been.calledOnceWith(postEvent);
                    // Checking logError
                    expect(logErrorMock).to.have.been.calledOnceWith('errorMock!');
                    done();
                };
                notices.Do(v2notice, callback);
            });
        });

        it('should fail with invalid NGSIv2 data', function(done) {

            var callback = function (e, request) {
                should.not.exists(request);
                should.exist(e);
                // Check invalid notice error
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'invalid NGSIv2 notice format data must be an array, not a number');
                done();
            };
            v2notice.data =123;
            notices.Do(v2notice, callback);
        });
        it('should fail with invalid NGSIv1 contextResponses', function(done) {
            var callback = function (e, request) {
                should.not.exists(request);
                should.exist(e);
                // Check invalid Location error
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'ContextResponses is not an array (number)');
                done();
            };
            v1notice.contextResponses =123;
            notices.Do(v1notice, callback);
        });

        it('should fail whith invalid Servipaths', function(done) {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'Number of servicepath items does not match ContextResponses(3,1)');
                done();
            };
            v1notice.subservice += ',extra/service/4fail, extra2/service';
            notices.Do(v1notice, callback);
        });
    });

    describe('#processCBNotice', function() {
/*        it('should accept simple notice using DateTime type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            noticeExample.contextResponses = [
                {
                    'contextElement': {
                        'type': 'tipeExample1',
                        'isPattern': 'false',
                        'id': 'sensor-1',
                        'attributes': [
                            {
                                'name': 'Attr1',
                                'type': 'DateTime',
                                'value': '2018-06-03T09:31:26.296Z'
                            }
                        ]
                    }
                }
            ];
            notices.Do(noticeExample, callback);
        });
        it('should accept simple notice using geo:point type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                //should.equal(request[0].body, 'All right again!');
            };
            noticeExample.contextResponses = [
                {
                    'contextElement': {
                        'type': 'tipeExample1',
                        'isPattern': 'false',
                        'id': 'sensor-1',
                        'attributes': [
                            {
                                'name': 'Attr1',
                                'type': 'geo:point',
                                'value': '40.418889, -3.691944',
                            }
                        ]
                    }
                }
            ];
            notices.Do(noticeExample, callback);
        });
        it('should accept notices including metadata without type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                //should.equal(request[0].body, 'All right again!');
            };
            noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                'name':  'attMetaEXtraName',
                'value': '456',
                'type': 'Number'
            }];
            notices.Do(noticeExample, callback);
        });
        it('should accept notices including geo:point metadata', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                //should.equal(request[0].body, 'All right again!');
            };
            noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                'name':  'attMetaEXtraName',
                'value': '[40.418889, -3.691944]',
                'type': 'geo:point'
            }];
            notices.Do(noticeExample, callback);
        });
        it('should accept notices including DateTime metadata', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                //should.equal(request[0].body, 'All right again!');
            };
            noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [{
                'name':  'attMetaEXtraName',
                'value': '2018-06-03T09:31:26.296Z',
                'type': 'DateTime'
            }];
            notices.Do(noticeExample, callback);
        });
        it('should fail when contains Id As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'id';
            notices.Do(noticeExample, function(err, data) {
                should.equal(err.httpCode, 400);
                should.equal(err.message, 'id as attribute {'name':'id','type':'Number','value':'123'}');
            });
        });
        it('should fail when contains Type As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'type';
            notices.Do(noticeExample, function(err, data) {
                should.equal(err.httpCode, 400);
                should.equal(err.message, 'type as attribute {'name':'type','type':'Number','value':'123'}');
            });
        });
        it('should accept notices and parse value as location when exist an attribute named location in metadata',
            // This chech old NGSv1 way to indicate geolocalization type attributes
            function() {
                var callback = function (e, request) {
                    should.exist(request);
                    request.should.not.be.instanceof(Error);
                    should.equal(request.length, 1);
                    should.equal(request[0].code, 200);
                    //should.equal(request[0].body, 'All right again!');
                };
                noticeExample.contextResponses = [
                    {
                        'contextElement': {
                            'type': 'tipeExample1',
                            'isPattern': 'false',
                            'id': 'sensor-1',
                            'attributes': [
                                {
                                    'name': 'Attr1',
                                    'type': 'geoSomething',
                                    'value': '40.418889, -3.691944',
                                    'metadatas': [{
                                        // this name 'id' trigger the location parse for Attr1 value
                                        'name':  'location',
                                        'value': 'NotImportantValue',
                                        'type': 'deprecatedLocationType'
                                    }]
                                }
                            ]
                        }
                    }
                ];
                notices.Do(noticeExample, callback);
            }
        );
        it('should fail parsing NaN location old NGSv1 way',
            // This chech old NGSv1 way to indicate geolocalization type attributes
            function() {
                var callback = function (e, request) {
                    should.exist(e);
                    should.not.exists(request);
                    should.equal(e.httpCode, 400);
                    should.equal(e.message[0], 'latitude is not valid NaN');
                };
                noticeExample.contextResponses = [
                    {
                        'contextElement': {
                            'type': 'tipeExample1',
                            'isPattern': 'false',
                            'id': 'sensor-1',
                            'attributes': [
                                {
                                    'name': 'Attr1',
                                    'type': 'geoSomething',
                                    'value': 'XXP_BAD_402.418889, -3.691944',
                                    'metadatas': [{
                                        // this name 'id' trigger the location parse for Attr1 value
                                        'name':  'location',
                                        'value': 'NotImportantValue',
                                        'type': 'deprecatedLocationType'
                                    }]
                                }
                            ]
                        }
                    }
                ];
                notices.Do(noticeExample, callback);
            }
        );
        it('should fail parsing invalid location attribute', function() {
            var callback = function (e, request) {
                should.exist(e);
                should.not.exists(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message[0], 'invalid location Error: Latitude must be in range [-90, 90).');
            };
            noticeExample.contextResponses = [
                {
                    'contextElement': {
                        'type': 'tipeExample1',
                        'isPattern': 'false',
                        'id': 'sensor-1',
                        'attributes': [
                            {
                                'name': 'Attr1',
                                'type': 'geo:point',
                                'value': '452.418889, -3.691944',
                            }
                        ]
                    }
                }
            ];
            notices.Do(noticeExample, callback);
        });*/
    });
});