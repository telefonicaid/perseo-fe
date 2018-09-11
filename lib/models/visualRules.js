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
    rules = require('./rules'),
    myutils = require('../myutils'),
    eplTemplate = 'select *,"${name}" as ruleName' +
        ' from pattern [every ev=iotEvent(${conditions})]',
    operatorMap = {
        'GREATER_THAN': ' > ',
        'EQUAL_TO': ' = ',
        'MINOR_THAN': ' < ',
        'DIFFERENT_TO': ' != ',
        'GREATER_OR_EQUAL_THAN': ' >= ',
        'MINOR_OR_EQUAL_THAN': ' <= ',
        'MATCH': ' regexp '
    },
    errors = {};

function errorOperator(op) {
    if (operatorMap[op] === undefined) {
        return new errors.UnknownOperator(op);
    }
    return null;
}

function castVar(str, isNumber) {
    str = util.format('cast(`%s`?, String)', str);
    if (isNumber === true) {
        str = util.format('cast(%s, float)', str);
    }
    return str;
}

function adaptExp(str, isNumber) {
    if (str.indexOf('${') !== 0) {
        if (isNumber !== true) {
            str = util.format('%j', str);
        }
        return str;
    }
    //Remove starting "${" and trailing "}"
    str = str.slice(2, -1);
    //Change dot to double underscore
    str = str.replace(/\./g, '__');
    return castVar(str, isNumber);
}

function makeUserPropCondition(exprL, op, exprR, isNumber) {
    exprL = adaptExp(exprL, isNumber);
    exprR = adaptExp(exprR, isNumber);
    return util.format('(%s %s %s)', exprL, operatorMap[op], exprR);
}
function makeObservationCondition(exprL, op, exprR, isNumber) {
    exprL = castVar(exprL, isNumber);
    exprR = adaptExp(exprR, isNumber);
    return util.format('(%s %s %s)', exprL, operatorMap[op], exprR);
}
function plainParams(p) {
    var i, obj = {};
    for (i = 0; i < p.length; i += 1) {
        obj[p[i].name] = p[i].value;
    }
    return obj;
}

function vr2rule(cardRule) {
    var r, i, card,
        conditions = [],
        action = {},
        noSignal, id, idRegexp, type,
        plain,
        checkInterval,
        errOp;
    try {
        r = {VR: cardRule, name: cardRule.name};
        for (i = 0; i < cardRule.cards.length; i += 1) {
            card = cardRule.cards[i];
            switch (card.type) {
            case 'SensorCard':
                switch (card.conditionList[0].scope) {
                case 'USER_PROP':
                    errOp = errorOperator(card.conditionList[0].operator);
                    if (errOp) {
                        return errOp;
                    }
                    conditions.push(makeUserPropCondition(card.conditionList[0].userProp,
                        card.conditionList[0].operator,
                        card.conditionList[0].parameterValue,
                        false));

                    break;
                case 'XPATH':
                    errOp = errorOperator(card.conditionList[0].operator);
                    if (errOp) {
                        return errOp;
                    }
                    conditions.push(makeObservationCondition(card.conditionList[0].parameterName,
                        card.conditionList[0].operator,
                        card.conditionList[0].parameterValue,
                        card.sensorData.dataType === 'Quantity'));
                    if (card.conditionList[0].parameterName === 'id') {
                        if (card.conditionList[0].operator === 'MATCH') {
                            idRegexp = card.conditionList[0].parameterValue;
                            //Just to check it is a valid regexp
                            new RegExp(idRegexp);
                        } else {
                            id = card.conditionList[0].parameterValue;
                        }
                    } else if (card.conditionList[0].parameterName === 'type') {
                        type = card.conditionList[0].parameterValue;
                    }
                    break;
                case 'OBSERVATION':
                    errOp = errorOperator(card.conditionList[0].operator);
                    if (errOp) {
                        return errOp;
                    }
                    if (card.sensorData.measureName === 'id') {
                        return new errors.IdAsAttribute('');
                    } else if (card.sensorData.measureName === 'type') {
                        return new errors.TypeAsAttribute('');
                    }
                    conditions.push(makeObservationCondition(card.sensorData.measureName,
                        card.conditionList[0].operator,
                        card.conditionList[0].parameterValue,
                        card.sensorData.dataType === 'Quantity'));
                    break;
                case 'LAST_MEASURE':
                    checkInterval = parseInt(card.timeData.interval, 10);
                    if (isNaN(checkInterval) || checkInterval < 1) {
                        return new errors.InvalidVisualRule('check interval ' + card.timeData.interval);
                    }
                    noSignal = {
                        checkInterval: card.timeData.interval,
                        attribute: card.sensorData.measureName,
                        reportInterval: card.conditionList[0].parameterValue
                    };
                    break;
                default:
                    return new errors.NotSupportedActionScope(card.conditionList[0].scope);
                }
                break;
            case 'ActionCard':
                switch (card.actionData.type) {
                case 'SendEmailAction':
                    plain = plainParams(card.actionData.userParams);
                    action.type = 'email';
                    action.template = plain['mail.message'];
                    action.parameters = {
                        to: plain['mail.to'],
                        from: plain['mail.from'],
                        subject: plain['mail.subject']
                    };
                    break;
                case 'SendSmsMibAction':
                    plain = plainParams(card.actionData.userParams);
                    action.type = 'sms';
                    action.template = plain['sms.message'];
                    action.parameters = {
                        to: plain['sms.to']
                    };
                    break;
                case 'updateAttribute':
                    action.type = 'update';
                    action.parameters = {
                        name: card.actionData.userParams.name,
                        value: card.actionData.userParams.value
                    };
                    if (card.actionData.userParams.actionType) {
                        action.parameters.actionType =
                            card.actionData.userParams.actionType;
                    }
                    break;
                default:
                    return new errors.NotSupportedActionType(card.actionData.type);
                }
                break;

            case 'TimeCard':
                if (card.configData) {
                    switch (card.configData.timeType) {
                    case 'timeInterval': //No signal detection
                        // This is different from old DCA rules. No-signal cards are now of type
                        // SensorCard with a timeData field. https://jirapdi.tid.es/browse/PIOTP-855
                        return new errors.NotSupportedTimeCard(card.configData.timeType);
                        //break; not necessary with return
                    case 'timeElapsed': // Minimal interval for actions
                        action.interval = card.timeData.interval;
                        break;
                    }
                }
                else {
                    return new errors.MissingConfigDataInTimeCard(JSON.stringify(card));
                }

            }
        }

        r.action = action;
        r.subservice = cardRule.subservice;
        r.service = cardRule.service;
        if (noSignal) {
            r.nosignal = noSignal;
            r.nosignal.id = id;
            r.nosignal.idRegexp = idRegexp;
            r.nosignal.type = type;
        } else {
            r.text = myutils.expandVar(eplTemplate, {
                name: r.name,
                conditions: conditions.join(' AND '),
                service: r.service,
                subservice: r.subservice
            });
        }
    } catch (ex) { // SHOULD BE ex instanceof TypeError. Do not do anything else inside try
        // Also it can be instance of SyntaxError: Invalid regular expression
        return new errors.InvalidVisualRule(ex.toString());
    }
    return r;
}

