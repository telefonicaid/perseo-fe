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
    logger = require('logops'),
    errorNotAMaster;

/*jshint quotmark: double */
errorNotAMaster = new Error("I'm not a master");
/*jshint quotmark: single */
errorNotAMaster.httpCode = 400;

function Check(req, resp) {
    logger.debug({}, 'Check');
    if (config.isMaster) {
        myutils.respondWOMetrics(resp, null, 'OK');
    } else {
        myutils.respondWOMetrics(resp, errorNotAMaster, null);
    }
}

function AddTo(app) {
    app.get(config.endpoint.checkPath, Check);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
