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
    uuid = require('uuid'),
    config = require('../../config'),
    myutils = require('../myutils'),
    errors = {};

function processCBNotice(ncr) {
    var n = {},
        pp,
        temp,
        localError;

    n.noticeId = uuid.v1();
    n.received = new Date();

    try {
        n.id = ncr.contextResponses[0].contextElement.id;
        n.type = ncr.contextResponses[0].contextElement.type;
        n.isPattern = ncr.contextResponses[0].contextElement.isPattern;
        n.subservice = ncr.subservice;
        n.service = ncr.service;

        localError = null;
        //Transform name-value-type
        ncr.contextResponses[0].contextElement.attributes.forEach(function(attr) {
            if (attr.name === 'id') {
                localError = new errors.IdAsAttribute(JSON.stringify(attr));
            } else if (attr.name === 'type') {
                localError = new errors.TypeAsAttribute(JSON.stringify(attr));
            }
            n[attr.name] = attr.value;
            n[attr.name + '__type'] = attr.type;

            if (attr.metadatas) {
                for (var i = 0; i < attr.metadatas.length; i++) {
                    n[attr.name + '__metadata__' + attr.metadatas[i].name] = attr.metadatas[i].value;
                    n[attr.name + '__metadata__' + attr.metadatas[i].name + '__type'] = attr.metadatas[i].type;
                }
            }
        });
        if (localError !== null) {
            return localError;
        }

        Object.keys(n).forEach(function(p) {
            //Change dots in key to double-underscore as in rules to avoid confusing EPL engine
            pp = p.replace(/\./g, '__');
            temp = n[p];
            delete n[p];
            n[pp] = temp;
        });

        n = myutils.flattenMap('', n);

    } catch (ex) { // SHOULD BE ex instanceof TypeError. Do not do anything else inside try
        localError = new errors.InvalidNotice(JSON.stringify(ncr));
        myutils.logErrorIf(localError);
        return localError;
    }
    return n;
}

function DoNotice(orionN, callback) {
    var notice;

    notice = processCBNotice(orionN);

    if (notice instanceof Error) {
        myutils.logErrorIf(notice);
        return callback(notice, null);
    }
    myutils.requestHelper('post', {url: config.perseoCore.noticesURL, json: notice}, callback);
    if (config.nextCore && config.nextCore.noticesURL) {
        myutils.requestHelper('post', {url: config.nextCore.noticesURL, json: notice}, myutils.logErrorIf);
    }
    return;
}

module.exports.Do = DoNotice;
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {
    errors.InvalidNotice = function InvalidNotice(msg) {
        this.name = 'INVALID_NOTICE';
        this.message = 'invalid notice format ' + msg;
        this.httpCode = 400;
    };
    errors.IdAsAttribute = function IdAsAttribute(msg) {
        this.name = 'ID_ATTRIBUTE';
        this.message = 'id as attribute ' + msg;
        this.httpCode = 400;
    };
    errors.TypeAsAttribute = function TypeAsAttribute(msg) {
        this.name = 'TYPE_ATTRIBUTE';
        this.message = 'type as attribute ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
