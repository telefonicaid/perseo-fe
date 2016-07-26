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
    express = require('express'),
    bodyParser = require('body-parser'),
    async = require('async'),
    constants = require('./constants'),
    appContext = require('./appContext'),
    config = require('../config'),
    db = require('./db'),
    actionsRoutes = require('./routes/actionsController'),
    rulesRoutes = require('./routes/rulesController'),
    noticesRoutes = require('./routes/noticesController'),
    visualRulesRoutes = require('./routes/visualRulesController'),
    checkRoutes = require('./routes/checkController'),
    versionRoutes = require('./routes/versionController'),
    rules = require('./models/rules'),
    app = express(),
    server,
    logger = require('logops'),
    domainMiddleware = require('./middleware/domain').requestDomain(),
    logRequestMiddleware = require('./middleware/logRequest'),
    serviceMiddleware = require('./middleware/service'),
    errorMiddleware = require('./middleware/error'),
    myutils = require('./myutils'),
    d = domain.create();

function start(callbackStart) {
    var context = {op: 'start', comp: constants.COMPONENT_NAME};

    logger.info(context, 'starting perseo');
    logger.setLevel(config.logLevel);

    logger.getContext = function getDomainContext() {
        if (process.domain) {
            return process.domain.context;
        }
    };

    d.context = context;
    d.on('error', function(ex) {
        logger.fatal(context, 'uncaughtException: %s', ex.message || ex, ex.stack && ex.stack.split('\n').join(','));
        logger.stream.write('', function() {
            process.exit(-1);
        });
    });
    d.enter();

    app.disable('etag');
    app.use(serviceMiddleware.middleware());
    app.use(bodyParser.json());
    app.use(errorMiddleware.middleware());
    app.use(domainMiddleware);
    app.use(logRequestMiddleware.middleware());


    actionsRoutes.AddTo(app);
    rulesRoutes.AddTo(app);
    noticesRoutes.AddTo(app);
    visualRulesRoutes.AddTo(app);
    checkRoutes.AddTo(app);
    versionRoutes.AddTo(app);



    async.series(
        [
            function(callback) {
                async.waterfall([
                    db.getDb,
                    function(db0, cbwf) {
                        appContext.SetDB(db0);
                        cbwf(null);
                    }
                ], callback);
            },
            db.ping,
            db.setUp,
            function(callback) {
                async.waterfall([
                    db.getOrionDb,
                    function(dbO, cbwf) {
                        appContext.SetOrionDB(dbO);
                        cbwf(null);
                    }
                ], callback);
            },
            db.orionPing,
            rules.Refresh,
            function(callback) {
                server = app.listen(config.endpoint.port, function() {
                    logger.info('listening on port %d', server.address().port);
                    return callback(null, server);
                });
            }
        ],
        function(err) {
            myutils.logErrorIf(err, context);
            require('./refreshCore'); // Start periodical update of rules at core
            return callbackStart(err);
        }
    );

}

function stop(callback) {
    var context = {op: 'stop'};
    logger.info(context, 'stopping perseo');
    async.series([
            server.close.bind(server),
            db.close,
            db.orionClose
        ],
        function(err) {
            myutils.logErrorIf(err, context);
            return callback(err);
        });
}

/**
 * start starts perseo server.
 *
 *  @param {function}       callback function(error)
 */
module.exports.start = start;
/**
 * stop stops perseo server.
 *
 *  @param {function}       callback function(error)
 */
module.exports.stop = stop;


