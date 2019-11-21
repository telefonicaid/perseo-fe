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

var async = require('async'),
    appContext = require('../appContext'),
    logger = require('logops'),
    execCollectionName = require('../../config').collections.executions,
    myutils = require('../myutils');

module.exports = {
    LastTime: function LastTime(task, callback) {
        var db = appContext.Db(),
            service = task.event.service,
            subservice = task.event.subservice,
            ruleName = task.event.ruleName,
            id = task.event.id,
            index = task.action.index;

        db.collection(execCollectionName, { strict: true }, function(err, col) {
            if (err) {
                myutils.logErrorIf(err);
                return callback(err, null);
            }
            var cursor = col
                .find(
                    {
                        name: ruleName,
                        subservice: subservice,
                        service: service,
                        id: id,
                        index: index
                    },
                    {}
                )
                .sort({ lastTime: -1 });
            cursor = cursor.limit(1);
            cursor.toArray(function(err, results) {
                myutils.logErrorIf(err);
                if (err) {
                    return callback(err, null);
                }
                var data = results.length ? results[0] : null;
                return callback(null, (data && data.lastTime && data.lastTime.getTime()) || 0);
            });
        });
    },
    AlreadyDone: function AlreadyDone(task, callback) {
        var db = appContext.Db(),
            service = task.event.service,
            subservice = task.event.subservice,
            ruleName = task.event.ruleName,
            id = task.event.id,
            index = task.action.index,
            noticeId = task.event.noticeId;
        db.collection(execCollectionName, { strict: true }, function(err, col) {
            if (err) {
                myutils.logErrorIf(err);
                return callback(err, null);
            }
            col.findOne(
                {
                    name: ruleName,
                    subservice: subservice,
                    service: service,
                    id: id,
                    notice: noticeId,
                    index: index
                },
                function(error2, data) {
                    myutils.logErrorIf(error2);
                    if (error2) {
                        return callback(error2, null);
                    }
                    return callback(null, data);
                }
            );
        });
    },
    Update: function Update(task, callback) {
        var db = appContext.Db(),
            service = task.event.service,
            subservice = task.event.subservice,
            ruleName = task.event.ruleName,
            id = task.event.id,
            index = task.action.index,
            noticeId = task.event.noticeId;
        async.waterfall(
            [
                db.collection.bind(db, execCollectionName, { strict: true }),
                function(col, cb) {
                    col.update(
                        {
                            name: ruleName,
                            subservice: subservice,
                            service: service,
                            id: id,
                            notice: noticeId,
                            index: index
                        },
                        { $currentDate: { lastTime: true } },
                        { upsert: true },
                        cb
                    );
                }
            ],
            function(err, result) {
                myutils.logErrorIf(err);
                logger.info('executionsStore.Update %j', result);
                return callback(err, result);
            }
        );
    }
};
