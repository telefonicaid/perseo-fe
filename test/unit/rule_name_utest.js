/*
 * Copyright 2015 Telefonica Investigaci�n y Desarrollo, S.A.U
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

const assert = require('assert');
const rules = require('../../lib/models/rules');
const errors = rules.errors;

describe('lib/models/rules.js', function() {
    describe('validNameRule()', function() {
        it('should return null if rule is null', function() {
            const result = rules.validNameRule(null);
            assert.strictEqual(result, null);
        });

        it('should return null if rule.text is missing', function() {
            const rule = {
                name: 'reglaTemperatura'
            };

            const result = rules.validNameRule(rule);
            assert.strictEqual(result, null);
        });

        it('should return null if rule.name is missing', function() {
            const rule = {
                text: 'select "reglaTemperatura" as ruleName, * from iotEvent'
            };

            const result = rules.validNameRule(rule);
            assert.strictEqual(result, null);
        });

        it('should return null when rule name in text matches rule.name exactly', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: 'select "reglaTemperatura" as ruleName, *, status? from iotEvent where status? <> \'OK\''
            };

            const result = rules.validNameRule(rule);
            assert.strictEqual(result, null);
        });

        it('should return InvalidRuleNameInEPL when rule name in text does not match rule.name', function() {
            const rule = {
                name: 'reglaTemperatur',
                text: 'select "reglaTemperatura" as ruleName, *, status? from iotEvent where status? <> \'OK\''
            };

            const result = rules.validNameRule(rule);

            assert(result instanceof errors.InvalidRuleNameInEPL);
        });

        it('should detect error when a character is added to rule.name but not updated in text', function() {
            const rule = {
                name: 'reglaTemperaturaX',
                text: 'select "reglaTemperatura" as ruleName, * from iotEvent'
            };

            const result = rules.validNameRule(rule);

            assert(result instanceof errors.InvalidRuleNameInEPL);
        });

        it('should detect error when a character is removed from rule.name but not updated in text', function() {
            const rule = {
                name: 'reglaTemperatur',
                text: 'select "reglaTemperatura" as ruleName, * from iotEvent'
            };

            const result = rules.validNameRule(rule);

            assert(result instanceof errors.InvalidRuleNameInEPL);
        });

        it('should not return error if text does not contain "as ruleName"', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: "select *, status? from iotEvent where status? <> 'OK'"
            };

            const result = rules.validNameRule(rule);
            assert.strictEqual(result, null);
        });

        it('should work with different casing in SELECT and AS', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: 'SELECT "reglaTemperatura" AS ruleName, * from iotEvent'
            };

            const result = rules.validNameRule(rule);
            assert.strictEqual(result, null);
        });
    });

    describe('normalizeRuleName()', function() {
        it('should return the same rule if rule is null', function() {
            const result = rules.normalizeRuleName(null);
            assert.strictEqual(result, null);
        });

        it('should not modify the rule if text is missing', function() {
            const rule = {
                name: 'reglaTemperatura'
            };

            const result = rules.normalizeRuleName(rule);

            assert.deepStrictEqual(result, rule);
        });

        it('should add "name as ruleName" when it does not exist in text', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: "select *, status? from iotEvent where status? <> 'OK'"
            };

            const result = rules.normalizeRuleName(rule);

            assert.strictEqual(
                result.text,
                'select "reglaTemperatura" as ruleName, *, status? from iotEvent where status? <> \'OK\''
            );
        });

        it('should not modify text when "as ruleName" already exists', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: 'select "reglaTemperatura" as ruleName, *, status? from iotEvent'
            };

            const originalText = rule.text;
            const result = rules.normalizeRuleName(rule);

            assert.strictEqual(result.text, originalText);
        });

        it('should insert ruleName right after select', function() {
            const rule = {
                name: 'reglaHumedad',
                text: 'select temperature, humidity from iotEvent'
            };

            const result = rules.normalizeRuleName(rule);

            assert.strictEqual(result.text, 'select "reglaHumedad" as ruleName, temperature, humidity from iotEvent');
        });

        it('should keep the rest of the text unchanged after inserting ruleName', function() {
            const rule = {
                name: 'reglaPresion',
                text: "select *, status? from iotEvent where status? <> 'OK'"
            };

            const result = rules.normalizeRuleName(rule);

            assert.strictEqual(
                result.text,
                'select "reglaPresion" as ruleName, *, status? from iotEvent where status? <> \'OK\''
            );
        });
    });

    describe('validation + normalization flow', function() {
        it('should not return error after normalizing a rule without ruleName', function() {
            const rule = {
                name: 'reglaTemperatura',
                text: "select *, status? from iotEvent where status? <> 'OK'"
            };

            rules.normalizeRuleName(rule);
            const result = rules.validNameRule(rule);

            assert.strictEqual(result, null);
        });

        it('should still return error if text contains incorrect ruleName and normalize does not replace it', function() {
            const rule = {
                name: 'reglaCorrecta',
                text: 'select "reglaIncorrecta" as ruleName, * from iotEvent'
            };

            const result = rules.validNameRule(rule);

            assert(result instanceof errors.InvalidRuleNameInEPL);
        });
    });
});
