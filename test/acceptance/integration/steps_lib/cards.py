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


@step('a Not Updated sensor card')
def a_not_updated_sensor_card(step):
    """
      | id     | interval | attribute_name | max_time_without_update | connected_to |
      | card_1 | 45       | temperature    | 10                      | card_2       |
    :param step:
    :return:
    """
    error_msg = """
      | id     | interval | attribute_name | max_time_without_update | connected_to |
      | card_1 | 45       | temperature    | 10                      | card_2       |
    """
    assert len(step.hashes) >= 1, 'The minimum hashes are 1, with the format: \n {error_msg}'.format(
        error_msg=error_msg)
    for row in step.hashes:
        world.cards.append(world.cards_utils.create_sensor_not_updated_card(row['id'], [row['connected_to']],
                                                                            row['max_time_without_update'],
                                                                            row['interval'], row['attribute_name']))