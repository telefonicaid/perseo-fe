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


from lettuce import world, after, before
import time
from tools.cep import CEP
import tools.general_utils


@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.test_time_init = time.strftime("%c")


@before.each_scenario
def before_each_scenario(scenario):
    """
    actions before each scenario
    :param scenario:
    """
    world.cep_requests = CEP(world.config['CEP']['cep_url'],
                             send_sms_url = world.config['CEP']['cep_send_sms_url'],
                             send_email_url = world.config['CEP']['cep_send_email_url'],
                             send_update_url = world.config['CEP']['cep_send_update_url'],
                             rule_post_url = world.config['CEP']['cep_rule_post_url'],
                             version = world.config['CEP']['cep_version'],
                             rule_name_default = world.config['CEP']['cep_rule_name_default'],
                             tenant_default = world.config['CEP']['cep_tenant_default'],
                             service_path_default = world.config['CEP']['cep_service_path_default'],
                             identity_type_default = world.config['CEP']['cep_identity_type'],
                             identity_id_default = world.config['CEP']['cep_identity_id'],
                             attribute_number_default = world.config['CEP']['cep_attribute_number_default'],
                             rules_number_default = int(world.config['CEP']['cep_rules_number_default']),
                             epl_attribute_data_type = world.config['CEP']['cep_epl_attribute_data_type'],
                             epl_operation = world.config['CEP']['cep_epl_operation'],
                             epl_value = world.config['CEP']['cep_epl_value'],
                             card_active = world.config['CEP']['cep_card_active'],
                             retries_number = world.config['CEP']['cep_retries_received_in_mock'],
                             retry_delay = world.config['CEP']['cep_delay_to_retry']
    )


@after.each_scenario
def after_each_scenario(scenario):
    """
    actions after each scenario
    :param scenario:
    """
    pass

@after.all
def after_all_scenarios(scenario):
    """
    Actions after all scenarios
    Show the initial and final time of the tests completed
    :param scenario:
    """
    tools.general_utils.show_times(world.test_time_init)

