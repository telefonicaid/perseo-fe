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

var notices = require('../models/notices'),
    metrics = require('../models/metrics'),
    config = require('../../config'),
    logger = require('logops'),
    myutils = require('../myutils');

function PostNotice(req, resp) {
    var notice;

    notice = req.body;
    notice.subservice = req.subservice;
    notice.service = req.service;
    logger.info({}, 'posting notice ' + notice);
    metrics.IncMetrics(req.service, req.subservice, metrics.notifications);
    notices.Do(notice, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedNotifications);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okNotifications);
        }
        myutils.respond(resp, err, data);
    });
}

function AddTo(app) {
    app.post(config.endpoint.noticesPath, PostNotice);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
