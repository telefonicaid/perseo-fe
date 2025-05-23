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
    logger = require('logops'),
    myutils = require('../myutils'),
    constants = require('../constants'),
    entitiesStore = require('./entitiesStore'),
    actions = require('./actions'),
    config = require('../../config'),
    nsRulesByInterval = {},
    checkers = {},
    intervalUnit = 1000 * 60,
    SERVICE = 0,
    SUBSERVICE = 1,
    NAME = 2,
    ATTRIBUTE = 3,
    ID = 4,
    ID_REGEXP = 5,
    TYPE = 6,
    REPORT_INTERVAL = 7,
    CHECK_INTERVAL = 8,
    MAX_TIME_DETECTION = 9,
    MAX_TIME_DETECTION_ATTR = 10,
    REPORT_INTERVAL_ATTR = 11,
    context = { op: 'checkNonSignal', comp: constants.COMPONENT_NAME, corr: 'n/a', trans: 'n/a' },
    lastTime,
    MIN_INTERVAL_MS = 30e3,
    MAX_INTERVAL_MS = 2147483647; // 2^31-1 which is 2,147,483,647ms (maximum value of a signed 32 bit integer in ms)
const { v4: uuidv4 } = require('uuid');

function alertFunc(nsLineRule, entity) {
    var d = domain.create();
    d.context = {};
    d.context.trans = uuidv4();
    d.context.corr = d.context.trans;
    d.context.srv = 'n/a';
    d.context.subsrv = 'n/a';
    d.context.op = 'alertNS';
    d.context.comp = constants.COMPONENT_NAME;

    d.on('error', function(err) {
        myutils.logErrorIf(err, 'alertFunc on ', d.context);
        d.exit();
    });
    d.run(function() {
        logger.debug(context, 'alertfunc nsLineRule %j  entity %j ', nsLineRule, entity);
        // We duplicate info in event and event.ev for VR and non-VR action parameters
        var event = {
            service: nsLineRule[SERVICE],
            subservice: nsLineRule[SUBSERVICE],
            ruleName: nsLineRule[NAME],
            reportInterval: nsLineRule[REPORT_INTERVAL],
            maxTimeDetection: nsLineRule[MAX_TIME_DETECTION],
            maxTimeDetectionAttr: nsLineRule[MAX_TIME_DETECTION_ATTR],
            reportIntervalAttr: nsLineRule[REPORT_INTERVAL_ATTR],
            internalCurrentTime: new Date().toISOString()
        };
        if (!config.nonSignalByAPI) {
            // entity is really a entity doc obtained from mongo
            event.id = entity._id.id;
            event.type = entity._id.type;
            logger.debug(context, 'alertfunc event %j ', event);
            // Search for modDate of the entity's attribute
            // and copy every attribute (if not in event yet)
            // for use in action template
            Object.keys(entity.attrs).forEach(function(attrName) {
                if (attrName === nsLineRule[ATTRIBUTE]) {
                    try {
                        lastTime = new Date(entity.attrs[attrName].modDate * 1000).toISOString();
                    } catch (ex) {
                        myutils.logErrorIf(ex, 'run ', d.context);
                    }
                }
                if (event[attrName] === undefined) {
                    if (entity.attrs[attrName].type === 'DateTime') {
                        event[attrName] = new Date(entity.attrs[attrName].value * 1000).toISOString();
                    } else {
                        event[attrName] = entity.attrs[attrName].value;
                    }
                }
            });
        } else {
            // entity is and NGSI object
            event.id = entity.id;
            event.type = entity.type;
            logger.debug(context, 'alertfunc event %j ', event);
            // Search for modDate of the entity's attribute
            // and copy every attribute (if not in event yet)
            // for use in action template
            const attrName = nsLineRule[ATTRIBUTE];
            if (entity[attrName]) {
                try {
                    lastTime = entity[attrName].metadata.TimeInstant.value;
                } catch (ex) {
                    myutils.logErrorIf(ex, 'run ', d.context);
                }
                if (event[attrName] === undefined) {
                    if (entity[attrName].type === 'DateTime') {
                        event[attrName] = entity[attrName].metadata.TimeInstant.value;
                    } else {
                        event[attrName] = entity[attrName].value;
                    }
                }
            }
        }

        logger.debug(context, 'lastTime could be ', lastTime);
        if (lastTime !== undefined && lastTime !== null) {
            event.lastTime = lastTime;
        }
        logger.debug(context, 'event available is %j', event);
        var delay;
        if (config.isMaster) {
            delay = 0;
        } else {
            delay = config.slaveDelay;
        }
        setTimeout(function() {
            actions.Do(event, function(err) {
                myutils.logErrorIf(err, 'DoEvent', d.context);
            });
        }, delay);
    });
}

