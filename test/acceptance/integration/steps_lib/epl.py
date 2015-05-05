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
from tools.general_utils import pretty

__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'
from lettuce import step, world


@step('an EPL sentence with name "([^"]*)"')
def an_epl_sentence_with_name(step, name):
    world.log.debug('Setting the EPL rule name as "{rule_name}" and reset the EPL entity_id, entity_type and attributes'.format(rule_name=name))
    world.rule_name = name
    world.epl_entity_id = None
    world.epl_entity_type = None
    world.epl_attributes = []

@step('the entity_id "([^"]*)" for the EPL')
def the_entity_id_for_the_epl(step, entity_id):
    world.log.debug('Setting the EPL entity id as "{entity_id}"'.format(entity_id=entity_id))
    world.epl_entity_id = entity_id

@step('the entity_type "([^"]*)" for the EPL')
def the_entity_type_for_the_epl(step, entity_type):
    world.log.debug('Setting the EPL entity type as "{entity_type}"'.format(entity_type=entity_type))
    world.epl_entity_type = entity_type

@step('the attributes for the EPL')
def the_attributes_for_the_epl(step):
    """
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    """
    # Check there is at las one row
    example = """
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    """
    assert len(step.hashes) >= 1, 'The attributes data are mandatory in this steps, with the format: \n {example}'.format(example=example)
    for row in step.hashes:
        world.epl_attributes.append({
            'id': row['attribute_id'],
            'type': row['attribute_value_type'],
            'operation': row['attribute_operation'],
            'value': row['attribute_value']
        })
    world.log.debug('Setting the EPL attributes as \n"{attributes}"'.format(attributes=pretty(world.epl_attributes)))

@step('generate the epl sentence with the data defined before')
def generate_the_epl_sentence_with_the_data_defined_before(step):
    world.epl_sentence = world.rules_utils.generate_epl2(world.rule_name, world.epl_entity_id, world.epl_entity_type, world.epl_attributes)
    world.log.debug('Generate the EPL sentence with the data defined before, the EPL generated is: \n {epl_sentence}'.format(epl_sentence=world.epl_sentence))


@step('a number of "([^"]*)" equal attributes for the EPL with the following data')
def a_number_of_equal_attributes_for_the_epl_with_the_data(step, attributes_number):
    """
    | attribute_id_prefix | attribute_value_type | attribute_operation | attribute_value |
    | temperature_        | float                | >                   | 1.5             |
    :param step:
    :param number:
    :return:
    """
    # Check there is at las one row
    example = """
      | attribute_id_prefix | attribute_value_type | attribute_operation | attribute_value |
      | temperature_        | float                | >                   | 1.5             |
    """
    assert len(step.hashes) == 1, 'The line (only one) attributes data is mandatory in this steps, with the format: \n {example}'.format(example=example)
    for i in range(0,int(attributes_number)):
        world.epl_attributes.append({
            'id': '{prefix}_{iterator}'.format(prefix=step.hashes[0]['attribute_id_prefix'], iterator=i),
            'type': step.hashes[0]['attribute_value_type'],
            'operation': step.hashes[0]['attribute_operation'],
            'value': step.hashes[0]['attribute_value'],
        })
    world.log.debug('Setting the EPL attributes as \n"{attributes}"'.format(attributes=pretty(world.epl_attributes)))

@step('an EPL with a rule name "([^"]*)", an identity type "([^"]*)", an attributes Number "([^"]*)", an attribute data type "([^"]*)", an operation type "([^"]*)" and value "([^"]*)"')
def an_epl_with_a_rule_name_an_identity_type_an_attributes_number_an_attribute_data_type_an_operation_type_and_value_(step, name, type, attributes_number, attribute_type, operation_type, value):
    service, servicepath = world.cep.get_service_and_servicepath()
    world.epl_sentence = world.rules_utils.generate_epl(service, servicepath, name, type, attributes_number,
                                                        attribute_type, operation_type, value)
    world.attributes_number = attributes_number
    world.rule_name = name
