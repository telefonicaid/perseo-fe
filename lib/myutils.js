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

var request = require('request'),
    util = require('util'),
    logger = require('logops'),
    constants = require('./constants'),
    metrics = require('./models/metrics');

function logErrorIf(err, message, context) {
    var level = 'error';
    if (context === undefined) {
        context = process.domain && process.domain.context;
    }
    if (err) {
        message = message || '';
        if (context) {
            context.op =
                context.op ||
                new Error().stack
                    .split('\n')[2]
                    .trim()
                    .substr(3);
            context.comp = context.comp || constants.COMPONENT_NAME;
            logger[level](context, message, err.message || JSON.stringify(err));
        } else {
            logger[level](message, err.message || JSON.stringify(err));
        }
    }
}

function expandVar(val, mapping, trycast) {
    if (typeof val === 'string') {
        Object.keys(mapping).forEach(function(p) {
            val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), mapping[p]);
        });
        var expanded = false;
        if (trycast) {
            try {
                // Check if "${num}" and expand it as real value, non string
                var n = JSON.parse(val);
                switch (typeof n) {
                    case 'number':
                    case 'boolean':
                    case 'object': // for a json in a string like: "{\"type\":\"Point\"}"
                        val = n;
                        expanded = true;
                        break;
                }
            } catch (e) {
                // keep val value
            }
        }
        if (!expanded) {
            val = val.replace(/\$\{\w*\}/g, 'null');
        }
    }
    return val;
}

function expandObject(templateObj, dictionary) {
    var res = {};
    if (templateObj && typeof templateObj === 'object') {
        Object.keys(templateObj).forEach(function(key) {
            if (typeof templateObj[key] === 'string') {
                res[expandVar(key, dictionary)] = expandVar(templateObj[key], dictionary);
            } else if (typeof templateObj[key] === 'object') {
                res[expandVar(key, dictionary)] = expandObject(templateObj[key], dictionary);
            } else {
                //Added default else clause
                logger.debug('expandObject() - Default else clause');
            }
        });
    }
    return res;
}

// Think better if this is the best way
function flattenMap(key, targetMap) {
    var newMap = {},
        v,
        flattened,
        fv;
    Object.keys(targetMap).forEach(function(k) {
        v = targetMap[k];
        if (v && typeof v === 'object') {
            flattened = flattenMap(k + '__', v);
            Object.keys(flattened).forEach(function(fk) {
                fv = flattened[fk];
                newMap[key + fk] = fv;
            });
        } else {
            newMap[key + k] = v;
        }
    });
    return newMap;
}

function requestHelperAux(method, options, withMetrics, callback) {
    var localError,
        respObj,
        headers,
        domain = process.domain;
    logger.info('making %s to %s', method, options.url);
    if (withMetrics && domain.context) {
        metrics.IncMetrics(domain.context.srv, domain.context.subsrv, metrics.outgoingTransactions);
    }
    headers = options.headers || {};
    if (domain && domain.context) {
        headers[constants.CORRELATOR_HEADER] = domain.context.corr;
        if (domain.context.srv && headers[constants.SERVICE_HEADER] === undefined) {
            headers[constants.SERVICE_HEADER] = domain.context.srv;
        }
        if (domain.context.subsrv && headers[constants.SUBSERVICE_HEADER] === undefined) {
            headers[constants.SUBSERVICE_HEADER] = domain.context.subsrv;
        }
        if (domain.context.from && headers[constants.REALIP_HEADER] === undefined) {
            headers[constants.REALIP_HEADER] = domain.context.from;
        }
    }
    options.headers = headers;
    if (withMetrics && options.json && domain.context) {
        try {
            metrics.IncMetrics(
                domain.context.srv,
                domain.context.subsrv,
                metrics.outgoingTransactionsRequestSize,
                Buffer.byteLength(JSON.stringify(options.body), 'utf-8')
            );
        } catch (exception) {
            logger.warn(exception);
        }
    }
    request[method](options, function cbRequest2core(err, response, body) {
        var bodySz = 0;
        if (withMetrics && domain.context) {
            if (body) {
                if (typeof body === 'string') {
                    bodySz = Buffer.byteLength(body);
                } else {
                    try {
                        bodySz = Buffer.byteLength(JSON.stringify(body));
                    } catch (ex) {
                        logger.warn(ex);
                    }
                }
                metrics.IncMetrics(
                    domain.context.srv,
                    domain.context.subsrv,
                    metrics.outgoingTransactionsResponseSize,
                    bodySz
                );
            }
        }
        if (err) {
            logErrorIf(err, util.format('error %s to %s', method, options.url));
            if (withMetrics && domain.context) {
                metrics.IncMetrics(domain.context.srv, domain.context.subsrv, metrics.outgoingTransactionsErrors);
            }
            return callback(err, null);
        }
        respObj = { code: response.statusCode, body: body };
        logger.debug('%s to %s returns %j', method, options.url, respObj);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            localError = new Error(
                util.format(
                    'error %s to %s (%s)',
                    method,
                    options.url,
                    (body && body.error) || (body && JSON.stringify(body)) || response.statusCode
                )
            );
            localError.httpCode = respObj.code < 500 && respObj.code >= 400 ? respObj.code : 500;
            logErrorIf(localError, null, domain && domain.context);
            if (withMetrics && domain.context) {
                metrics.IncMetrics(domain.context.srv, domain.context.subsrv, metrics.outgoingTransactionsErrors);
            }
            return callback(localError, respObj);
        }
        logger.info('done %s to %s', method, options.url);
        return callback(err, respObj);
    });
}

