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
var expect = chai.expect;
var config = require('../../config.js');
var NGSI = require('ngsijs');
chai.Should();
chai.use(sinonChai);

describe('entitiesStore', function() {
    describe('#findSilentEntitiesByAPI', function() {
        var connectionMock;
        var listEntitiesMock;

        beforeEach(function() {
            connectionMock = sinon.stub(NGSI, 'Connection');
            listEntitiesMock = sinon.stub();

            // Mock the Connection function
            connectionMock.returns({ v2: { listEntities: listEntitiesMock } });
        });

        afterEach(function() {
            // Restore the original function after each test
            connectionMock.restore();
        });

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
            func = 'sinon.stub()',
            callback = function(e, request) {
                should.exist(request);
                should.not.exist(e);
                should.equal(request.httpCode, 200);
            };

        it('By default should call findSilentEntitiesByMongo', function() {
            var findSilentEntitiesByMongoSpy = sinon.spy();
            entitiesStore.__set__('findSilentEntitiesByMongo', findSilentEntitiesByMongoSpy);
            entitiesStore.FindSilentEntities(ruleData.service, ruleData.subservice, ruleData, func, callback);
            sinon.assert.calledOnce(findSilentEntitiesByMongoSpy);
        });

        it('If default settings are changed FindSilentEntitiesByAPI should be called', function() {
            config.nonSignalByAPI = true;
            var findSilentEntitiesByAPISpy = sinon.spy();
            entitiesStore.__set__('findSilentEntitiesByAPI', findSilentEntitiesByAPISpy);
            entitiesStore.FindSilentEntities();
            sinon.assert.calledOnce(findSilentEntitiesByAPISpy);
        });

        it('should return silent entities', async function() {
            var funcM = sinon.spy(),
                callbackM = sinon.spy();

            // Mock the listEntities function to resolve with a test response
            listEntitiesMock.returns(Promise.resolve({ results: [] }));

            await entitiesStore.findSilentEntitiesByAPI(
                ruleData.service,
                ruleData.subservice,
                ruleData,
                funcM,
                callbackM
            );

            expect(listEntitiesMock.calledOnce).to.be.true;
            expect(funcM.callCount).to.equal(0);
            expect(callbackM.calledOnceWith(null, [])).to.be.true;
        });
    });
});
