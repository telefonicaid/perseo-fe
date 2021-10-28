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
 *
 * Modified by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */
'use strict';

var util = require('util'),
    async = require('async'),
    rulesStore = require('./rulesStore'),
    config = require('../../config'),
    myutils = require('../myutils'),
    noSignal = require('./noSignal'),
    actions = require('./actions'),
    logger = require('logops'),
    namePattern = /^[a-zA-Z0-9_-]+$/,
    MaxNameLength = 50,
    errors = {};

function validNSRule(rule) {
    var checkInterval = parseInt(rule.nosignal.checkInterval, 10);
    if (isNaN(checkInterval) || checkInterval < 1) {
        return new errors.InvalidCheckInterval(rule.nosignal.checkInterval);
    }
    return null;
}

function validRule(rule) {
    var err = null;

    if (typeof rule.name !== 'string') {
        //includes null ('object') and undefined ('undefined')
        return new errors.MustBeStringRuleName(typeof rule.name);
    } else if (rule.name.length === 0) {
        //empty string ""
        return new errors.MissingRuleName(JSON.stringify(rule.name));
    } else if (rule.name.length > MaxNameLength) {
        return new errors.TooLongRuleName(JSON.stringify(rule.name));
    } else if (!namePattern.test(rule.name)) {
        return new errors.InvalidRuleName(rule.name);
    } else if (!rule.text && !rule.nosignal) {
        return new errors.EmptyRule(JSON.stringify(rule));
    } else {
        //Added default else clause
        logger.debug('validRule() - Default else clause');
    }
    if (rule.nosignal) {
        //Specific checks for no-signal rules
        err = validNSRule(rule);
        if (err !== null) {
            return err;
        }
    }
    return actions.validateAction(rule.action);
}

function isTimedRule(rule) {
    // Detect timed rules, taken from perseo-core
    // https://github.com/telefonicaid/perseo-core/blob/master/perseo-main/src/main/java/com/telefonica/iot/perseo/TimeRulesStore.java#L110
    return (
        rule.text.includes('timer:') ||
        (rule.text.toLowerCase().includes('match_recognize') && rule.text.toLowerCase().includes('interval'))
    );
}

function postR2core(rule, callback) {
    if (rule.text) {
        // check if timedrule
        var context = {},
            eplRule = {};
        if (isTimedRule(rule)) {
            context = {
                name: myutils.contextNameTimedRule(rule),
                text: myutils.contextEPLTimedRule(rule)
            };
            eplRule = {
                name: myutils.ruleUniqueName(rule),
                text: myutils.ruleWithContextTimedRule(rule)
            };
        } else {
            context = {
                name: myutils.contextName(rule),
                text: myutils.contextEPL(rule)
            };
            eplRule = {
                name: myutils.ruleUniqueName(rule),
                text: myutils.ruleWithContext(rule)
            };
        }
        logger.info('Post2core using context %j eplRule %j', context, eplRule);
        async.series(
            [
                myutils.requestHelperWOMetrics.bind(null, 'post', { url: config.perseoCore.rulesURL, json: context }),
                myutils.requestHelperWOMetrics.bind(null, 'post', { url: config.perseoCore.rulesURL, json: eplRule }),
                function propagateRule(cb) {
                    if (config.nextCore && config.nextCore.rulesURL) {
                        async.series(
                            [
                                myutils.requestHelperWOMetrics.bind(null, 'post', {
                                    url: config.nextCore.rulesURL,
                                    json: context
                                }),
                                myutils.requestHelperWOMetrics.bind(null, 'post', {
                                    url: config.nextCore.rulesURL,
                                    json: eplRule
                                })
                            ],
                            function(/*error*/) {
                                cb(null); // Do not propagate error
                            }
                        );
                    } else {
                        cb(null);
                    }
                }
            ],
            callback
        );
    } else {
        callback(null, rule);
    }
}

function delR2core(rule, callback) {
    var wholeName = myutils.ruleUniqueName(rule);
    logger.info('delR2core using name %s', wholeName);
    //Now we don't know if it is EPL or N-S, it's safe to try to remove any case
    async.series(
        [
            myutils.requestHelperWOMetrics.bind(null, 'del', { url: config.perseoCore.rulesURL + '/' + wholeName }),
            function propagateDel(cb) {
                if (config.nextCore && config.nextCore.rulesURL) {
                    myutils.requestHelperWOMetrics(
                        'del',
                        { url: config.nextCore.rulesURL + '/' + wholeName },
                        function(/*error*/) {
                            cb(null); // Do not propagate error
                        }
                    );
                } else {
                    cb(null);
                }
            }
        ],
        callback
    );
}

function putR2core(rules, callback) {
    var rulesAndContexts = [];
    rules.forEach(function(rule) {
        if (rule.text) {
            if (isTimedRule(rule)) {
                rulesAndContexts.push({
                    name: myutils.contextNameTimedRule(rule),
                    text: myutils.contextEPLTimedRule(rule)
                });
                rulesAndContexts.push({
                    name: myutils.ruleUniqueName(rule),
                    text: myutils.ruleWithContextTimedRule(rule)
                });
            } else {
                rulesAndContexts.push({
                    name: myutils.contextName(rule),
                    text: myutils.contextEPL(rule)
                });
                rulesAndContexts.push({
                    name: myutils.ruleUniqueName(rule),
                    text: myutils.ruleWithContext(rule)
                });
            }
        }
    });
    logger.debug('putR2core using rulesAndContexts: %j', rulesAndContexts);
    myutils.requestHelperWOMetrics('put', { url: config.perseoCore.rulesURL, json: rulesAndContexts }, function(
        error,
        data
    ) {
        if (error && error.httpCode >= 500) {
            callback(error, data);
        } else {
            // Do not propagate error
            callback(null, data);
        }
    });
}

