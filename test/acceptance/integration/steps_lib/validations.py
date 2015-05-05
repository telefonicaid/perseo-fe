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

# Background
@step('perseo-fe is up and running')
def perseo_fe_is_up_and_running(step):
    """
    Check if perseo answer to the version in ok
    :param step:
    :return:
    """
    assert world.cep.version().status_code == 200
    world.cards = []
    world.rules = []

@step('validate the http code of the response is "([^"]*)"')
def i_receive_an_http_code_in_rules_request(step, code):
    assert world.resp.status_code == int(code), \
        'The code received from cep is "{code_received}" and the expected is "{code_expected}"'.format(
        code_received=world.resp.status_code, code_expected=code)


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

@step('Validate that rule name is deleted successfully in db')
def validate_that_rule_name_is_deleted_successfully_in_db(step):
    assert len(world.cep.get_rule_from_mongo(
        world.rules[len(world.rules) - 1]['name'])) == 0, 'The rule "{name}" is still in the db'.format(
        name=world.rules[len(world.rules) - 1]['name'])