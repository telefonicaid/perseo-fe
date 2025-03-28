/*
 * Copyright 2023 Telefonica Investigación y Desarrollo, S.A.U
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
 */

'use strict';

var should = require('should');
var rewire = require('rewire');
var entitiesStore = rewire('../../lib/models/entitiesStore.js');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var config = require('../../config.js');
chai.Should();
chai.use(sinonChai);

describe('entitiesStore', function() {
    var ruleData = {
            name: 'NSR2',
            action: {
                type: 'update',
                parameters: {
                    id: 'alarma:${id}',
                    type: 'Alarm',
                    attributes: [
                        {
                            name: 'msg',
                            value: 'El status de ${id} es ${status}'
                        }
                    ]
                }
            },
            subservice: '/',
            service: 'unknownt',
            nosignal: {
                checkInterval: '1',
                attribute: 'temperature',
                reportInterval: '5',
                id: 'thing:disp1',
                idRegexp: null,
                type: 'thing'
            }
        },
        alterFunc = 'sinon.stub()',
        callback = function(e, request) {
            should.exist(request);
            should.not.exist(e);
            should.equal(request.httpCode, 200);
        };

    describe('FindSilentEntities', function() {
        it('By default should call findSilentEntitiesByMongo', function() {
            var findSilentEntitiesByMongoSpy = sinon.spy();
            entitiesStore.__set__('findSilentEntitiesByMongo', findSilentEntitiesByMongoSpy);
            entitiesStore.FindSilentEntities(ruleData.service, ruleData.subservice, ruleData, alterFunc, callback);
            sinon.assert.calledOnce(findSilentEntitiesByMongoSpy);
        });

        it('If default settings are changed FindSilentEntitiesByAPI should be called', function() {
            config.nonSignalByAPI = true;
            var findSilentEntitiesByAPISpy = sinon.spy();
            entitiesStore.__set__('findSilentEntitiesByAPI', findSilentEntitiesByAPISpy);
            entitiesStore.FindSilentEntities();
            sinon.assert.calledOnce(findSilentEntitiesByAPISpy);
        });
    });

    describe('findSilentEntitiesByAPI', function() {
        it('should call findSilentEntitiesByAPIWithPagination', function() {
            var findSilentEntitiesByAPIWithPaginationSpy = sinon.spy();
            var createConnectionStub = sinon.stub().returns({});
            var createFilterStub = sinon.stub().returns({});
            var alterFunc2 = sinon.stub();
            var callback2 = sinon.stub();

            entitiesStore.__set__('findSilentEntitiesByAPIWithPagination', findSilentEntitiesByAPIWithPaginationSpy);
            entitiesStore.__set__('createConnection', createConnectionStub);
            entitiesStore.__set__('createFilter', createFilterStub);

            entitiesStore.findSilentEntitiesByAPI(
                ruleData.service,
                ruleData.subservice,
                ruleData,
                alterFunc2,
                callback2
            );

            sinon.assert.calledOnce(findSilentEntitiesByAPIWithPaginationSpy);
            sinon.assert.calledOnce(createConnectionStub);
            sinon.assert.calledOnce(createFilterStub);
        });
    });
    describe('findSilentEntitiesByAPIWithPagination', function() {
        var connectionMock, alterFuncMock, accumulatedResults, callbackMock;

        beforeEach(function() {
            connectionMock = {
                v2: {
                    listEntities: sinon.stub()
                }
            };
            alterFuncMock = sinon.stub();
            accumulatedResults = [];
            callbackMock = sinon.stub();
        });

        it('should pass error to callback when listEntities promise is rejected', function(done) {
            var filter = { limit: 20, offset: 0 };
            var error = new Error('test error');

            connectionMock.v2.listEntities.returns(Promise.reject(error));

            entitiesStore.findSilentEntitiesByAPIWithPagination(
                connectionMock,
                filter,
                alterFuncMock,
                accumulatedResults,
                function(err) {
                    chai.expect(err).to.equal(error);
                    done();
                }
            );
        });

        it('should recursively call itself when more entities are present', function() {
            var filter = { limit: 2, offset: 0 };
            var entitiesBatch1 = [
                {
                    id: 'entity1',
                    type: 'Device',
                    attributes: {
                        temperature: {
                            value: 23,
                            type: 'Float'
                        },
                        humidity: {
                            value: 45,
                            type: 'Float'
                        }
                    }
                },
                {
                    id: 'entity2',
                    type: 'Device',
                    attributes: {
                        temperature: {
                            value: 25,
                            type: 'Float'
                        },
                        humidity: {
                            value: 50,
                            type: 'Float'
                        }
                    }
                }
            ];
            var entitiesBatch2 = [
                {
                    id: 'entity3',
                    type: 'Device',
                    attributes: {
                        temperature: {
                            value: 22,
                            type: 'Float'
                        },
                        humidity: {
                            value: 55,
                            type: 'Float'
                        }
                    }
                }
            ];

            connectionMock.v2.listEntities
                .onFirstCall()
                .returns(Promise.resolve({ results: entitiesBatch1, count: 3 }));
            connectionMock.v2.listEntities
                .onSecondCall()
                .returns(Promise.resolve({ results: entitiesBatch2, count: 3 }));

            return entitiesStore.findSilentEntitiesByAPIWithPagination(
                connectionMock,
                filter,
                alterFuncMock,
                accumulatedResults,
                function(err, entities, count) {
                    sinon.assert.calledTwice(connectionMock.v2.listEntities);
                    sinon.assert.calledThrice(alterFuncMock);
                    chai.expect(entities).to.deep.equal(entitiesBatch1.concat(entitiesBatch2));
                    chai.expect(count).to.equal(3);
                }
            );
        });
    });

    describe('findSilentEntitiesByMongo', function() {
        var ruleData = {
            name: 'NSR4',
            action: {
                type: 'update',
                parameters: {
                    id: 'alarma:${id}',
                    type: 'Alarm',
                    attributes: [
                        {
                            name: 'msg',
                            value: 'El status de ${id} es ${status}'
                        }
                    ]
                }
            },
            subservice: '/',
            service: 'unknownt',
            nosignal: {
                checkInterval: '1',
                attribute: 'temperature',
                reportInterval: '5',
                id: 'thing:disp1',
                idRegexp: null,
                type: 'thing'
            }
        };

        var alterFunc4 = sinon.stub();
        var callback4 = sinon.stub();
        var col = {
            aggregate: sinon.stub().returnsThis(),
            toArray: sinon.stub()
        };
        var db = { collection: sinon.stub().yields(null, col) };

        beforeEach(function() {
            entitiesStore.__set__('orionServiceDb', sinon.stub().returns(db));
        });

        it('should call findSilentEntitiesByMongo', function(done) {
            entitiesStore.findSilentEntitiesByMongo(
                ruleData.service,
                ruleData.subservice,
                ruleData,
                alterFunc4,
                callback4
            );
            col.aggregate.should.have.been.calledOnce;
            done();
        });

        it('should pass error to callback when listEntities promise is rejected', function(done) {
            var expectedError = new Error('Test Error');
            var col = {
                aggregate: sinon.stub().returnsThis(),
                toArray: sinon.stub().yields(expectedError, null)
            };
            var db = { collection: sinon.stub().yields(null, col) };

            entitiesStore.__set__('orionServiceDb', sinon.stub().returns(db));
            var callback4 = sinon.stub();

            entitiesStore.findSilentEntitiesByMongo(
                ruleData.service,
                ruleData.subservice,
                ruleData,
                alterFunc4,
                callback4
            );

            process.nextTick(function() {
                callback4.should.have.been.calledOnceWith(expectedError);
                done();
            });
        });
    });
});
