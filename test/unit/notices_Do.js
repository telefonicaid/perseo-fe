'use strict';

var should = require('should');
var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.Should();
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

describe('Notices Do', function() {

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
                    processCBNoticeMock.should.have.been.calledWith('utest', '/test/notices/unit', v1notice, 0);
                    processCBNoticeMock.should.be.calledOnce;
                    // Checking call to requestWOMetrics
                    var h = {'fiware-servicepath': '/test/notices/unit'};
                    requestWOMetricsMock.should.have.been.calledWith('post', {
                        url: 'http://mokedurl.org',
                        json: coreNotice1,
                        headers: h
                    });
                    requestWOMetricsMock.should.be.calledOnce;
                    alarmReleaseMock.should.have.been.calledWith(postEvent);
                    alarmReleaseMock.should.be.calledOnce;
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
                should.equal(e.message, 'invalid notice format Subservice must be' +
                    ' a comma-separated list of servicePath');
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
                    processCBv2NoticeMock.should.have.been.calledWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    processCBv2NoticeMock.should.be.calledOnce;
                    // Checking call to requestWOMetrics
                    var h = {'fiware-servicepath': '/test/notices/unit'};
                    requestWOMetricsMock.should.have.been.calledWith('post', {
                        url: 'http://mokedurl.org',
                        json: coreNotice1,
                        headers: h
                    });
                    requestWOMetricsMock.should.be.calledOnce;
                    alarmReleaseMock.should.have.been.calledWith(postEvent);
                    alarmReleaseMock.should.be.calledOnce;
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
                    processCBv2NoticeMock.should.have.been.calledWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    processCBv2NoticeMock.should.be.calledOnce;
                    // Checking logError
                    logErrorMock.should.have.been.calledWith(errorLocNotice);
                    logErrorMock.should.be.calledOnce;
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
                    processCBv2NoticeMock.should.have.been.calledWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    processCBv2NoticeMock.should.be.calledOnce;
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
                    alarmRaiseMock.should.have.been.calledWith(postEvent);
                    alarmRaiseMock.should.be.calledOnce;
                    // Checking logError
                    logErrorMock.should.have.been.calledWith('errorMock!');
                    logErrorMock.should.be.calledOnce;
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
});