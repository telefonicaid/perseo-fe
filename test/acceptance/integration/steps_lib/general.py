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
from tools.general_utils import pretty

__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'
from lettuce import step, world
from time import sleep



@step('waiting "([^"]*)" seconds to verify orion contexts')
def waiting_seconds_to_verify_orion_contexts(step, seconds):
    """
    Wait a given number of seconds
    :param step:
    :param seconds:
    :return:
    """
    world.log.debug('Waiting {seconds} seconds'.format(seconds=seconds))
    sleep(int(seconds))
