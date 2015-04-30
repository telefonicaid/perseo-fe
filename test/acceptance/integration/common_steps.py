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
from tools.notifications_utils import NotificationsUtils

__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'
from lettuce import step, world
from tools.general_utils import pretty






@step(
    'create a sensor card of notUpdated type with id "([^"]*)", verify interval "([^"]*)", attribute name "([^"]*)", max time without update "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_notupdated_type_with_id_verify_interval_attribute_name_max_time_without_update_and_connect_to(
        step, id, interval, attribute_name, max_time, connected_to):
    world.cards.append(
        world.cards_utils.create_sensor_not_updated_card(id, [connected_to], max_time, interval, attribute_name))


@step('create a sensor card of id type, with id "([^"]*)", identity id "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_with_id_group1_identity_id_group2_and_connect_to_group3(step, id, identity_id,
                                                                                            connected_to):
    world.cards.append(world.cards_utils.create_sensor_regex_card(id, [connected_to], identity_id))


@step(
    'create a sensor card of type type, with "([^"]*)", identity type "([^"]*)",operator "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_type_type_with_group1_identity_type_group2_operator_group3_and_connect_to_group4(step, id,
                                                                                                             identity_id,
                                                                                                             operator,
                                                                                                             connected_to):
    world.cards.append(world.cards_utils.create_sensor_type_card(id, [connected_to], operator, identity_id))


@step('create a sensor card of value threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", parameter value "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_with_id_group1_attribute_name_group2_operator_group3_data_type_group4_parameter_value_group5_and_connect_to_group6(
        step, id, attribute_name, operator, data_type, parameter_value, connected_to):
    world.cards.append(
        world.cards_utils.create_sensor_threshold_card(id, [connected_to], operator, parameter_value, attribute_name,
                                                       data_type))


@step(
    'create a sensor card of attribute threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", attribute to refer "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_attribute_threshold_type_with_id_group1_attribute_name_group2_operator_group3_data_type_group4_attribute_to_refer_group5_and_connect_to_group6(
        step, id, attribute_name, operator, data_type, attribute_to_refer, connected_to):
    world.cards.append(
        world.cards_utils.create_sensor_attribute_threshold_card(id, [connected_to], operator, attribute_to_refer,
                                                                 attribute_name, data_type))


@step('create a sensor card of epl type with id "([^"]*)", epl query "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_epl_type_with_id_group1_epl_query_group2_and_connect_to_group3(step, id, epl_query,
                                                                                           connected_to):
    world.cards.append(world.cards_utils.create_sensor_cep_epl_card(id, [connected_to], epl_query))


@step('create a action card of "([^"]*)" type, with id "([^"]*)", response "([^"]*)", parameters "([^"]*)" and connect to "([^"]*)"')
def create_a_action_card_of_group1_type_with_id_group2_response_group3_parameters_group4_and_connect_to_group5(step,
                                                                                                               action_type,
                                                                                                               id,
                                                                                                               mock_response,
                                                                                                               parameters,
                                                                                                               connected_to):
    if action_type == 'SendEmailAction':
        world.cards.append(
            world.cards_utils.create_action_email_card(id, id, [connected_to], parameters, parameters, 'test_subject',
                                                       mock_response))
    elif action_type == 'SendSmsMibAction':
        world.cards.append(world.cards_utils.create_action_sms_card(id, id, [connected_to], parameters, mock_response))
    elif action_type == 'updateAttribute':
        world.cards.append(
            world.cards_utils.create_action_update_card(id, id, [connected_to], parameters, mock_response))
    else:
        raise ValueError('The action card type "{action_type}" is not supported'.format(action_type=action_type))


@step('create a time card of time elapsed type, with id "([^"]*)", interval "([^"]*)" and connect to "([^"]*)"')
def create_a_time_card_of_time_elapsed_type_with_id_group1_interval_group2_and_connect_to_group3(step, id, interval,
                                                                                                 connected_to):
    world.cards.append(world.cards_utils.create_time_enlapsed_card(id, [connected_to], interval))


@step('append a new rule name "([^"]*)", activate "([^"]*)"')
def append_a_new_rule_name_group1_activate_group2(step, name, active):
    world.rules.append(world.rules_utils.create_card_rule(name, active, world.cards))
    world.cards = []
    world.resp = world.cep.create_visual_rule(world.rules[len(world.rules) - 1])


@step('I receive an "([^"]*)" http code in rules request')
def i_receive_an_http_code_in_rules_request(step, code):
    assert world.resp.status_code == int(
        code), 'The code received from cep is "{code_received}" and the expected is "{code_expected}"'.format(
        code_received=world.resp.status_code, code_expected=code)


@step('Validate that rule name is created successfully in db')
def validate_that_rule_name_is_created_successfully_in_db(step):
    assert len(world.cep.get_rule_from_mongo(world.rules[len(world.rules) - 1]['name'])) == 1