module.exports = {
    FindAll: function FindAll(service, subservice, callback) {
        rules.FindAll(service, subservice, function(err, data) {
            if (err) {
                return callback(err, null);
            }
            var vrdata = [], i;
            for (i = 0; i < data.length; i += 1) {
                if (data[i].VR) {
                    vrdata.push(data[i].VR);
                }
            }
            return callback(err, vrdata);
        });
    },
    Find: function Find(rule, callback) {
        rules.Find(rule, function(err, data) {
            if (err) {
                return callback(err, null);
            }
            data = data || {};
            data.VR = data.VR || {};
            return callback(err, data.VR);
        });
    },
    Save: function Save(vrrule, callback) {
        var rule = vr2rule(vrrule);
        if (rule instanceof Error) {
            myutils.logErrorIf(rule);
            return callback(rule, null);
        }
        rules.Save(rule, function(err, data) {
            if (err) {
                return callback(err, null);
            }
            return callback(null, data[2].VR);
        });
    },
    Remove: function Remove(id, callback) {
        rules.Remove(id, callback);
    },
    Put: function(id, rule, callback) {
        rule = vr2rule(rule);
        if (rule instanceof Error) {
            myutils.logErrorIf(rule);
            return callback(rule, null);
        }
        rules.Put(id, rule, function(err, data) {
            if (err) {
                return callback(err, null);
            }
            callback(err, data[0].VR);
        });
    }
};
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;
// Only for testing, not intended for external use
module.exports.vr2rule = vr2rule;
module.exports.errorOperator = errorOperator;

(function() {

    errors.InvalidVisualRule = function InvalidVisualRule(msg) {
        this.name = 'INVALID_VISUAL_RULE';
        this.message = 'invalid visual rule format ' + msg;
        this.httpCode = 400;
    };
    errors.NotSupportedTimeCard = function NotSupportedTimeCard(msg) {
        this.message = 'TimeCard not supported ' + msg;
        this.httpCode = 400;
    };
    errors.NotSupportedActionType = function NotSupportedActionType(msg) {
        this.name = 'ACTION_TYPE_NOT_SUPPORTED';
        this.message = 'ActionType not supported ' + msg;
        this.httpCode = 400;
    };
    errors.NotSupportedActionScope = function NotSupportedActionScope(msg) {
        this.name = 'UNKNOWN_SCOPE_ACTION';
        this.message = 'Scope not supported ' + msg;
        this.httpCode = 400;
    };
    errors.MissingConfigDataInTimeCard = function MissingConfigDataInTimeCard(msg) {
        this.name = 'MISSING_CONFIGDATA_TIMECARD';
        this.message = 'Missing config data in time card' + msg;
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
    errors.UnknownOperator = function UnknownOperator(msg) {
        this.name = 'UNKNOWN_OPERATOR';
        this.message = 'unknown operator ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();



