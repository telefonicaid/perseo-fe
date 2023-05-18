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
 * please contact with::[contacto@tid.es]
 *
 * Created by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */
'use strict';

var rewire = require('rewire');
var notices = rewire('../../lib/models/notices');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);
chai.Should();

var id = 'sensor-1';
var type = 'tipeExample1';

var attrKey = 'Attr1';
var attrType = 'Number';
var attrValue = 122;

var subservice = '/test/notices/unit';
var service = 'utest';

var noticeExampleV1 = JSON.stringify({
    subscriptionId: '5b311ccb29adb333f843b5f3',
    originator: 'localhost',
    contextResponses: [
        {
            contextElement: {
                id: id,
                type: type,
                isPattern: 'false',
                attributes: [
                    {
                        name: attrKey,
                        type: attrType,
                        value: attrValue
                    }
                ]
            }
        }
    ],
    subservice: subservice,
    service: service
});

var processCBNotice = notices.__get__('processCBNotice');

// Mocks
var mockedUid = 'MockedUID_';
var mockedDateMilis = 442796400000;
var uuidMock = sinon.spy(function() {
    return mockedUid;
});
var dateNowMock = sinon.spy(function() {
    return mockedDateMilis;
});

// Date
var dateType = 'DateTime';
var dateValue = '2018-06-03T09:31:26.296Z';

// Location
var locType = 'geo:point';
var lat = 40.418889;
var long = -3.691944;
var locValue = lat + ', ' + long;

describe('Notices NGSIv1', function() {
    var noticeExample;
    beforeEach(function() {
        // Default
        noticeExample = JSON.parse(noticeExampleV1);
    });
    describe('#processCBNotice', function() {
        it('should accept simple notice using Number type', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                done();
            });
        });

        it('should accept simple notice using geo:point type', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = locType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = locValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(locType);
                expect(noticeResult[attrKey]).to.equal(locValue);
                done();
            });
        });

        it('should accept simple notice using DateTime type', function(done) {
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.contextResponses[0].contextElement.attributes[0].type = dateType;
                noticeExample.contextResponses[0].contextElement.attributes[0].value = dateValue;
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(dateType);
                expect(noticeResult[attrKey]).to.equal(dateValue);
                done();
            });
        });

        it('should accept notices including metadata without type', function(done) {
            var at = 'theMetaAttribute';
            var metaAtVal = 'mockedValue1234';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [
                    {
                        name: at,
                        value: metaAtVal
                    }
                ];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).not.exist;
                expect(noticeResult[attrKey + '__metadata__' + at]).to.equal(metaAtVal);
                done();
            });
        });

        it('should accept notice using DateTime metadata', function(done) {
            var at = 'theMetaAttribute';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [
                    {
                        name: at,
                        value: dateValue,
                        type: dateType
                    }
                ];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false'); // why not boolean??
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(dateType);
                done();
            });
        });

        it('should fail when contains Id As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'id';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.IdAsAttribute);
            expect(noticeResult.name).to.equal('ID_ATTRIBUTE');
            expect(noticeResult.message).to.equal(
                'id as attribute ' + JSON.stringify(noticeExample.contextResponses[0].contextElement.attributes[0])
            );
            expect(noticeResult.httpCode).to.equal(400);
        });

        it('should fail when contains Type As Attribute', function() {
            noticeExample.contextResponses[0].contextElement.attributes[0].name = 'type';
            var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
            noticeResult.should.be.instanceof(notices.errors.TypeAsAttribute);
            expect(noticeResult.name).to.equal('TYPE_ATTRIBUTE');
            expect(noticeResult.message).to.equal(
                'type as attribute ' + JSON.stringify(noticeExample.contextResponses[0].contextElement.attributes[0])
            );
            expect(noticeResult.httpCode).to.equal(400);
        });

        // Weird functionality
        it('should accept notices and parse value as location when exist an attribute named location in metadata', function(done) {
            // this feature does not seem to make sense
            var at = 'location';
            notices.__with__({
                uuidv1: uuidMock,
                'Date.now': dateNowMock
            })(function() {
                noticeExample.contextResponses[0].contextElement.attributes[0].metadatas = [
                    {
                        name: at,
                        value: locValue,
                        type: locType
                    }
                ];
                var noticeResult = processCBNotice(service, subservice, noticeExample, 0);
                expect(noticeResult.noticeId).to.equal(mockedUid);
                expect(noticeResult.noticeTS).to.equal(mockedDateMilis);
                expect(noticeResult.id).to.equal(id);
                expect(noticeResult.type).to.equal(type);
                expect(noticeResult.subservice).to.equal(subservice);
                expect(noticeResult.service).to.equal(service);
                expect(noticeResult.isPattern).to.equal('false');
                expect(noticeResult[attrKey + '__type']).to.equal(attrType);
                expect(noticeResult[attrKey]).to.equal(attrValue);
                expect(noticeResult[attrKey + '__metadata__' + at]).to.equal(locValue);
                expect(noticeResult[attrKey + '__metadata__' + at + '__type']).to.equal(locType);
                done();
            });
        });
    });
});
