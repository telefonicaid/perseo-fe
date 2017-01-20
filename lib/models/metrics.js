/*
 * Copyright 2016 Telefonica Investigación y Desarrollo, S.A.U
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

var logger = require('logops'),
    metrics = {},
    metricsNames = [];

function newMetrics() {
    var m = {};
    metricsNames.forEach(function(name) {
        m[name] = 0;
    });
    return m;
}

function getMetrics(service, servicePath) {
    var mService,
        mServicePath;

    mService = metrics[service];
    if (!mService) {
        mService = metrics[service] = {};
    }
    mServicePath = mService[servicePath];
    if (!mServicePath) {
        mServicePath = mService[servicePath] = newMetrics();
    }

    return mServicePath;
}

function deleteMetrics() {
    metrics = {};
}

function incMetrics(service, servicePath, key, value) {
    var m = getMetrics(service, servicePath);
    if (value === undefined) {
        value = 1;
    }
    if (m[key] === undefined) {
        logger.error('invalid key for metrics %s', key);
        return;
    }
    m[key] += value;
}

function decoratedMetrics() {
    var decorated = {services: {}},
        total = newMetrics(),
        totalPerServ;

    for (var serv in metrics) {
        totalPerServ = newMetrics();
        decorated.services[serv] = {subservices: {}};
        for (var subserv in metrics[serv]) {
            for (var key in metrics[serv][subserv]) {
                totalPerServ[key] += metrics[serv][subserv][key];
                total[key] += metrics[serv][subserv][key];
            }
            decorated.services[serv].subservices[subserv] = metrics[serv][subserv];
        }
        decorated.services[serv].sum = totalPerServ;
    }
    decorated.sum = total;

    // Calculate average service time
    for (var decServ in decorated.services) { // includes sum
        for (var decSubServ in decorated.services[decServ].subservices) {
            decorated.services[decServ].subservices[decSubServ][module.exports.serviceTime] /=
                decorated.services[decServ].subservices[decSubServ][module.exports.incomingTransactions];
        }
        decorated.services[decServ].sum[module.exports.serviceTime] /=
            decorated.services[decServ].sum[module.exports.incomingTransactions];
    }
    if (decorated.sum[module.exports.serviceTime] !== undefined) {
        decorated.sum[module.exports.serviceTime] /=
            decorated.sum[module.exports.incomingTransactions];
    }
    if (isNaN(decorated.sum[module.exports.serviceTime])) {
        delete decorated.sum[module.exports.serviceTime];
    }
    return decorated;
}

module.exports.incomingTransactions = 'incomingTransactions';
module.exports.incomingTransactionsRequestSize = 'incomingTransactionsRequestSize';
module.exports.incomingTransactionsResponseSize = 'incomingTransactionsResponseSize';
module.exports.incomingTransactionsErrors = 'incomingTransactionsErrors';

module.exports.serviceTime = 'serviceTime';

module.exports.outgoingTransactions = 'outgoingTransactions';
module.exports.outgoingTransactionsRequestSize = 'outgoingTransactionsRequestSize';
module.exports.outgoingTransactionsResponseSize = 'outgoingTransactionsResponseSize';
module.exports.outgoingTransactionsErrors = 'outgoingTransactionsErrors';

module.exports.notifications = 'notifications';
module.exports.okNotifications = 'okNotifications';
module.exports.failedNotifications = 'failedNotifications';

module.exports.ruleCreation = 'ruleCreation';
module.exports.okRuleCreation = 'okRuleCreation';
module.exports.failedRuleCreation = 'failedRuleCreation';

module.exports.ruleUpdate = 'ruleUpdate';
module.exports.okRuleUpdate = 'okRuleUpdate';
module.exports.failedRuleUpdate = 'failedRuleUpdate';

module.exports.ruleDelete = 'ruleDelete';
module.exports.okRuleDelete = 'okRuleDelete';
module.exports.failedRuleDelete = 'failedRuleDelete';

module.exports.firedRules = 'firedRules';
module.exports.errAction = 'errAction';

module.exports.actionEntityUpdate = 'actionEntityUpdate';
module.exports.okActionEntityUpdate = 'okActionEntityUpdate';
module.exports.failedActionEntityUpdate = 'failedActionEntityUpdate';

module.exports.actionSMS = 'actionSMS';
module.exports.okActionSMS = 'okActionSMS';
module.exports.failedActionSMS = 'failedActionSMS';

module.exports.actionEmail = 'actionEmail';
module.exports.okActionEmail = 'okActionEmail';
module.exports.failedActionEmail = 'failedActionEmail';

module.exports.actionHttpPost = 'actionHttpPost';
module.exports.okActionHttpPost = 'okActionHttpPost';
module.exports.failedActionHttpPost = 'failedActionHttpPost';

module.exports.actionTwitter = 'actionTwitter';
module.exports.okActionTwitter = 'okActionTwitter';
module.exports.failedActionTwitter = 'failedActionTwitter';

for (var p in module.exports) {
    module.exports.hasOwnProperty(p);
    metricsNames.push(p);
}

// now, the functions

module.exports.GetMetrics = getMetrics;
module.exports.DeleteMetrics = deleteMetrics;
module.exports.IncMetrics = incMetrics;
module.exports.GetDecorated = decoratedMetrics;

