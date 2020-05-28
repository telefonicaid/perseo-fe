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
    constants = require('../constants'),
    config = require('../../config'),
    logger = require('logops'),
    util = require('util'),
    myutils = require('../myutils');

function GetAllRules(req, resp) {
    var limit = req.query && req.query.limit ? req.query.limit : 1000;
    var offset = req.query && req.query.offset ? req.query.offset : 0;
    var count = req.query && req.query.options ? req.query.options === 'count' : true;
    logger.debug({}, 'getting all rules');
    rules.FindAll(req.service, req.subservice, function(err, data) {
        if (util.isArray(data)) {
            resp.set(constants.TOTAL_COUNT_HEADER, data.length);
            data = data.splice(offset, limit);
        }
        myutils.respond(resp, err, data, count);
    });
}
function GetRules(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        service: req.service
    };
    logger.debug({}, 'getting rule %j', rule);
    rules.Find(rule, function(err, data) {
        myutils.respond(resp, err, data);
    });
}
function PostRules(req, resp) {
    req.body = req.body || {};
    req.body.subservice = req.subservice;
    req.body.service = req.service;
    logger.info({}, 'posting rule %j', req.body);
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
        service: req.service
    };
    logger.info({}, 'deleting rule %j', rule);
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
    /**
     * @swagger
     *
     * /rules:
     *   get:
     *     tags:
     *       - Rules
     *     description: Get all rules
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: fiware-service
     *         description: Fiware service.
     *         in: header
     *         required: true
     *         type: string
     *       - name: fiware-servicepath
     *         description: Fiware service path.
     *         in: header
     *         required: true
     *         type: string     *
     *     responses:
     *       200:
     *         description: rules
     */
    app.get(config.endpoint.rulesPath, GetAllRules);
    /**
     * @swagger
     *
     * /rules/:id:
     *   get:
     *     tags:
     *       - Rules
     *     description: Get rule by id
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: fiware-service
     *         description: Fiware service.
     *         in: header
     *         required: true
     *         type: string
     *       - name: fiware-servicepath
     *         description: Fiware service path.
     *         in: header
     *         required: true
     *         type: string
     *       - name: id
     *         description: Name of the rule.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: rules
     */
    app.get(config.endpoint.rulesPath + '/:id', GetRules);
    /**
     * @swagger
     *
     * /rules:
     *   post:
     *     tags:
     *       - Rules
     *     description: Add rule
     *     produces:
     *      - application/json
     *     parameters:
     *       - name: fiware-service
     *         description: Fiware service.
     *         in: header
     *         required: true
     *         type: string
     *       - name: fiware-servicepath
     *         description: Fiware service path.
     *         in: header
     *         required: true
     *         type: string
     *       - name: body
     *         in: body
     *         schema:
     *           type: object
     *           properties:
     *             name:
     *               type: string
     *               description: Rule's name
     *               example:
     *                 - foo
     *             text:
     *               type: string
     *               description: EPL sentence
     *               example:
     *                 - select *
     *             action:
     *               type: object
     *               properties:
     *                 type:
     *                   type: string
     *                   description: Action type
     *                   example:
     *                     - update
     *                 parameters:
     *                   type: object
     *                   properties:
     *                     name:
     *                       type: string
     *                       description: Parameter name
     *                       example:
     *                         - foo
     *                     value:
     *                       type: string
     *                       description: Parameter value
     *                       example:
     *                         - true
     *                     type:
     *                       type: string
     *                       description: Parameter type
     *                       example:
     *                         - boolean
     *           required:
     *               - name
     *               - text
     *               - action
     *     responses:
     *       200:
     *         description: rules
     */
    app.post(config.endpoint.rulesPath, PostRules);

    /**
     * @swagger
     *
     * /rules/:id:
     *   delete:
     *     tags:
     *       - Rules
     *     description: Delete rule by id
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: fiware-service
     *         description: Fiware service.
     *         in: header
     *         required: true
     *         type: string
     *       - name: fiware-servicepath
     *         description: Fiware service path.
     *         in: header
     *         required: true
     *         type: string
     *       - name: id
     *         description: Rule id.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: rules
     */
    app.delete(config.endpoint.rulesPath + '/:id', DelRules);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;