function checkNoSignal(period) {
    var list = nsRulesByInterval[period] || [];
    var currentContext = context;
    currentContext.srv = 'n/a';
    currentContext.subsrv = 'n/a';
    logger.debug(currentContext, 'Executing no-signal handler for period of %d (%d rules)', period, list.length);

    list.forEach(function(nsrule) {
        currentContext.srv = nsrule[SERVICE];
        currentContext.subsrv = nsrule[SUBSERVICE];
        entitiesStore.FindSilentEntities(
            nsrule[SERVICE],
            nsrule[SUBSERVICE],
            {
                attribute: nsrule[ATTRIBUTE],
                id: nsrule[ID],
                idRegexp: nsrule[ID_REGEXP],
                type: nsrule[TYPE],
                reportInterval: nsrule[REPORT_INTERVAL],
                maxTimeDetection: nsrule[MAX_TIME_DETECTION],
                maxTimeDetectionAttr: nsrule[MAX_TIME_DETECTION_ATTR],
                reportIntervalAttr: nsrule[REPORT_INTERVAL_ATTR]
            },
            alertFunc.bind({}, nsrule),
            function(err, data) {
                myutils.logErrorIf(err, 'checkNoSignal nsrule %s' % nsrule.name ? nsrule.name : '', currentContext);
                logger.debug(currentContext, 'silent entities: ', data);
            }
        );
    });
}

function nsr2arr(service, subservice, name, nsr) {
    var arrayRule = [];
    arrayRule[SUBSERVICE] = subservice;
    arrayRule[SERVICE] = service;
    arrayRule[NAME] = name;
    arrayRule[ATTRIBUTE] = nsr.attribute;
    arrayRule[ID] = nsr.id;
    arrayRule[ID_REGEXP] = nsr.idRegexp;
    arrayRule[TYPE] = nsr.type;
    arrayRule[REPORT_INTERVAL] = nsr.reportInterval;
    arrayRule[CHECK_INTERVAL] = nsr.checkInterval;
    arrayRule[MAX_TIME_DETECTION] = nsr.maxTimeDetection;
    arrayRule[MAX_TIME_DETECTION_ATTR] = nsr.maxTimeDetectionAttr;
    arrayRule[REPORT_INTERVAL_ATTR] = nsr.reportIntervalAttr;
    return arrayRule;
}

function addNSRule(service, subservice, name, nsr) {
    var arrayRule,
        alreadyExists = false,
        intervalAsNum;
    context.srv = service;
    context.subsrv = subservice;
    // Verify the interval is valid. It should be as it is checked at rule creation time
    // but an invalid modification of DB could cause a "big" problem
    intervalAsNum = parseInt(nsr.checkInterval, 10);
    if (isNaN(intervalAsNum)) {
        logger.error(
            context,
            util.format('Invalid check interval %s for rule (%s, %s, %s)', nsr.checkInterval, service, subservice, name)
        );
        return 0;
    }
    intervalAsNum *= intervalUnit;
    if (intervalAsNum > MAX_INTERVAL_MS) {
        logger.warn(
            context,
            util.format('Check interval %s too big for rule (%s, %s, %s)', nsr.checkInterval, service, subservice, name)
        );
        intervalAsNum = MAX_INTERVAL_MS;
    }
    if (intervalAsNum < MIN_INTERVAL_MS) {
        logger.warn(
            context,
            util.format(
                'Check interval %s too small for rule (%s, %s, %s)',
                nsr.checkInterval,
                service,
                subservice,
                name
            )
        );
        intervalAsNum = MIN_INTERVAL_MS;
    }

    arrayRule = nsr2arr(service, subservice, name, nsr);
    nsRulesByInterval[nsr.checkInterval] = nsRulesByInterval[nsr.checkInterval] || [];
    nsRulesByInterval[nsr.checkInterval].forEach(function(element, index, array) {
        if (element[NAME] === name && element[SERVICE] === service && element[SUBSERVICE] === subservice) {
            array[index] = arrayRule; //Update rule
            alreadyExists = true;
            logger.debug(context, util.format('Updating no-signal rule (%s, %s, %s)', service, subservice, name));
        }
    });
    if (!alreadyExists) {
        nsRulesByInterval[nsr.checkInterval].push(arrayRule);
        logger.debug(context, util.format('Adding no-signal rule (%s, %s, %s)', service, subservice, name));
    }
    if (!checkers.hasOwnProperty(nsr.checkInterval)) {
        logger.info(context, util.format('no-signal rule (%s, %s, %s)', service, subservice, name));
        checkers[nsr.checkInterval] = setInterval(checkNoSignal, intervalAsNum, nsr.checkInterval);
        checkers[nsr.checkInterval].unref();
    }
    return intervalAsNum;
}

