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
 * please contact with iot_support at tid dot es
 *
 * Created by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */

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
    timestamp: '2018-12-05T12:34:32.00Z'
};
var action1 = {
    type: 'update',
    parameters: {
        version: '2',
        attributes: [
            {
                name: 'streetLightID',
                type: 'Text',
                value: '${id}'
            },
            {
                name: 'textNumberLit',
                type: 'Text',
                value: 666
            },
            {
                name: 'textBoolLit',
                type: 'Text',
                value: false
            },
            {
                name: 'textObjLit',
                type: 'Text',
                value: { a: 1, b: 2 }
            },
            {
                name: 'streetLightID',
                type: 'Text',
                value: '${id}'
            },
            {
                name: 'illuminanceLevel',
                type: 'Number',
                value: '${lastLightIllumNumber}'
            },
            {
                name: 'illuminanceLevel2',
                type: 'Number',
                value: '${lastLightIllumStringNumber}'
            },
            {
                name: 'illuminanceLevel3',
                type: 'Number',
                value: 12.5
            },
            {
                name: 'lastchange',
                type: 'DateTime',
                value: '${stringDate}'
            },
            {
                name: 'lastchange2',
                type: 'DateTime',
                value: '${stringDateMs}'
            },
            {
                name: 'lastchange3',
                type: 'DateTime',
                value: '${numberDateMs}'
            },
            {
                name: 'isBool1',
                type: 'Boolean',
                value: '${isconnected}',
                metadata: metaExample
            },
            {
                name: 'isBool2',
                type: 'Boolean',
                value: 'true'
            },
            {
                name: 'isBool3',
                type: 'Boolean',
                value: 'true'
            },
            {
                name: 'isBool4',
                type: 'Boolean',
                value: 'false'
            },
            {
                name: 'isBool5',
                type: 'Boolean',
                value: 'other'
            },
            {
                name: 'isBool6',
                type: 'Boolean',
                value: true
            },
            {
                name: 'isBool7',
                type: 'Boolean',
                value: false
            },
            {
                name: 'district',
                type: 'Text',
                value: '${areaServed}'
            },
            {
                name: 'status',
                type: 'Text',
                value: '${laststatus}'
            },
            {
                name: 'address',
                type: 'Address',
                value: '${streetAddress}, ${addressLocality}'
            },
            {
                name: 'powerState',
                type: 'Text',
                value: '${powerState}'
            },
            {
                name: 'refNone',
                type: '${refNoneType}',
                value: null
            },
            {
                name: 'refNone2',
                type: '${refNoneType}',
                value: '123'
            },
            {
                name: 'refNone3',
                type: '${refNoneType}',
                value: null
            }
        ]
    }
};
var event1 = {
    ruleName: 'switch_on',
    id: 'AmbientLightSensor:1',
    type: 'AmbientLightSensor',
    lastLightIllumNumber: 80,
    lastLightIllumStringNumber: '69',
    isconnected: true,
    streetAddress: 'Vasagatan 1',
    addressLocality: 'Stockholm',
    laststatus: 'allright',
    powerState: 'on',
    stringDate: '2018-12-05T11:31:39.000Z',
    stringDateMs: '1548843060657',
    numberDateMs: 1548843229832,
    subservice: '/',
    areaServed: 'Stockholm center',
    service: 'dev_test',
    refNoneType: 'None',
    fiwarePerseoContext: {
        path: '/actions/do',
        op: '/actions/do',
        comp: 'perseo-fe',
        trans: 'f8636710-5fc6-4070-9b1e-8d414fc6522a',
        corr: 'd5f0a9cc-0258-11e9-b678-0242ac160003; perseocep=15',
        srv: 'dev_test',
        subsrv: '/'
    }
};
var expectedChanges = {
    actionType: 'append',
    entities: [
        {
            address: {
                value: 'Vasagatan 1, Stockholm',
                type: 'Address'
            },
            status: {
                value: 'allright',
                type: 'Text'
            },
            textBoolLit: {
                value: false,
                type: 'Text'
            },
            textNumberLit: {
                value: 666,
                type: 'Text'
            },
            textObjLit: {
                value: { a: 1, b: 2 },
                type: 'Text'
            },
            refNone: {
                value: null,
                type: 'None'
            },
            refNone2: {
                value: 123,
                type: 'None'
            },
            refNone3: {
                value: null,
                type: 'None'
            },
            isBool1: {
                value: true,
                type: 'Boolean',
                metadata: metaExample
            },
            isBool2: {
                value: true,
                type: 'Boolean'
            },
            isBool3: {
                value: true,
                type: 'Boolean'
            },
            isBool4: {
                value: false,
                type: 'Boolean'
            },
            isBool5: {
                value: 'other',
                type: 'Boolean'
            },
            isBool6: {
                value: true,
                type: 'Boolean'
            },
            isBool7: {
                value: false,
                type: 'Boolean'
            },
            powerState: {
                value: 'on',
                type: 'Text'
            },
            illuminanceLevel: {
                value: 80,
                type: 'Number'
            },
            illuminanceLevel2: {
                value: 69,
                type: 'Number'
            },
            illuminanceLevel3: {
                value: 12.5,
                type: 'Number'
            },
            streetLightID: {
                value: 'AmbientLightSensor:1',
                type: 'Text'
            },
            district: {
                value: 'Stockholm center',
                type: 'Text'
            },
            lastchange: {
                value: '2018-12-05T11:31:39.000Z',
                type: 'DateTime'
            },
            lastchange2: {
                value: 1548843060657,
                type: 'DateTime'
            },
            lastchange3: {
                value: 1548843229832,
                type: 'DateTime'
            }
        }
    ]
};

