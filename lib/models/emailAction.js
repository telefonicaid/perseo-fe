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

var nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    config = require('../../config'),
    myutils = require('../myutils'),
    logger = require('logops');

var transporter = nodemailer.createTransport(smtpTransport({
    host: config.smtp.host,
    port: config.smtp.port
}));

function SendMail(action, event, callback) {
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: action.parameters.from,
        to: action.parameters.to,
        subject: action.parameters.subject,
        text: myutils.expandVar(action.template, event)
    };

    transporter.sendMail(mailOptions, function(err, info) {
        logger.debug('emailAction.SendMail %j %j', err, info);
        if (err) {
            myutils.logErrorIf(err, 'emailAction.SendMail');
        }
        else {
            logger.info('done emailAction.SendMail');
        }

        return callback(err, info);
    });
}

module.exports.doIt = SendMail;

