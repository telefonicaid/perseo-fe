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

Feature: Launch an action if a visual rule is triggered in Perseo manager
  As a Perseo user
  I want to be able to launch a action (sms, email or update) if a visual rule is triggered in Perseo manager
  so that they become more functional and useful

  Background:
    Given perseo-fe is up and running


  @happy_path @value_threshold_card
  Scenario Outline: Launch an action if a visual rule is triggered in Perseo manager using only value threshold card and an action card
    # create a new visual rule
    Given create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "<condition>", data type "Quantity", parameter value "<attribute_value>" and connect to "card_5"
    And create a sms action card with id "card_5" text "The new value is ${temperature}" telephone number "666999666" and connected to ""
    And append a new rule name "value_threshold", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value  |
      | temperature  | celcius        | <notification_value> |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The new value is" in the action "sms"

  Examples:
    | condition    | attribute_value | notification_value |
    | GREATER_THAN | 3400            | 3401               |
    | MINOR_THAN   | 240             | 239                |
    | EQUAL_TO     | 300             | 300                |

  @attribute_threshold_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only attribute threshold card and actions cards
    # create a new visual rule
    Given create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "<condition>", data type "Quantity", attribute to refer "temperature_value" and connect to "card_6"
    And create a sms action card with id "card_6" text "The attribute_value is ${temperature} and the attribute_threshold value is ${temperature_value}" telephone number "666999666" and connected to ""
    And append a new rule name "attribute_threshold", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "Room" with the following attributes
      | attribute_id      | attribute_type | attribute_new_value                  |
      | temperature       | celcius        | <attribute_value>                    |
      | temperature_value | celcius        | <notification_refer_attribute_value> |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The attribute_value is <attribute_value> and the attribute_threshold value is <notification_refer_attribute_value>" in the action "sms"

  Examples:
    | condition    | attribute_value | notification_refer_attribute_value |
    | GREATER_THAN | 3401            | 3400                               |
    | MINOR_THAN   | 239             | 240                                |
    | EQUAL_TO     | 300             | 300                                |

  @type_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only type card and actions cards
    # create a new visual rule
    Given create a sensor card of type type, with "card_3", identity type "Room",operator "<condition>" and connect to "card_4"
    And create a sms action card with id "card_4" text "The new temperature is ${temperature}" telephone number "666999666" and connected to ""
    And append a new rule name "type", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "<entity_type>" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The new temperature is 300" in the action "sms"

  Examples:
    | entity_type | condition    |
    | Room        | EQUAL_TO     |
    | NoRoom      | DIFFERENT_TO |

  @id_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only id-regexp card and actions cards
     # create a new visual rule
    Given create a sensor card of id type, with id "card_2", identity id "<entity_id>" and connect to "card_3"
    And create a sms action card with id "card_3" text "The new temperature is ${temperature}" telephone number "666999666" and connected to ""
    And append a new rule name "id_regex", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "Room_1" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The new temperature is 300" in the action "sms"
  Examples:
    | entity_id |
    | Room_1    |
    | Room.*    |
    | Room_.*   |

  @not_updated_card @BUG_ISSUE_73
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only not_updated_card and actions cards
    Given generate context orion fake with entity id "room_1", entity type "room", attribute name "alarm", attribute value "danger" and attribute type "void"
    # create a new visual rule
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "alarm", max time without update "<max_time_WO_update>" and connect to "card_2"
    And create a sms action card with id "card_2" text "The attribute alarm with value: ${alarm} is not updated :${reportInterval} ${lastTime}" telephone number "666999666" and connected to ""
    # And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "not_updated", activate "1"
    When waiting "65" seconds to verify orion contexts
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The attribute alarm with value: danger is not updated" in the action "sms"

  Examples:
    | interval | max_time_WO_update |
    | 1        | 1                  |


  @not_updated_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only not_updated_card with more than one attributes not updated and actions cards
    Given generate context orion fake with entity id "room_1", entity type "room", attribute name "alarm", attribute value "danger" and attribute type "void"
    And generate context orion fake with entity id "room_2", entity type "room", attribute name "alarm", attribute value "danger" and attribute type "void"
    # create a new visual rule
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "alarm", max time without update "<max_time_WO_update>" and connect to "card_2"
    And create a sms action card with id "card_2" text "The attribute alarm with value: ${alarm} is not updated :${reportInterval} ${lastTime}" telephone number "666999666" and connected to ""
    And append a new rule name "not_updated", activate "1"
    When waiting "65" seconds to verify orion contexts
    Then the mock receive the number "2" of actions "sms"
    And the mock receive this part of text "The attribute alarm with value: danger is not updated" in the action "sms"

  Examples:
    | interval | max_time_WO_update |
    | 1        | 1                  |

  @several_cards
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using value threshold, id and type cards and an action card
    # create a new visual rule
    Given create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "<condition>", data type "Quantity", parameter value "<attribute_value>" and connect to "card_5"
    And create a sensor card of id type, with id "card_2", identity id "Room1" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "<entity_type>",operator "<condition_type>" and connect to "card_4"
    And create a sms action card with id "card_5" text "The attribute is ${temperature} the id ${id} and the type ${type}" telephone number "666999666" and connected to ""
    And append a new rule name "value_id_type", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "Room1" and type "Room" with the following attributes
      | attribute_id | attribute_type | attribute_new_value  |
      | temperature  | celcius        | <notification_value> |
    When the notification is sent to perseo
    Then the mock receive the number "1" of actions "sms"
    And the mock receive this part of text "The attribute is <notification_value> the id Room1 and the type Room" in the action "sms"

  Examples:
    | condition    | attribute_value | notification_value | entity_type | condition_type |
    | GREATER_THAN | 3400            | 3401               | Room        | EQUAL_TO       |
    | MINOR_THAN   | 240             | 239                | Room        | EQUAL_TO       |
    | EQUAL_TO     | 300             | 300                | Room        | EQUAL_TO       |
    | GREATER_THAN | 3400            | 3401               | NoRoom      | DIFFERENT_TO   |
    | MINOR_THAN   | 240             | 239                | NoRoom      | DIFFERENT_TO   |
    | EQUAL_TO     | 300             | 300                | NoRoom      | DIFFERENT_TO   |
