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
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    serviceField = 'ev__service',
    tenantField = 'ev__tenant',
    errors = {};

function doIt(action, event, callback) {
    /*jshint camelcase: false */
    var service,
        tenant,
        headers,
        updateOrion = {
            contextElements: [
                {
                    type: event.ev__type,
                    isPattern: event.ev__isPattern,
                    id: event.ev__id,
                    attributes: [
                        {
                            name: action.parameters.name,
                            value: action.parameters.value
                        }
                    ]
                }
            ],
            updateAction: 'APPEND'
        };
    //The portal does not provide 'type' for attribute, "plain" rules could
    if (action.parameters.type) {
        updateOrion.contextElements[0].attributes[0].type = action.parameters.type;
    }
    service = String(event[serviceField]);
    tenant = String(event[tenantField]);
    headers = {
        'Accept': 'application/json'
    };
    headers[constants.SERVICE_HEADER] = service;
    headers[constants.TENANT_HEADER] = tenant;

    myutils.requestHelper('post',
        {
            url: config.orion.URL,
            json: updateOrion,
            headers: headers
        }, function(err, data) {
            if (!err && data.body && data.body.orionError) {
                err = new errors.OrionError(JSON.stringify(data.body.orionError));
            }
            callback(err, data);
        });
}

module.exports.doIt = doIt;

/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.OrionError = function OrionError(msg) {
        this.name = 'ORION_AXN_ERROR';
        this.message = 'Orion error ' + (msg || '');
        this.httpCode = 404;
    };

    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();

