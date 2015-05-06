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
#        * the "only_develop" tag is used to verify releases that has not all funcionabilities. discards the scenarios tagged
#            -tg=-only_develop
#        * The "skip" tag is to skip the scenarios that still are not developed or failed
#          always it is associated to an issue or bug
#            -tg=-skip
#        * For to see "default" values, in properties.json file
#
@epl_notifications
Feature: Launch an action if a rule is triggered in Perseo manager
  As a Perseo user
  I want to be able to launch a action (sms, email or update) if a rule is triggered in Perseo manager
  so that they become more functional and useful

  Background:
    Given perseo-fe is up and running


  @happy_path @action_if_the_rule_is_satisfied
  Scenario: Launch an action if a rule is triggered with entity type and id (does not matter the action)
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_id "room2" for the EPL
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
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "the new temperature is 300" in the action "sms"

  @satisfied_some_attributes
  Scenario: Launch an action if a rule with two attributes is satisfied with one notice
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
      | speed        | float                | >                   | 100             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room2" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
      | speed        | kms per our    | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "the new temperature is 300" in the action "sms"

  @satisfied_separate_part_rules
  Scenario: Do not launch an action if a rule with two attributes is satisfied with two notices
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
      | speed        | float                | >                   | 100             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room2" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    When the notification is sent to perseo
    # Notification 2
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room2" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | speed        | kms per our    | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "0" of actions "sms"


  @several_rules
  Scenario Outline: Launch several actions if several rules are satisfied
    # Gen EPL
    Given an EPL sentence with name "rule_prefix_name"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append an amount of "<rule_number>" rules in perseo with prefix name "rule_prefix_name"
    # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room2" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "<rule_number>" of actions "sms"

  Examples:
    | rule_number |
    | 1           |
    | 5           |
    | 10          |
    | 50          |
    | 100         |

  @several_attributes
  Scenario Outline: Launch an action if a rule is satisfied with several attributes
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And a number of "<attributes_number>" equal attributes for the EPL with the following data
      | attribute_id_prefix | attribute_value_type | attribute_operation | attribute_value |
      | temperature         | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "Room" with the amount of "<attributes_number>" equal attributes with the following data
      | attribute_id_prefix | attribute_type | attribute_new_value |
      | temperature         | celcius        | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"

  Examples:
    | attributes_number |
    | 1                 |
    | 5                 |
    | 10                |
    | 50                |


  Scenario Outline: Check there is no notifications if the rule is not satisfied because multiple reasons
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the entity_id "room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Notification
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "<entity_id>" and type "<entity_type>" with the following attributes
      | attribute_id   | attribute_type | attribute_new_value |
      | <attribute_id> | celcius        | <attribute_value>   |
    When the notification is sent to perseo
    Then the mock receive the number "0" of actions "sms"
  Examples:
    | entity_id | entity_type | attribute_id       | attribute_value |
    | bad_id    | Room        | temperature        | 300             |
    | room      | Room2       | temperature        | 300             |
    | room      | Room        | diferent_attribute | 300             |
    | room      | Room        | temperature        | 1.4             |


