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

var should = require('should');
var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.Should();
chai.use(sinonChai);

var noticeExampleV2 = JSON.stringify({
    subscriptionId: '5b311ccb29adb333f843b5f3',
    data: [
        {
            id: 'sensorv2-1',
            type: 'tipeExamplev21',
            Attr1: {
                type: 'Number',
                value: 122,
                metadata: {}
            }
        }
    ],
    subservice: '/test/notices/unitv2',
    service: 'utestv2'
});

// Core mocks
var coreNotice1 = {
    id: 'ent1',
    type: 'Room',
    service: 'utest',
    subservice: '/test/notices/unit'
};

describe('Notices Do', function() {
    describe('#DoNotice', function() {
        var v2notice;

        beforeEach(function() {
            v2notice = JSON.parse(noticeExampleV2);
        });

        it('should fail whith empty notice', function(done) {
            var callback = function(e, request) {
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
            var callback = function(e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(
                    e.message,
                    'invalid notice format Subservice must be' + ' a comma-separated list of servicePath'
                );
                done();
            };
            notices.Do({ data: [], subservice: 123 }, callback);
        });

        it('should accept NGSIv2 entities', function(done) {
            var postEvent = 'POST_EVENT';
            var alarmReleaseMock = sinon.spy(function() {});
            var processCBv2NoticeMock = sinon.spy(function() {
                return coreNotice1;
            });
            var requestWOMetricsMock = sinon.spy(function(method, option, callback) {
                callback(null, { httpCode: '200', message: 'all right' });
            });
            notices.__with__({
                'myutils.requestHelperWOMetrics': requestWOMetricsMock,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.release': alarmReleaseMock,
                'alarm.POST_EVENT': postEvent,
                processCBv2Notice: processCBv2NoticeMock
            })(function() {
                var callback = function(e, request) {
                    should.exist(request);
                    request.should.not.be.instanceof(Error);
                    should.equal(request.length, 1);
                    should.equal(request[0].httpCode, 200);
                    // Checking call to processCBv2NoticeMock
                    processCBv2NoticeMock.should.have.been.calledWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    processCBv2NoticeMock.should.be.calledOnce;
                    // Checking call to requestWOMetrics
                    var h = { 'fiware-servicepath': '/test/notices/unit' };
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
            var alarmReleaseMock = sinon.spy(function() {});
            var errorLocNotice = new notices.errors.InvalidLocation('Location_Mock');
            errorLocNotice.httpCode = 500;
            var processCBv2NoticeMock = sinon.spy(function() {
                return errorLocNotice;
            });
            var logErrorMock = sinon.spy();
            notices.__with__({
                processCBv2Notice: processCBv2NoticeMock,
                'myutils.logErrorIf': logErrorMock,
                'alarm.POST_EVENT': postEvent,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.release': alarmReleaseMock
            })(function() {
                var callback = function(e, request) {
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
            var alarmRaiseMock = sinon.spy(function() {});
            var processCBv2NoticeMock = sinon.spy(function() {
                return coreNotice1;
            });
            var requestWOMetricsMock = sinon.spy(function(method, option, callback) {
                callback('errorMock!');
            });
            var logErrorMock = sinon.spy(function(notice) {});
            notices.__with__({
                'myutils.requestHelperWOMetrics': requestWOMetricsMock,
                'config.perseoCore.noticesURL': 'http://mokedurl.org',
                'alarm.raise': alarmRaiseMock,
                'alarm.POST_EVENT': postEvent,
                processCBv2Notice: processCBv2NoticeMock,
                'config.nextCore': { noticesURL: 'http://nextCoreMockURL' },
                'myutils.logErrorIf': logErrorMock
            })(function() {
                var callback = function(e, request) {
                    should.exist(e);
                    should.not.exists(request);
                    should.equal(e.httpCode, 400);
                    // Checking call to processCBv2NoticeMock
                    processCBv2NoticeMock.should.have.been.calledWith('utestv2', '/test/notices/unitv2', v2notice, 0);
                    processCBv2NoticeMock.should.be.calledOnce;
                    // Checking call to requestWOMetrics
                    var h = { 'fiware-servicepath': '/test/notices/unit' };
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
            var callback = function(e, request) {
                should.not.exists(request);
                should.exist(e);
                // Check invalid notice error
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'invalid NGSIv2 notice format data must be an array, not a number');
                done();
            };
            v2notice.data = 123;
            notices.Do(v2notice, callback);
        });
    });
});
