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

    it('should call findSilentEntitiesByAPIWithPagination', function() {
        var findSilentEntitiesByAPIWithPaginationSpy = sinon.spy();
        var createConnectionStub = sinon.stub().returns({});
        var createFilterStub = sinon.stub().returns({});
        var alterFunc2 = sinon.stub();
        var callback2 = sinon.stub();

        entitiesStore.__set__('findSilentEntitiesByAPIWithPagination', findSilentEntitiesByAPIWithPaginationSpy);
        entitiesStore.__set__('createConnection', createConnectionStub);
        entitiesStore.__set__('createFilter', createFilterStub);

        entitiesStore.findSilentEntitiesByAPI(ruleData.service, ruleData.subservice, ruleData, alterFunc2, callback2);

        sinon.assert.calledOnce(findSilentEntitiesByAPIWithPaginationSpy);
        sinon.assert.calledOnce(createConnectionStub);
        sinon.assert.calledOnce(createFilterStub);
    });

    it('should call listEntities and handle successful API response', function(done) {
        var listEntitiesStub = sinon.stub().returns(
            Promise.resolve({
                results: [],
                count: 0
            })
        );
        var fakeConnection = {
            v2: {
                listEntities: listEntitiesStub
            }
        };
        var fakeFilter = {};
        var alterFuncStub = sinon.stub();
        var callbackStub = sinon.stub();

        entitiesStore
            .findSilentEntitiesByAPIWithPagination(fakeConnection, fakeFilter, alterFuncStub, callbackStub)
            .then(() => {
                sinon.assert.calledOnce(listEntitiesStub);
                sinon.assert.calledWith(listEntitiesStub, fakeFilter);
                sinon.assert.calledOnce(alterFuncStub);
                sinon.assert.calledOnce(callbackStub);
                done();
            })
            .catch(done);
    });

    it('should handle errors from listEntities', function(done) {
        var listEntitiesStub = sinon.stub().returns(Promise.reject('error'));
        var fakeConnection = {
            v2: {
                listEntities: listEntitiesStub
            }
        };
        var fakeFilter = {};
        var alterFuncStub = sinon.stub();
        var callbackStub = sinon.stub();

        entitiesStore
            .findSilentEntitiesByAPIWithPagination(fakeConnection, fakeFilter, alterFuncStub, callbackStub)
            .then(() => {
                done(new Error('Expected method to reject.'));
            })
            .catch(() => {
                sinon.assert.calledOnce(listEntitiesStub);
                sinon.assert.calledWith(listEntitiesStub, fakeFilter);
                sinon.assert.notCalled(alterFuncStub);
                sinon.assert.calledOnce(callbackStub);
                sinon.assert.calledWith(callbackStub, 'error', null);
                done();
            });
    });
});
