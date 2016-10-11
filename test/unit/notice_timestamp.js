/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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
 */

'use strict';

var should = require('should'),
    notices = require('../../lib/models/notices');


function basicNotice() {
    return {
        'subscriptionId': '57f73930e0e2c975a712b8fd',
        'originator': 'localhost',
        'contextResponses': [
            {
                'contextElement': {
                    'type': 'Trunk',
                    'isPattern': 'false',
                    'id': 'T1',
                    'attributes': [
                        {
                            'name': 'position',
                            'type': 'geo:point',
                            'value': '40.418889, -3.691944'
                        }
                    ]
                },
                'statusCode': {
                    'code': '200',
                    'reasonPhrase': 'OK'
                }
            }
        ]
    };
}
describe('Notices', function() {
    describe('#ProcessCBNotice()', function() {
        it('should add a noticeTS pseudo-attribute for every notice', function() {
            var bn = basicNotice(),
               before = Date.now(),
                after,
                processed;

            processed = notices.ProcessCBNotice(bn);
            after = Date.now();
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            should.exist(processed.noticeTS);
            processed.noticeTS.should.not.be.below(before);
            processed.noticeTS.should.not.be.above(after);
        });
        it('should add a ts pesudo-attribute for a field of type DateTime', function() {
            var bn = basicNotice(),
                date = new Date(),
                iso8601 = date.toISOString(),
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'birthDate',
                type: 'DateTime',
                value: iso8601
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.birthDate__ts);
            should.equal(processed.birthDate__ts, millis);
            /*jshint +W106 */
        });
        it('should add a ts pesudo-attribute for a field of type urn:x-ogc:def:trs:IDAS:1.0:ISO8601', function() {
            var bn = basicNotice(),
                date = new Date(),
                iso8601 = date.toISOString(),
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'birthDate',
                type: 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601',
                value: iso8601
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.birthDate__ts);
            should.equal(processed.birthDate__ts, millis);
            /*jshint +W106 */
        });
        it('should add a ts pesudo-attribute for a field named TimeInstant', function() {
            var bn = basicNotice(),
                date = new Date(),
                iso8601 = date.toISOString(),
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'TimeInstant',
                value: iso8601
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.TimeInstant__ts);
            should.equal(processed.TimeInstant__ts, millis);
            /*jshint +W106 */
        });

        // idem for metadata
        it('should add a ts pesudo-attribute for a metadata field of type DateTime', function() {
            var bn = basicNotice(),
                date = new Date('2008-09-15T15:53:00+05:00'),
                iso8601 = '2008-09-15T15:53:00+05:00',
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'temperature',
                type: 'number',
                value: 12,
                metadatas: [
                    {
                        name: 'when',
                        'type' : 'DateTime',
                        'value' : iso8601
                    }
                ]
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.temperature__metadata__when__ts);
            should.equal(processed.temperature__metadata__when__ts, millis);
            /*jshint +W106 */
        });
        it('should add a ts pesudo-attribute for a field of type urn:x-ogc:def:trs:IDAS:1.0:ISO8601', function() {
            var bn = basicNotice(),
                date = new Date(),
                iso8601 = date.toISOString(),
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'temperature',
                type: 'centigrade',
                value: 12,
                metadatas: [
                    {
                        name: 'when',
                        'type' : 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601',
                        'value' : iso8601
                    }
                ]
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.temperature__metadata__when__ts);
            should.equal(processed.temperature__metadata__when__ts, millis);
            /*jshint +W106 */
        });
        it('should add a ts pesudo-attribute for a metadata field named TimeInstant', function() {
            var bn = basicNotice(),
                date = new Date(),
                iso8601 = date.toISOString(),
                millis = date.getTime(),
                processed;
            bn.contextResponses[0].contextElement.attributes.push({
                name: 'temperature',
                value: 12,
                metadatas: [
                    {
                        name: 'TimeInstant',
                        'value': iso8601
                    }
                ]
            });
            processed = notices.ProcessCBNotice(bn);
            should.exist(processed);
            processed.should.not.be.instanceof(Error);
            /*jshint -W106 */
            should.exist(processed.temperature__metadata__TimeInstant__ts);
            should.equal(processed.temperature__metadata__TimeInstant__ts, millis);
            /*jshint +W106 */
        });
    });
});

