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


@step('validate that rule name is created successfully in perseo-core')
def validate_that_rule_name_is_created_successfully_in_perseo_core(step):
    """
    Get the las rule added to the list, and check if its created in preseo-core
    :param step:
    :return:
    """
    service, servicepath = world.cep.get_service_and_servicepath()
    assert 'error' not in world.cep.get_perseo_core_rule('{name}@{service}{servicepath}'.format(name=world.rules[len(world.rules)-1]['name'], service=service.lower(), servicepath=servicepath.lower())).json()