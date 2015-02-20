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

from lettuce import world, step

@step(u'Perseo manager is installed correctly to "([^"]*)"')
def cep_manager_is_installed_correctly(step, operation):
    """
    verify if CEP is installed correctly
    :param operation: operation type (append, delete, etc)
    :param step:
    """
    world.operation = operation
    world.cep_requests.verify_CEP()

@step (u'configured with tenant "([^"]*)" and service "([^"]*)"')
def configured_with_tenant_and_service (self, tenant, service_path):
    """
    configure the tenant and servicePath used
    :param self:
    :param tenant:
    :param servicePath:
    """
    world.cep_requests.config_tenant_and_service(tenant, service_path)

@step (u'create a sensor card of notUpdated type with id "([^"]*)", verify interval "([^"]*)", attribute name "([^"]*)", max time without update "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_notUpdated_type_connect_to_and_parameter_value (step, sc_id_card, interval, attribute_name, max_time_update, sc_connect_to):
    """
    create a new not updated card
    """
    world.rules.create_sensor_card (sensorCardType="notUpdated", id=sc_id_card, interval=interval, measureName=attribute_name, parameterValue=max_time_update, connectedTo=sc_connect_to)

@step (u'create a sensor card of id type, with id "([^"]*)", identity id "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_connect_to_and_parameter_value (step, sc_id_card,  identity_id, sc_connect_to):
    """
    create a new id card
    """
    world.rules.create_sensor_card (sensorCardType="regexp", id=sc_id_card, parameterValue=identity_id, connectedTo=sc_connect_to)

@step (u'create a sensor card of type type, with "([^"]*)", identity type "([^"]*)",operator "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_connect_to_and_parameter_value (step, sc_id_card, identity_type, operator, sc_connect_to):
    """
    create a new type card
    """
    world.rules.create_sensor_card (sensorCardType="type", id=sc_id_card, parameterValue=identity_type, operator=operator, connectedTo=sc_connect_to)

@step (u'And create a sensor card of value threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", parameter value "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value (step, sc_id_card, attribute_name, operator, data_type, parameter_value, sc_connect_to):
    """
    create a new value threshold card
    """
    world.rules.create_sensor_card (sensorCardType="valueThreshold", id=sc_id_card,  measureName=attribute_name, operator=operator, dataType=data_type, parameterValue=parameter_value,  connectedTo=sc_connect_to)

@step (u'And create a sensor card of attribute threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", attribute to refer "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value (step, sc_id_card, attribute_name, operator, data_type, attribute_to_refer, sc_connect_to):
    """
    create a new attribute threshold card
    """
    world.rules.create_sensor_card (sensorCardType="attributeThreshold", id=sc_id_card,  measureName=attribute_name, operator=operator, dataType=data_type, parameterValue=attribute_to_refer,  connectedTo=sc_connect_to)

@step (u'create a sensor card of epl type with id "([^"]*)", epl query "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_epl_type_with_id_epl_query_and_connect_to (step, sc_id_card, epl_query, sc_connect_to):
     """
      create a new epl card
     """
     world.rules.create_sensor_card (sensorCardType="ceprule", id=sc_id_card,  parameterValue=epl_query,  connectedTo=sc_connect_to)

@step (u'create a action card of "([^"]*)" type, with id "([^"]*)", response "([^"]*)", parameters "([^"]*)" and connect to "([^"]*)"')
def create_a_action_card_of_type_connect_to_a_response_and_a_parameters_ (step, ac_card_type, ac_id_card, response, parameters, connected_to):
    """
    create a new action card
    """
    world.rules.create_action_card (id=ac_id_card, actionCardType=ac_card_type, connectedTo=connected_to, response=response, parameters=parameters)

@step (u'create a time card of time elapsed type, with id "([^"]*)", interval "([^"]*)" and connect to "([^"]*)"')
def create_a_time_card_of_time_elapsed_type_with_id_interval_and_connect_to (step, tc_id_card, interval, connected_to):
    world.rules.create_time_card (id=tc_id_card, timeCardType="timeElapsed", interval=interval, connectedTo=connected_to)

@step (u'append a new rule name "([^"]*)", activate "([^"]*)"')
def append_a_new_rule_name_activate (step, rule_name, active):
    """
    create a new card rule
    :param step:
    :param rule_name: rule name
    :param active: if is active or not (0 | 1)
    """
    world.card_rule = world.cep_requests.new_visual_rule (rule_name, active)

@step (u'create visual rules "([^"]*)" with prefix "([^"]*)", sensor cards and an action card "([^"]*)"')
def create_visual_rules_with_sensor_cards_and_an_action_card (step, rule_number, prefix, action_card_type):
    """
    Create N visual rules with N sensor cards and an action card
    :param step: append sensor cards into the visual rule, the format of the table is:
                 | sensorCardType |
                  values allowed: notUpdated, regexp, type, valueThreshold, attributeThreshold or ceprule
    :param rule_number: number of visual rules created
    :param action_card_type: action card used in all visual rules
    """
    world.prefix_name = prefix
    world.rules.create_several_visual_rules(step, rule_number, prefix, action_card_type)

@step (u'read all rules')
def get_all_rules (step):
    """
    get all visual rules stored
    :param step:
    """
    world.rules.get_all_visual_rules()

@step (u'read a visual rule in perseo')
def read_a_visual_rule_in_perseo (step):
    """
    get only one visual rule in perseo
    :param step:
    """
    world.rules.get_one_visual_rules()

@step (u'rule name "([^"]*)" to try to delete but it does not exists')
def rule_name_to_try_to_delete_but_it_does_not_exists (step, name):
    """
    rule name to try to delete but it does not exists
    :param step:
    :param name: this name does not exists
    """
    world.rules.rule_name_to_try_to_delete_but_it_does_not_exists(name)
    pass
#----------------------------------------------------------------------------------------
@step(u'I receive an "([^"]*)" http code')
def i_receive_an_http_code (step, httpCode):
    """
    validate http code in response
    :param httpCode:  http code for validate
    """
    world.rules.validate_HTTP_code(httpCode)


@step (u'delete a rule created')
def delete_a_rule_created(step):
    """
    delete a rule in rule manager
    :param step:
    """
    world.rules.delete_one_rule("visual_rules")

@step (u'delete all rules created')
def delete_group_rules_created (step):
     """
    delete rules group
     :param step:
     """
     world.rules.delete_rules_group("visual_rules", world.prefix_name)

@step (u'Validate that rule name is created successfully in db')
def validate_that_rule_name_is_created_successfully_in_db (step):
    """
    Validate that card rule is created successfully in db
    """
    world.rules.validate_card_rule_in_mongo(world.cep_mongo)

@step (u'Validate that rule name is deleted successfully in db')
def validate_that_rule_name_is_deleted_successfully (step):
    """
    Validate that card rule is deleted successfully in db
    """
    world.rules.card_rule_does_not_exists_in_mongo(world.cep_mongo)

@step (u'validate that all visual rules are returned')
def validate_that_all_visual_rules_are_returned (step):
     """
     validate that all visual rules are returned
     :param step:
     """
     world.rules.validate_that_all_visual_rules_are_returned()