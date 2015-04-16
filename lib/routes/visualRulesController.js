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
    config = require('../../config'),
    myutils = require('../myutils');

function GetAllVR(req, resp) {
    visualRules.FindAll(req.tenant, req.subservice, function(err, data) {
        if (!err && util.isArray(data)) {
            data = data.map(function(e) {
                delete e.subservice;
                delete e.tenant;
                return e;
            });
        }
        myutils.respond(resp, err, data, true);
    });
}
function GetVR(req, resp) {
    var rule = {
        name: req.params.id,
        subservice: req.subservice,
        tenant: req.tenant
    };
    visualRules.Find(rule, function(err, data) {
        if (!err && data) {
            delete data.subservice;
            delete data.tenant;
        }
        myutils.respond(resp, err, data);
    });
}
function PostVR(req, resp) {
    req.body = req.body || {};
    req.body.subservice = req.subservice;
    req.body.tenant = req.tenant;
    visualRules.Save(req.body, function(err, data) {
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
        tenant: req.tenant
    };
    visualRules.Remove(rule, function(err, data) {
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
    req.body.tenant = req.tenant;
    visualRules.Put(req.params.id, req.body, function(err, data) {
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
