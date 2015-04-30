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

@step('the mock receive the number "([^"]*)" of actions "([^"]*)"')
def the_mock_receive_the_action(step, number, action):
    if action == 'SendEmailAction' or action == 'email':
        resp = world.mock_utils.get_counter_mails()
        find_result = resp.text.find('email counter: {number}'.format(number=number))
    elif action == 'SendSmsMibAction' or action == 'sms':
        resp = world.mock_utils.get_counter_sms()
        find_result = resp.text.find('sms counter: {number}'.format(number=number))
    elif action == 'updateAttribute' or action == 'update':
        resp = world.mock_utils.get_counter_update()
        find_result = resp.text.find('update counter: {number}'.format(number=number))
    elif action == 'post':
        resp = world.mock_utils.get_counter_post()
        find_result = resp.text.find('post counter: {number}'.format(number=number))
    else:
        raise ValueError('The action "{action}" is not supported'.format(action=action))
    assert find_result >= 0, 'The response from the mock for action "{action}" is not the expected, the response is: "{response}"'.format(action=action, response=resp.text)

@step('the mock receive this part of text "([^"]*)" in the action "([^"]*)"')
def the_mock_receive_this_part_of_text_in_the_action(step, text, action):
    if action == 'SendEmailAction' or action == 'email':
        resp = world.mock_utils.get_mails()
        assert resp.status_code == 200
    elif action == 'SendSmsMibAction' or action == 'sms':
        resp = world.mock_utils.get_sms()
        assert resp.status_code == 200
    elif action == 'updateAttribute' or action == 'update':
        resp = world.mock_utils.get_update()
        assert resp.status_code == 200
    elif action == 'post':
        resp = world.mock_utils.get_post()
        assert resp.status_code == 200
    else:
        raise ValueError('The action "{action}" is not supported'.format(action=action))
    find_result = resp.text.find(text)
    assert find_result >= 0, 'The response from the mock for action "{action}" is not the expected, the response is: "{response}"'.format(action=action, response=resp.text)