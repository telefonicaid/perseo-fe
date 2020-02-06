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
    domain = require('domain'),
    async = require('async'),
    actionStore = require('./actionsStore'),
    executionsStore = require('./executionsStore'),
    emailAction = require('./emailAction'),
    smsAction = require('./smsAction'),
    smppAction = require('./smppAction'),
    updateAction = require('./updateAction'),
    postAction = require('./postAction'),
    twitterAction = require('./twitterAction'),
    errors = {},
    myutils = require('../myutils'),
    logger = require('logops'),
    config = require('../../config');

var inProcess = {};

function errorsAction(event) {
    var ruleName = event.ruleName;
    if (ruleName === null || ruleName === undefined) {
        return new errors.MissingRuleName(JSON.stringify(event));
    }
    return null;
}

function validateAction(axn) {
    var axnArr, axnElem, i;
    if (util.isArray(axn)) {
        axnArr = axn;
    } else {
        axnArr = [axn];
    }
    for (i = 0; i < axnArr.length; i++) {
        axnElem = axnArr[i];
        //There is an action
        if (typeof axnElem.type !== 'string') {
            return new errors.MissingActionType(axnElem);
        }

        //Action type
        switch (axnElem.type) {
            case 'email':
            case 'sms':
            case 'update':
            case 'post':
            case 'twitter':
                break;
            default:
                return new errors.UnknownActionType(axnElem.type);
        }

        //Do not use id/type as attribute
        if (axnElem.type === 'update' && axnElem.parameters) {
            if (axnElem.parameters.name === 'id') {
                return new errors.IdAsAttribute(JSON.stringify(axnElem.parameters));
            } else if (axnElem.parameters.name === 'type') {
                return new errors.IdAsAttribute(JSON.stringify(axnElem.parameters));
            } else {
                //Added default else clause
                return null;
            }
        }
    }
    //Everything is OK
    return null;
}

function conditionalExec(task, lastTime, callbackW) {
    var rightNow = Date.now(),
        action = task.action,
        event = task.event,
        localError;
    action.interval = Number(action.interval);
    if (isNaN(action.interval)) {
        action.interval = 0;
    }
    if (lastTime + action.interval < rightNow) {
        async.series(
            [
                function(callbackS) {
                    switch (action.type) {
                        case 'email':
                            emailAction.doIt(action, event, callbackS);
                            break;
                        case 'sms':
                            if (!config.smpp.enabled) {
                                smsAction.doIt(action, event, callbackS);
                            } else {
                                smppAction.doIt(action, event, callbackS);
                            }
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
                executionsStore.Update.bind(null, task)
            ],
            callbackW
        );
    } else {
        logger.info(
            'discarding action, too recent lastTime %d interval %d now %d',
            lastTime,
            action.interval,
            rightNow
        );
        callbackW(null);
    }
}
function slaveExec(task, alreadyExecuted, callback) {
    logger.debug('slaveExec alreadyExecuted=%s task %j', alreadyExecuted, task);
    if (!alreadyExecuted) {
        async.waterfall([executionsStore.LastTime.bind(null, task), conditionalExec.bind(null, task)], function(err) {
            callback(err);
        });
    } else {
        return callback(null);
    }
}

function execAxn(task, cbCe) {
    var domainAxn = domain.create();
    domainAxn.context = task.context;
    domainAxn.run(function() {
        logger.debug('executing axn task %j', task);
        if (config.isMaster) {
            async.waterfall([executionsStore.LastTime.bind(null, task), conditionalExec.bind(null, task)], function(
                err
            ) {
                cbCe(err);
            });
        } else {
            async.waterfall([executionsStore.AlreadyDone.bind(null, task), slaveExec.bind(null, task)], function(err) {
                cbCe(err);
            });
        }
    });
}

function deleteInProcessArray(service, servicePath, ruleName, id, type) {
    var servicePathMap = inProcess[service][servicePath],
        ruleMap = servicePathMap[ruleName];

    delete ruleMap[id][type];
    if (Object.keys(ruleMap[id]).length === 0) {
        delete ruleMap[id];
    }
    if (Object.keys(ruleMap).length === 0) {
        delete servicePathMap[ruleMap];
    }
}

function getInProcessArray(service, servicePath, ruleName, id, type) {
    var inPService, inPServicePath, inPRule, inPEntity, inPType;

    inPService = inProcess[service];
    if (!inPService) {
        inPService = inProcess[service] = {};
    }
    inPServicePath = inPService[servicePath];
    if (!inPServicePath) {
        inPServicePath = inPService[servicePath] = {};
    }
    inPRule = inPServicePath[ruleName];
    if (!inPRule) {
        inPRule = inPServicePath[ruleName] = {};
    }
    inPEntity = inPRule[id];
    if (!inPEntity) {
        inPEntity = inPRule[id] = {};
    }
    inPType = inPEntity[type];
    if (!inPType) {
        inPType = inPEntity[type] = async.queue(execAxn);
        inPType.drain = deleteInProcessArray.bind({}, service, servicePath, ruleName, id, type);
    }
    return inPType;
}

function DoAction(event, callback) {
    var ruleName = event.ruleName,
        subservice = event.subservice,
        service = event.service,
        id = event.id,
        type = event.type,
        localError;

    logger.debug('service %s, subservice %s, event %j', service, subservice, event);
    localError = errorsAction(event);
    if (localError !== null) {
        myutils.logErrorIf(localError);
        return callback(localError, null);
    }

    actionStore.Find(service, subservice, ruleName, function(err, actions) {
        var localError, queue;

        if (err) {
            return callback(err, null);
        }
        if (!util.isArray(actions)) {
            actions = [actions];
        }
        // check all axns are right
        for (var i = 0; i < actions.length; i++) {
            localError = validateAction(actions[i]);
            if (localError !== null) {
                myutils.logErrorIf(localError);
                return callback(localError, null);
            }
        }

        queue = getInProcessArray(service, subservice, ruleName, id, type);
        for (i = 0; i < actions.length; i++) {
            actions[i].index = i;
            logger.debug('inserting in queue action %s', actions[i]);
            queue.push({
                action: actions[i],
                event: event,
                context: event.fiwarePerseoContext
            });
        }
    });

    return callback(null);
}

module.exports.Do = DoAction;
module.exports.errorsAction = errorsAction;
module.exports.validateAction = validateAction;
module.exports.getInProcessArray = getInProcessArray;
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
    errors.IdAsAttribute = function IdAsAttribute(msg) {
        this.name = 'ID_ATTRIBUTE';
        this.message = 'id as attribute ' + msg;
        this.httpCode = 400;
    };
    errors.TypeAsAttribute = function TypeAsAttribute(msg) {
        this.name = 'TYPE_ATTRIBUTE';
        this.message = 'type as attribute ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
