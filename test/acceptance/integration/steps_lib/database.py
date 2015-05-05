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
from tools.general_utils import generate_context_fake_in_cep_mongo

@step('generate context orion fake with entity id "([^"]*)", entity type "([^"]*)", attribute name "([^"]*)", attribute value "([^"]*)" and attribute type "([^"]*)"')
def generate_context_orion_fake_with_entity_id_entity_type_attribute_name_attribute_value_and_attribute_type(step, entity_id, entity_type, attribute_name, attribute_value, attribute_type):
    """
    Gen an entity structure in mongo and insert into the db
    :param step:
    :param entity_id:
    :param entity_type:
    :param attribute_name:
    :param attribute_value:
    :param attribute_type:
    :return:
    """
    entity_structure = generate_context_fake_in_cep_mongo(entity_id, entity_type, world.config['CEP']['service_path'], attribute_name, attribute_value, attribute_type)
    world.log.debug('Sending the entity structure to the mongo database: {entity_structure}'.format(entity_structure=entity_structure))
    world.cep.create_entity_orion_mongo(entity_structure)