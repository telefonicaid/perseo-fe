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
 * please contact with::[contacto@tid.es]
 */

'use strict';

/* global structuredClone */

function readLoadSetting(name, defaultValue, maximum) {
    if (process.env[name] === undefined) {
        return defaultValue;
    }

    const value = Number(process.env[name]);
    if (!Number.isInteger(value) || value < 1 || value > maximum) {
        throw new Error(name + ' must be an integer between 1 and ' + maximum);
    }
    return value;
}

function percentile(samples, ratio) {
    const sorted = samples.slice().sort(function(a, b) {
        return a - b;
    });
    return sorted[Math.ceil(sorted.length * ratio) - 1];
}

const should = require('should'),
    clients = require('../test/utils/clients'),
    utilsT = require('../test/utils/utilsT'),
    testEnv = require('../test/utils/testEnvironment'),
    REQUESTS = readLoadSetting('ACTION_LOAD_REQUESTS', 500, 10000),
    CONCURRENCY = readLoadSetting('ACTION_LOAD_CONCURRENCY', 64, 500),
    BODY_SIZES = [1024, 4096, 16384],
    DOWNSTREAM_DELAY = 250;

function postAction(event) {
    return new Promise(function(resolve, reject) {
        clients.PostAction(event, function(error, response) {
            if (error) {
                return reject(error);
            }
            if (response.statusCode !== 200) {
                return reject(new Error('POST /actions/do returned HTTP ' + response.statusCode));
            }
            resolve();
        });
    });
}

function runLoadTest(done) {
    const rule = utilsT.loadExample('./test/data/good_rules/blood_rule_sms.json'),
        action = utilsT.loadExample('./test/data/good_actions/action_sms.json'),
        workerCount = Math.min(CONCURRENCY, REQUESTS);
    let downstreamCount = 0,
        completedDownstream = 0,
        activeDownstream = 0,
        maxConcurrentDownstream = 0,
        downstreamDone;
    const downstreamFinished = new Promise(function(resolve) {
        downstreamDone = resolve;
    });

    clients.PostRule(rule, function(ruleError, ruleResponse) {
        should.not.exist(ruleError);
        ruleResponse.should.have.property('statusCode', 200);

        utilsT.setServerCallback(function(req, resp) {
            downstreamCount++;
            activeDownstream++;
            maxConcurrentDownstream = Math.max(maxConcurrentDownstream, activeDownstream);
            resp.on('finish', function() {
                activeDownstream--;
                completedDownstream++;
                if (downstreamCount === REQUESTS && activeDownstream === 0) {
                    downstreamDone();
                }
            });
            setTimeout(function() {
                resp.end('ok');
            }, DOWNSTREAM_DELAY);
        });

        const latencies = [],
            bodyCounts = {},
            startedAt = Date.now();
        let nextRequest = 0;

        function sendNext() {
            if (nextRequest >= REQUESTS) {
                return Promise.resolve();
            }

            const index = nextRequest++;
            const event = structuredClone(action);
            event.ev.id += '-' + index;
            const bodySize = BODY_SIZES[index % BODY_SIZES.length];
            event.ev.loadPadding = '';
            const paddingSize = bodySize - Buffer.byteLength(JSON.stringify(event), 'utf8');
            if (paddingSize < 0) {
                throw new Error('Base event exceeds target body size of ' + bodySize + ' bytes');
            }
            event.ev.loadPadding = 'x'.repeat(paddingSize);
            Buffer.byteLength(JSON.stringify(event), 'utf8').should.equal(bodySize);
            bodyCounts[bodySize] = (bodyCounts[bodySize] || 0) + 1;
            const requestStartedAt = Date.now();

            return postAction(event)
                .then(function() {
                    latencies.push(Date.now() - requestStartedAt);
                })
                .then(sendNext);
        }

        Promise.all(Array.from({ length: workerCount }, sendNext))
            .then(function() {
                const elapsed = Date.now() - startedAt;
                return downstreamFinished.then(function() {
                    downstreamCount.should.equal(REQUESTS);
                    completedDownstream.should.equal(REQUESTS);
                    maxConcurrentDownstream.should.be.greaterThan(1);
                    latencies.length.should.equal(REQUESTS);
                    console.log('Body sizes (bytes: requests): %j', bodyCounts);
                    console.log(
                        'Load result: %d requests, concurrency %d, %s requests/s, latency p50=%dms p95=%dms max=%dms, downstream peak=%d',
                        REQUESTS,
                        workerCount,
                        ((REQUESTS * 1000) / elapsed).toFixed(1),
                        percentile(latencies, 0.5),
                        percentile(latencies, 0.95),
                        Math.max.apply(null, latencies),
                        maxConcurrentDownstream
                    );
                });
            })
            .then(function() {
                done();
            })
            .catch(done);
    });
}

describe('POST /actions/do load', function() {
    beforeEach(testEnv.commonBeforeEach);
    afterEach(testEnv.commonAfterEach);

    it('should process a configurable concurrent burst', runLoadTest).timeout(120000);
});
