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
 */
'use strict';

var domain = require('domain'),
    util = require('util'),
    actions = require('../models/actions'),
    metrics = require('../models/metrics'),
    myutils = require('../myutils'),
    config = require('../../config'),
    constants = require('../constants'),
    logger = require('logops'),
    recentAxn = {},
    corrAge = {};

function PostAction(req, resp) {
    var firedEvent,
        errorAxn,
        nextDomain,
        delay,
        correlator = req.headers[constants.CORRELATOR_HEADER],
        rulesWithCorr,
        errMsg,
        now = Date.now(),
        MAX_AGE_CORR = 15 * 60 * 1000;

    firedEvent = req.body || {};
    firedEvent.subservice = req.subservice;
    firedEvent.service = req.service;

    metrics.IncMetrics(req.service, req.subservice, metrics.firedRules);

    if (correlator) {
        // try detect loop
        corrAge[correlator] = now;
        rulesWithCorr = recentAxn[correlator];
        if (!rulesWithCorr) {
            //There is no array yet for this correlator
            rulesWithCorr = recentAxn[correlator] = [];
        }
        if (util.isArray(rulesWithCorr)) {
            for (var i = 0; i < rulesWithCorr.length; i++) {
                if (rulesWithCorr[i] === firedEvent.ruleName) {
                    errMsg = util.format(
                        'check infinite loop for %s (%s) - the rule has not been triggered',
                        firedEvent.ruleName,
                        correlator
                    );
                    logger.error(errMsg);
                    metrics.IncMetrics(req.service, req.subservice, metrics.errAction);
                    myutils.respondWOMetrics(resp, { httpCode: 500, message: errMsg });
                    return;
                }
            }
            // rule not found for this correlator, add it
            rulesWithCorr.push(firedEvent.ruleName);
        }
    }
    // Purge old correlators
    for (var p in corrAge) {
        if (corrAge.hasOwnProperty(p)) {
            if (now - corrAge[p] > MAX_AGE_CORR) {
                delete recentAxn[p];
                delete corrAge[p];
            }
        }
    }

    errorAxn = actions.errorsAction(firedEvent);
    if (errorAxn) {
        myutils.logErrorIf(errorAxn);
        myutils.respondWOMetrics(resp, errorAxn, null);
        return;
    }
    //We need to do this before losing response domain
    nextDomain = domain.create();
    if (process.domain) {
        nextDomain.context = {};
        nextDomain.context.path = process.domain.context.path;
        nextDomain.context.op = process.domain.context.op;
        nextDomain.context.comp = process.domain.context.comp;
        nextDomain.context.trans = process.domain.context.trans;
        nextDomain.context.corr = process.domain.context.corr;
        nextDomain.start = process.domain.start;
        nextDomain.context.srv = process.domain.context.srv;
        nextDomain.context.subsrv = process.domain.context.subsrv;
    }
    //Don't wait until action is finished
    resp.end();

    if (config.isMaster) {
        delay = 0;
    } else {
        delay = config.slaveDelay;
    }
    // TODO: Tricky ... To refactor?
    var cleanDomain, domainErrorHandler;

    domainErrorHandler = function(err) {
        logger.error(err);
        cleanDomain();
    };
    cleanDomain = function() {
        var responseTime = Date.now() - nextDomain.start;
        logger.debug('response-time: %s', responseTime);
        nextDomain.removeListener('error', domainErrorHandler);
        delete nextDomain.context;
    };
    nextDomain.on('error', domainErrorHandler);
    firedEvent.fiwarePerseoContext = nextDomain.context;
    setTimeout(function() {
        nextDomain.run(function() {
            for (var p in firedEvent.ev) {
                if (firedEvent[p] === undefined) {
                    firedEvent[p] = firedEvent.ev[p];
                }
            }
            actions.Do(firedEvent, function(err) {
                myutils.logErrorIf(err);
                cleanDomain();
            });
        });
    }, delay);
}

function AddTo(app) {
    app.post(config.endpoint.actionsPath, PostAction);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
