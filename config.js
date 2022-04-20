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

var config = {};

/**
 * Default log level. Can be one of: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
 * @type {string}
 */
config.logLevel = 'INFO';

/**
 * Configures the exposed API.
 */
config.endpoint = {
    host: 'localhost',
    port: 9090,
    rulesPath: '/rules',
    actionsPath: '/actions/do',
    noticesPath: '/notices',
    vrPath: '/m2m/vrules',
    checkPath: '/check',
    versionPath: '/version',
    logPath: '/admin/log',
    metricsPath: '/admin/metrics'
};

/**
 * Is Master this one?
 */
config.isMaster = true;

/**
 * Delay (in milliseconds) for slave to execute an action
 */
config.slaveDelay = 500;

/**
 * DB Configuration.
 */
config.mongo = {
    // The URI to use for the database connection. It supports replica set URIs.
    // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    // I.e.: 'mongodb://user:pass@host1:27017,host2:27018,host3:27019/cep?replicaSet=myrep'
    url: 'mongodb://localhost:27017/cep'
};

/**
 * OrionDB Configuration.
 */
config.orionDb = {
    url: 'mongodb://localhost:27017/orion',
    collection: 'entities',
    prefix: 'orion',
    batchSize: 500
};

/**
 * EPL core options
 *
 * interval is the time in milliseconds between refreshing rules
 * at core. Each <<interval>> ms, the rules are sent to core.
 */
config.perseoCore = {
    rulesURL: 'http://localhost:8080/perseo-core/rules',
    noticesURL: 'http://localhost:8080/perseo-core/events',
    interval: 60e3 * 5
};
/**
 * NEXT EPL core options (with HA)
 */
config.nextCore = {
    //
    // Note this parameter is empty, so Perseo will not use HA by default
    //
    /*
    rulesURL : 'http://next-core:8080/perseo-core/rules',
    noticesURL : 'http://next-core:8080/perseo-core/events'
    */
};

/**
 * SMTP endpoint options
 */
config.smtp = {
    port: 25,
    host: 'smtpserver',
    secure: false,
    /*
     auth: {
     user: 'abc',
     pass: 'xyz'
     }
     ,
    */
    tls: {
        // keep rejectUnauthorized to false when secure is also false
        rejectUnauthorized: false
    }
};

/**
 * SMS endpoint options
 */
config.sms = {
    URL: 'http://sms-endpoint/smsoutbound',
    API_KEY: '',
    API_SECRET: '',
    from: 'tel:22012;phone-context=+34'
};

/**
 * SMPP endpoint options
 */
config.smpp = {
    host: '',
    port: '',
    systemid: '',
    password: '',
    from: '346666666',
    enabled: false
};

/**
 * Orion (Context Broker) endpoint options
 */
config.orion = {
    URL: 'http://orion-endpoint:1026'
};

/**
 * Pep (proxy for Context Broker) endpoint options
 */
config.pep = {
    URL: 'http://pep-endpoint:1026'
};

/**
 * Authorization endpoint
 */
config.authentication = {
    host: 'keystone',
    port: '5001',
    user: 'user',
    password: 'password',
    service: 'admin_domain'
};

/**
 * Collections
 * @type {String}
 */
config.collections = {
    rules: 'rules',
    executions: 'executions'
};

/**
 * Executions TTL
 *
 * Number of seconds to expire a document in 'executions'
 * @type {Number}
 *
 */
config.executionsTTL = 1 * 24 * 60 * 60;

/**
 * Constants for missing header fields for service (Fiware-servicepath) DEFAULT_SUBSERVICE
 * and tenant (Fiware-service) DEFAULT_TENANT
 *
 * @type {String}
 */
config.DEFAULT_SUBSERVICE = '/';
config.DEFAULT_SERVICE = 'unknownt';

/**
 * CheckDB configuration
 *
 * delay Number of milliseconds to check DB connection
 * @type {Number}
 *
 * reportInterval Number of milliseconds to report a problem with DB connection in logs
 * @type {Number}
 */
config.checkDB = {
    delay: 5e3,
    reconnectTries: 1e3,
    reconnectInterval: 5e3,
    bufferMaxEntries: 5
};

/**
 * Rest base for changing access to twitter
 *
 * It should not be changed in normal conditions
 *
 * restBase:  URL
 * @type {String}
 *
 */
config.restBase = null;

/**
 * Cast attribute values in updateAction using NGSIv2 types
 */
config.castTypes = false;

module.exports = config;