var queryOptions = { type: 'AmbientLightSensor' };

var expectedChanges2 = {
    actionType: 'append',
    entities: []
};

describe('doIt', function() {
    describe('#NGSIv2 updateActions', function() {
        beforeEach(function() {});

        it('should accept NGSIv2 entities', function(done) {
            // Mocks
            var batchUpdateThen = sinon.spy(function(successCB, errorCB) {
                setTimeout(function() {
                    successCB({ httpCode: '200', message: 'all right' }); // success callback
                }, 0);
                return '__TEST';
            });
            var batchUpdateMock = sinon.spy(function(changes, options) {
                return { then: batchUpdateThen };
            });
            var NGSICloseMock = sinon.spy(function() {
                return 'closed';
            });
            var NGSIConnectionMock = sinon.spy(function() {
                return {
                    v2: { batchUpdate: batchUpdateMock },
                    close: NGSICloseMock
                };
            });

            updateAction.__with__({
                'NGSI.Connection': NGSIConnectionMock
            })(function() {
                var callback = function(e, request) {
                    should.exist(request);
                    should.not.exist(e);
                    should.equal(request.httpCode, 200);
                    expectedChanges.entities[0].id = 'AmbientLightSensor:1_NGSIv2Test';
                    expectedChanges.entities[0].type = 'NGSIv2TypesTest';
                    batchUpdateMock.should.be.calledOnceWith(expectedChanges);
                    done();
                };
                action1.parameters.id = '${id}_NGSIv2Test';
                action1.parameters.type = 'NGSIv2TypesTest';
                updateAction.doIt(action1, event1, callback);
            });
        });

        it('should accept NGSIv2 entities without type and id', function(done) {
            // Mocks
            var batchUpdateThen = sinon.spy(function(successCB, errorCB) {
                setTimeout(function() {
                    successCB({ httpCode: '200', message: 'all right' }); // success callback
                }, 0);
                return '__TEST';
            });
            var batchUpdateMock = sinon.spy(function(changes, options) {
                return { then: batchUpdateThen };
            });
            var NGSICloseMock = sinon.spy(function() {
                return 'closed';
            });
            var NGSIConnectionMock = sinon.spy(function() {
                return {
                    v2: { batchUpdate: batchUpdateMock },
                    close: NGSICloseMock
                };
            });

            updateAction.__with__({
                'NGSI.Connection': NGSIConnectionMock
            })(function() {
                var callback = function(e, request) {
                    should.exist(request);
                    should.not.exist(e);
                    should.equal(request.httpCode, 200);
                    expectedChanges.entities[0].id = 'AmbientLightSensor:1';
                    expectedChanges.entities[0].type = 'AmbientLightSensor';
                    batchUpdateMock.should.be.calledOnceWith(expectedChanges);
                    done();
                };
                delete action1.parameters.id;
                delete action1.parameters.type;
                updateAction.doIt(action1, event1, callback);
            });
        });

        it('should control failed update actions', function(done) {
            // Mocks
            var theCBError = new Error();
            var batchUpdateThen = sinon.spy(function(successCB, errorCB) {
                setTimeout(function() {
                    errorCB(theCBError); // success callback
                }, 0);
                return '__TEST';
            });
            var batchUpdateMock = sinon.spy(function(changes, options) {
                return { then: batchUpdateThen };
            });
            var NGSICloseMock = sinon.spy(function() {
                return 'closed';
            });
            var NGSIConnectionMock = sinon.spy(function() {
                return {
                    v2: { batchUpdate: batchUpdateMock },
                    close: NGSICloseMock
                };
            });

            updateAction.__with__({
                'NGSI.Connection': NGSIConnectionMock
            })(function() {
                var callback = function(e, request) {
                    should.not.exist(request);
                    should.exist(e);
                    e.should.be.instanceof(Error);
                    expectedChanges.entities[0].id = 'AmbientLightSensor:1_NGSIv2Test';
                    expectedChanges.entities[0].type = 'NGSIv2TypesTest';
                    batchUpdateMock.should.be.calledOnceWith(expectedChanges);
                    done();
                };
                action1.parameters.id = '${id}_NGSIv2Test';
                action1.parameters.type = 'NGSIv2TypesTest';
                updateAction.doIt(action1, event1, callback);
            });
        });

        it('should accept NGSIv2 entities with filter', function(done) {
            // Mocks
            var listEntitiesThen = sinon.spy(function(successCB, errorCB) {
                setTimeout(function() {
                    successCB({ httpCode: '200', message: 'all right' }); // success callback
                }, 0);
                return '__TEST';
            });
            var batchUpdateThen = sinon.spy(function(successCB, errorCB) {
                setTimeout(function() {
                    successCB({ httpCode: '200', message: 'all right' }); // success callback
                }, 0);
                return '__TEST';
            });
            var listEntitiesMock = sinon.spy(function(changes, options) {
                return { then: listEntitiesThen };
            });
            var batchUpdateMock = sinon.spy(function(changes, options) {
                return { then: batchUpdateThen };
            });
            var NGSICloseMock = sinon.spy(function() {
                return 'closed';
            });
            var NGSIConnectionMock = sinon.spy(function() {
                return {
                    v2: {
                        listEntities: listEntitiesMock,
                        batchUpdate: batchUpdateMock
                    },
                    close: NGSICloseMock
                };
            });

            updateAction.__with__({
                'NGSI.Connection': NGSIConnectionMock
            })(function() {
                var callback = function(e, request) {
                    should.exist(request);
                    should.not.exist(e);
                    should.equal(request.httpCode, 200);
                    queryOptions.type = 'NGSIv2TypesTest2';
                    listEntitiesMock.should.be.calledOnceWith(queryOptions);
                    batchUpdateMock.should.be.calledOnceWith(expectedChanges2);
                    done();
                };
                action1.parameters.type = 'NGSIv2TypesTest2';
                action1.parameters.version = 2;
                action1.parameters.filter = { type: 'NGSIv2TypesTest2' };
                updateAction.doIt(action1, event1, callback);
            });
        });
    });
});
