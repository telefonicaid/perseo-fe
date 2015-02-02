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

var domain = require('domain'),
    actions = require('../models/actions'),
    myutils = require('../myutils'),
    config = require('../../config'),
    logger = require('logops'),
    checkMaster = require('../checkMaster');

function PostAction(req, resp) {
    var firedEvent, errorAxn, nextDomain;
    firedEvent = req.body || {};

    errorAxn = actions.errorsAction(firedEvent);
    if (errorAxn) {
        myutils.logErrorIf(errorAxn);
        myutils.respond(resp, errorAxn, null);
        return;
    }
    //We need to do this before losing response domain
    nextDomain = domain.create();
    if (process.domain) {
        nextDomain.path = process.domain.path;
        nextDomain.op = process.domain.op;
        nextDomain.trans = process.domain.trans;
        nextDomain.corr = process.domain.corr;
        nextDomain.start = process.domain.start;
    }
    //Don't wait until action is finished
    resp.send({error: null, data: null});

    // TODO: Tricky ... To refactor?
    var domainErrorHandler = function(err) {
        logger.error(err);
        cleanDomain();
    };
    var cleanDomain = function() {
        var responseTime = Date.now() - nextDomain.start;
        logger.debug('response-time: %s', responseTime);
        nextDomain.removeListener('error', domainErrorHandler);
        delete nextDomain.trans;
        delete nextDomain.corr;
        delete nextDomain.op;
        delete nextDomain.path;
        nextDomain.exit();

    };
    nextDomain.on('error', domainErrorHandler);
    nextDomain.enter();
    nextDomain.run(function() {
        if (checkMaster.isAvailable()) {
            //nothing to do, but it's OK
            logger.info('slave ignoring action, master is available');
            return;
        }
        for (var p in firedEvent.ev) {
            if (firedEvent[p] === undefined) {
                firedEvent[p] = firedEvent.ev[p];
            }
        }
        delete firedEvent.ev;
        actions.Do(firedEvent, function(err) {
            cleanDomain();
        });
    });
}

function AddTo(app) {
    app.post(config.endpoint.actionsPath, PostAction);
}

/**
 * AddTo adds path and handler function to the Express app.
 *
 *  @param {Object}  Express application
 */
module.exports.AddTo = AddTo;

