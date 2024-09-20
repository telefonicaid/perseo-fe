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

function buildTransporterOptions(action, event) {
    var options = {};
    if (action.parameters.smtp) {
        options.smtp = {};
        options.smtp = action.parameters.smtp;
        if (action.parameters.smtp.host) {
            options.smtp.host = myutils.expandVar(action.parameters.smtp.host, event, true);
        }
        if (action.parameters.smtp.port) {
            options.smtp.port = myutils.expandVar(action.parameters.smtp.port, event, true);
        }
    }
    return options;
}

function buildMailOptions(action, event) {
    var options = {};
    options = {
        from: myutils.expandVar(action.parameters.from, event, true),
        to: myutils.expandVar(action.parameters.to, event, true),
        subject: myutils.expandVar(action.parameters.subject || '', event, true),
        text: myutils.expandVar(action.template, event, true)
    };
    if (action.parameters.cc) {
        options.cc = myutils.expandVar(action.parameters.cc, event, true);
    }
    if (action.parameters.bcc) {
        options.bcc = myutils.expandVar(action.parameters.bcc, event, true);
    }
    return options;
}

function SendMail(action, event, callback) {
    var transporter;
    try {
        // setup e-mail data with unicode symbols
        var mailOptions = buildMailOptions(action, event),
            transporterOptions = buildTransporterOptions(action, event),
            opt2log,
            smtpConfig,
            msgFromConfig;

        if (transporterOptions.smtp) {
            smtpConfig = transporterOptions.smtp;
            msgFromConfig = 'from action';
        } else {
            smtpConfig = config.smtp;
            msgFromConfig = 'from global';
        }
        var smtpAuth = smtpConfig.auth ? Object.assign({}, smtpConfig.auth) : undefined; // force clone
        smtpConfig.auth = { user: 'UUU', pass: 'XXX' }; // fake auth for log purposes
        logger.debug('Using smtp transporter %j config: %j', msgFromConfig, smtpConfig);
        smtpConfig.auth = smtpAuth; // restore auth
        transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
        metrics.IncMetrics(event.service, event.subservice, metrics.actionEmail);

        transporter.sendMail(mailOptions, function(err, info) {
            logger.debug('emailAction.SendMail mailOptions: %j error: %j info: %j', mailOptions, err, info);
            // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
            metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactions);

            if (err) {
                metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEmail);
                // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
                metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactionsErrors);

                opt2log = {
                    to: mailOptions.to,
                    from: mailOptions.from,
                    subject: mailOptions.subject,
                    smtp: smtpConfig
                };
                opt2log.smtp.auth = { user: 'UUU', pass: 'XXX' };
                myutils.logErrorIf(err, util.format('emailAction.SendMail %j', opt2log));
                smtpConfig.auth = smtpAuth; // ensure smtpConfig.auth is not tainted
                alarm.raise(alarm.EMAIL);
            } else {
                metrics.IncMetrics(event.service, event.subservice, metrics.okActionEmail);

                logger.info('done emailAction.SendMail to %s', mailOptions.to);
                alarm.release(alarm.EMAIL);
            }
            return callback(err, info);
        });
    } catch (ex) {
        metrics.IncMetrics(event.service, event.subservice, metrics.failedActionEmail);
        // Not an HTTP request, so outgoingTransacion hasn't already counted and must be counted now
        metrics.IncMetrics(event.service, event.subservice, metrics.outgoingTransactionsErrors);
        return callback(ex);
    } finally {
        if (transporter) {
            // release resources
            transporter.close();
        }
    }
}

module.exports.doIt = SendMail;
module.exports.buildMailOptions = buildMailOptions;
