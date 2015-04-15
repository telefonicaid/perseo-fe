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
__author__ = 'Jon Calderín Goñi (jon.caldering@gmail.com)'

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


@step(u'configured with tenant "([^"]*)" and service "([^"]*)"')
def configured_with_tenant_and_service(step, tenant, service_path):
    """
    configure the tenant and servicePath used
    :param step:
    :param tenant:
    :param servicePath:
    """
    world.cep_requests.config_tenant_and_service(tenant, service_path)


@step(u'an EPL with a rule name "([^"]*)", an identity type "([^"]*)", an attributes Number "([^"]*)", an attribute data type "([^"]*)", an operation type "([^"]*)" and value "([^"]*)"')
def a_EPL_with_a_rule_name_an_identity_Id_an_attribute_type_attributes_Number_an_operation_type_and_value(step,
                                                                                                          rule_name,
                                                                                                          identity_type,
                                                                                                          attributes_number,
                                                                                                          attribute_type,
                                                                                                          operation,
                                                                                                          value):
    """
    generate a EPL query dinamically.genera
    :param step:
    :param rule_name:
    :param identity_type:
    :param attribute_type:
    :param attributes_number:
    :param operation:
    :param value:
    """
    world.rule_name = rule_name
    world.EPL = world.cep_requests.generate_EPL(rule_name, identity_type, attributes_number, attribute_type, operation,
                                                value)


@step(u'append a new rule with a rule type "([^"]*)", a template "([^"]*)" and a parameters "([^"]*)"')
def append_a_new_rule_with_a_rule_type_a_template_and_a_parameters(step, rule_type, template_info, parameters):
    """
    Create a new rule
    :param template_info:
    :param step:
    :param rule_type: (SMS, email, update, twitter)
    :param template: additional info to template
    :param parameters: several parameters according to the type of rule
    """
    parameters = world.cep_requests.set_rule_type_and_parameters(rule_type, parameters)
    world.rules.create_epl_rule(rule_type, template_info, parameters, world.EPL)


@step(u'an identity_id "([^"]*)", with attribute number "([^"]*)", attribute name "([^"]*)" and attribute type "([^"]*)"')
def a_tenant_service_path_resource_with_attribute_number_and_attribute_name(step, identity_id, attribute_number,
                                                                            attributes_name, attribute_type):
    """
    configuration to notifications
    :param step:
    :param identity_id:
    :param attribute_number:
    :param attributes_name:
    :param attribute_type:
    """
    world.cep_requests.notif_configuration(identity_id=identity_id, attribute_number=attribute_number,
                                           attributes_name=attributes_name, attribute_type=attribute_type)


@step(u'receives a notification with attributes value "([^"]*)", metadata value "([^"]*)" and content "([^"]*)"')
def receives_a_notification_with_attributes_value_metadata_value_and_content(step, attribute_value, metadata_value,
                                                                             content):
    """
    store notification values in ckan
    :param step:
    :param attribute_value:
    :param metadata_value:
    :param content:
    """
    world.resp = world.cep_requests.received_notification(attribute_value, metadata_value, content)


@step(u'reset counters in mock "([^"]*)"')
def reset_counters_in_mock(step, rule_type):
    """
    reset counters (sms, email, update
    :param rule_type:
    :param step:
    """
    world.mock.reset_counters(rule_type)


@step(u'create "([^"]*)" rules with prefix "([^"]*)" and "([^"]*)" type')
def create_rules_with_type(step, rule_number, prefix_name, rule_type):
    """
    Create N rules with a rule type
    :param prefix_name:
    :param step:
    :param rule_number:
    :param rule_type:
    """
    world.prefix_name = prefix_name
    parameters = world.cep_requests.set_rule_type_and_parameters(rule_type)
    world.rules.create_several_epl_rules(prefix_name, rule_number, rule_type, parameters)


@step(u'delete a EPL rule created')
def delete_a_rule_created(step):
    """
    delete a rule in rule manager
    :param step:
    """
    world.rules.delete_one_rule("EPL")


@step(u'delete all EPL rules created')
def delete_group_rules_created(step):
    """
   delete rules group
    :param step:
    """
    world.rules.delete_rules_group("EPL", world.prefix_name)


@step(u'Validate that EPL rule is triggered successfully')
def validate_that_rule_is_triggered_successfully(step):
    """
    Validate that rule is triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_rule_was_triggered("EPL")


@step(u'Validate that all EPL rules are triggered successfully')
def validate_that_all_rule_are_triggered_successfully(step):
    """
    Validate that all rules were triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_all_rule_were_triggered("EPL")


