# -*- coding: utf-8 -*-
#
# Copyright 2015 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of perseo-fe
#
# perseo-fe is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# perseo-fe is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with perseo-fe.
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with:
#   iot_support at tid.es
#
__author__ = 'Iván Arias León (ivan.ariasleon@telefonica.com)'


from lettuce import world
import json
import os
import sys

"""
Parse the JSON configuration file located in the src folder and
store the resulting dictionary in the lettuce world global variable.
"""
with open("properties.json") as config_file:
    try:
        world.config = json.load(config_file)
    except Exception, e:
        print 'Error parsing config file: %s' % (e)
        sys.exit(1)

"""
Make sure the logs path exists and create it otherwise.
"""
if not os.path.exists(world.config["environment"]["logs_path"]):
    os.makedirs(world.config["environment"]["logs_path"])
