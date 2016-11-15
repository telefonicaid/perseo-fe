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
    alarm = require('../alarm'),
    UtmConverter = require('utm-converter'),
    converter = new UtmConverter(),
    errors = {};

function parseLocation(locStr) {
    var position,
        lat,
        lon,
        utmResult;

    position = locStr.split(',', 3);
    if (position.length !== 2) {
        return new errors.InvalidLocation(position);
    }
    lat = parseFloat(position[0]);
    if (isNaN(lat) || !isFinite(lat)) {
        return new errors.InvalidLatitude(lat);
    }
    lon = parseFloat(position[1]);
    if (isNaN(lon) || !isFinite(lon)) {
        return new errors.InvalidLongitude(lon);
    }
    utmResult = converter.toUtm({coord: [lon, lat]}); // CAUTION: Longitude first element

    return {
        lat: lat,
        lon: lon,
        x: utmResult.coord.x,
        y: utmResult.coord.y
    };
}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
function parseDate(isoStr) {
    var date,
        ts,
        error;

    ts = Date.parse(isoStr);
    if (isNaN(ts)) {
        error = new errors.InvalidDateTime(isoStr);
        myutils.logErrorIf(error);
        return error;
    } else {
        date = new Date(isoStr);
        return {
            ts: ts,
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
            millisecond: date.getMilliseconds(),
            dayUTC: date.getUTCDate(),
            monthUTC: date.getUTCMonth() + 1,
            yearUTC: date.getUTCFullYear(),
            hourUTC: date.getUTCHours(),
            minuteUTC: date.getUTCMinutes(),
            secondUTC: date.getUTCSeconds(),
            millisecondUTC: date.getUTCMilliseconds()
        };
    }
}

function addTimeInfo(object, key, timeInfo) {
    if (timeInfo && !(timeInfo instanceof Error)) {
        for (var p in timeInfo) {
            if (timeInfo.hasOwnProperty(p)) {
                object[key + '__' + p] = timeInfo[p];
            }
        }
    }
}

function processCBNotice(ncr) {
    var n = {},
        pp,
        temp,
        location = null,
        timeInfo = null,
        localError = null;

    n.noticeId = uuid.v1();
    n.noticeTS = Date.now();

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
            else {
                n[attr.name] = attr.value;
                n[attr.name + '__type'] = attr.type;

                // NGSIv1 location attribute (only one should be present)
                // see links in issues/198
                if (attr.type === 'geo:point') {
                    location = parseLocation(attr.value);
                }

                if (attr.name === 'TimeInstant' ||
                    attr.type === 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601' ||
                    attr.type === 'DateTime') {
                    timeInfo = parseDate(attr.value);
                    addTimeInfo(n, attr.name, timeInfo);
                }

                if (attr.metadatas) {
                    for (var i = 0; i < attr.metadatas.length; i++) {
                        n[attr.name + '__metadata__' + attr.metadatas[i].name] = attr.metadatas[i].value;
                        n[attr.name + '__metadata__' + attr.metadatas[i].name + '__type'] = attr.metadatas[i].type;

                        if (attr.metadatas[i].name === 'TimeInstant' ||
                            attr.metadatas[i].type === 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601' ||
                            attr.metadatas[i].type === 'DateTime') {
                            timeInfo = parseDate(attr.metadatas[i].value);
                            addTimeInfo(n, attr.name + '__metadata__' + attr.metadatas[i].name, timeInfo);
                        }

                        // Deprecated location in NGSV1
                        // see links in issues/198
                        if (attr.metadatas[i].name === 'location') {
                            location = parseLocation(attr.value);
                        }
                    }
                }
                if (location !== null) {
                    if (location instanceof Error) {
                        localError = location;
                    }
                    else {
                        n[attr.name + '__lat'] = location.lat;
                        n[attr.name + '__lon'] = location.lon;
                        n[attr.name + '__x'] = location.x;
                        n[attr.name + '__y'] = location.y;

                    }
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
    myutils.requestHelper('post', {url: config.perseoCore.noticesURL, json: notice}, function(err, data) {
        if (err) {
            alarm.raise(alarm.POST_EVENT);
        } else {
            alarm.release(alarm.POST_EVENT);
        }
        callback(err, data);
    });
    if (config.nextCore && config.nextCore.noticesURL) {
        myutils.requestHelper('post', {url: config.nextCore.noticesURL, json: notice}, myutils.logErrorIf);
    }
    return;
}

module.exports.Do = DoNotice;
module.exports.ParseLocation = parseLocation;
module.exports.ProcessCBNotice = processCBNotice;
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
    errors.InvalidLocation = function InvalidLocation(msg) {
        this.name = 'INVALID_LOCATION';
        this.message = 'invalid location ' + msg;
        this.httpCode = 400;
    };
    errors.InvalidLongitude = function InvalidLongitude(msg) {
        this.name = 'INVALID_LONGITUDE';
        this.message = 'longitude is not valid ' + msg;
        this.httpCode = 400;
    };
    errors.InvalidLatitude = function InvalidLatitude(msg) {
        this.name = 'INVALID_LATITUDE';
        this.message = 'latitude is not valid ' + msg;
        this.httpCode = 400;
    };
    errors.InvalidDateTime = function InvalidDateTime(msg) {
        this.name = 'INVALID_DATETIME';
        this.message = 'datetime is not valid ' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
