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
        /* jshint ignore:start */
        it('should call ngsi.Connection.v2.listEntities', async function() {
            var filter = {};
            var alterFunc3 = sinon.stub();
            var callback3 = sinon.stub();
            var connectionStub = { v2: { listEntities: sinon.stub().resolves([]) } };

            await entitiesStore.findSilentEntitiesByAPIWithPagination(connectionStub, filter, alterFunc3, callback3);

            sinon.assert.calledOnce(connectionStub.v2.listEntities);
        });

        it('should call alterFunc for each entity', async function() {
            var filter2 = { limit: 20, offset: 0 };
            var entities = [{}, {}, {}];
            var connection = {
                v2: { listEntities: sinon.stub().resolves({ count: entities.length, results: entities }) }
            };
            var alterFunc4 = sinon.stub();
            var callback4 = sinon.stub();

            await entitiesStore.findSilentEntitiesByAPIWithPagination(connection, filter2, alterFunc4, callback4);
            sinon.assert.callCount(alterFunc4, entities.length);
        });
        /* jshint ignore:end */
    });
});