function deleteNSRuleIf(predicate) {
    Object.keys(nsRulesByInterval).forEach(function(chkInt) {
        var line = nsRulesByInterval[chkInt] || [];
        line.forEach(function(element, index) {
            if (predicate(element[SERVICE], element[SUBSERVICE], element[NAME])) {
                line.splice(index, 1);
                if (line.length === 0) {
                    // There are no rules left for this interval
                    if (checkers.hasOwnProperty(chkInt)) {
                        clearInterval(checkers[chkInt]);
                        delete checkers[chkInt];
                    }
                    if (nsRulesByInterval.hasOwnProperty(chkInt)) {
                        delete nsRulesByInterval[chkInt];
                    }
                }
                context.srv = element[SERVICE];
                context.subsrv = element[SUBSERVICE];
                logger.debug(
                    context,
                    util.format(
                        'Deleting no-signal rule (%s, %s, %s)',
                        element[SERVICE],
                        element[SUBSERVICE],
                        element[NAME]
                    )
                );
            }
        });
    });
}

function deleteNSRule(service, subservice, name) {
    deleteNSRuleIf(function(serviceElement, subserviceElement, nameElement) {
        return serviceElement === service && subserviceElement === subservice && nameElement === name;
    });
}

function getNSRule(service, subservice, name) {
    var intervals = Object.keys(nsRulesByInterval),
        chkInt,
        line;
    for (var i = 0; i < intervals.length; i++) {
        chkInt = intervals[i];
        line = nsRulesByInterval[chkInt] || [];
        for (var j = 0; j < line.length; j++) {
            if (line[j][SERVICE] === service && line[j][SUBSERVICE] === subservice && line[j][NAME] === name) {
                return line[j];
            }
        }
    }
    return null;
}

function RuleSet() {
    this.set = {};
}
RuleSet.prototype.add = function(service, subservice, name) {
    var srvObj;
    if (this.set[service] === undefined) {
        this.set[service] = {};
    }
    srvObj = this.set[service];
    if (srvObj[subservice] === undefined) {
        srvObj[subservice] = {};
    }
    srvObj[subservice][name] = true;
};

RuleSet.prototype.includes = function(service, subservice, name) {
    return this.set[service] && this.set[service][subservice] && this.set[service][subservice][name] === true;
};

function refreshAllRules(rules) {
    var count = 0,
        ruleSet = new RuleSet(),
        oldRuleArr = [];
    context.srv = 'n/a';
    context.subsrv = 'n/a';
    logger.debug(context, 'Refreshing all no-signal rules');
    rules.forEach(function(rule) {
        if (rule.nosignal) {
            //check if any checkInterval has been modified, and delete if so.
            oldRuleArr = getNSRule(rule.service, rule.subservice, rule.name);
            deleteNSRuleIf(function() {
                return oldRuleArr && oldRuleArr[CHECK_INTERVAL] !== rule.nosignal.checkInterval;
            });
            if (addNSRule(rule.service, rule.subservice, rule.name, rule.nosignal) > 0) {
                count++;
                ruleSet.add(rule.service, rule.subservice, rule.name);
            }
        }
    });
    // remove old rules not in the new set
    deleteNSRuleIf(function(srv, subsrv, nm) {
        return !ruleSet.includes(srv, subsrv, nm);
    });
    logger.debug(
        context,
        util.format('no-signal rules %d/%d, checkers: %d', count, rules.length, Object.keys(checkers).length)
    );
}

module.exports.AddNSRule = addNSRule;
module.exports.DeleteNSRule = deleteNSRule;
module.exports.RefreshAllRules = refreshAllRules;
module.exports.GetNSArrRule = getNSRule;
module.exports.CheckNoSignal = checkNoSignal;
module.exports.Nsr2Arr = nsr2arr;
module.exports.getMinIntervalMs = function() {
    return MIN_INTERVAL_MS;
};
module.exports.getIntervalUnit = function() {
    return intervalUnit;
};
