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
 */

'use strict';

var should = require('should'),
    utilsT = require('../utils/utilsT'),
    visualRules = require('../../lib/models/visualRules');

describe('VisualRules', function() {
    describe('#vr2rule()', function() {
        it('should generate the right EPL', function() {
            var cases = utilsT.loadDirExamples('./test/data/unit/vr_epl');
            cases.forEach(function(c) {
                var rule = visualRules.vr2rule(c.object.VR);
                rule.text.should.be.a.string;
                rule.text = rule.text.replace(/\s{2,}/g, ' ');
                c.object.text = c.object.text.replace(/\s{2,}/g, ' ');
                should.equal(c.object.text, rule.text);
            });
        });
    });
    describe('#errorOp()', function() {
        it('should return null with valid operators', function() {
            var cases = [
                'GREATER_THAN',
                'EQUAL_TO',
                'MINOR_THAN',
                'DIFFERENT_TO',
                'GREATER_OR_EQUAL_THAN',
                'MINOR_OR_EQUAL_THAN',
                'MATCH',
            ];
            cases.forEach(function(c) {
                var errOp = visualRules.errorOperator(c);
                should(errOp).be.null;
            });
        });
        it('should return an error with invalid operators', function() {
            var cases = ['GREATER_THA', 'equal_to', '<', '', null, undefined, 42, {}];
            cases.forEach(function(c) {
                var errOp = visualRules.errorOperator(c);
                errOp.should.be.an.instanceOf(visualRules.errors.UnknownOperator);
            });
        });
    });
});