@step(u'delete a visual rule created')
def delete_a_rule_created(step):
    """
    delete a rule in rule manager
    :param step:
    """
    world.rules.delete_one_rule("visual_rules")


@step(u'delete orion database fake')
def delete_orion_database_fake(step):
    """
    delete the database fake to simulate orion database
    """
    world.cep_orion_mongo.drop_database()
    world.cep_orion_mongo.disconnect()


@step(u'create a sensor card of notUpdated type with id "([^"]*)", verify interval "([^"]*)", attribute name "([^"]*)", max time without update "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_notUpdated_type_connect_to_and_parameter_value(step, sc_id_card, interval, attribute_name,
                                                                           max_time_update, sc_connect_to):
    """
    create a new not updated card
    :param step:
    :param sc_id_card:
    :param interval:
    :param attribute_name:
    :param max_time_update:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="notUpdated", id=sc_id_card, interval=interval,
                                   measureName=attribute_name, parameterValue=max_time_update,
                                   connectedTo=sc_connect_to)


@step(u'create a sensor card of id type, with id "([^"]*)", identity id "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_connect_to_and_parameter_value(step, sc_id_card, identity_id, sc_connect_to):
    """
    create a new id card
    :param step:
    :param sc_id_card:
    :param identity_id:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="regexp", id=sc_id_card, parameterValue=identity_id,
                                   connectedTo=sc_connect_to)


@step(u'create a sensor card of type type, with "([^"]*)", identity type "([^"]*)",operator "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_id_type_connect_to_and_parameter_value(step, sc_id_card, identity_type, operator,
                                                                   sc_connect_to):
    """
    create a new type card
    :param step:
    :param sc_id_card:
    :param identity_type:
    :param operator:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="type", id=sc_id_card, parameterValue=identity_type,
                                   operator=operator, connectedTo=sc_connect_to)


@step(u'create a sensor card of value threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", parameter value "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value(step,
                                                                                                        sc_id_card,
                                                                                                        attribute_name,
                                                                                                        operator,
                                                                                                        data_type,
                                                                                                        parameter_value,
                                                                                                        sc_connect_to):
    """
    create a new value threshold card
    :param step:
    :param sc_id_card:
    :param attribute_name:
    :param operator:
    :param data_type:
    :param parameter_value:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="valueThreshold", id=sc_id_card, measureName=attribute_name,
                                   operator=operator, dataType=data_type, parameterValue=parameter_value,
                                   connectedTo=sc_connect_to)


@step(u'create a sensor card of attribute threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", attribute to refer "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value(step,
                                                                                                        sc_id_card,
                                                                                                        attribute_name,
                                                                                                        operator,
                                                                                                        data_type,
                                                                                                        attribute_to_refer,
                                                                                                        sc_connect_to):
    """
    create a new attribute threshold card
    :param step:
    :param sc_id_card:
    :param attribute_name:
    :param operator:
    :param data_type:
    :param attribute_to_refer:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="attributeThreshold", id=sc_id_card, measureName=attribute_name,
                                   operator=operator, dataType=data_type, parameterValue=attribute_to_refer,
                                   connectedTo=sc_connect_to)


@step(u'create a sensor card of epl type with id "([^"]*)", epl query "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_epl_type_with_id_epl_query_and_connect_to(step, sc_id_card, epl_query, sc_connect_to):
    """
     create a new epl card
    :param step:
    :param sc_id_card:
    :param epl_query:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="ceprule", id=sc_id_card, parameterValue=epl_query,
                                   connectedTo=sc_connect_to)


@step(u'create a action card of "([^"]*)" type, with id "([^"]*)", response "([^"]*)", parameters "([^"]*)" and connect to "([^"]*)"')
def create_a_action_card_of_type_connect_to_a_response_and_a_parameters_(step, ac_card_type, ac_id_card, response,
                                                                         parameters, connected_to):
    """
    create a new action card
    :param step:
    :param ac_card_type:
    :param ac_id_card:
    :param response:
    :param parameters:
    :param connected_to:
    """
    world.cep_requests.set_action_card_config(ac_card_type, response, parameters)
    world.rules.create_action_card(id=ac_id_card, actionCardType=ac_card_type, connectedTo=connected_to,
                                   response=response, parameters=parameters)


@step(u'append a new rule name "([^"]*)", activate "([^"]*)"')
def append_a_new_rule_name_activate(step, rule_name, active):
    """
    create a new card rule
    :param step:
    :param rule_name: rule name
    :param active: if is active or not (0 | 1)
    """
    world.cep_requests.new_visual_rule(rule_name, active)


