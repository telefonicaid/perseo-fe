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
    metricsRoutes = require('./routes/metricsController'),
    rules = require('./models/rules'),
    metrics = require('./models/metrics'),
    app = express(),
    server,
    logger = require('logops'),
    domainMiddleware = require('./middleware/domain').requestDomain(),
    logRequestMiddleware = require('./middleware/logRequest'),
    serviceMiddleware = require('./middleware/service'),
    errorMiddleware = require('./middleware/error'),
    myutils = require('./myutils'),
    d = domain.create(),
    swaggerJsdoc = require('swagger-jsdoc'),
    swaggerUi = require('swagger-ui-express'),
    pjson = require('../package.json');

function start(callbackStart) {
    var context = { op: 'start', comp: constants.COMPONENT_NAME };

    logger.info(context, 'starting perseo');
    logger.setLevel(config.logLevel);
    logger.debug(context, 'Using config:\n\n%s\n', JSON.stringify(config, null, 4));
    logger.getContext = function getDomainContext() {
        if (process.domain) {
            return process.domain.context;
        }
    };

    d.run(function() {
        app.disable('etag');
        app.use(serviceMiddleware.middleware());
        app.use(domainMiddleware);
        app.use(
            bodyParser.json({
                verify: function(req, res, buf) {
                    // actions are internal, not to be included
                    if (
                        req.url !== config.endpoint.actionsPath &&
                        req.url !== config.endpoint.checkPath &&
                        req.url !== config.endpoint.versionPath &&
                        req.url !== config.endpoint.logPath &&
                        req.url !== config.endpoint.metricsPath
                    ) {
                        metrics.IncMetrics(
                            req.service,
                            req.subservice,
                            metrics.incomingTransactionsRequestSize,
                            buf.length
                        );
                    }
                }
            })
        );
        app.use(logRequestMiddleware.middleware());
        app.use(errorMiddleware.middleware());

        actionsRoutes.AddTo(app);
        rulesRoutes.AddTo(app);
        noticesRoutes.AddTo(app);
        visualRulesRoutes.AddTo(app);
        checkRoutes.AddTo(app);
        versionRoutes.AddTo(app);
        metricsRoutes.AddTo(app);

        const options = {
            definition: {
                swagger: '2.0', // Specification (optional, defaults to swagger: '2.0')
                info: {
                    title: pjson.name, // Title (required)
                    version: pjson.version // Version (required)
                }
            },
            // Path to the API docs
            apis: ['./lib/routes/*.js']
        };

        const specs = swaggerJsdoc(options);

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

        async.series(
            [
                function(callback) {
                    async.waterfall(
                        [
                            db.getDb,
                            function(db0, client, cbwf) {
                                appContext.SetDB(db0);
                                cbwf(null);
                            }
                        ],
                        callback
                    );
                },
                db.ping,
                db.setUp,
                function(callback) {
                    async.waterfall(
                        [
                            db.getOrionDb,
                            function(dbO, client, cbwf) {
                                appContext.SetClient(client);
                                appContext.SetOrionDB(dbO);
                                cbwf(null);
                            }
                        ],
                        callback
                    );
                },
                db.orionPing,
                function(callback) {
                    var domain = require('domain').create();
                    domain.context = {};
                    domain.context.op = 'initialRefresh';
                    domain.context.comp = constants.COMPONENT_NAME;
                    domain.context.trans = 'n/a';
                    domain.context.corr = domain.context.trans;
                    domain.context.srv = 'n/a';
                    domain.context.subsrv = 'n/a';
                    domain.run(function() {
                        rules.Refresh(callback);
                    });
                },
                function(callback) {
                    server = app.listen(config.endpoint.port, function() {
                        logger.info(context, 'listening on port %d', server.address().port);
                        return callback(null, server);
                    });
                }
            ],
            function(err) {
                myutils.logErrorIf(err, context);
                require('./refreshCore'); // Start periodical update of rules at core
                if (err && err.httpCode >= 500) {
                    // just propagate to perseo.bin 500 error
                    return callbackStart(err);
                } else {
                    return callbackStart(null);
                }
            }
        );
    });
}

function stop(callback) {
    var context = { op: 'stop', comp: constants.COMPONENT_NAME };
    logger.info(context, 'stopping perseo');
    async.series([server.close.bind(server)], function(err) {
        myutils.logErrorIf(err);
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
