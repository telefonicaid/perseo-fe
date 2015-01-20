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
    constants = require('../constants');

/**
 * Express middleware that adds service to request
 * If a request header is not present 'unknown' is assigned
 * and an error is logged
 *
 *  @return {Function} Express middleWare.
 */
exports.middleware = function() {
    return function serviceNtenant(req, res, next) {
        var service = req.headers[constants.SERVICE_HEADER],
            tenant = req.headers[constants.TENANT_HEADER];
        if (!service) {
            logger.info('missing service header');
            service = config.DEFAULT_SERVICE;
        }
        if (!tenant) {
            logger.info('missing tenant header');
            tenant = config.DEFAULT_TENANT;
        }
        req.service = service.toLowerCase();
        req.tenant = tenant.toLowerCase();
        next();
    };
};

