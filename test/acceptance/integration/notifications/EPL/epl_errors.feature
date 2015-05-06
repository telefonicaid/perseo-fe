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
__author__ = 'Jon Calderin Goñi (jon.caldering at gmail dot com)'

Feature: Launch an action if a rule is triggered in Perseo manager
  As a Perseo user
  I want to be able to launch a action (sms, email or update) if a rule is triggered in Perseo manager
  so that they become more functional and useful

  Background:
    Given perseo-fe is up and running

  @rule_type_error @issue35
  Scenario: Do not trigger a notification because the rule type is wrong
    # Gen EPL
    Given an EPL sentence with name "post_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set a bad type action with post structure, payload "the new temperature is ${temperature}" and url "mock_url"
    When with the epl generated and the action, append a new rule in perseo with name "post_rule"
    # Validate
    Then validate the http code of the response is "400"

  @xml_format
  Scenario: Not launch an action if notification is in xml format
 # Gen EPL
    Given an EPL sentence with name "<rule_name>"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
 # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room2" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    When the notification is sent to perseo in xml format
    Then validate the http code of the response is "400"

