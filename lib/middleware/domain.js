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

var domain = require('domain'),
    uuid = require('uuid'),
    logger = require('logops'),
    constants = require('../constants'),
    metrics = require('../models/metrics'),
    config = require('../../config'),
    CORR_SUFFIX = '; perseocep=',
    MAX_INT_SAFE = (1 << 53) - 1,
    corrSequence = 0;

/**
 * Express middleware that creates a domain per request
 * It also generates a unique request id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
function requestDomain() {

    return function requestDomain(req, res, next) {
        var reqDomain = domain.create();
        reqDomain.add(req);
        reqDomain.add(res);
        reqDomain.context = {};
        reqDomain.context.path = req.path;
        reqDomain.context.op = req.url;
        reqDomain.context.comp = constants.COMPONENT_NAME;

        reqDomain.start = Date.now();

        function cleanDomain() {
            var responseTime = Date.now() - reqDomain.start;
            logger.debug('response-time: ' + responseTime + ' statusCode: ' + res.statusCode);
            if (req.url.indexOf(config.endpoint.actionsPath) !== 0 &&
                req.url.indexOf(config.endpoint.checkPath) !== 0 &&
                req.url.indexOf(config.endpoint.versionPath) !== 0 &&
                req.url.indexOf(config.endpoint.logPath) !== 0 &&
                req.url.indexOf(config.endpoint.metricsPath) !== 0
            ) {
                metrics.IncMetrics(req.service, req.subservice, metrics.serviceTime, responseTime);
            }
            reqDomain.removeListener('error', domainErrorHandler);
            reqDomain.remove(req);
            reqDomain.remove(res);
            delete reqDomain.context;
            reqDomain.exit();
        }

        function domainErrorHandler(err) {
            logger.error(err);
            cleanDomain();
        }

        function requestHandler() {
            var corr, realIP;

            reqDomain.context.trans = req.requestId = uuid.v4();

            corr = req.get(constants.CORRELATOR_HEADER);
            if (!corr) {
                corr = reqDomain.context.trans;
            }

            if (corr.indexOf(CORR_SUFFIX) === -1) {
                // first time it arrives to perseo, tainted it
                corr += CORR_SUFFIX + corrSequence;
                if (corrSequence + 1 < MAX_INT_SAFE) {
                    corrSequence++;
                } else {
                    corrSequence = 0;
                }
            }
            reqDomain.context.corr = corr;
            res.set(constants.CORRELATOR_HEADER, reqDomain.context.corr);

            reqDomain.context.srv = req.service;
            reqDomain.context.subsrv = req.subservice;

            realIP = req.get(constants.REALIP_HEADER);
            if (realIP) {
                reqDomain.context.from = realIP;
            } else {
                reqDomain.context.from = req.connection.remoteAddress;
            }
            next();
        }

        res.once('finish', cleanDomain);
        reqDomain.on('error', domainErrorHandler);
        reqDomain.run(requestHandler);

    };

}
/**
 * Express middleWare that creates a domain per request
 * It also generates a unique request id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
exports.requestDomain = requestDomain;