function requestHelper(method, options, callback) {
    return requestHelperAux(method, options, true, callback);
}

function requestHelperWOMetrics(method, options, callback) {
    return requestHelperAux(method, options, false, callback);
}

function respondAux(resp, err, data, withCount, raw, withMetrics) {
    var statusCode = 200,
        errMsg = null,
        respObj,
        respStr,
        domain = process.domain;
    if (err) {
        errMsg = err.message;
        statusCode = err.httpCode || 500;
        data = null;
    }

    if (raw === true) {
        if (err) {
            respObj = err;
            delete respObj.httpCode;
        } else {
            respObj = data;
        }
    } else {
        // non-raw
        respObj = { error: errMsg, data: data };
        if (withCount === true && data && util.isArray(data)) {
            respObj.count = data.length;
        }
    }
    logger.info('sending response: %s %j', statusCode, respObj);
    respStr = JSON.stringify(respObj);
    if (withMetrics && domain && domain.context) {
        metrics.IncMetrics(
            domain.context.srv,
            domain.context.subsrv,
            metrics.incomingTransactionsResponseSize,
            Buffer.byteLength(respStr, 'utf-8')
        );
        if (err) {
            metrics.IncMetrics(domain.context.srv, domain.context.subsrv, metrics.incomingTransactionsErrors);
        }
    }
    resp.set('Content-Type', 'application/json');
    resp.status(statusCode);
    resp.send(respStr);
}

function respond(resp, err, data, withCount, raw) {
    return respondAux(resp, err, data, withCount, raw, true);
}

function respondWOMetrics(resp, err, data, withCount, raw) {
    return respondAux(resp, err, data, withCount, raw, false);
}

function firstChars(result) {
    var text;
    if (result === undefined) {
        result = 'undefined';
    }
    text = JSON.stringify(result);
    if (text.length > 125) {
        text = text.substr(0, 125) + ' [...]';
    }
    return text;
}

