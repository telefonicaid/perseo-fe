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
    request = require('request'),
    logger = require('logops'),
    configTrust = require('../../configTrust'),
    alarm = require('../alarm'),
    errors = {};

function getToken(trust, callback) {
    var trustConf = configTrust.trusts.find((item) => item.id === trust);
    // check trust was found or log it
    if (!trustConf) {
        logger.error('Trust [%s] not found in configTrust file', trust);
        callback(new errors.TokenRetrievalError(trust, 'trust not found' + trust));
    }
    var options = {
        url: 'http://' + trustConf.host + ':' + trustConf.port + '/v3/auth/tokens',
        method: 'POST',
        json: {
            auth: {
                identity: {
                    methods: ['password'],
                    password: {
                        user: {
                            domain: {
                                name: trustConf.service
                            },
                            name: trustConf.user,
                            password: trustConf.password
                        }
                    }
                },
                scope: {
                    domain: {
                        name: trustConf.service
                    }
                }
            }
        }
    };

    logger.debug('retrieving token with trust [%s]', trust);

    request(options, function handleResponse(error, response /*, body*/) {
        if (error) {
            logger.error('error retrieving token from Keystone: %s', error);
            alarm.raise(alarm.AUTH);
            callback(new errors.TokenRetrievalError(trust, error));
        } else if (response.statusCode === 201 && response.headers['x-subject-token']) {
            logger.debug('token found for trust [%s] = [%s]', trust, response.headers['x-subject-token']);
            alarm.release(alarm.AUTH);
            callback(null, response.headers['x-subject-token']);
        } else if (response.statusCode === 401) {
            logger.error('authentication rejected: %s', trust);
            alarm.raise(alarm.AUTH, 'authentication rejected');
            callback(new errors.AuthenticationError(trust));
        } else {
            logger.error('unexpected status code: %d', response.statusCode);
            alarm.raise(alarm.AUTH, util.format('unexpected status code: %d', response.statusCode));
            callback(
                new errors.TokenRetrievalError(trust, 'unexpected status code retrieving token: ' + response.statusCode)
            );
        }
    });
}

exports.getToken = getToken;

(function() {
    errors.TokenRetrievalError = function(trust, msg) {
        this.name = 'TOKEN_RETRIEVAL_ERROR';
        this.message = 'An error occurred trying to retrieve a token with trust [' + trust + ']: ' + msg;
    };
    errors.AuthenticationError = function(trust) {
        this.name = 'AUTHENTICATION_ERROR';
        this.message = 'The trust configured for the device was rejected: [' + trust + ']';
    };
    Object.keys(errors).forEach(function(element) {
        util.inherits(errors[element], Error);
    });
})();
