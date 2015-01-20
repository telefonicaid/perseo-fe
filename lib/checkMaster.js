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
var config = require('../config'),
    request = require('request'),
    logger = require('logops'),
    isOK = false,
    interval, domain, lastReport = 0;

function isAvailable() {
    return isOK;
}
function checkMaster() {
    var wasOK = isOK;
    request.get({url: config.master.checkURL}, function cbRequestCheck(error, response) {
        var now;
        if (error || response.statusCode < 200 || response.statusCode >= 300) {
            isOK = false;
            now = Date.now();
            if (wasOK !== isOK || lastReport + config.master.reportInterval < now) {
                logger.error('master', config.master.checkURL, 'is not available');
                lastReport = now;
            }
        }
        else {
            isOK = true;
        }
        if (wasOK !== isOK) {
            logger.info('master', config.master.checkURL, 'availability has changed to', isOK);
        }
    });
}
if (!config.isMaster) {
    interval = setInterval(checkMaster, config.master.interval);
    domain = require('domain').create();
    domain.add(interval);
    domain.op = 'checkMaster';
    interval.unref();
}


/**
 * isAvailable returns a boolean with value true if the master node
 * was available at last check.
 *
 * @return {bool}        master is available
 */
module.exports.isAvailable = isAvailable;

