'use strict';

var should = require('should'),
    notices = require('../../lib/models/notices');

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

describe('Notices', function() {
    /*beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);*/

    describe('#DoNotice CB NGSIv1', function() {
        var noticeExample;
        beforeEach(function() {
            noticeExample = JSON.parse(noticeExampleV1);
        })
        it('should accept simple notice using Number type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            notices.Do(noticeExample, callback);
        });
        it('should accept simple notice using DateTime type', function() {

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
            noticeExample.contextResponses[0].contextElement.attributes[0].name = "id";
            notices.Do(noticeExample, function(err, data) {
                should.equal(err.httpCode, 400);
                should.equal(err.message, 'id as attribute {"name":"id","type":"Number","value":"123"}');
            });
        });
        it('should fail when contains Type As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = "type";
            notices.Do(noticeExample, function(err, data) {
                should.equal(err.httpCode, 400);
                should.equal(err.message, 'type as attribute {"name":"type","type":"Number","value":"123"}');
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
        });
    });
});