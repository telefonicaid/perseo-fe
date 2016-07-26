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
var uuid = require('uuid'),
    config = require('../config'),
    constants = require('./constants'),
    rules = require('./models/rules'),
    logger = require('logops'),
    myutils = require('./myutils'),
    interval, domain,
    MAX_INTERVAL = Math.pow(2, 31) - 1,
    MIN_INTERVAL = 1000;

function refreshCore() {
    require('domain').active.context.trans = uuid.v4();
    rules.Refresh(function(error) {
        myutils.logErrorIf(error);
        interval = setTimeout(refreshCore, config.perseoCore.interval);
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
interval = setTimeout(refreshCore, config.perseoCore.interval);
domain = require('domain').create();
domain.add(interval);
domain.context = {};
domain.context.op = 'refreshCore';
domain.context.comp = constants.COMPONENT_NAME;
domain.context.trans = 'n/a';
domain.context.corr = 'n/a';
domain.context.srv = 'n/a';
domain.context.subsrv = 'n/a';

interval.unref();

