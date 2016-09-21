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
    constants = require('./constants');


function logErrorIf(err, message, context) {
    var level = 'error';
    if (context === undefined) {
        context = process.domain && process.domain.context;
    }
    if (err) {
        message = message || '';
        if (context) {
            context.op = context.op || new Error().stack.split('\n')[2].trim().substr(3);
            context.comp = context.comp || constants.COMPONENT_NAME;
            logger[level](context, message, err.message || JSON.stringify(err));
        }
        else {
            logger[level](message, err.message || JSON.stringify(err));
        }
    }

}

function expandVar(val, mapping) {
    Object.keys(mapping).forEach(function(p) {
        val = val.replace(
            new RegExp('\\$\\{' + p + '\\}', 'g'),
            mapping[p]
        );
        val = val.replace(
            new RegExp('\\{\\{' + p + '\\}\\}', 'g'),
            mapping[p]
        );
    });
    val = val.replace(/\$\{\w*\}/g, '[?]');
    return val;
}

// Think better if this is the best way
function flattenMap(key, targetMap) {
    var newMap = {}, v, flattened, fv;
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

function requestHelper(method, options, callback) {
    var localError, respObj, headers,
        domain = process.domain;
    logger.info('making %s to %s', method, options.url);
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
    request[method](options, function cbRequest2core(err, response, body) {
        if (err) {
            logErrorIf(err, util.format('error %s to %s', method, options.url));
            return callback(err, null);
        }
        respObj = {code: response.statusCode, body: body};
        logger.debug('%s to %s returns %j', method, options.url, respObj);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            localError = new Error(util.format('error %s to %s (%s)', method, options.url,
                    (body && body.error) || (body && JSON.stringify(body)) || response.statusCode));
            localError.httpCode = 500;
            logErrorIf(localError, domain && domain.context);
            return callback(localError, respObj);
        }
        logger.info('done %s to %s', method, options.url);
        return callback(err, respObj);
    });
}

function respond(resp, err, data, withCount) {
    var statusCode = 200,
        errMsg = null,
        respObj;
    if (err) {
        errMsg = err.message;
        statusCode = err.httpCode || 500;
        data = null;
    }
    resp.status(statusCode);
    respObj = {error: errMsg, data: data};
    if (withCount === true && data && util.isArray(data)) {
        respObj.count = data.length;
    }
    logger.info('sending response: %s %j', statusCode,
        respObj);
    resp.jsonp(respObj);
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

function ruleUniqueName(rule) {
    return util.format('%s@%s%s', rule.name, rule.service, rule.subservice);
}

function contextEPL(rule) {
    return util.format('create context %s partition by service from iotEvent(service="%s" and subservice="%s")',
        contextName(rule), rule.service, rule.subservice);
}

function ruleWithContext(rule) {
    return util.format('context %s %s', contextName(rule), rule.text);
}

/**
 * expandVar substitutes every variable in val (denoted as $(var}) with the value
 * in mappings (as dictionary), getting the key 'var' from the object
 *
 * @param  {string}   'template' in which to replace variables for values
 * @param  {Object}   variable name to substitute
 */
module.exports.expandVar = expandVar;

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
