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
__author__ = 'Jon Calderin Goñi <jon.caldering@gmail.com>'

import time
from tools.cep2 import Cep
import tools.general_utils
from tools.rules_utils_2 import CardsUtils, RulesUtils
from tools.mock_utils2 import Mock
from lettuce import world, after, before
from iotqautils.iotqaLogger import get_logger



@before.all
def before_all_scenarios():
    """
    Actions before all scenarios
    Get the initial time at start the tests
    """
    world.test_time_init = time.strftime("%c")
    # Remove lettuce log file
    # file = open('logs/lettuce.log', 'w')
    # file.write('')
    # file.close()
    log = get_logger('terrain', file=True, filename='logs/lettuce.log')
    world.log = log
    # Set test utils instances
    world.cep = Cep(cep_host=world.config['CEP']['host'],
                    cep_port=world.config['CEP']['port'],
                    service=world.config['CEP']['service'],
                    service_path=world.config['CEP']['service_path'],
                    mongo_host=world.config['MongoDB']['host'],
                    mongo_port=world.config['MongoDB']['port'],
                    mongo_db=world.config['MongoDB']['database'],
                    mongo_orion_db_prefix=world.config['MongoOrion']['mongo_database'],
                    mongo_orion_db_collection=world.config['MongoOrion']['mongo_collection'],
                    cep_core_host=world.config['CEP-CORE']['host'],
                    cep_core_port=world.config['CEP-CORE']['port'],
                    log_instance=world.log,
                    log_verbosity=world.config['CEP']['log_level']
                    )
    world.rules_utils = RulesUtils()
    world.cards_utils = CardsUtils()
    world.mock_utils = Mock(world.config['Mock']['host'], world.config['Mock']['port'])



def reset_environment():
    # Reset the world attributes set in each test
    world.cards = []
    world.resp = []
    world.rules = []
    # Reset the database of tests
    world.cep.reset_db()
    world.cep.util_delete_all_core_rules()
    world.mock_utils.reset_mails()
    world.mock_utils.reset_post()
    world.mock_utils.reset_update()
    world.mock_utils.reset_sms()


@before.each_scenario
def before_each_scenario(scenario):
    """
    actions before each scenario
    :param scenario:
    """
    reset_environment()

@before.outline
def before_outline(scenario, *args):
    """
    Actions before outline
    :param outline:
    :return:
    """
    reset_environment()


@after.each_scenario
def after_each_scenario(scenario):
    """
    actions after each scenario
    :param scenario:
    """
    # Restore service and service path
    world.cep.set_service_and_servicepath(service=world.config['CEP']['service'], service_path=world.config['CEP']['service_path'])


@after.all
def after_all_scenarios(scenario):
    """
    Actions after all scenarios
    Show the initial and final time of the tests completed
    :param scenario:
    """
    reset_environment()
    tools.general_utils.show_times(world.test_time_init)

