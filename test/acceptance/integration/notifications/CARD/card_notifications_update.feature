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
__author__ = 'Jon Calderín Goñi (jon.caldering at gmail dot com)'

#
#  Notes:
#        * The skip tag is to skip the scenarios that still are not developed or failed
#          always it is associated to an issue or bug
#            -tg=-skip
#        * For to see "default" values, in properties.json file
#

Feature: Launch an action if a visual rule is triggered in Perseo manager
  As a Perseo user
  I want to be able to launch a action (sms, email or update) if a visual rule is triggered in Perseo manager
  so that they become more functional and useful
  
  Background:
    Given perseo-fe is up and running

  @happy_path @sms_value_threshold_card
  Scenario: Launch an update action if a visual rule is satisfied using only a threshold card and an action card
    # create a new visual rule
    Given create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "100" and connect to "card_5"
    And create an update action card with id "card_5" for attribute "temperature" value "300" and connected to ""
    And append a new rule name "update_rule", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "Room" with the following attributes
      | attribute_id  | attribute_type | attribute_new_value  |
      | temperature | celcius        | 300                  |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "update"
    And the mock receive this part of text "300" in the action "update"
