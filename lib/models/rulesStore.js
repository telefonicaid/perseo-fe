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
    async = require('async'),
    appContext = require('../appContext'),
    rulesCollectionName = require('../../config').collections.rules,
    myutils = require('../myutils'),
    logger = require('logops'),
    errors = {};

function search(rule, callback) {
    var db = appContext.Db();
    async.waterfall([
        db.collection.bind(db, rulesCollectionName, {strict: true}),
        function(col, cb) {
            col.findOne({name: rule.name, service: rule.service, tenant: rule.tenant}, cb);
        }
    ], callback);
}

function findAll(tenant, service, callback) {
    var criterion = {};

    if (typeof tenant === 'function') {
        callback = tenant;
    } else {
        criterion.tenant = tenant;
        criterion.service = service;
    }
    var db = appContext.Db();
    async.waterfall([
        db.collection.bind(db, rulesCollectionName, {strict: true}),
        function(col, cb) {
            col.find(criterion).toArray(cb);
        }
    ], function(err, result) {
        myutils.logErrorIf(err);
        logger.info('rulesStore.FindAll %s', myutils.firstChars(result));
        return callback(err, result);
    });
}

module.exports = {
    Find: function Find(rule, callback) {
        search(rule, function(err, result) {
            myutils.logErrorIf(err);
            if (err) {
                return callback(err, null);
            }
            if (!result) {
                return callback(new errors.NotFoundRule(rule.name), null);
            }
            logger.info('rulesStore.Find %s', myutils.firstChars(result));
            return callback(err, result);
        });
    },
    Exists: function Exists(rule, callback) {
        search(rule, function(err, result) {
            myutils.logErrorIf(err);
            callback(err, Boolean(result));
        });
    },
    FindAll: findAll,
    Remove: function Remove(rule, callback) {
        var db = appContext.Db();
        async.waterfall([
            db.collection.bind(db, rulesCollectionName, {strict: true}),
            function(col, cb) {
                col.remove({name: rule.name, service: rule.service, tenant: rule.tenant}, cb);
            }
        ], function(err, result) {
            myutils.logErrorIf(err);
            logger.info('rulesStore.Remove %j', myutils.firstChars(result));
            return callback(err, result);
        });
    },
    Save: function Save(r, callback) {
        var db = appContext.Db();
        async.waterfall([
            db.collection.bind(db, rulesCollectionName, {strict: true}),
            function(col, cb) {
                col.save(r, cb);
            }
        ], function(err, result) {
            myutils.logErrorIf(err);
            logger.info('rulesStore.Save %j', myutils.firstChars(result));
            return callback(err, result);
        });
    },
    Update: function Update(id, r, callback) {
        var db = appContext.Db();
        async.waterfall([
            db.collection.bind(db, rulesCollectionName, {strict: true}),
            function(col, cb) {
                // With mongodb 2.6 we could ask for {fullResult: true},
                // Caution: not very well documented ...
                col.update({name: id}, r, function(err, howmany) {
                    if (howmany === 0) {
                        return cb(new errors.NotFoundRule(id), null);
                    }
                    //"Simulate" {fullResult: true}
                    return cb(err, r);
                });
            }
        ], function(err, result) {
            myutils.logErrorIf(err);
            logger.info('rulesStore.Update %j', myutils.firstChars(result));
            return callback(err, result);
        });
    }
};
/**
 * Constructors for possible errors from this module
 *
 * @type {Object}
 */
module.exports.errors = errors;

(function() {

    errors.NotFoundRule = function NotFoundRule(msg) {
        this.name = 'RULE_NOTFOUND';
        this.message = 'rule not found ' + msg;
        this.httpCode = 404;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
