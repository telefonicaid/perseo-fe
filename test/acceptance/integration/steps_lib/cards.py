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


@step('a Not Updated sensor card')
def a_not_updated_sensor_card(step):
    """
      | id     | interval | attribute_name | max_time_without_update | connected_to |
      | card_1 | 45       | temperature    | 10                      | card_2       |
    :param step:
    :return:
    """
    error_msg = """
      | id     | interval | attribute_name | max_time_without_update | connected_to |
      | card_1 | 45       | temperature    | 10                      | card_2       |
    """
    assert len(step.hashes) >= 1, 'The minimum hashes are 1, with the format: \n {error_msg}'.format(
        error_msg=error_msg)
    for row in step.hashes:
        world.cards.append(world.cards_utils.create_sensor_not_updated_card(row['id'], [row['connected_to']],
                                                                            row['max_time_without_update'],
                                                                            row['interval'], row['attribute_name']))


@step('create a sensor card of notUpdated type with id "([^"]*)", verify interval "([^"]*)", attribute name "([^"]*)", max time without update "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_notupdated_type_with_id_verify_interval_attribute_name_max_time_without_update_and_connect_to(step, id, interval, attribute_name, max_time, connected_to):
    world.cards.append(world.cards_utils.create_sensor_not_updated_card(id, [connected_to], max_time, interval, attribute_name))


@step('create a sensor card of id type, with id "([^"]*)", identity id "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_with_id_group1_identity_id_group2_and_connect_to_group3(step, id, identity_id, connected_to):
    world.cards.append(world.cards_utils.create_sensor_regex_card(id, [connected_to], identity_id))


@step('create a sensor card of type type, with "([^"]*)", identity type "([^"]*)",operator "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_type_type_with_group1_identity_type_group2_operator_group3_and_connect_to_group4(step, id, identity_id, operator, connected_to):
    world.cards.append(world.cards_utils.create_sensor_type_card(id, [connected_to], operator, identity_id))


@step('create a sensor card of value threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", parameter value "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_with_id_group1_attribute_name_group2_operator_group3_data_type_group4_parameter_value_group5_and_connect_to_group6(step, id, attribute_name, operator, data_type, parameter_value, connected_to):
    world.cards.append(world.cards_utils.create_sensor_threshold_card(id, [connected_to], operator, parameter_value, attribute_name, data_type))


@step('create a sensor card of attribute threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", attribute to refer "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_attribute_threshold_type_with_id_group1_attribute_name_group2_operator_group3_data_type_group4_attribute_to_refer_group5_and_connect_to_group6(step, id, attribute_name, operator, data_type, attribute_to_refer, connected_to):
    world.cards.append(world.cards_utils.create_sensor_attribute_threshold_card(id, [connected_to], operator, attribute_to_refer, attribute_name, data_type))


@step('create a sensor card of epl type with id "([^"]*)", epl query "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_epl_type_with_id_group1_epl_query_group2_and_connect_to_group3(step, id, epl_query, connected_to):
    world.cards.append(world.cards_utils.create_sensor_cep_epl_card(id, [connected_to], epl_query))


@step('create a action card of "([^"]*)" type, with id "([^"]*)", response "([^"]*)", parameters "([^"]*)" and connect to "([^"]*)"')
def create_a_action_card_of_group1_type_with_id_group2_response_group3_parameters_group4_and_connect_to_group5(step, action_type,id,mock_response,parameters,connected_to):
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

@step('create a sms action card with id "([^"]*)" text "([^"]*)" telephone number "([^"]*)" and connected to "([^"]*)"')
def create_a_sms_action_card_with_id_text_number_and_connected_to(step, card_id, sms_text, telephone_number, connected_to):
    """
    Create a sms action card (json) and append it to the card list
    :param step:
    :param card_id:
    :param sms_text:
    :param telephone_number:
    :param connected_to:
    :return:
    """
    world.cards.append(world.cards_utils.create_action_sms_card(card_id, card_id, [connected_to], telephone_number, sms_text))

@step('create an email action card with id "([^"]*)" from "([^"]*)" to "([^"]*)" subject "([^"]*)" body "([^"]*)" and connected to "([^"]*)"')
def create_an_email_action_card_with_id_text_number_and_connected_to(step, card_id, from_, to, subject, body, connected_to):
    """
    Create an email action card (json) and append it to the card list
    :param step:
    :param card_id:
    :param sms_text:
    :param telephone_number:
    :param connected_to:
    :return:
    """
    world.cards.append(world.cards_utils.create_action_email_card(card_id, card_id, [connected_to], from_, to, subject, body))

@step('create an update action card with id "([^"]*)" for attribute "([^"]*)" value "([^"]*)" and connected to "([^"]*)"')
def create_an_update_action_card_with_id_text_number_and_connected_to(step, card_id, attribute, value, connected_to):
    """
    Create an update action card (json) and append it to the card list
    :param step:
    :param card_id:
    :param sms_text:
    :param telephone_number:
    :param connected_to:
    :return:
    """
    world.cards.append(world.cards_utils.create_action_update_card(card_id, card_id, [connected_to], attribute, value))



@step('create a time card of time elapsed type, with id "([^"]*)", interval "([^"]*)" and connect to "([^"]*)"')
def create_a_time_card_of_time_elapsed_type_with_id_group1_interval_group2_and_connect_to_group3(step, id, interval,
                                                                                                 connected_to):
    world.cards.append(world.cards_utils.create_time_enlapsed_card(id, [connected_to], interval))