/**
 * Add ruleName if necessary in rule text field
 *
 * @param rule The rule object
 */
function normalizeRuleName(rule) {
    var newAs = '"' + rule.name + '" as ruleName';
    // Add "name as ruleName" if not exist
    if (rule.text && rule.text.indexOf(' as ruleName') === -1) {
        var offset = 'select'.length + 1;
        var idx = rule.text.toLowerCase().indexOf('select') + offset;
        rule.text = rule.text = rule.text.slice(0, idx) + newAs + ', ' + rule.text.slice(idx);
    }

    return rule;
}

module.exports = {
    FindAll: function(service, subservice, callback) {
        rulesStore.FindAll(service, subservice, function(err, data) {
            return callback(err, data);
        });
    },
    Find: function(rule, callback) {
        rulesStore.Find(rule, function(err, data) {
            return callback(err, data);
        });
    },
    Save: function(rule, callback) {
        var localError;

        localError = validRule(rule);
        if (localError !== null) {
            myutils.logErrorIf(localError);
            return callback(localError);
        }

        // Normalize the rule text
        rule = normalizeRuleName(rule);

        async.series(
            [
                function(localCallback) {
                    rulesStore.Exists(rule, function rsSaveExistsCb(err, exists) {
                        if (err) {
                            return localCallback(err);
                        }
                        if (exists) {
                            return localCallback(new errors.RuleExists(rule.name));
                        }
                        return localCallback(err, exists);
                    });
                },
                postR2core.bind(null, rule),
                rulesStore.Save.bind(null, rule),
                function(cb) {
                    if (rule.nosignal) {
                        noSignal.AddNSRule(rule.service, rule.subservice, rule.name, rule.nosignal);
                    }
                    cb(null);
                }
            ],
            callback
        );
    },
    Remove: function(rule, callback) {
        async.series(
            [
                rulesStore.Remove.bind(null, rule),
                delR2core.bind(null, rule),
                function(cb) {
                    noSignal.DeleteNSRule(rule.service, rule.subservice, rule.name);
                    cb(null);
                }
            ],
            callback
        );
    },
    Refresh: function(callback) {
        async.waterfall(
            [
                rulesStore.FindAll,
                function(rules, cb) {
                    noSignal.RefreshAllRules(rules);
                    cb(null, rules);
                },
                putR2core
            ],
            callback
        );
    },
    Put: function(id, rule, callback) {
        var localError;
        localError = validRule(rule);
        if (localError !== null) {
            myutils.logErrorIf(localError);
            return callback(localError);
        }

        // Normalize the rule text
        rule = normalizeRuleName(rule);

        async.series(
            [
                delR2core.bind(null, rule),
                function(cb) {
                    if (rule.nosignal) {
                        noSignal.DeleteNSRule(rule.service, rule.subservice, rule.name);
                    }
                    cb(null);
                },
                postR2core.bind(null, rule),
                function(cb) {
                    if (rule.nosignal) {
                        noSignal.AddNSRule(rule.service, rule.subservice, rule.name, rule.nosignal);
                    }
                    cb(null);
                },
                rulesStore.Update.bind(null, id, rule)
            ],
            callback
        );
    }
};
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.MissingRuleName = function MissingRuleName(msg) {
        this.name = 'MISSING_RULE_NAME';
        this.message = 'missing rule name ' + msg;
        this.httpCode = 400;
    };
    errors.EmptyRule = function EmptyRule(msg) {
        this.name = 'EMPTY_RULE';
        this.message = 'empty rule, missing text or nosignal ' + msg;
        this.httpCode = 400;
    };
    errors.RuleExists = function RuleExists(msg) {
        this.name = 'EXISTING_RULE';
        this.message = 'rule exists ' + msg;
        this.httpCode = 400;
    };
    errors.MustBeStringRuleName = function MustBeStringRuleName(msg) {
        this.name = 'MUST_BE_STRING_RULE_NAME';
        this.message = 'name must be a string ' + msg;
        this.httpCode = 400;
    };
    errors.TooLongRuleName = function TooLong(msg) {
        this.name = 'TOO_LONG_RULE_NAME';
        this.message = 'rule name too long ' + msg;
        this.httpCode = 400;
    };
    errors.InvalidRuleName = function InvalidRuleName(msg) {
        this.name = 'INVALID_RULE_NAME';
        this.message = 'invalid char in name ' + msg;
        this.httpCode = 400;
    };
    errors.InvalidCheckInterval = function InvalidCheckInterval(msg) {
        this.name = 'INVALID_CHECK_INTERVAL';
        this.message = 'invalid check interval ' + msg;
        this.httpCode = 400;
    };

    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