@step('Check the parameter value of the sensor card "([^"]*)" changed to "([^"]*)"')
def validate_that_rule_name_is_created_successfully_in_db(step, card_id, new_value):
    cards_stored = world.cep.get_rule_from_mongo(world.rules[len(world.rules) - 1]['name'])[0]['VR']['cards']
    for card in cards_stored:
        if card['id'] == card_id:
            assert card['conditionList'][0]['parameterValue'].find(new_value) >= 0
            return
    assert False, 'There is no cards with the id "{id}"'.format(id=card_id)


@step('Check the interval value of the sensor card "([^"]*)" changed to "([^"]*)"')
def validate_that_rule_name_is_created_successfully_in_db(step, card_id, new_value):
    cards_stored = world.cep.get_rule_from_mongo(world.rules[len(world.rules) - 1]['name'])[0]['VR']['cards']
    for card in cards_stored:
        if card['id'] == card_id:
            assert card['timeData']['interval'].find(new_value) >= 0
            return
    assert False, 'There is no cards with the id "{id}"'.format(id=card_id)


@step('Check the parameter value of the action card "([^"]*)" changed to "([^"]*)"')
def validate_that_rule_name_is_created_successfully_in_db(step, card_id, new_value):
    action_card = world.cep.get_rule_from_mongo(world.rules[len(world.rules) - 1]['name'])[0]['action']
    for parameter in action_card['parameters']:
        if action_card['parameters'][parameter].find(new_value) >= 0:
            return
    assert False, 'The new value "{new_value}" is not in any action parameter. Parameters {parameters}'.format(
        new_value=new_value, parameters=action_card['parameters'])


@step('delete a visual rule created')
def delete_a_visual_rule_created(step):
    world.resp = world.cep.delete_visual_rule(world.rules[len(world.rules) - 1]['name'])


@step('configured with service "([^"]*)" and service path "([^"]*)"')
def configured_with_service_and_service_path(step, service, service_path):
    world.cep.set_service_and_servicepath(service, service_path)


@step('Validate that rule name is deleted successfully in db')
def validate_that_rule_name_is_deleted_successfully_in_db(step):
    assert len(world.cep.get_rule_from_mongo(
        world.rules[len(world.rules) - 1]['name'])) == 0, 'The rule "{name}" is still in the db'.format(
        name=world.rules[len(world.rules) - 1]['name'])


@step('rule name "([^"]*)" to try to delete but it does not exists')
def rule_name_group1_to_try_to_delete_but_it_does_not_exists(step, group1):
    world.rules.append(world.rules_utils.create_card_rule('rule_name', 1, []))


@step('read a visual rule in perseo')
def read_a_visual_rule_in_perseo(step):
    world.resp = world.cep.get_visual_rule(world.rules[len(world.rules) - 1]['name'])


@step('validate that all visual rules are returned')
def validate_that_all_visual_rules_are_returned(step):
    for rule in world.rules:
        assert world.cep.get_visual_rule(rule['name']).json()['data'] != None


@step('validate that all visual rules are listed')
def validate_that_all_visual_rules_are_listed(step):
    assert len(world.resp.json()['data']) == len(world.rules)
    names_returned = [x['name'] for x in world.resp.json()['data']]
    names_sent = [x['name'] for x in world.rules]
    for name in names_sent:
        assert name in names_returned, 'The name "{name}" sent is not in the names returned "{names_returned}"'.format(
            name=name, names_returned=names_returned)


@step('create visual rules "([^"]*)" with prefix "([^"]*)", sensor cards and an action card "([^"]*)"')
def create_visual_rules_group1_with_prefix_group2_sensor_cards_and_an_action_card_group3(step, number, prefix, action):
    sensor_types = []
    for hash in step.hashes:
        sensor_types.append(hash['sensorCardType'])
    for i in range(0, int(number)):
        name = prefix + str(i)
        world.rules.append(world.rules_utils.util_create_card_rule_with_some_sensor_types(sensor_types, action, name))
        world.resp = world.cep.create_visual_rule(world.rules[len(world.rules) - 1])
        assert world.resp.status_code == 201, 'There was an error creating the visual rule: \n {visual_rule}'.format(
            visual_rule=pretty(world.rules[len(world.rules) - 1]))


@step('list all rules')
def read_all_rules(step):
    world.resp = world.cep.list_visual_rules()


@step('delete all visual rules created')
def delete_all_visual_rules_created(step):
    assert False, 'This step must be implemented'


@step('update a visual rule "([^"]*)"')
def update_a_visual_rule_group1(step, name):
    world.rules.append(world.rules_utils.create_card_rule(name, '1', world.cards))
    world.cards = []
    world.resp = world.cep.update_visual_rule(name, world.rules[len(world.rules) - 1])


