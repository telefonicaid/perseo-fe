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
    events = require('events'),
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    errors = {},
    tokens = {},
    newTokenEvent = 'new_token';

function getCachedToken(service, subservice, name) {
    if (tokens[service] === undefined) {
        tokens[service] = {};
    }
    if (tokens[service][subservice] === undefined) {
        tokens[service][subservice] = {};
    }
    if (tokens[service][subservice][name] === undefined) {
        tokens[service][subservice][name] = {token: null, generating: false, emitter: new events.EventEmitter()  };
    }
    ;
    return tokens[service][subservice][name];
}
function generateToken(trust, cached) {
   cached.generating = true;
   // Here should call KeyStone to generate a token, we'd entry into event loop
   cached.token= " MIIEyAYJKoZIhvcNAQcCoIIEuTCCBLUCAQExCTAHBgUrDgMCGjCCAx4GCSqGSIb3DQEHAaCCAw8EggMLeyJ0b2tlbiI6IHsiT1MtVFJVU1Q6dHJ1c3QiOiB7ImltcGVyc29uYXRpb24iOiBmYWxzZSwgInRydXN0ZWVfdXNlciI6IHsiaWQiOiAiZjhmNzliY2Y0YzdiNDY1YzljZTc1NWE2NzFlNDlhOTgifSwgImlkIjogIjEwNDgxZWVkNzRiMzQ2YTY4NGUwZDQzNjMxMDk3YjJhIiwgInRydXN0b3JfdXNlciI6IHsiaWQiOiAiYTVjNjI0YTg0MDJiNDhjMzkzMWQ0NjAwYTdmZTJiZTkifX0sICJtZXRob2RzIjogWyJwYXNzd29yZCJdLCAicm9sZXMiOiBbeyJpZCI6ICIyMjU0MzlmMzgyNDY0Y2I0Yjc1NTlkYTQxZmQxYWY3YSIsICJuYW1lIjogIjE2OTY2ZTZmZGFjNzQyMjVhZmI0ZWRmODAxZGQ5YjJhI1N1YlNlcnZpY2VBZG1pbiJ9XSwgImV4cGlyZXNfYXQiOiAiMjAxNS0wMy0wM1QxMDoxMjoxMC44OTE2MTBaIiwgInByb2plY3QiOiB7ImRvbWFpbiI6IHsiaWQiOiAiMTY5NjZlNmZkYWM3NDIyNWFmYjRlZGY4MDFkZDliMmEiLCAibmFtZSI6ICJTbWFydFZhbGVuY2lhIn0sICJpZCI6ICIwNzkzZTZmMTg5OTM0M2Y0OTQwYWE1OWVhZDFmZDBjOSIsICJuYW1lIjogIi9FbGVjdHJpY2lkYWQifSwgImNhdGFsb2ciOiBbXSwgImV4dHJhcyI6IHt9LCAidXNlciI6IHsiZG9tYWluIjogeyJpZCI6ICI1MzIxZTZmODdkYzc0MTU1YjEzN2I1MTFhY2ViYzNiOCIsICJuYW1lIjogImFkbWluX2RvbWFpbiJ9LCAiaWQiOiAiZjhmNzliY2Y0YzdiNDY1YzljZTc1NWE2NzFlNDlhOTgiLCAibmFtZSI6ICJwZXAifSwgImlzc3VlZF9hdCI6ICIyMDE1LTAzLTAzVDA5OjEyOjEwLjg5MTY4M1oifX0xggGBMIIBfQIBATBcMFcxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVVbnNldDEOMAwGA1UEBwwFVW5zZXQxDjAMBgNVBAoMBVVuc2V0MRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20CAQEwBwYFKw4DAhowDQYJKoZIhvcNAQEBBQAEggEAahtAIbZcZMT8D1RT75GJJZgVA-JpawCE06Gi3ntAR-qWpNfZ43NBttI-O7kJUzKnR-EG8pJvStepOQ+Bp1KZO24HxTNIeC71T2JncK4YWtQZiRYRvfWtTAAKX4u4OAsRnqWByDz6HwYzTPI0gHO6CjOrG9qG-9iTmNhbs1LrrYB72fHuK43-ogrnCj5Pjmb1mD-phI9alIOucEIjz0+lQpq7AhaoeDWJ3De0FJ0uNG-q7UwhsS05Ajf8va2HFXXg7M90H9+gwj2yTC5LbVBx9obkzSLHOcKlJlUuDhTUJ4vABx+VbfnqFcZFd2xhanEEk0gx2VfZ1AHGzpKciI0DbQ==";
   cached.generating = false;
   cached.emitter.emit(newTokenEvent, null /*error*/, cached);

}

function doRequest(action, event, token, callback) {
    var service,
        tenant,
        ruleName,
        headers,
        updateOrion,
        id, type, name, value, isPattern,
        cached;

    service = event.service;
    tenant = event.tenant;
    ruleName = event.ruleName;

    action.parameters.id = action.parameters.id || '${id}';
    action.parameters.type = action.parameters.type || '${type}';
    action.parameters.isPattern = action.parameters.isPattern || 'false';

    id = myutils.expandVar(action.parameters.id, event);
    type = myutils.expandVar(action.parameters.type, event);
    name = myutils.expandVar(action.parameters.name, event);
    value = myutils.expandVar(action.parameters.value, event);
    isPattern = myutils.expandVar(action.parameters.isPattern, event);

    updateOrion = {
        contextElements: [
            {
                type: type,
                isPattern: isPattern,
                id: id,
                attributes: [
                    {
                        name: name,
                        value: value
                    }
                ]
            }
        ],
        updateAction: 'APPEND'
    };
    //The portal does not provide 'type' for attribute, "plain" rules could
    if (action.parameters.attrType) {
        updateOrion.contextElements[0].attributes[0].type = myutils.expandVar(action.parameters.attrType, event);
    }

    headers = {
        'Accept': 'application/json',
        'X-Auth-Token': token
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

function retry(action, event, error, cached, callback) {
       console.log("retry ", error, cached)
    doRequest(action,event,cached.token, function cbDoReqUpdAxn(error, data){
        console.log(">>>>>>>>>>  RESULT retry",error, data);
        // If authorization error, we should call generateToken and addListener with retry
        callback(error,data);
    })
}

function doIt(action, event, callback) {
    var service,
        tenant,
        ruleName,
        cached;

    service = event.service;
    tenant = event.tenant;
    ruleName = event.ruleName;

    cached = getCachedToken(tenant, service, ruleName);
    if (cached.token === null) {  //First time token is generated from trust
        cached.emitter.once(newTokenEvent, retry.bind(null, action, event));
        if (cached.generating === false) {
            generateToken(action.parameters.trust, cached);
        }
    } else if (cached.generating === true) { // In the middle of getting a new one
        cached.emitter.once(newTokenEvent, retry.bind(null, action, event));
    } else {
        doRequest(action,event,cached.token, function cbDoReqUpdAxn(error, data){
            console.log(error, data);
            // If authorization error, we should call generateToken and addListener with retry
            callback(error,data);
        });
    }

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

