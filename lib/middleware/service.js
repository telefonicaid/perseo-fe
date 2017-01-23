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

var logger = require('logops'),
    config = require('../../config'),
    constants = require('../constants'),
    paths = require('../../lib/models/paths'),
    myutils = require('../myutils'),
    metrics = require('../../lib/models/metrics'),
    subservArr;

function checkServiceHeaders(req) {
    var subservice = req.headers[constants.SUBSERVICE_HEADER],
        service = req.headers[constants.SERVICE_HEADER],
        context = { op: 'checkRequest', comp: constants.COMPONENT_NAME},
        err;
    if (!subservice) {
        logger.info(context, 'missing subservice header');
        subservice = config.DEFAULT_SUBSERVICE;
    }
    else {
        // for notifications, a comma-separated list of subservices is possible
        subservArr = subservice.split(',');
        subservArr.forEach(function(ss) {
            err = paths.validServicePath(ss.trim());
            if (err) {
                return err;
            }
        });
    }
    if (!service) {
        logger.info(context, 'missing service header');
        service = config.DEFAULT_SERVICE;
    }
    else {
        err = paths.validService(service);
        if (err) {
            return err;
        }
    }
    // subservice is NOT transformed to lower case. See issue #146
    req.subservice = subservice;
    req.service = service.toLowerCase();
    return null;
}

/**
 * Express middleware that adds service to request
 * If a request header is not present 'unknown' is assigned
 * and an error is logged
 *
 *  @return {Function} Express middleWare.
 */
exports.middleware = function() {
    return function serviceNsubservice(req, res, next) {
        var err = checkServiceHeaders(req),
            contentType, contentLength;

        if (req.url.indexOf(config.endpoint.actionsPath) !== 0 &&
            req.url.indexOf(config.endpoint.checkPath) !== 0 &&
            req.url.indexOf(config.endpoint.versionPath) !== 0 &&
            req.url.indexOf(config.endpoint.logPath) !== 0 &&
            req.url.indexOf(config.endpoint.metricsPath) !== 0
        ) {
            metrics.IncMetrics(req.service, req.subservice, metrics.incomingTransactions);
        }
        if (err) {
            myutils.respond(res, err);
            // if valid service/subservice ...
            if (req.url.indexOf(config.endpoint.actionsPath) !== 0 &&
                req.url.indexOf(config.endpoint.checkPath) !== 0 &&
                req.url.indexOf(config.endpoint.versionPath) !== 0 &&
                req.url.indexOf(config.endpoint.logPath) !== 0 &&
                req.url.indexOf(config.endpoint.metricsPath) !== 0
            ) {
                metrics.IncMetrics(req.service, req.subservice, metrics.incomingTransactionsErrors);
            }
            return;
        }
        contentType = req.headers['content-type'];
        contentLength = req.headers['content-length'];
        // Chunked transfer encoding should be rejected, not counting against request size
        if ((contentType && contentType.indexOf('application/json') !== 0)) {
                myutils.respond(res, {httpCode: 400, message: 'invalid content-type'}, null, false, true);
                metrics.IncMetrics(req.service, req.subservice, metrics.incomingTransactionsErrors);
                metrics.IncMetrics(req.service, req.subservice, metrics.incomingTransactionsRequestSize,
                    (contentLength ? +contentLength : 0));
                return;
        }
        next();
    };
};
exports.checkServiceHeaders = checkServiceHeaders;

