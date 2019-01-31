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

var rules = require('../models/rules'),
    metrics = require('../models/metrics'),
    config = require('../../config'),
    myutils = require('../myutils');

function GetAllRules(req, resp) {
    rules.FindAll(req.service, req.subservice, function(err, data) {
        myutils.respond(resp, err, data);
    });
}
function GetRules(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        service: req.service,
    };
    rules.Find(rule, function(err, data) {
        myutils.respond(resp, err, data);
    });
}
function PostRules(req, resp) {
    req.body = req.body || {};
    req.body.subservice = req.subservice;
    req.body.service = req.service;
    metrics.IncMetrics(req.service, req.subservice, metrics.ruleCreation);
    rules.Save(req.body, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedRuleCreation);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okRuleCreation);
        }
        myutils.respond(resp, err, data);
    });
}
function DelRules(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        service: req.service,
    };
    metrics.IncMetrics(req.service, req.subservice, metrics.ruleDelete);
    rules.Remove(rule, function(err, data) {
        if (err) {
            metrics.IncMetrics(req.service, req.subservice, metrics.failedRuleDelete);
        } else {
            metrics.IncMetrics(req.service, req.subservice, metrics.okRuleDelete);
        }
        //200, it includes entity
        myutils.respond(resp, err, data);
    });
}

function AddTo(app) {
    app.get(config.endpoint.rulesPath, GetAllRules);
    app.get(config.endpoint.rulesPath + '/:id', GetRules);
    app.post(config.endpoint.rulesPath, PostRules);
    app.delete(config.endpoint.rulesPath + '/:id', DelRules);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
