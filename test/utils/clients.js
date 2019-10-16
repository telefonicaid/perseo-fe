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
    request = require('request'),
    config = require('../../config'),
    constants = require('../../lib/constants');

function commonRequest(method, url, object, callback) {
    var options = {};
    options.headers = {};
    options.headers[constants.SERVICE_HEADER] = config.DEFAULT_SERVICE;
    options.headers[constants.SUBSERVICE_HEADER] = config.DEFAULT_SUBSERVICE;
    options.url = url;
    if (object) {
        options.json = object;
    }
    request[method](options, function cbCommonRequest(error, response, body) {
        if (error) {
            return callback(error, null);
        }
        if (response.headers['content-type'] === 'application/json; charset=utf-8' && typeof body === 'string') {
            body = JSON.parse(body);
        }
        return callback(error, { statusCode: response.statusCode, body: body, headers: response.headers });
    });
}

function PostNotice(notice, callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.noticesPath);
    commonRequest('post', url, notice, callback);
}
function PostRule(rule, callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.rulesPath);
    commonRequest('post', url, rule, callback);
}
function DeleteRule(ruleName, callback) {
    var url = util.format(
        'http://%s:%s%s/%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.rulesPath,
        ruleName
    );
    commonRequest('del', url, null, callback);
}
function GetRule(ruleName, callback) {
    var url = util.format(
        'http://%s:%s%s/%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.rulesPath,
        ruleName
    );
    commonRequest('get', url, null, callback);
}
function GetAllRules(callback) {
    var url = util.format(
        'http://%s:%s%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.rulesPath + '?limit=100&offset=0&options=count'
    );
    commonRequest('get', url, null, callback);
}

function PostVR(rule, callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.vrPath);
    commonRequest('post', url, rule, callback);
}
function PutVR(ruleName, rule, callback) {
    var url = util.format(
        'http://%s:%s%s/%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.vrPath,
        ruleName
    );
    commonRequest('put', url, rule, callback);
}
function DeleteVR(ruleName, callback) {
    var url = util.format(
        'http://%s:%s%s/%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.vrPath,
        ruleName
    );
    commonRequest('del', url, null, callback);
}
function GetVR(ruleName, callback) {
    var url = util.format(
        'http://%s:%s%s/%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.vrPath,
        ruleName
    );
    commonRequest('get', url, null, callback);
}
function GetAllVR(callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.vrPath);
    commonRequest('get', url, null, callback);
}
function PostAction(action, callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.actionsPath);
    commonRequest('post', url, action, callback);
}
function GetVersion(callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.versionPath);
    commonRequest('get', url, null, callback);
}
function PutLogLevel(level, callback) {
    var url = util.format(
        'http://%s:%s%s?level=%s',
        config.endpoint.host,
        config.endpoint.port,
        config.endpoint.logPath,
        level
    );
    commonRequest('put', url, null, callback);
}
function GetLogLevel(callback) {
    var url = util.format('http://%s:%s%s', config.endpoint.host, config.endpoint.port, config.endpoint.logPath);
    commonRequest('get', url, null, callback);
}

module.exports.PostVR = PostVR;
module.exports.DeleteVR = DeleteVR;
module.exports.GetVR = GetVR;
module.exports.GetAllVR = GetAllVR;
module.exports.PutVR = PutVR;

module.exports.PostRule = PostRule;
module.exports.DeleteRule = DeleteRule;
module.exports.GetRule = GetRule;
module.exports.GetAllRules = GetAllRules;

module.exports.PostNotice = PostNotice;

module.exports.PostAction = PostAction;

module.exports.GetVersion = GetVersion;

module.exports.PutLogLevel = PutLogLevel;
module.exports.GetLogLevel = GetLogLevel;
