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
# iot_support at tid.es
#

__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'
from lettuce import step, world

@step('set service "([^"]*)" and service path "([^"]*)"')
def set_service_and_subservice(step, service, service_path):
    world.cep.set_service_and_servicepath(service, service_path)

@step('configured with service "([^"]*)" and service path "([^"]*)"')
def configured_with_service_and_service_path(step, service, service_path):
    world.cep.set_service_and_servicepath(service, service_path)