@step(u'create visual rules "([^"]*)" with prefix "([^"]*)", sensor cards and an action card "([^"]*)"')
def create_visual_rules_with_sensor_cards_and_an_action_card(step, rule_number, prefix, action_card_type):
    """
    Create N visual rules with N sensor cards and an action card
    :param prefix: prefix used in rule name
    :param step: append sensor cards into the visual rule, the format of the table is:
                 | sensorCardType |
                  values allowed: notUpdated, regexp, type, valueThreshold, attributeThreshold or ceprule
    :param rule_number: number of visual rules created
    :param action_card_type: action card used in all visual rules
    """
    world.prefix_name = prefix
    world.rules.create_several_visual_rules(step, rule_number, prefix, action_card_type)


@step(u'generate context orion fake with entity id "([^"]*)", entity type "([^"]*)", attribute name "([^"]*)", attribute value "([^"]*)" and attribute type "([^"]*)"')
def generate_context_orion_fake_with_entity_id_entity_type_attribute_name_attribute_value_and_attribute_type(step,
                                                                                                             entity_id,
                                                                                                             entity_type,
                                                                                                             attribute_name,
                                                                                                             attribute_value,
                                                                                                             attribute_type):
    """
    generate context fake in cep mongo that is used in not updated card (no-signal)
    :param step:
    :param entity_id:
    :param entity_type:
    :param attribute_name:
    :param attribute_value:
    :param attribute_type:
    """
    # change current database name to the database name by default (see properties.json) + "_" + current tenant ex: "orion" to "orion-my_tenant"
    database = world.config['MongoOrion']['mongo_database'] + "-" + world.cep_requests.get_tenant()
    world.cep_orion_mongo.choice_database(database)
    world.cep_orion_mongo.connect()
    world.rules.generate_context_fake_in_cep_mongo(world.cep_orion_mongo, entity_id, entity_type,
                                                   world.cep_requests.get_service_path(), attribute_name,
                                                   attribute_value, attribute_type)


@step(u'waiting "([^"]*)" seconds to verify orion contexts')
def waiting_seconds_to_verify_orion_contexts(step, time):
    """
    waiting N seconds after validate if the rule is triggered
    :param step:
    :param time: seconds
    """
    world.cep_requests.delays_seconds(time)


@step(u'an identity id "([^"]*)" and an identity type "([^"]*)" with attribute number "([^"]*)", attribute name "([^"]*)" and attribute type "([^"]*)"')
def an_identity_id_and_an_identity_type_with_attribute_number_attribute_name_and_attribute_type(step, identity_id,
                                                                                                identity_type,
                                                                                                attribute_number,
                                                                                                attributes_name,
                                                                                                attribute_type):
    """
    configuration to notifications
    :param step:
    :param identity_id:
    :param identity_type:
    :param attribute_number:
    :param attributes_name:
    :param attribute_type:
    """
    world.cep_requests.notif_configuration(identity_id=identity_id, identity_type=identity_type,
                                           attribute_number=attribute_number, attributes_name=attributes_name,
                                           attribute_type=attribute_type)


@step(u'I receive an "([^"]*)" http code$')
def i_receive_an_http_code(step, expected_status_code):
    """
    validate http code in response
    :param step:
    :param expected_status_code:
    :param httpCode:  http code for validate
    """
    world.cep_requests.validate_HTTP_code(expected_status_code, world.resp)


@step(u'Validate that visual rule is triggered successfully')
def validate_that_rule_is_triggered_successfully(step):
    """
    Validate that rule is triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_rule_was_triggered("visual_rules")


@step(u'Validate that all visual rules are triggered successfully')
def validate_that_all_rule_are_triggered_successfully(step):
    """
    Validate that all rules were triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_all_rule_were_triggered("visual_rules")


@step('Read the rule name in perseo')
def read_the_rule_name_in_perseo(step):
    """
   Read the rule name in perseo
    :param step:
    """
    world.rules.read_a_rule_name(world.rule_name)


@step(u'read all rules that exist in the list')
def read_all_rules_that_exist_in_the_list(step):
    """
    read all rules that exist in the list
    """
    world.rules.read_a_rules_list()



@step(u'I receive an "([^"]*)" http code in rules request')
def i_receive_an_http_code_in_rules_request(step, httpCode):
    """
    validate http code in response
    :param httpCode:  http code for validate
    """
    world.rules.validate_HTTP_code(httpCode)


@step(u'Validate that rule name is created successfully$')
def validate_that_rule_name_is_created_successfully(step):
    """
    Validate that rule name is created successfully
    :param step:
    """
    if world.operation == "append":
        world.rules.validate_rule_response()


@step(u'Validate that rule name is deleted successfully$')
def validate_that_rule_name_is_deleted_successfully(step):
    """
    validate that the rule is deleted
    :param step:
    """
    world.rules.validate_delete_rule()


