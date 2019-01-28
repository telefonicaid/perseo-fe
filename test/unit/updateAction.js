'use strict';

var should = require('should');
var rewire = require('rewire');
var updateAction = rewire('../../lib/models/updateAction.js');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.Should();
chai.use(sinonChai);


var metaExample = {
    'timestamp': '2018-12-05T12:34:32.00Z'
};
var action1 = {
    'type': 'update',
    'parameters': {
        'id':'${id}_NGSIv2Test',
        'type':'NGSIv2TypesTest',
        'version': '2',
        'attributes': [
            {
                'name':'streetLightID',
                'type': 'Text',
                'value': '${id}'
            },
            {
                'name':'illuminanceLevel',
                'type': 'Number',
                'value': '${lastLightIllum}'
            },
            {
                'name':'lastchange',
                'type': 'DateTime',
                'value': '${lastchange}'
            },
            {
                'name':'isonline',
                'type': 'Boolean',
                'value': '${isconnected}',
                'metadata': metaExample
            },
            {
                'name':'district',
                'type': 'Text',
                'value': '${areaServed}'
            },
            {
                'name':'status',
                'type': 'Text',
                'value': '${laststatus}'
            },
            {
                'name':'address',
                'type': 'Address',
                'value': '${streetAddress}, ${addressLocality}'
            },
            {
                'name':'powerState',
                'type': 'Text',
                'value': '${powerState}'
            },
            {
                'name':'ref',
                'type': '${refType}',
                'value': 'futureNull'
            }
        ]
    }
};
var event1 = {
    'ruleName': 'switch_on',
    'id': 'AmbientLightSensor:1',
    'lastLightIllum': 80,
    'isconnected': true,
    'streetAddress': 'Vasagatan 1',
    'addressLocality': 'Stockholm',
    'laststatus': 'allright',
    'powerState':'on',
    'lastchange': '2018-12-05T11:31:39.00Z',
    'subservice': '/',
    'areaServed': 'Stockholm center',
    'service': 'dev_test',
    'refType': 'None',
    'fiwarePerseoContext': {
        'path': '/actions/do',
        'op': '/actions/do',
        'comp': 'perseo-fe',
        'trans': 'f8636710-5fc6-4070-9b1e-8d414fc6522a',
        'corr': 'd5f0a9cc-0258-11e9-b678-0242ac160003; perseocep=15',
        'srv': 'dev_test',
        'subsrv': '/'
    }
};

var expectedChanges = {
    'address': {
        'value': 'Vasagatan 1, Stockholm',
        'type': 'Address'
    },
    'status': {
        'value': 'allright',
        'type': 'Text'
    },
    'ref': {
        'value': null,
        'type': 'None'
    },
    'isonline': {
        'value': true,
        'type': 'Boolean',
        'metadata': metaExample
    },
    'powerState': {
        'value': 'on',
        'type': 'Text'
    },
    'illuminanceLevel': {
        'value': 80,
        'type': 'Number'
    },
    'streetLightID': {
        'value': 'AmbientLightSensor:1',
        'type': 'Text'
    },
    'district': {
        'value': 'Stockholm center',
        'type': 'Text'
    },
    'lastchange': {
        'value': '2018-12-05T11:31:39.00Z',
        'type': 'DateTime'
    },
    'id': 'AmbientLightSensor:1_NGSIv2Test',
    'type': 'NGSIv2TypesTest'
};

describe('doIt', function() {

    describe('#NGSIv2 simple updateAction', function() {

        beforeEach(function () {
        });

        it('should accept NGSIv1 entities', function (done) {

            // Mocks
            var createEntityThen = sinon.spy(function (successCB, errorCB) {
                setTimeout(function () {
                    successCB({'httpCode': '200', 'message': 'all right'}); // success callback
                }, 0);
                return '__TEST';
            });
            var createEntityMock = sinon.spy(
                function (changes, options) {
                    return {'then': createEntityThen};
                }
            );
            var NGSICloseMock = sinon.spy(
                function () {
                    return 'closed';
                }
            );
            var NGSIConnectionMock = sinon.spy(
                function () {
                    return {
                        'v2': {'createEntity': createEntityMock},
                        'close': NGSICloseMock
                    };
                }
            );

            updateAction.__with__({
                'NGSI.Connection': NGSIConnectionMock
            })(function () {
                var callback = function (e, request) {
                    should.exist(request);
                    request.should.not.be.instanceof(Error);
                    should.equal(request.httpCode, 200);
                    createEntityMock.should.be.calledOnceWith(expectedChanges, {upsert: true});
                    done();
                };
                updateAction.doIt(action1, event1, callback);
            });
        });

    });
});