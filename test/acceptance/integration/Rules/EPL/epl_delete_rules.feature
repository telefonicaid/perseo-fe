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

Feature: Delete a rule in Perseo manager
  As a Perseo user
  I want to be able to delete a  rule in Perseo manager
  so that they become more functional and useful

  # -----
  @happy_path 
  Scenario: delete a sms rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "The new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    When delete a plain rule created
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "0"

  @happy_path 
  Scenario: delete a email rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the email action with from "from@from.com" to "to@to.com" subject "notification mail" and body "The new temperature is ${temperature}"
    And with the epl generated and the action, append a new rule in perseo with name "email_rule"
    When delete a plain rule created
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "0"

  @happy_path 
  Scenario: delete a post rule in Perseo manager
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
    When delete a plain rule created
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "0"

  @happy_path 
  Scenario: delete a update rule in Perseo manager
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
    When delete a plain rule created
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "0"

    # ----
  @rule_name 
  Scenario Outline: delete a rule with several names in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "<rule_name>"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the update action with attribute name "temperature" attribute value "500" attribute type "empty" entity id "empty" is pattern "empty"
    And with the epl generated and the action, append a new rule in perseo with name "<rule_name>"
    # Action
    When delete a plain rule created
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "0"
  Examples:
    | rule_name               |
    | test_345                |
    | TEST_345                |
    | test-345                |
    | sgvMpTs52nwuq25UsA3a    |
    | rulename length allowed |

  @rule_not_exist
  Scenario: try to delete a rule does not exist in Perseo manager
    When delete a plain rule with name "not_exist"
    Then I receive an "200" http code in rules request


