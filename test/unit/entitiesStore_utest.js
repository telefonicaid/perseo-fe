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

        it('should pass accumulated results to callback when all entities are fetched', function(done) {
            var filter = { limit: 2, offset: 0 };
            var entitiesBatch = [{ id: 'entity1' }, { id: 'entity2' }];

            connectionMock.v2.listEntities.returns(Promise.resolve({ results: entitiesBatch, count: 2 }));

            entitiesStore.findSilentEntitiesByAPIWithPagination(
                connectionMock,
                filter,
                alterFuncMock,
                accumulatedResults,
                function(err, entities, count) {
                    chai.expect(entities).to.deep.equal(entitiesBatch);
                    chai.expect(count).to.equal(2);
                    done(err);
                }
            );
        });
    });
});
