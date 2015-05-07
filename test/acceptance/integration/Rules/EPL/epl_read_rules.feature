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
__author__ = 'Iván Arias León (ivan.ariasleon at telefonica dot com)'


#
#  Notes:
#        * The skip tag is to skip the scenarios that still are not developed or failed
#          always it is associated to an issue or bug
#            -tg=-skip
#        * For to see "default" values, in properties.json file
#

Feature: Get a rule in Perseo manager
  As a Perseo user
  I want to be able to get a  rule in Perseo manager
  so that they become more functional and useful

  # -----
  @happy_path 
  Scenario: get a update rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "update_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the update action with attribute name "temperature" attribute value "500" attribute type "empty" entity id "empty" is pattern "empty"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    # Read the rule
    When read a plain rule in perseo
    Then I receive an "200" http code in rules request

  @happy_path 
  Scenario: get a email rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "email"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the email action with from "from@from.com" to "to@to.com" subject "automatic notification" and body "The temperature is ${temperature}"
    And with the epl generated and the action, append a new rule in perseo with name "email"
    # Read the rule
    When read a plain rule in perseo
    Then I receive an "200" http code in rules request

  @happy_path 
  Scenario: get a sms rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "The temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Read the rule
    When read a plain rule in perseo
    Then I receive an "200" http code in rules request

  @happy_path 
  Scenario: get a update rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "post_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the post action with payload "The new temperature is ${temperature}" and url "mock_url"
    And with the epl generated and the action, append a new rule in perseo with name "post_rule"
    # Read the rule
    When read a plain rule in perseo
    Then I receive an "200" http code in rules request

  @happy_path 
  Scenario: get a twitter rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "twitter_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the twitter action with text "The new temperature is ${temperature}" and the connexion information
    | consumer_key | consumer_secret | access_token_key | access_token_secret |
    | aaaa         | bbbbbb          | ccccc            | dddddd              |
    And with the epl generated and the action, append a new rule in perseo with name "twitter_rule"
    # Read the rule
    When read a plain rule in perseo
    Then I receive an "200" http code in rules request