@step('an EPL with a rule name "([^"]*)", an identity type "([^"]*)", an attributes Number "([^"]*)", an attribute data type "([^"]*)", an operation type "([^"]*)" and value "([^"]*)"')
def an_epl_with_a_rule_name_an_identity_type_an_attributes_number_an_attribute_data_type_an_operation_type_and_value_(step, name, type, attributes_number, attribute_type, operation_type, value):
    service, servicepath = world.cep.get_service_and_servicepath()
    world.epl_sentence = world.rules_utils.generate_epl(service, servicepath, name, type, attributes_number,
                                                        attribute_type, operation_type, value)
    world.attributes_number = attributes_number
    world.rule_name = name


@step('set service "([^"]*)" and service path "([^"]*)"')
def set_service_and_subservice(step, service, service_path):
    world.cep.set_service_and_servicepath(service, service_path)





@step('Validate that rule name is created successfully$')
def validate_that_rule_name_is_created_successfully(step):
    assert False, 'This step must be implemented'


@step('delete a EPL rule created')
def delete_a_epl_rule_created(step):
    assert False, 'This step must be implemented'


@step('Validate that all rules are found')
def validate_that_all_rules_are_found(step):
    assert False, 'This step must be implemented'


@step('delete all EPL rules created')
def delete_all_epl_rules_created(step):
    assert False, 'This step must be implemented'


@step('delete a EPL rule created')
def delete_a_epl_rule_created(step):
    assert False, 'This step must be implemented'


@step('Validate that rule name is deleted successfully$')
def validate_that_rule_name_is_deleted_successfully(step):
    assert False, 'This step must be implemented'


@step('Validate that rule name is not deleted')
def validate_that_rule_name_is_not_deleted(step):
    assert False, 'This step must be implemented'


@step('Read the rule name in perseo')
def read_the_rule_name_in_perseo(step):
    assert False, 'This step must be implemented'


@step('Validate that rule name is found')
def validate_that_rule_name_is_found(step):
    assert False, 'This step must be implemented'





@step('read all rules that exist in the list')
def read_all_rules_that_exist_in_the_list(step):
    assert False, 'This step must be implemented'


@step('an identity id "([^"]*)" and an identity type "([^"]*)" with attribute number "([^"]*)", attribute name "([^"]*)" and attribute type "([^"]*)"')
def an_identity_id_group1_and_an_identity_type_group2_with_attribute_number_group3_attribute_name_group4_and_attribute_type_group5(step,
                                                                                                                                   identity_id,
                                                                                                                                   identity_type,
                                                                                                                                   attribute_number,
                                                                                                                                   attribute_name,
                                                                                                                                   attribute_type):

    attributes = [NotificationsUtils.create_attribute(attribute_name, attribute_type, )]


@step('receives a notification with attributes value "([^"]*)", metadata value "([^"]*)" and content "([^"]*)"')
def when_receives_a_notification_with_attributes_value_group1_metadata_value_group2_content_group3(step, group1, group2,
                                                                                                   group3):
    assert False, 'This step must be implemented'


@step('Validate that visual rule is triggered successfully')
def validate_that_visual_rule_is_triggered_successfully(step):
    assert False, 'This step must be implemented'


@step(
    'generate context orion fake with entity id "([^"]*)", entity type "([^"]*)", attribute name "([^"]*)", attribute value "([^"]*)" and attribute type "([^"]*)"')
def generate_context_orion_fake_with_entity_id_group1_entity_type_group2_attribute_name_group3_attribute_value_group4_and_attribute_type_group5(
        step, group1, group2, group3, group4, group5):
    assert False, 'This step must be implemented'


@step('waiting "([^"]*)" seconds to verify orion contexts')
def waiting_group1_seconds_to_verify_orion_contexts(step, group1):
    assert False, 'This step must be implemented'


@step('Validate that visual rule is triggered successfully')
def validate_that_visual_rule_is_triggered_successfully(step):
    assert False, 'This step must be implemented'


@step('delete orion database fake')
def delete_orion_database_fake(step):
    assert False, 'This step must be implemented'


@step(
    'an identity_id "([^"]*)", with attribute number "([^"]*)", attribute name "([^"]*)" and attribute type "([^"]*)"')
def an_identity_id_group1_with_attribute_number_group2_attribute_name_group3_and_attribute_type_group4(step, group1,
                                                                                                       group2, group3,
                                                                                                       group4):
    assert False, 'This step must be implemented'


@step('Validate that EPL rule is triggered successfully')
def validate_that_epl_rule_is_triggered_successfully(step):
    assert False, 'This step must be implemented'


@step('reset counters in mock "([^"]*)"')
def reset_counters_in_mock_group1(step, group1):
    assert False, 'This step must be implemented'


@step('Validate that all EPL rules are triggered successfully')
def validate_that_all_epl_rules_are_triggered_successfully(step):
    assert False, 'This step must be implemented'


@step(' receives a notification with attributes value "([^"]*)", metadata value "([^"]*)" and content "([^"]*)"')
def when_receives_a_notification_with_attributes_value_group1_metadata_value_group2_content_group3(step, group1, group2,
                                                                                                   group3):
    assert False, 'This step must be implemented'



