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

@step(u'an EPL with a rule name "([^"]*)", an identity type "([^"]*)", an attributes Number "([^"]*)", an attribute data type "([^"]*)", an operation type "([^"]*)" and value "([^"]*)"')
def a_EPL_with_a_rule_name_an_identity_Id_an_attribute_type_attributes_Number_an_operation_type_and_value (step, rule_name, identity_type, attributes_number, attribute_type, operation, value):
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
    world.EPL = world.cep_requests.generate_EPL (rule_name, identity_type, attributes_number, attribute_type, operation, value)

@step (u'append a new rule with a rule type "([^"]*)", a template "([^"]*)" and a parameters "([^"]*)"')
def append_a_new_rule_with_a_rule_type_a_template_and_a_parameters (step, rule_type, template_info, parameters):
    """
    Create a new rule
    :param step:
    :param rule_type: (SMS, email, update, twitter)
    :param template: additional info to template
    :param parameters: several parameters according to the type of rule
    """
    parameters = world.cep_requests.set_rule_type_and_parameters(rule_type, parameters)
    world.rules.create_epl_rule (rule_type, template_info, parameters, world.EPL)

@step (u'an identity_id "([^"]*)", with attribute number "([^"]*)", attribute name "([^"]*)" and attribute type "([^"]*)"')
def a_tenant_service_path_resource_with_attribute_number_and_attribute_name (step, identity_id, attribute_number, attribute_name, attribute_type):
    """
    send a notification
    """
    world.cep_requests.notif_configuration(identity_id, attribute_number, attribute_name, attribute_type)

@step (u'receives a notification with attributes value "([^"]*)", metadata value "([^"]*)" and content "([^"]*)"')
def receives_a_notification_with_attributes_value_metadata_value_and_content (step, attribute_value, metadata_value, content):
    """
    store notification values in ckan
    """
    world.resp = world.cep_requests.received_notification(attribute_value, metadata_value, content)

@step (u'reset counters in mock "([^"]*)"')
def reset_counters_in_mock (step, rule_type):
    """
    reset counters (sms, email, update
    :param step:
    """
    world.mock.reset_counters(rule_type)

@step (u'create "([^"]*)" rules with prefix "([^"]*)" and "([^"]*)" type')
def create_rules_with_type (step, rule_number, prefix_name, rule_type):
    """
    Create N rules with a rule type
    :param step:
    :param rule_number:
    :param rule_type:
    """
    world.prefix_name=prefix_name
    world.cep_requests.set_rule_type_and_parameters(rule_type)
    world.rules.create_several_epl_rules (prefix_name, rule_number, rule_type)

@step (u'create "([^"]*)" rules with "([^"]*)" type')
def create_rules_with_type (step, rule_number,  rule_type):
    """
    Create N rules with a rule type
    :param step:
    :param rule_number:
    :param rule_type:
    """
    world.rules.create_several_epl_rules (rule_number, rule_type)

@step (u'delete a rule created')
def delete_a_rule_created(step):
    """
    delete a rule in rule manager
    :param step:
    """
    world.rules.delete_one_rule("EPL")

@step (u'delete all rules created')
def delete_group_rules_created (step):
     """
    delete rules group
     :param step:
     """
     world.rules.delete_rules_group("EPL", world.prefix_name)

#----------------------------------------------------------------------------------------
@step(u'I receive an "([^"]*)" http code')
def i_receive_an_http_code (step, expected_status_code):
    """
    validate http code in response
    :param httpCode:  http code for validate
    """
    world.cep_requests.validate_HTTP_code(expected_status_code, world.resp)

@step (u'Validate that rule is triggered successfully')
def validate_that_rule_is_triggered_successfully (step):
    """
    Validate that rule is triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_rule_was_triggered()

@step (u'Validate that all rules are triggered successfully')
def validate_that_all_rule_are_triggered_successfully (step):
    """
    Validate that all rules were triggered successfully
    :param step:
    """
    world.cep_requests.validate_that_all_rule_were_triggered()


