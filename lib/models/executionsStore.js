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

var appContext = require('../appContext'),
    logger = require('logops'),
    execCollectionName = require('../../config').collections.executions,
    myutils = require('../myutils');

module.exports = {
    LastTime: function LastTime(task, callback) {
        myutils.collectionExists(appContext.Db(), execCollectionName, function(exists) {
            if (!exists) {
                return callback('collection ' + execCollectionName + ' does not exist');
            }

            var col = appContext.Db().collection(execCollectionName),
                service = task.event.service,
                subservice = task.event.subservice,
                ruleName = task.event.ruleName,
                id = task.event.id,
                index = task.action.index;

            col.find({
                name: ruleName,
                subservice: subservice,
                service: service,
                id: id,
                index: index
            })
                .sort({ lastTime: -1 })
                .limit(1)
                .toArray()
                .then(function(results) {
                    var data = results.length > 0 ? results[0] : null;
                    callback(null, (data && data.lastTime && data.lastTime.getTime()) || 0);
                })
                .catch(function(err) {
                    myutils.logErrorIf(err);
                    callback(err, null);
                });
        });
    },
    AlreadyDone: function AlreadyDone(task, callback) {
        myutils.collectionExists(appContext.Db(), execCollectionName, function(exists) {
            if (!exists) {
                return callback('collection ' + execCollectionName + ' does not exist');
            }

            var col = appContext.Db().collection(execCollectionName),
                service = task.event.service,
                subservice = task.event.subservice,
                ruleName = task.event.ruleName,
                id = task.event.id,
                index = task.action.index,
                noticeId = task.event.noticeId;
            col.findOne({
                name: ruleName,
                subservice: subservice,
                service: service,
                id: id,
                notice: noticeId,
                index: index
            })
                .then(function(data) {
                    callback(null, data);
                })
                .catch(function(err) {
                    myutils.logErrorIf(err);
                    callback(err, null);
                });
        });
    },
    Update: function Update(task, callback) {
        myutils.collectionExists(appContext.Db(), execCollectionName, function(exists) {
            if (!exists) {
                return callback('collection ' + execCollectionName + ' does not exist');
            }

            var col = appContext.Db().collection(execCollectionName),
                service = task.event.service,
                subservice = task.event.subservice,
                ruleName = task.event.ruleName,
                id = task.event.id,
                index = task.action.index,
                noticeId = task.event.noticeId;
            col.updateOne(
                {
                    name: ruleName,
                    subservice: subservice,
                    service: service,
                    id: id,
                    notice: noticeId,
                    index: index
                },
                {
                    $currentDate: {
                        lastTime: true
                    }
                },
                {
                    upsert: true
                }
            )
                .then(function(result) {
                    return col.findOne({
                        name: ruleName,
                        subservice: subservice,
                        service: service,
                        id: id,
                        notice: noticeId,
                        index: index
                    });
                })
                .then(function(doc) {
                    callback(null, doc);
                })
                .catch(function(err) {
                    myutils.logErrorIf(err);
                    callback(err);
                });
        });
    }
};
