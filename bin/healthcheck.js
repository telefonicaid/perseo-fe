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

const http = require('http');
const port = process.env.PERSEO_ENDPOINT_PORT || '9090';
const path = process.env.HEALTHCHECK_PATH || '/version';
const httpCode = process.env.HEALTHCHECK_CODE || 200;

const options = {
    host: 'localhost',
    port,
    timeout: 2000,
    method: 'GET',
    path
};

const request = http.request(options, (result) => {
    // eslint-disable-next-line no-console
    console.info(`Performed health check, result ${result.statusCode}`);
    if (result.statusCode === httpCode) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error(`An error occurred while performing health check, error: ${err}`);
    process.exit(1);
});

request.end();
