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
    constants = require('../constants'),
    logger = require('logops');

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
            reqDomain.context.trans = req.requestId = uuid.v4();
            var corr = req.get(constants.CORRELATOR_HEADER);
            if (corr) {
                reqDomain.context.corr = corr;
            } else {
                reqDomain.context.corr = reqDomain.context.trans;
            }
            res.set(constants.CORRELATOR_HEADER, reqDomain.context.corr);

            reqDomain.context.srv = req.service;
            reqDomain.context.subsrv = req.subservice;
            next();
        }

        res.once('finish', cleanDomain);
        reqDomain.on('error', domainErrorHandler);
        reqDomain.enter();
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
