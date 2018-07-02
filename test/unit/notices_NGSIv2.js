'use strict';

var should = require('should'),
    notices = require('../../lib/models/notices');

var noticeExampleV2 = JSON.stringify({
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
});

describe('Notices', function() {
    describe('#DoNotice CB NGSIv2', function() {
        var noticeExample;
        beforeEach(function() {
            // Default
            noticeExample = JSON.parse(noticeExampleV2);
        });
        it('should accept simple notice using Number type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            notices.Do(noticeExample, callback);
        });
        it('should fail whith empty notice', function() {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'Empty notice is not valid ');
            };
            notices.Do({}, callback);
        });
        it('should fail whith invalid subservice', function() {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'invalid notice format Subservice must be a comma-separated list of servicePath');
            };
            notices.Do({data:[]}, callback);
        });
        it('should fail whith invalid data', function() {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'invalid NGSIv2 notice format data must be an array, not a string');
            };
            noticeExample.data = 'bad';
            notices.Do(noticeExample, callback);
        });
        it('should fail whith invalid Servipaths', function() {

            var callback = function (e, request) {
                should.exist(e);
                should.not.exist(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message, 'Number of servicepath items does not match ContextResponses(3,1)');
            };
            noticeExample.subservice += ',extra/service/4fail, extra2/service';
            notices.Do(noticeExample, callback);
        });
        it('should accept simple notice using DateTime type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            noticeExample.data = [
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'DateTime',
                        'value': '2018-06-03T09:31:26.296Z',
                        'metadata': {}
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
        it('should accept notices including metadata without type', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            noticeExample.data[0].Attr1.metadata = {
                'metaAtt': {
                    'value': 'attMetaEXtra'
                }
            };
            notices.Do(noticeExample, callback);
        });
        it('should accept notices including geo:point metadata', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            noticeExample.data[0].Attr1.metadata = {
                'location': {
                    'value': '40.418889, -3.691944',
                    'type': 'geo:point'
                }
            };
            notices.Do(noticeExample, callback);
        });
        it('should accept notices including DateTime metadata', function() {

            var callback = function (e, request) {
                should.exist(request);
                request.should.not.be.instanceof(Error);
                should.equal(request.length, 1);
                should.equal(request[0].code, 200);
            };
            noticeExample.data[0].Attr1.metadata = {
                'aMomment': {
                    'value': '2018-06-03T09:31:26.296Z',
                    'type': 'DateTime'
                }
            };
            notices.Do(noticeExample, callback);
        });
        it('should fail parsing invalid location attributes', function() {
            var callback = function (e, request) {
                should.exist(e);
                should.not.exists(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message[0], 'Invalid geo:point attribute: invalid location 47.41x8889, -3.691944, x');
                should.equal(e.message[1], 'Invalid geo:point attribute metadata: longitude is not valid NaN');
                should.equal(e.message[2], 'Invalid geo:point attribute metadata: invalid location Error: ' +
                                           'Longitude must be in range [-180, 180).');
                should.equal(e.message[3], 'Invalid geo:point attribute: invalid location Error: ' +
                                           'Latitude must be in range [-90, 90).');
                should.equal(e.message[4], 'Invalid geo:point attribute metadata: latitude is not valid NaN');
                should.equal(e.message[5], 'Invalid geo:point attribute: invalid location 4559');
            };
            noticeExample.data = [
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '47.41x8889, -3.691944, x',
                        'metadata': {
                            'metaAttr1': {
                                type: 'geo:point',
                                value: '47.55555, -ll3.333x-333'
                            }
                        }
                    }
                },
                {
                    'id': 'sensor-2',
                    'type': 'tipeExample2',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '43.41x8889, -5.691944',
                        'metadata': {
                            'metaAttr1': {
                                type: 'geo:point',
                                value: '47.55555, -ll3.333x-333'
                            }
                        }
                    }
                },
                {
                    'id': 'sensor-3',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '47.418889, -3.691944',
                        'metadata': {
                            'metaAttr1': {
                                type: 'geo:point',
                                value: '47.55555, -333.333333'
                            }
                        }
                    }
                },
                {
                    'id': 'sensor-4',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '470.418889, -3.691944',
                        'metadata': {}
                    }
                },
                {
                    'id': 'sensor-5',
                    'type': 'tipeExample2',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': '43.41x8889, -5.691944',
                        'metadata': {
                            'metaAttr1': {
                                type: 'geo:point',
                                value: 'x4x7x.5555x5-, -3.33333'
                            }
                        }
                    }
                },
                {
                    'id': 'sensor-6',
                    'type': 'tipeExample2',
                    'Attr1': {
                        'type': 'geo:point',
                        'value': 4559,
                        'metadata': {
                            'metaAttr1': {
                                type: 'geo:point',
                                value: '47.55555, 3.33333'
                            }
                        }
                    }
                }
            ];
            noticeExample.subservice = '/test/notices/unit,/test/notices/unit,/test/notices/unit,' +
                                       '/test/notices/unit,/test/notices/unit,/test/notices/unit';
            notices.Do(noticeExample, callback);
        });
        it('should fail parsing invalid DateTime attributes', function() {
            var callback = function (e, request) {
                should.exist(e);
                should.not.exists(request);
                should.equal(e.httpCode, 400);
                should.equal(e.message[0], 'Invalid DateTime attribute metadata: datetime is not valid 2018-96-03T09:31:26.296Z');
                should.equal(e.message[1], 'Invalid DateTime attribute: datetime is not valid 2018-08-32T09:31:26.296Z');
            };
            noticeExample.data = [
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'DateTime',
                        'value': '2018-06-03T09:31:26.296Z',
                        'metadata': {
                            'metaAttr1': {
                                'value': '2018-96-03T09:31:26.296Z',
                                'type': 'DateTime'
                            }
                        }
                    }
                },
                {
                    'id': 'sensor-1',
                    'type': 'tipeExample1',
                    'Attr1': {
                        'type': 'DateTime',
                        'value': '2018-08-32T09:31:26.296Z',
                        'metadata': {
                            'metaAttr1': {
                                'value': '2018-06-03T09:31:26.296Z',
                                'type': 'DateTime'
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