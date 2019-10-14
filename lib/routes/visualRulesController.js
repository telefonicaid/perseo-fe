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
    visualRules = require('../models/visualRules'),
    metrics = require('../models/metrics'),
    config = require('../../config'),
    constants = require('../constants'),
    logger = require('logops'),
    myutils = require('../myutils');

function GetAllVR(req, resp) {
    var limit = req.query.limit ? req.query.limit : 1000;
    var offset = req.query.offset ? req.query.offset : 0;
    var count = req.query && req.query.options ? req.query.options === 'count' : true;
    visualRules.FindAll(req.service, req.subservice, function(err, data) {
        if (!err && util.isArray(data)) {
            data = data.map(function(e) {
                delete e.subservice;
                delete e.service;
                return e;
            });
            resp.set(constants.TOTAL_COUNT_HEADER, data.length);
            data = data.splice(offset, limit);
        }
        myutils.respond(resp, err, data, count);
    });
}
function GetVR(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        service: req.service
    };
    logger.info({}, 'getting Vrule ' + rule);
    visualRules.Find(rule, function(err, data) {
        if (!err && data) {
            delete data.subservice;
            delete data.service;
        }
        myutils.respond(resp, err, data);
    });
}
function PostVR(req, resp) {
    req.body = req.body || {};
    req.body.subservice = req.subservice;
    req.body.service = req.service;
    logger.info({}, 'posting Vrule ' + req.body);
    metrics.IncMetrics(req.service, req.subservice, metrics.ruleCreation);

    visualRules.Save(req.body, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedRuleCreation);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okRuleCreation);
        }

        if (err) {
            return myutils.respond(resp, err, data);
        }
        if (data && data.name) {
            resp.location(req.url + '/' + encodeURIComponent(data.name));
        }
        resp.status(201);
        resp.send();
    });
}
function DelVR(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        service: req.service
    };
    logger.info({}, 'deleting Vrule ' + rule);
    metrics.IncMetrics(req.service, req.subservice, metrics.ruleDelete);

    visualRules.Remove(rule, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedRuleDelete);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okRuleDelete);
        }

        if (err) {
            return myutils.respond(resp, err, data);
        }
        resp.status(204);
        resp.send();
    });
}
function PutVR(req, resp) {
    req.body = req.body || {};
    req.body.subservice = req.subservice;
    req.body.service = req.service;
    logger.info({}, 'putting Vrule ' + req.body);
    metrics.IncMetrics(req.service, req.subservice, metrics.ruleUpdate);

    visualRules.Put(req.params.id, req.body, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedRuleUpdate);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okRuleUpdate);
        }

        if (err) {
            return myutils.respond(resp, err, data);
        }
        if (data && data.name) {
            //resp.location(req.url.replace(new RegExp(req.params.id), '')+encodeURIComponent(data.name));
            resp.location(req.url.substr(0, req.url.lastIndexOf('/')) + '/' + encodeURIComponent(data.name));
        }
        resp.status(200);
        resp.send();
    });
}

function AddTo(app) {
    app.get(config.endpoint.vrPath, GetAllVR);
    app.get(config.endpoint.vrPath + '/:id', GetVR);
    app.post(config.endpoint.vrPath, PostVR);
    app.delete(config.endpoint.vrPath + '/:id', DelVR);
    app.put(config.endpoint.vrPath + '/:id', PutVR);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