function purgeName(name) {
    return name ? name.replace(/\//g, '$') : name;
}

function contextName(rule) {
    return util.format('ctxt$%s%s', purgeName(rule.service), purgeName(rule.subservice));
}

function contextNameTimedRule(rule) {
    return util.format('timedRctxt$%s%s', purgeName(rule.service), purgeName(rule.subservice));
}

function ruleUniqueName(rule) {
    return util.format('%s@%s%s', rule.name, rule.service, rule.subservice);
}

function contextEPL(rule) {
    return util.format(
        'create context %s partition by service from iotEvent(service="%s" and subservice="%s")',
        contextName(rule),
        rule.service,
        rule.subservice
    );
}

function contextEPLTimedRule(rule) {
    return util.format('create context %s start @now', contextNameTimedRule(rule));
}

// Remove CR, LF and CR+LF'chars from text rule
//  \r = CR (Carriage Return) → Used as a new line character in Mac OS before X
//  \n = LF (Line Feed) → Used as a new line character in Unix/Mac OS X
//  \r\n = CR + LF → Used as a new line character in Windows
function removeCRLFchars(text) {
    return text.replace(/(\r\n|\n|\r)/gm, ' ');
}

function ruleWithContext(rule) {
    const ruleText = removeCRLFchars(rule.text);
    const preSelectMatch = ruleText.match(/.+?(?=\bselect )/i);
    const SelectMatch = ruleText.match(/\bselect.*/i);
    const insertionPreSelect = preSelectMatch ? preSelectMatch[0] : '';
    const insertionSelect = SelectMatch ? SelectMatch[0] : '';

    return util.format('%s context %s %s', insertionPreSelect, contextName(rule), insertionSelect).trim();
}

function ruleWithContextTimedRule(rule) {
    const ruleText = removeCRLFchars(rule.text);
    const preSelectMatch = ruleText.match(/.+?(?=\bselect )/i);
    const SelectMatch = ruleText.match(/\bselect.*/i);
    const insertionPreSelect = preSelectMatch ? preSelectMatch[0] : '';
    const insertionSelect = SelectMatch ? SelectMatch[0] : '';

    return util.format('%s context %s %s', insertionPreSelect, contextNameTimedRule(rule), insertionSelect).trim();
}

/**
 * expandVar substitutes every variable in val (denoted as $(var}) with the value
 * in mappings (as dictionary), getting the key 'var' from the object
 *
 * @param  {string}   'template' in which to replace variables for values
 * @param  {Object}   variable name to substitute
 */
module.exports.expandVar = expandVar;

module.exports.expandObject = expandObject;

/**
 * flattenMap flatten a map recursively using '__' to nested maps
 *
 * @param  {string} key to append to every nested key
 * @param  {Object} object to put the flattened keys
 */
module.exports.flattenMap = flattenMap;

/**
 * requestHelper makes an HTTP request.
 *
 * @param {string}       method  ('GET', 'POST', 'PUT', 'DELETE')
 * @param {Object}       options, as accepted by 'request' library
 * @param {function}     callback function(error, response)
 */
module.exports.requestHelper = requestHelper;
module.exports.requestHelperWOMetrics = requestHelperWOMetrics;

/**
 * respond sends an HTTP response with the proper code for the error passed in, if any.
 * Also it can add the length if the object to send is in Array and it is asked for.
 *
 * @param {Object}       response object form Express
 * @param {Object}       error object or null
 * @param {Object}       data to send as JSON
 * @param {boolean}      if data is an Array, add a count field with its length
 */
module.exports.respond = respond;
module.exports.respondWOMetrics = respondWOMetrics;

/**
 * logErrorIf writes an error if passed in. Optionally a message can be add and the level for log can be set
 *
 * @param {Object}       error, if null, nothing will be logged
 * @param {string}       message to add, optional
 * @param {string}       level to log to, optional. 'error' by default
 */
module.exports.logErrorIf = logErrorIf;
/**
 * firstChars returns first characters of a string
 *
 * @param  {string} string to trim, if necessary
 */
module.exports.firstChars = firstChars;
/**
 * ruleUniqueName returns a unique name for a rule, including subservice and service names
 *
 * @param  {Object} Object rule
 */
module.exports.ruleUniqueName = ruleUniqueName;

/**
 * ruleWithContext returns the text of a rule with the context information add (currently the text)
 *
 * @param  {Object} Object rule
 */
module.exports.ruleWithContext = ruleWithContext;

/**
 * contextRuleText returns the EPL text for creating a context for subservice and service names
 *
 * @param  {Object} Object rule
 */
module.exports.contextEPL = contextEPL;

/**
 * contextRuleName returns the name of a context for subservice and service names
 *
 * @param  {Object} Object rule
 */
module.exports.contextName = contextName;

/**
 * contextRuleName returns the name of a context Timed Rule for subservice and service names
 *
 * @param  {Object} Object rule
 */
module.exports.contextNameTimedRule = contextNameTimedRule;

/**
 * contextRuleText returns the EPL text for creating a context for subservice and service names
 *
 * @param  {Object} Object rule
 */
module.exports.contextEPLTimedRule = contextEPLTimedRule;

/**
 * ruleWithContextTimedRule returns the text of a rule with the context information add (currently the text)
 *
 * @param  {Object} Object rule
 */
module.exports.ruleWithContextTimedRule = ruleWithContextTimedRule;
