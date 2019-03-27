/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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

var util = require('util'),
    logger = require('logops'),
    alarms = {};

function raise(alarm, context, message) {
    var state = alarms[alarm];
    var contextTemp = (process.domain && process.domain.context) || {};
    var messageTemp = '';
    if (typeof message === 'object' && message) {
        messageTemp = util.format('%j', message);
    }
    messageTemp = messageTemp || '';
    if (state !== true) {
        // emit ERROR alarm ON
        logger.error(contextTemp, 'ALARM-ON [' + alarm + '] ' + messageTemp);
    }
    alarms[alarm] = true;
}
function release(alarm, context, message) {
    var state = alarms[alarm];
    var contextTemp = (process.domain && process.domain.context) || {};
    var messageTemp = '';
    if (typeof message === 'object' && message) {
        messageTemp = util.format('%j', message);
    }
    messageTemp = messageTemp || '';
    if (state === true) {
        // emit ERROR alarm OFF
        logger.error(contextTemp, 'ALARM-OFF [' + alarm + '] ' + messageTemp);
    }
    alarms[alarm] = false;
}

module.exports.raise = raise;
module.exports.release = release;

module.exports.CORE = 'CORE';
module.exports.POST_EVENT = 'POST_EVENT';
module.exports.DATABASE = 'DATABASE';
module.exports.DATABASE_ORION = 'DATABASE_ORION';
module.exports.ORION = 'ORION';
module.exports.EMAIL = 'EMAIL';
module.exports.SMS = 'SMS';
module.exports.SMPP = 'SMPP';
module.exports.AUTH = 'AUTH';
