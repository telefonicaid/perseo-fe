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
    constants = require('./constants'),
    rules = require('./models/rules'),
    logger = require('logops'),
    alarm = require('./alarm'),
    interval, domain,
    MAX_INTERVAL = Math.pow(2, 31) - 1,
    MIN_INTERVAL = 1000,
    context = {op: 'refreshCore', comp: constants.COMPONENT_NAME, trans: 'n/a', corr: 'n/a', srv: 'n/a', subsrv: 'n/a'};

function refreshCore() {
    rules.Refresh(function(error) {
        logger.debug(error, 'refresh core', context);
        if (error) {
            alarm.raise(alarm.CORE);
        } else {
            alarm.release(alarm.CORE);
        }
    });
}
if (config.perseoCore.interval >= MAX_INTERVAL) {
    logger.error('Invalid value for config.perseoCore.interval, too large (%d >= %d)',
        config.perseoCore.interval, MAX_INTERVAL);
    process.abort();
}
if (config.perseoCore.interval <= MIN_INTERVAL) {
    logger.error('Invalid value for config.perseoCore.interval, too small (%d <= %d)',
        config.perseoCore.interval, MIN_INTERVAL);
    process.abort();
}

domain = require('domain').create();
domain.context = context;

interval = setInterval(refreshCore, config.perseoCore.interval);
domain.add(interval);


interval.unref();

