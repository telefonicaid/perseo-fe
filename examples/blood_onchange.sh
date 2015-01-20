#!/bin/sh

# Copyright 2015 Telefonica Investigacion y Desarrollo, S.A.U
#
# This file is part of perseo-fe
#
# perseo-fe is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# perseo-fe is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
# General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with perseo-fe. If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by this license please contact with
# iot_support at tid dot es

source ./config.env

(curl ${ORION_HOST}:${ORION_PORT}/v1/subscribeContext -s -S --header 'Fiware-service: unknownT' --header 'Fiware-servicepath: /' --header 'Content-Type: application/json' --header 'Accept: application/json' -d @- | python -mjson.tool) <<EOF
{
    "entities": [
        {
            "type": "BloodMeter",
            "isPattern": "true",
            "id": ".*"
        }
    ],
    "attributes": [
        "BloodPressure"
    ],
    "reference": "http://${PERSEO_HOST}:${PERSEO_PORT}/notices",
    "duration": "P1Y",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "BloodPressure"
            ]
        }
    ],
    "throttling": "PT1S"
}
EOF
