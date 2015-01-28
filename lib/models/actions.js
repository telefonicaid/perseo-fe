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

var util = require('util'),
    async = require('async'),
    actionStore = require('./actionsStore'),
    executionsStore = require('./executionsStore'),
    emailAction = require('./emailAction'),
    smsAction = require('./smsAction'),
    updateAction = require('./updateAction'),
    postAction = require('./postAction'),
    twitterAction = require('./twitterAction'),
    errors = {},
    myutils = require('../myutils'),
    logger = require('logops'),
    config = require('../../config');

function conditionalExec(action, event, lastTime, callbackW) {
    var rightNow = Date.now(),
        ruleName = event.ruleName,
        eventId = event.id,
        service = event.service,
        tenant = event.tenant,
        noticeId = event.noticeId,
        localError;
    action.interval = Number(action.interval);
    if (isNaN(action.interval)) {
        action.interval = 0;
    }
    if (lastTime + action.interval < rightNow) {
        async.series([
            function(callbackS) {
                switch (action.type) {
                case 'email':
                    emailAction.doIt(action, event, callbackS);
                    break;
                case 'sms':
                    smsAction.doIt(action, event, callbackS);
                    break;
                case 'update':
                    updateAction.doIt(action, event, callbackS);
                    break;
                case 'post':
                    postAction.doIt(action, event, callbackS);
                    break;
                case 'twitter':
                    twitterAction.doIt(action, event, callbackS);
                    break;
                default:
                    localError = new errors.UnknownActionType(action.type);
                    myutils.logErrorIf(localError);
                    return callbackS(localError, null);
                }
            },
            executionsStore.Update.bind(null, tenant, service, ruleName, eventId, noticeId)
        ], callbackW);
    }
    else {
        logger.info('discarding action, too recent lastTime %d interval %d now %d',
            lastTime, action.interval, rightNow);
        callbackW(null);
    }
}
function slaveExec(action, event, alreadyExecuted, callback) {
    var ruleName = event.ruleName,
        eventId = event.id,
        service = event.service,
        tenant = event.tenant;
    if (!alreadyExecuted) {
        async.waterfall(
            [
                executionsStore.LastTime.bind(null, tenant, service, ruleName, eventId),
                conditionalExec.bind(null, action, event)
            ],
            function(err, tasks) {
                callback(err);
            });
    } else {
        return callback(null);
    }
}

function execAxn(action, event, cbCe) {
    var ruleName = event.ruleName,
        eventId = event.id,
        service = event.service,
        tenant = event.tenant,
        noticeId = event.noticeId;

    if(config.isMaster) {
        async.waterfall(
            [
                executionsStore.LastTime.bind(null, tenant, service, ruleName, eventId),
                conditionalExec.bind(null, action, event)
            ],
            function(err, tasks) {
                cbCe(err);
            });
    } else {
        async.waterfall(
            [
                executionsStore.AlreadyDone.bind(null, tenant, service, ruleName, eventId, noticeId),
                slaveExec.bind(null, action, event)
            ],
            function(err, tasks) {
                cbCe(err);
            });
    }
}

function DoAction(event, callback) {

    var ruleName = event.ruleName,
    /*jshint -W106 */
        eventId = event.ev__id,
        service = event.ev__service,
        tenant = event.ev__tenant,
        noticeId = event.ev__noticeId,
    /*jshint +W106 */
        localError;
    event.id = eventId;
    event.service = service;
    event.tenant = tenant;
    event.noticeId = noticeId;
    logger.debug('tenant %s, service %s, event %j', tenant, service, event);
    if (ruleName === null || ruleName === undefined) {
        localError = new errors.MissingRuleName(event);
        myutils.logErrorIf(localError);
        return callback(localError, null);
    }
    actionStore.Find(tenant, service, ruleName, function(err, action) {
        if (err) {
            return callback(err, null);
        }
        if (action.type === null || action.type === undefined) {
            localError = new errors.MissingActionType(action);
            myutils.logErrorIf(localError);
            return callback(localError, null);
        }
        return execAxn(action, event, callback);
    });
}

function errorsAction(event) {
    var ruleName = event.ruleName;
    if (ruleName === null || ruleName === undefined) {
        return new errors.MissingRuleName(JSON.stringify(event));
    }
}

module.exports.Do = DoAction;
module.exports.errorsAction = errorsAction;
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.MissingActionType = function MissingActionType(msg) {
        this.name = 'MISSING_ACTION_TYPE';
        this.message = 'missing type in action ' + msg;
        this.httpCode = 400;
    };

    errors.UnknownActionType = function UnknownActionType(msg) {
        this.name = 'UNKNOWN_ACTION_TYPE';
        this.message = 'unknown action type ' + msg;
        this.httpCode = 400;
    };

    errors.MissingRuleName = function MissingRuleName(msg) {
        this.name = 'MISSING_ACTION_RULE_NAME';
        this.message = 'missing rule name for action ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
