/*
 * Copyright 2017 Telefonica Investigación y Desarrollo, S.A.U
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
    metrics = require('../../lib/models/metrics');

describe('Metrics', function() {
    var service = 'S',
        subservice = 'SP';
    describe('service time (average)', function() {
        it('should be the average when only one transaction', function() {
            var time = Math.random() * 100,
                decorated;
            metrics.DeleteMetrics();
            metrics.IncMetrics(service, subservice, metrics.incomingTransactions);
            metrics.IncMetrics(service, subservice, metrics.serviceTime, time);

            decorated = metrics.GetDecorated();

            // exhaustive assert of existence only in this test, for quick detecting this kind of problems
            should.exist(decorated);
            should.exist(decorated.sum);
            should.exist(decorated.services); // exhaustive assert of existence only here, for quick detecting
            should.exist(decorated.services[service]);
            should.exist(decorated.services[service].sum);

            should.equal(decorated.sum[metrics.serviceTime], time);
            should.equal(decorated.services[service].sum[metrics.serviceTime], time);
        });
    });
    describe('service time (average)', function() {
        it('should be the average when more than one transaction, the same service/subservice', function() {
            var times = [
                    9.538113116286695,
                    83.72875661589205,
                    6.256202259100974,
                    85.36320026032627,
                    88.29136565327644,
                    88.75782943796366,
                    98.26397101860493,
                    42.91834740433842,
                    94.48413769714534,
                    7.29342435952276,
                ],
                average = 0,
                decorated;

            times.forEach(function(t) {
                average += t;
            });
            average /= times.length; // 60.489534782245755

            metrics.DeleteMetrics();
            metrics.IncMetrics(service, subservice, metrics.incomingTransactions, times.length);
            times.forEach(function(t) {
                metrics.IncMetrics(service, subservice, metrics.serviceTime, t);
            });

            decorated = metrics.GetDecorated();

            should.equal(decorated.sum[metrics.serviceTime], average);
            should.equal(decorated.services[service].sum[metrics.serviceTime], average);
        });
    });
});
