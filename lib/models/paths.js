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
    componentPattern = /^[a-zA-Z0-9_]+$/,
    maxComponents = 10,
    maxComponentLength = 50,
    errors = {};

function validComponent(component) {
    var err = null;

    if(component.length == 0) {
        err = new errors.EmptyComponent('');
    }
    else if(component.length > maxComponentLength) {
        err = new errors.TooLong(component);
    }
    else if (!componentPattern.test(component)){
        err = new errors.InvalidCharacter(component);
    }
    return err;
}
function validService(service) {
    return validComponent(service);
}
function validServicePath(servicepath) {
    var err = null, parts;

    if (servicepath === '/') {
        return null;
    }
    parts = servicepath.split('/');
    if(parts[0] !== '') { // chars before /, not absolute
        return new errors.AbsolutePath(parts[0]);
    }
    if (parts.length > maxComponents) {
        return new errors.TooMany(parts.length);
    }
    for (var i = 1; i < parts.length; i++) {
        err = validComponent(parts[i]);
        if(err !== null ) {
            return err;
        };
    }
    return null;
}



module.exports.validService = validService;
module.exports.validServicePath = validServicePath;

/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;


(function() {

    errors.EmptyComponent = function EmptyComponent(msg) {
        this.name = 'EMPTY';
        this.message = 'service/subservice: empty component ' + msg;
        this.httpCode = 400;
    };

    errors.InvalidCharacter = function InvalidCharacter(msg) {
        this.name = 'INVALID_CHAR';
        this.message = 'service/subservice: invalid character \'' + msg+ '\'';
        this.httpCode = 400;
    };
    errors.AbsolutePath = function AbsolutePath(msg) {
        this.name = 'ABS_PATH';
        this.message = 'subservice: must be absolute ' + msg;
        this.httpCode = 400;
    };
    errors.TooLong = function TooLong(msg) {
        this.name = 'TOO_LONG';
        this.message = 'service/subservice: too long string ' + msg;
        this.httpCode = 400;
    };
    errors.TooMany = function TooMany(msg) {
        this.name = 'TOO_MANY';
        this.message = 'service/subservice: too many components ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
