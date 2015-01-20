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

/**
 * Express middleware that logs incoming request
 * It also generates a unique request id that can be used to track requests in logs.
 *
 * @return {Function} Express middleWare.
 */
exports.middleware = function() {
    return function logRequest(req, res, next) {
        logger.info('incoming request %j', {method: req.method, url: req.url, headers: req.headers, body: req.body,
            service: req.service, tenant: req.tenant});
        next();
    };
};

