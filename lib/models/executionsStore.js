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
    LastTime: function LastTime(tenant, subservice, ruleName, id, callback) {
        var db = appContext.Db();
        db.collection(execCollectionName, {strict: true}, function(err, col) {
            if (err) {
                myutils.logErrorIf(err);
                return callback(err, null);
            }
            col.findOne({ '$query': {'name': ruleName, 'subservice': subservice, 'tenant': tenant, 'id': id},
                '$orderby': {'lastTime': -1}}, function(err, data) {
                myutils.logErrorIf(err);
                if (err) {
                    return callback(err, null);
                }
                return callback(null, (data && data.lastTime && data.lastTime.getTime()) || 0);
            });
        });
    },
    AlreadyDone: function AlreadyDone(tenant, subservice, ruleName, id, noticeId, callback) {
        var db = appContext.Db();
        db.collection(execCollectionName, {strict: true}, function(err, col) {
            if (err) {
                myutils.logErrorIf(err);
                return callback(err, null);
            }
            col.findOne({'name': ruleName, 'subservice': subservice, 'tenant': tenant, 'id': id, 'notice': noticeId},
                function(err, data) {
                    myutils.logErrorIf(err);
                    if (err) {
                        return callback(err, null);
                    }
                    return callback(null, data);
                });
        });
    },
    Update: function Update(tenant, subservice, ruleName, id, noticeId, callback) {
        var db = appContext.Db();
        async.waterfall([
            db.collection.bind(db, execCollectionName, {strict: true}),
            function(col, cb) {
                col.update({'name': ruleName, 'subservice': subservice, 'tenant': tenant, 'id': id, 'notice': noticeId},
                    // $currentDate would be a better option => mongo 2.6
                    {'$set': {'lastTime': new Date()}},
                    {'upsert': true},
                    cb);
            }
        ], function(err, result) {
            myutils.logErrorIf(err);
            logger.info('executionsStore.Update %j', result);
            return callback(err, result);
        });
    }
};
