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

/**
 * Constant strings for header with incoming requests
 *
 */
module.exports = {
    SUBSERVICE_HEADER: 'fiware-servicepath',
    SERVICE_HEADER: 'fiware-service',
    CORRELATOR_HEADER: 'fiware-correlator',
    AUTH_HEADER: 'X-Auth-Token',
    REALIP_HEADER: 'X-Real-IP',
    COMPONENT_NAME: 'perseo-fe',
};
