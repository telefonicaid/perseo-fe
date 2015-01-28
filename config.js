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
    rulesPath : '/rules',
    actionsPath : '/actions/do',
    noticesPath : '/notices',
    vrPath : '/m2m/vrules',
    checkPath : '/check'
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
    url : 'mongodb://localhost:27017/test'
};

/**
 * OrionDB Configuration.
 */
config.orionDb = {
    url : 'mongodb://localhost:27017/orion',
    collection : 'entities',
    prefix : 'orion',
    batchSize: 500
};


/**
 * EPL core options
 *
 * interval is the time in milliseconds between refreshing rules
 * at core. Each <<interval>> ms, the rules are sent to core.
 */
config.perseoCore = {
    rulesURL : 'http://localhost:8080/perseo-core/rules',
    noticesURL : 'http://localhost:8080/perseo-core/events',
    interval: 60e3*1
};
/**
 * NEXT EPL core options (with HA)
 */
config.nextCore = {
    rulesURL : 'http://demo-dca-be-01:8080/perseo-core/rules',
    noticesURL : 'http://demo-dca-be-01:8080/perseo-core/events'
};


/**
 * SMTP endpoint options
 */
config.smtp = {
    port : 25,
    host : 'tid'
};

/**
 * SMS endpoint options
 */
config.sms = {
    URL : 'http://pigeon.hopto.org:443/sms/v2/smsoutbound',
    API_KEY : '80ce17b0-2232-4788-b506-0efa38e3a22d',
    API_SECRET: '22c51b7b-3f66-485c-a01b-6dcfc74106be'
};

/**
 * Orion (Context Broker) endpoint options
 */
config.orion = {
    URL : 'http://qa-orion-fe-02.hi.inet:1026/NGSI10/updateContext'
};

/**
 * Collections
 * @type {{}}
 */
config.collections = {
    rules : 'rules',
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
 * Constants for missing header fields for service (Fiware-servicepath) DEFAULT_SERVICE
 * and tenant (Fiware-service) DEFAULT_TENANT
 *
 * @type {{}}
 */
config.DEFAULT_SERVICE= '/';
config.DEFAULT_TENANT= 'unknownt';

module.exports = config;

