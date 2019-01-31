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

var config = require('../../config'),
    myutils = require('../myutils'),
    packageObj = require('../../package.json'),
    logger = require('logops'),
    util = require('util'),
    versionObj = {
        name: packageObj.name,
        description: packageObj.description,
        version: packageObj.version,
    },
    logLevels = {
        DEBUG: 'DEBUG',
        INFO: 'INFO',
        WARN: 'WARN',
        ERROR: 'ERROR',
        FATAL: 'FATAL',
    },
    errors = {},
    currentLevel = config.logLevel;

function version(req, resp) {
    myutils.respond(resp, null, versionObj);
}

function changeLogLevel(req, resp) {
    logger.warn({}, 'changing log level to ' + req.query.level);
    var newLevel = logLevels[req.query.level];
    if (newLevel !== undefined) {
        logger.setLevel(newLevel);
        currentLevel = newLevel;
        resp.status(200).end();
    } else {
        logger.error({}, 'invalid log level ' + req.query.level);
        myutils.respond(resp, new errors.InvalidLogLevel());
    }
}

function getLogLevel(req, resp) {
    logger.debug({}, 'getting log level');
    myutils.respondWOMetrics(resp, null, { level: currentLevel }, /* withCount */ false, /* raw */ true);
}
function AddTo(app) {
    app.get(config.endpoint.versionPath, version);
    app.put(config.endpoint.logPath, changeLogLevel);
    app.get(config.endpoint.logPath, getLogLevel);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;

/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.InvalidLogLevel = function InvalidLogLevel() {
        this.name = 'INVALID_LOG_LEVEL';
        this.message = 'invalid log level';
        this.httpCode = 400;
    };

    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
