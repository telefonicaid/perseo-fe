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
var entitiesStore = rewire('../../lib/models/entitiesStore.js');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var config = require('../../config.js');
chai.Should();
chai.use(sinonChai);

describe('Test suit', function() {
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
        func = 'hola',
        callback = {
            function(e, request) {
                should.exist(request);
                should.not.exist(e);
                should.equal(request.httpCode, 200);
                done();
            }
        };
    describe('FindSilentEntities test', () => {
        it('By default should call FindSilentEntitiesByMongo', () => {
            // Create a Sinon stub for the function findSilentEntitiesByMongo
            var FindSilentEntitiesByMongoStub = sinon.stub();

            // Configure the module to use the stub instead of the actual implementation
            entitiesStore.FindSilentEntitiesByMongo = FindSilentEntitiesByMongoStub;

            // Calling the function to be tested
            entitiesStore.FindSilentEntities(ruleData.service, ruleData.subservice, ruleData, func, callback);

            // Check if the function FindSilentEntitiesByMongo has been call
            expect(FindSilentEntitiesByMongoStub.calledOnce).to.be.true;
        });
        it('If default settings are changed FindSilentEntitiesByAPI should be called', () => {
            config.nonSignalByAPI = true;
            // Create a Sinon stub for the function FindSilentEntitiesByAPI
            var FindSilentEntitiesByAPIStub = sinon.stub();

            // Configure the module to use the stub instead of the actual implementation
            entitiesStore.FindSilentEntitiesByAPI = FindSilentEntitiesByAPIStub;

            // Calling the function to be tested
            entitiesStore.FindSilentEntities(ruleData.service, ruleData.subservice, ruleData, func, callback);

            // Check if the function FindSilentEntitiesByAPI has been call
            expect(FindSilentEntitiesByAPIStub.calledOnce).to.be.true;
        });
    });

    describe('FindSilentEntitiesByMongo', function(done) {
        it('should return a 200 status code and JSON object when everything is fine', function(done) {
            // Mock the necessary dependencies
            var dbMock = {
                collection: sinon.stub().returnsThis(),
                find: sinon.stub().returnsThis(),
                batchSize: sinon.stub().returnsThis(),
                each: function(callback) {
                    var entity = { _id: { id: 'entityId' } };
                    callback(null, entity);
                    callback(null, null); // Cursor exhausted
                }
            };
            var appContextMock = {
                OrionDb: sinon.stub().returns(dbMock)
            };
            var configMock = {
                orionDb: {
                    collection: 'entities'
                }
            };
            var loggerMock = {
                debug: sinon.stub()
            };

            // Set up the test data
            var service = 'service';
            var subservice = 'subservice';
            var ruleData = {
                attribute: 'attribute',
                reportInterval: 1000
            };
            var funcMock = sinon.stub();
            var expectedResponse = [{ _id: { id: 'entityId' } }];

            // Set the mocks in the module
            entitiesStore.__set__('appContext', appContextMock);
            entitiesStore.__set__('config', configMock);
            entitiesStore.__set__('logger', loggerMock);
            done();

            // Call the function to be tested
            entitiesStore.FindSilentEntitiesByMongo(service, subservice, ruleData, funcMock, function(err, result) {
                // Check the response
                assert.strictEqual(err, null);
                assert.deepStrictEqual(result, expectedResponse);

                // Check the function calls and arguments
                assert.strictEqual(appContextMock.OrionDb.calledOnce, true);
                assert.deepStrictEqual(appContextMock.OrionDb.firstCall.args, ['prefix-service']);
                assert.strictEqual(dbMock.collection.calledOnce, true);
                assert.deepStrictEqual(dbMock.collection.firstCall.args, ['entities']);
                assert.strictEqual(dbMock.find.calledOnce, true);
                assert.deepStrictEqual(dbMock.find.firstCall.args, [
                    {
                        'attrs.attribute.modDate': { $lt: Date.now() / 1000 - 1000 },
                        '_id.servicePath': 'subservice'
                    }
                ]);
                assert.strictEqual(dbMock.batchSize.calledOnce, true);
                assert.deepStrictEqual(dbMock.batchSize.firstCall.args, [100]);
                assert.strictEqual(loggerMock.debug.calledOnce, true);
                assert.strictEqual(loggerMock.debug.getCall(0).args[0].op, 'checkNoSignal.FindSilentEntitiesByMongo');
                assert.deepStrictEqual(loggerMock.debug.getCall(0).args[1], 'FindSilentEntities criterion %j');
                assert.deepStrictEqual(loggerMock.debug.getCall(0).args[2], {
                    'attrs.attribute.modDate': { $lt: Date.now() / 1000 - 1000 },
                    '_id.servicePath': 'subservice'
                });
                assert.strictEqual(funcMock.calledOnce, true);
                assert.deepStrictEqual(funcMock.firstCall.args[0], { _id: { id: 'entityId' } });

                done();
            });
        });
    });
});