@step(u'Validate that rule name is not deleted')
def validate_that_rule_name_is_deleted_successfully(step):
    """
    validate that the rule is deleted
    :param step:
    """
    world.rules.validate_delete_rule(0)


@step(u'Validate that rule name is found')
def validate_that_rule_name_exists_in_perseo(step):
    """
     Validate that rule name exists in perseo
    :param step:
    """
    world.rules.validate_get_a_rule()


@step(u'Validate that all rules are found')
def validate_that_all_rules_are_found(step):
    """
    Validate that all rules are found
    :param step:
    """
    world.rules.validate_all_rules()


@step(u'And create a sensor card of value threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", parameter value "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value(step,
                                                                                                        sc_id_card,
                                                                                                        attribute_name,
                                                                                                        operator,
                                                                                                        data_type,
                                                                                                        parameter_value,
                                                                                                        sc_connect_to):
    """
    create a new value threshold card
    :param step:
    :param sc_id_card:
    :param attribute_name:
    :param operator:
    :param data_type:
    :param parameter_value:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="valueThreshold", id=sc_id_card, measureName=attribute_name,
                                   operator=operator, dataType=data_type, parameterValue=parameter_value,
                                   connectedTo=sc_connect_to)


@step(u'And create a sensor card of attribute threshold type, with id "([^"]*)", attribute name "([^"]*)", operator "([^"]*)", data type "([^"]*)", attribute to refer "([^"]*)" and connect to "([^"]*)"')
def create_a_sensor_card_of_value_threshold_type_connect_to_operator_attribute_name_and_parameter_value(step,
                                                                                                        sc_id_card,
                                                                                                        attribute_name,
                                                                                                        operator,
                                                                                                        data_type,
                                                                                                        attribute_to_refer,
                                                                                                        sc_connect_to):
    """
    create a new attribute threshold card
    :param step:
    :param sc_id_card:
    :param attribute_name:
    :param operator:
    :param data_type:
    :param attribute_to_refer:
    :param sc_connect_to:
    """
    world.rules.create_sensor_card(sensorCardType="attributeThreshold", id=sc_id_card, measureName=attribute_name,
                                   operator=operator, dataType=data_type, parameterValue=attribute_to_refer,
                                   connectedTo=sc_connect_to)


@step(u'create a time card of time elapsed type, with id "([^"]*)", interval "([^"]*)" and connect to "([^"]*)"')
def create_a_time_card_of_time_elapsed_type_with_id_interval_and_connect_to(step, tc_id_card, interval, connected_to):
    """


    :param step:
    :param tc_id_card:
    :param interval:
    :param connected_to:
    """
    world.rules.create_time_card(id=tc_id_card, timeCardType="timeElapsed", interval=interval, connectedTo=connected_to)


@step(u'read all rules')
def get_all_rules(step):
    """
    get all visual rules stored
    :param step:
    """
    world.rules.get_all_visual_rules()


@step(u'read a visual rule in perseo')
def read_a_visual_rule_in_perseo(step):
    """
    get only one visual rule in perseo
    :param step:
    """
    world.rules.get_one_visual_rules()


@step(u'rule name "([^"]*)" to try to delete but it does not exists')
def rule_name_to_try_to_delete_but_it_does_not_exists(step, name):
    """
    rule name to try to delete but it does not exists
    :param step:
    :param name: this name does not exists
    """
    world.rules.rule_name_to_try_to_delete_but_it_does_not_exists(name)


@step(u'update a visual rule "([^"]*)"')
def update_a_visual_rule(step, rule_name):
    """
    update a visual rule existent
    :param step:
    :param rule_name: rule name existent
    """
    world.rules.update_a_visual_rule(rule_name)


@step(u'delete all visual rules created')
def delete_group_rules_created(step):
    """
   delete rules group
    :param step:
    """
    world.rules.delete_rules_group("visual_rules", world.prefix_name)


@step(u'Validate that rule name is created successfully in db')
def validate_that_rule_name_is_created_successfully_in_db(step):
    """
    Validate that card rule is created successfully in db
    """
    world.rules.validate_card_rule_in_mongo(world.cep_mongo)


@step(u'Validate that rule name is deleted successfully in db')
def validate_that_rule_name_is_deleted_successfully(step):
    """
    Validate that card rule is deleted successfully in db
    """
    world.rules.card_rule_does_not_exists_in_mongo(world.cep_mongo)


@step(u'validate that all visual rules are returned')
def validate_that_all_visual_rules_are_returned(step):
    """
    validate that all visual rules are returned
    :param step:
    """
    world.rules.validate_that_all_visual_rules_are_returned()