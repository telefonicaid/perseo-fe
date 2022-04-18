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
    config = require('../../config'),
    alarm = require('../alarm'),
    errors = {};

function getToken(trust, authentication, callback) {
    const host = authentication && authentication.host ? authentication.host : config.authentication.host;
    const port = authentication && authentication.port ? authentication.port : config.authentication.port;
    const user = authentication && authentication.user ? authentication.user : config.authentication.user;
    const password =
        authentication && authentication.password ? authentication.password : config.authentication.password;
    const domain = authentication && authentication.domain ? authentication.domain : 'admin_domain';
    var options = {
        url: 'http://' + host + ':' + port + '/v3/auth/tokens',
        method: 'POST',
        json: {
            auth: {
                identity: {
                    methods: ['password'],
                    password: {
                        user: {
                            domain: {
                                name: domain
                            },
                            name: user,
                            password: password
                        }
                    }
                },
                scope: {
                    'OS-TRUST:trust': {
                        id: trust
                    }
                }
            }
        }
    };

    logger.debug('retrieving token from Keystone using trust [%s]', trust);

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
