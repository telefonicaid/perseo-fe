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

var logger = require('logops');
var constants = require('../constants');
const { v4: uuidv4 } = require('uuid');
var metrics = require('../models/metrics');
var config = require('../../config');
/**
 * Express middleWare that creates a domain per request
 * It also generates a unique request id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
function requestLogger(componentName) {
    return function(req, res, next) {
        let contextSrv;
        if (req.headers && req.headers[constants.SERVICE_HEADER]) {
            contextSrv = req.headers[constants.SERVICE_HEADER];
        }
        let contextSubsrv;
        if (req.headers && req.headers[constants.SUBSERVICE_HEADER]) {
            contextSubsrv = req.headers[constants.SUBSERVICE_HEADER];
        }
        let contextFrom;
        // x-forwarded-for/forwarded overwrites x-real-ip
        if (req.headers[constants.REALIP_HEADER]) {
            contextFrom = req.headers[constants.REALIP_HEADER];
        }
        if (req.headers[constants.X_FORWARDED_FOR_HEADER]) {
            contextFrom = req.headers[constants.X_FORWARDED_FOR_HEADER];
        }
        if (req.headers[constants.FORWARDED_HEADER]) {
            contextFrom = req.headers[constants.FORWARDED_HEADER];
        }
        let contextTrans = (req.requestId = uuidv4());
        let contextCorr = req.get(constants.CORRELATOR_HEADER);
        if (!contextCorr) {
            contextCorr = contextTrans;
        }
        req.corr = contextCorr; // for propagate in FWD request
        res.set(constants.CORRELATOR_HEADER, contextCorr); // for response
        const contextStart = Date.now();
        req.logger = logger.child({
            corr: contextCorr,
            trans: contextTrans,
            op: req.url,
            from: contextFrom,
            srv: contextSrv,
            subsrv: contextSubsrv,
            comp: componentName
        });
        res.once('finish', function() {
            const responseTime = Date.now() - contextStart;
            req.logger.debug('response-time: ' + responseTime + ' statusCode: ' + res.statusCode);
            if (
                req.url.indexOf(config.endpoint.actionsPath) !== 0 &&
                req.url.indexOf(config.endpoint.checkPath) !== 0 &&
                req.url.indexOf(config.endpoint.versionPath) !== 0 &&
                req.url.indexOf(config.endpoint.logPath) !== 0 &&
                req.url.indexOf(config.endpoint.metricsPath) !== 0
            ) {
                metrics.IncMetrics(req.service, req.subservice, metrics.serviceTime, responseTime);
            }
        });
        next();
    };
}

exports.requestLogger = requestLogger;
