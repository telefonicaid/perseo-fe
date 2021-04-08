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
    nodemailer = require('nodemailer'),
    logger = require('logops'),
    smtpTransport = require('nodemailer-smtp-transport'),
    config = require('../../config'),
    myutils = require('../myutils'),
    alarm = require('../alarm'),
    metrics = require('./metrics');

var transporter = nodemailer.createTransport(smtpTransport(config.smtp));

function buildTransporterOptions(action, event) {
    var options = {};
    if (action.parameters.smtp) {
        options.smtp = {};
        options.smtp = action.parameters.smtp;
        if (action.parameters.smtp.host) {
            options.smtp.host = myutils.expandVar(action.parameters.smtp.host, event);
        }
        if (action.parameters.smtp.port) {
            options.smtp.port = myutils.expandVar(action.parameters.smtp.port, event);
        }
    }
    return options;
}

function buildMailOptions(action, event) {
    return {
        from: myutils.expandVar(action.parameters.from, event),
        to: myutils.expandVar(action.parameters.to, event),
        subject: myutils.expandVar(action.parameters.subject || '', event),
        text: myutils.expandVar(action.template, event)
    };
}

function SendMail(action, event, callback) {
    try {
        // setup e-mail data with unicode symbols
        var mailOptions = buildMailOptions(action, event),
            transporterOptions = buildTransporterOptions(action, event),
            opt2log;

        if (transporterOptions.smtp) {
            logger.debug('Using smtp transporter config from action: %j', transporterOptions.smtp);
            transporter = nodemailer.createTransport(smtpTransport(transporterOptions.smtp));
        }
        metrics.IncMetrics(event.service, event.subservice, metrics.actionEmail);

        transporter.sendMail(mailOptions, function(err, info) {
            logger.debug('emailAction.SendMail %j %j %j', mailOptions, err, info);
            // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
            metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactions);

            if (err) {
                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEmail);
                // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
                metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactionsErrors);

                opt2log = { to: mailOptions.to, from: mailOptions.from, subject: mailOptions.subject };
                myutils.logErrorIf(err, util.format('emailAction.SendMail %j', opt2log));
                alarm.raise(alarm.EMAIL);
            } else {
                metrics.IncMetrics(event.service, event.subservice, metrics.okActionEmail);

                logger.info('done emailAction.SendMail');
                alarm.release(alarm.EMAIL);
            }
            return callback(err, info);
        });
    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEmail);
        // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
        metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactionsErrors);
        return callback(ex);
    }
}

module.exports.doIt = SendMail;
module.exports.buildMailOptions = buildMailOptions;
