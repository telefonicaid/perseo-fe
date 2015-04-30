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