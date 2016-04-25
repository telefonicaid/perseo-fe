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
    noSignal = require('../../lib/models/noSignal');

describe('noSignal', function() {
    var rule = {
        'name': 'NSR1',
        'action': {
            'type': 'sms',
            'template': '${device.asset.UserProps.threshold.major} message',
            'parameters': {
                'to': '12345678'
            }
        },
        'subservice': '/',
        'service': 'unknownt',
        'nosignal': {
            'checkInterval': '<< TO BE REPLACED >>',
            'attribute': 'at',
            'reportInterval': 900,
            'id': null,
            'idRegexp': '^.*',
            'type': null
        }
    };
    describe('#addNSRule()', function() {
        it('should reject to add a rule with invalid check interval', function() {
            rule.nosignal.checkInterval = 'aserejé';
            should.strictEqual(noSignal.AddNSRule(rule.service, rule.subservice, rule.name, rule.nosignal), 0);
        });
        it('should use minimum interval when adding a rule with a too small interval', function() {
            rule.nosignal.checkInterval = 0;
            should.strictEqual(noSignal.AddNSRule(rule.service, rule.subservice, rule.name, rule.nosignal),
                noSignal.getMinIntervalMs());
        });
        it('should add a rule with valid interval', function() {
            rule.nosignal.checkInterval = Math.ceil(noSignal.getMinIntervalMs() / noSignal.getIntervalUnit()) * 2;
            should.strictEqual(noSignal.AddNSRule(rule.service, rule.subservice, rule.name, rule.nosignal),
                rule.nosignal.checkInterval * noSignal.getIntervalUnit());
        });
    });
});


