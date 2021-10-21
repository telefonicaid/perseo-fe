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
 *
 * Modified by: Carlos Blanco - Future Internet Consulting and Development Solutions (FICODES)
 */
'use strict';

var util = require('util'),
    uuid = require('uuid'),
    logger = require('logops'),
    async = require('async'),
    config = require('../../config'),
    constants = require('../constants'),
    myutils = require('../myutils'),
    alarm = require('../alarm'),
    UtmConverter = require('utm-converter'),
    converter = new UtmConverter(),
    errors = {};

/**
 * Parse Location attribute
 *
 * @param locStr The location string e.g: "40.418889, -3.691944"
 *
 * @return The parsed Location (object with 'lat', 'lon', 'x', and 'y' attributes) if location was parsed successfully;
 *         InvalidLocation, InvalidLatitude, or InvalidLongitude error otherwise
 */
function parseLocation(locStr) {
    var position, lat, lon;
    if (typeof locStr !== 'string') {
        return new errors.InvalidLocation(locStr);
    }
    position = locStr.split(',');
    if (position.length !== 2) {
        return new errors.InvalidLocation(locStr);
    }
    lat = parseFloat(position[0]);
    if (isNaN(lat) || !isFinite(lat)) {
        return new errors.InvalidLatitude(lat);
    }
    lon = parseFloat(position[1]);
    if (isNaN(lon) || !isFinite(lon)) {
        return new errors.InvalidLongitude(lon);
    }
    var utmResult;
    try {
        utmResult = converter.toUtm({ coord: [lon, lat] }); // CAUTION: Longitude first element
    } catch (e) {
        return new errors.InvalidLocation(e);
    }

    return {
        lat: lat,
        lon: lon,
        x: utmResult.coord.x,
        y: utmResult.coord.y
    };
}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.9.1.15
function parseDate(isoStr) {
    var date, ts, error;

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

function processCBNotice(service, subservice, ncr, ix) {
    var n = {},
        pp,
        temp,
        location = null,
        timeInfo = null,
        localError = null;

    n.noticeId = uuid.v1();
    n.noticeTS = Date.now();
    try {
        n.id = ncr.contextResponses[ix].contextElement.id;
        n.type = ncr.contextResponses[ix].contextElement.type;
        n.isPattern = ncr.contextResponses[ix].contextElement.isPattern;
        n.subservice = subservice;
        n.service = service;

        localError = null;
        //Transform name-value-type
        ncr.contextResponses[ix].contextElement.attributes.forEach(function(attr) {
            if (attr.name === 'id') {
                localError = new errors.IdAsAttribute(JSON.stringify(attr));
            } else if (attr.name === 'type') {
                localError = new errors.TypeAsAttribute(JSON.stringify(attr));
            } else {
                n[attr.name] = attr.value;
                n[attr.name + '__type'] = attr.type;

                // NGSIv1 location attribute (only one should be present)
                // see links in issues/198
                if (attr.type === 'geo:point') {
                    location = parseLocation(attr.value);
                }

                if (
                    attr.name === 'TimeInstant' ||
                    attr.type === 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601' ||
                    attr.type === 'DateTime'
                ) {
                    timeInfo = parseDate(attr.value);
                    addTimeInfo(n, attr.name, timeInfo);
                }

                if (attr.metadatas) {
                    for (var i = 0; i < attr.metadatas.length; i++) {
                        n[attr.name + '__metadata__' + attr.metadatas[i].name] = attr.metadatas[i].value;
                        n[attr.name + '__metadata__' + attr.metadatas[i].name + '__type'] = attr.metadatas[i].type;

                        if (
                            attr.metadatas[i].name === 'TimeInstant' ||
                            attr.metadatas[i].type === 'urn:x-ogc:def:trs:IDAS:1.0:ISO8601' ||
                            attr.metadatas[i].type === 'DateTime'
                        ) {
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
                    } else {
                        n[attr.name + '__lat'] = location.lat;
                        n[attr.name + '__lon'] = location.lon;
                        n[attr.name + '__x'] = location.x;
                        n[attr.name + '__y'] = location.y;
                        location = null;
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
        n.stripped = ncr.contextResponses[ix].contextElement.attributes;
    } catch (ex) {
        // SHOULD BE ex instanceof TypeError. Do not do anything else inside try
        localError = new errors.InvalidNotice(JSON.stringify(ncr));
        myutils.logErrorIf(localError);
        return localError;
    }
    logger.debug('notice processed: %j', n);
    return n;
}

/**
 * Process NGSIv2 Context Broker Notice
 *
 * @param service The Fiware-Service
 * @param subservice The Fiware-ServicePath
 * @param ncr The notice data object
 * @param ix The data index
 *
 * @return The processed notice if notice was correct; InvalidV2Notice error otherwise
 */
function processCBv2Notice(service, subservice, ncr, ix) {
    var n = {},
        pp,
        temp,
        location = null,
        metalocation,
        date,
        metaDate;

    n.noticeId = uuid.v1();
    n.noticeTS = Date.now();
    try {
        n.id = ncr.data[ix].id;
        n.type = ncr.data[ix].type;
        n.isPattern = false;
        n.subservice = subservice;
        n.service = service;

        //Transform name-value-type
        var attrList = ncr.data[ix];
        for (var attr in attrList) {
            // Exclude id and type. NGSIv2
            if (attr === 'id' || attr === 'type') {
                continue;
            }
            // each atttribute
            var attrInfo = attrList[attr];
            n[attr + '__type'] = attrInfo.type;

            // NGSIv1 location attribute (only one should be present)
            // see links in issues/198
            if (attrInfo.type === 'geo:point') {
                location = parseLocation(attrInfo.value);
                n[attr] = attrInfo.value;
            } else if (
                attrInfo.type === 'geo:json' &&
                (attrInfo.value && attrInfo.value.type && attrInfo.value.type === 'Point')
            ) {
                location = parseLocation(attrInfo.value.coordinates.toString());
                // Parse geo:json also as usual JSON, not in a special way
                n[attr] = attrInfo.value;
            } else if (attr === 'TimeInstant' || attrInfo.type === 'DateTime') {
                date = parseDate(attrInfo.value);
                n[attr] = attrInfo.value;
                addTimeInfo(n, attr, date);
            } else {
                n[attr] = attrInfo.value;
            }

            for (var metaKey in attrInfo.metadata) {
                n[attr + '__metadata__' + metaKey + '__type'] = attrInfo.metadata[metaKey].type;
                if (attrInfo.metadata[metaKey].type === 'DateTime') {
                    metaDate = parseDate(attrInfo.metadata[metaKey].value);
                    n[attr + '__metadata__' + metaKey] = metaDate;
                    addTimeInfo(n, attr + '__metadata__' + metaKey, metaDate);
                } else if (attrInfo.metadata[metaKey].type === 'geo:point') {
                    metalocation = parseLocation(attrInfo.metadata[metaKey].value);
                    n[attr + '__metadata__' + metaKey] = metalocation;
                } else if (
                    attrInfo.metadata[metaKey].type === 'geo:json' &&
                    (attrInfo.metadata[metaKey].value &&
                        attrInfo.metadata[metaKey].value.type &&
                        attrInfo.metadata[metaKey].value.type === 'Point')
                ) {
                    metalocation = parseLocation(attrInfo.metadata[metaKey].value.coordinates.toString());
                    n[attr + '__metadata__' + metaKey] = metalocation;
                } else {
                    n[attr + '__metadata__' + metaKey] = attrInfo.metadata[metaKey].value;
                }
            }
            if (location !== null) {
                if (!(location instanceof Error)) {
                    n[attr + '__lat'] = location.lat;
                    n[attr + '__lon'] = location.lon;
                    n[attr + '__x'] = location.x;
                    n[attr + '__y'] = location.y;
                    location = null;
                }
            }
        }
        // Add descriptive information in errors
        if (date instanceof Error) {
            date.message = 'Invalid DateTime attribute: ' + date.message;
            return date;
        }
        if (location instanceof Error) {
            location.message = 'Invalid geo:point attribute: ' + location.message;
            return location;
        }
        if (metaDate instanceof Error) {
            metaDate.message = 'Invalid DateTime attribute metadata: ' + metaDate.message;
            return metaDate;
        }
        if (metalocation instanceof Error) {
            metalocation.message = 'Invalid geo:point attribute metadata: ' + metalocation.message;
            return metalocation;
        }
        Object.keys(n).forEach(function(p) {
            //Change dots in key to double-underscore as in rules to avoid confusing EPL engine
            pp = p.replace(/\./g, '__');
            temp = n[p];
            delete n[p];
            n[pp] = temp;
        });
        n = myutils.flattenMap('', n);
        n.stripped = ncr.data[ix];
    } catch (ex) {
        // Should never reach this catch
        var localError = new errors.InvalidV2Notice(ex + ' (' + JSON.stringify(ncr) + ')');
        myutils.logErrorIf(localError);
        return localError;
    }
    logger.debug('notice processed: %j', n);
    return n;
}

function DoNotice(orionN, callback) {
    var notices = [],
        noticesErr = [],
        dataArr = [],
        notice,
        sps;
    if (Object.keys(orionN).length === 0 && orionN.constructor === Object) {
        return callback(new errors.EmptyNotice(''));
    }

    // ServicePath may be a comma-separated list of servicePath
    // when an initial notification for a just created subscription
    // is created
    if (typeof orionN.subservice !== 'string') {
        return callback(new errors.InvalidNotice('Subservice must be a comma-separated list of servicePath'));
    }
    sps = orionN.subservice.split(',');

    var orionResponse = null;

    // Set NGSI 'version' in the notification object using an internal attribute.
    // NGSIv2 notification body, contains the notification data array inside 'data' attribute
    // see https://jsapi.apiary.io/previews/null/introduction/specification/notification-messages
    // and https://fiware-orion.readthedocs.io/en/master/user/initial_notification/index.html#introduction
    // NGSIv1 notification body, contains the notification data array inside 'contextResponses' attribute
    // see http://telefonicaid.github.io/fiware-orion/api/v1
    // and https://fiware-orion.readthedocs.io/en/1.4.0/user/walkthrough_apiv1/#context-management-using-ngsi10
    if (orionN.data) {
        orionN.version = 2;
        orionResponse = orionN.data;
    } else {
        orionN.version = 1;
        orionResponse = orionN.contextResponses;
    }

    if (!util.isArray(orionResponse)) {
        if (orionN.version === 2) {
            return callback(new errors.InvalidV2Notice('data must be an array, not a ' + typeof orionResponse));
        }
        return callback(new errors.ContextResponsesNotArray('(' + typeof orionResponse + ')'));
    }
    // Issue #527: ngsiv2 initial notification does not include al list of subservices explicitly in
    // servicePath header when subservice is '/'
    // See also issue #526. Maybe this code gets removed when that issue gets addressed
    if (orionN.version === 2) {
        if (sps.length < orionResponse.length && sps.length === 1 /* orionN.subservice === '/' */) {
            var newSps = new Array(orionResponse.length);
            for (var k = 0; k < orionResponse.length; k++) {
                newSps[k] = sps[0];
            }
            sps = newSps;
        }
    }
    if (orionResponse.length !== sps.length) {
        return callback(new errors.ServipathCountMismatch('(' + sps.length + ',' + orionResponse.length + ')'));
    }
    // Iterates the collection. process 1 notice for each entity
    for (var j = 0; j < sps.length; j++) {
        if (orionN.version === 2) {
            notice = processCBv2Notice(orionN.service, sps[j].trim(), orionN, j);
        } else {
            notice = processCBNotice(orionN.service, sps[j].trim(), orionN, j);
        }
        if (notice instanceof Error) {
            myutils.logErrorIf(notice);
            noticesErr.push(notice);
        } else {
            notices.push(notice);
        }
    }
    async.each(
        notices,
        function(notice, cbEach) {
            var h = {};
            h[constants.SUBSERVICE_HEADER] = notice.subservice;
            myutils.requestHelperWOMetrics(
                'post',
                {
                    url: config.perseoCore.noticesURL,
                    json: notice,
                    headers: h
                },
                function(err, data) {
                    if (err) {
                        alarm.raise(alarm.POST_EVENT);
                        noticesErr.push(err);
                    } else {
                        alarm.release(alarm.POST_EVENT);
                        dataArr.push(data);
                    }
                    // Don't wait propagation to next core to finish, asynchronously ...
                    if (config.nextCore && config.nextCore.noticesURL) {
                        myutils.requestHelperWOMetrics(
                            'post',
                            {
                                url: config.nextCore.noticesURL,
                                json: notice,
                                headers: h
                            },
                            myutils.logErrorIf
                        );
                    }
                    cbEach();
                }
            );
        },
        function endEach() {
            var msgArr = [],
                statusCode = 400;
            if (noticesErr.length === 0) {
                // No error happened
                return callback(null, dataArr); // signal no error to callback function
            }
            noticesErr.forEach(function(e) {
                msgArr.push(e.message);
                if (e.httpCode === 500) {
                    statusCode = 500;
                }
            });
            return callback({ httpCode: statusCode, message: msgArr });
        }
    );
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
    errors.InvalidV2Notice = function InvalidV2Notice(msg) {
        this.name = 'INVALID_NGSIV2_NOTICE';
        this.message = 'invalid NGSIv2 notice format ' + msg;
        this.httpCode = 400;
    };
    errors.EmptyNotice = function EmptyNotice(msg) {
        this.name = 'EMPTY_NOTICE';
        this.message = 'Empty notice is not valid ' + msg;
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
    errors.ContextResponsesNotArray = function ContextResponsesNotArray(msg) {
        this.name = 'CONTEXT_RESP_NOT_ARR';
        this.message = 'ContextResponses is not an array ' + msg;
        this.httpCode = 400;
    };
    errors.ServipathCountMismatch = function ServipathCountMismatch(msg) {
        this.name = 'CONTEXT_RESP_NOT_ARR';
        this.message = 'Number of servicepath items does not match ContextResponses' + msg;
        this.httpCode = 400;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
