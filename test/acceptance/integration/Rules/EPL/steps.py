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
def configured_with_tenant_and_service (step, tenant, service_path):
    """
    congfigure the tenant and servicePath used
    :param step:
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

@step (u'create "([^"]*)" rules with prefix "([^"]*)" and "([^"]*)" type')
def create_rules_with_type (step, rule_number, prefix_name, rule_type):
    """
    Create N rules with a rule type
    :param prefix_name:
    :param step:
    :param rule_number:
    :param rule_type:
    """
    world.prefix_name=prefix_name
    world.rules.create_several_epl_rules (prefix_name, rule_number, rule_type)

@step ('Read the rule name in perseo')
def read_the_rule_name_in_perseo (step):
     """
    Read the rule name in perseo
     :param step:
     """
     world.rules.read_a_rule_name(world.rule_name)

@step (u'read all rules that exist in the list')
def read_all_rules_that_exist_in_the_list (step):
    """
    read all rules that exist in the list
    """
    world.rules.read_a_rules_list()

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
def i_receive_an_http_code (step, httpCode):
    """
    validate http code in response
    :param httpCode:  http code for validate
    """
    world.rules.validate_HTTP_code(httpCode)

@step (u'Validate that rule name is created successfully')
def validate_that_rule_name_is_created_successfully (step):
    """
    Validate that rule name is created successfully
    :param step:
    """
    if world.operation == "append":
        world.rules.validate_rule_response()

@step (u'Validate that rule name is deleted successfully')
def validate_that_rule_name_is_deleted_successfully (step):
    """
    validate that the rule is deleted
    :param step:
    """
    world.rules.validate_delete_rule()

@step (u'Validate that rule name is not deleted')
def validate_that_rule_name_is_deleted_successfully (step):
    """
    validate that the rule is deleted
    :param step:
    """
    world.rules.validate_delete_rule(0)


@step (u'Validate that rule name is found')
def validate_that_rule_name_exists_in_perseo (step):
    """
     Validate that rule name exists in perseo
    :param step:
    """
    world.rules.validate_get_a_rule()

@step (u'Validate that all rules are found')
def validate_that_all_rules_are_found (step):
    """
    Validate that all rules are found
    :param step:
    """
    world.rules.validate_all_rules()


