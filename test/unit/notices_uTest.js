'use strict';

var should = require('should'),
    notices = require('../../lib/models/notices'),
    testEnv = require('../utils/testEnvironment');

var noticeExample = {
    'subscriptionId': '5b311ccb29adb333f843b5f3',
    'data': [
        {
            'id': 'sensor-1',
            'type': 'tipeExample1',
            'Attr1': {
                'type': 'Number',
                'value': 122,
                'metadata': {}
            }
        }
    ],
    'subservice': '/test/notices/unit',
    'service': 'utest'
};

describe('Notices', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    describe('#DoNotice CB NGSIv2', function() {
        it('should return 200 with simple notice using Number type', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            notices.Do(noticeExample, callback);
        });
        it('should return 200 with simple notice using DataTime type', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            noticeExample.data = [
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'DataTime',
                        'value': '2018-06-03T09:31:26.296Z',
                        'metadata': {}
                    }
                }
            ];
            notices.Do(noticeExample, callback);
        });
        it('should return 200 with simple notice using geo:point type', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            noticeExample.data = [
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '40.418889, -3.691944',
                        'metadata': {}
                    }
                }
            ];
            notices.Do(noticeExample, callback);
        });
        it('should return 200 with notice including metadata without type', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            noticeExample.data[0].Attr1.metadata = {
                'metaAtt': {
                    'value': 'attMetaEXtra'
                }
            };
            notices.Do(noticeExample, callback);
        });
        it('should return 200 with notice including geo:point metadata', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            noticeExample.data[0].Attr1.metadata = {
                'location': {
                    'value': '[123,456]',
                    'type': 'geo:point'
                }
            };
            notices.Do(noticeExample, callback);
        });
        it('should return 200 with notice including DateTime metadata', function() {

            var callback = function(e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
                should.equal(request[0].body, 'All right again!');
            };
            noticeExample.data[0].Attr1.metadata = {
                'aMomment': {
                    'value': '2018-06-03T09:31:26.296Z',
                    'type': 'DateTime'
                }
            };
            notices.Do(noticeExample, callback);
        });
    });
});