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
    errors = {},
    myutils = require('../myutils'),
    rulesStore = require('./rulesStore');

module.exports = {
    Find: function Find(service, subservice, ruleName, callback) {
        var localError;
        rulesStore.Find({ service: service, subservice: subservice, name: ruleName }, function(err, data) {
            myutils.logErrorIf(err);

            // Rule not found is managed by rulesStore.Find
            if (err) {
                return callback(err, null);
            } else if (data.action === undefined || data.action === null) {
                localError = new errors.NotFoundAction(data);
                myutils.logErrorIf(localError);
                return callback(localError, null);
            }
            else {
            	//Added default else clause
            	return callback(null, data.action);
            }
            	
            return callback(null, data.action);
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
    errors.NotFoundActionRule = function NotFoundActionRule(msg) {
        this.name = 'ACTION_RULE_NOTFOUND';
        this.message = 'rule for action not found ' + (msg || '');
        this.httpCode = 404;
    };

    errors.NotFoundAction = function NotFoundAction(msg) {
        this.name = 'ACTION_NOTFOUND';
        this.message = 'action not found ' + (msg || '');
        this.httpCode = 404;
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
