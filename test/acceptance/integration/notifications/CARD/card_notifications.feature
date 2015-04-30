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

  @happy_path @value_threshold_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only value threshold card and an action card
    Given Perseo manager is installed correctly to "append"
    # create a new visual rule
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature_0", operator "<operator>", data type "Quantity", parameter value "<attribute_value>" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_5", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "Room" with the following attributes
      | attribute_id  | attribute_type | attribute_new_value  |
      | temperature_0 | celcius        | <notification_value> |
    When the notification is sent to perseo
    Then the mock receive the action "<action>"

#    And an identity id "room2" and an identity type "room" with attribute number "1", attribute name "temperature" and attribute type "celcius"
#    When receives a notification with attributes value "<notification_value>", metadata value "True" and content "json"
#    Then I receive an "200" http code
#    And Validate that visual rule is triggered successfully
  Examples:
    | rule_name           | operator     | attribute_value | notification_value | action           | response                                                                  | parameters      |
    | test_10000_card_001 | GREATER_THAN | 3400            | 3401               | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>>  -- (Email rule) | erwer@sdfsf.com |
    | test_10000_card_002 | MINOR_THAN   | 240             | 239                | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>>  -- (sms rule)   | 123456789       |
    | test_10000_card_003 | EQUAL_TO     | 300             | 300                | updateAttribute  | danger                                                                    | ALARM           |

  @attribute_threshold_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only attribute threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    # create a new visual rule
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature_0", operator "EQUAL_TO", data type "Quantity", attribute to refer "temperature_1" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_6", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # notifications
    And an identity id "room2" and an identity type "room" with attribute number "2", attribute name "temperature" and attribute type "celcius"
    When receives a notification with attributes value "250", metadata value "True" and content "json"
    Then I receive an "200" http code
    And Validate that visual rule is triggered successfully
  Examples:
    | rule_name           | action           | response                                                                                                                    | parameters      |
    | test_20000_card_001 | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>> \n it is the same value to temperature_1 attribute -- (Email rule) | erwer@sdfsf.com |
    | test_20000_card_002 | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>> \n it is the same value to temperature_1 attribute-- (sms rule)    | 123456789       |
    | test_20000_card_003 | updateAttribute  | DANGER                                                                                                                      | ALARM           |

  @type_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only type card and actions cards
    Given Perseo manager is installed correctly to "append"
    # create a new visual rule
    And create a sensor card of type type, with "card_3", identity type "house",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room" and type "<identity_type_notif>" with the following attributes
      | attribute_id  | attribute_type | attribute_new_value  |
      | temperature_0 | celcius        | 100 |
    When the notification is sent to perseo
    Then the mock receive the action "<action>"

#    And an identity id "room2" and an identity type "<identity_type_notif>" with attribute number "1", attribute name "temperature" and attribute type "celcius"
#    When receives a notification with attributes value "250", metadata value "True" and content "json"
#    Then I receive an "OK" http code
#    And Validate that visual rule is triggered successfully
#    And delete a visual rule created
  Examples:
    | rule_name           | identity_type_notif | operator     | action           | response                                                                                    | parameters      |
    | test_30000_card_001 | house               | EQUAL_TO     | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>> and the identity type is house     | erwer@sdfsf.com |
    | test_30000_card_002 | house               | EQUAL_TO     | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>> and the identity type is house     | 123456789       |
    | test_30000_card_003 | house               | EQUAL_TO     | updateAttribute  | DANGER                                                                                      | ALARM           |
    | test_30000_card_004 | car                 | DIFFERENT_TO | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>> and the identity type is not house | erwer@sdfsf.com |
    | test_30000_card_005 | car                 | DIFFERENT_TO | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>> and the identity type is not house | 123456789       |
    | test_30000_card_006 | car                 | DIFFERENT_TO | updateAttribute  | DANGER                                                                                      | ALARM           |

  @id_card
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only id-regexp card and actions cards
    Given Perseo manager is installed correctly to "append"
     # create a new visual rule
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
     # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "room_1" and type "Room" with the following attributes
      | attribute_id  | attribute_type | attribute_new_value  |
      | temperature_0 | celcius        | 100 |
    When the notification is sent to perseo
    Then the mock receive the action "<action>"
#    And an identity id "room_1" and an identity type "room" with attribute number "1", attribute name "temperature" and attribute type "celcius"
#    When receives a notification with attributes value "250", metadata value "True" and content "json"
#    Then I receive an "OK" http code
#    And Validate that visual rule is triggered successfully
#    And delete a visual rule created
  Examples:
    | rule_name           | identity_id | action           | response                                                                               | parameters      |
    | test_40000_card_001 | room_1      | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>> and the identity id is room_1 | erwer@sdfsf.com |
    | test_40000_card_002 | room.*      | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>> and the identity id is room_1 | 123456789       |
    | test_40000_card_003 | room_.*     | updateAttribute  | DANGER                                                                                 | ALARM           |

  @not_updated_card @BUG_ISSUE_73
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using only not_updated_card and actions cards
    Given Perseo manager is installed correctly to "append"
    And generate context orion fake with entity id "<identity_id>", entity type "room", attribute name "alarm", attribute value "danger" and attribute type "void"
     # create a new visual rule
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "alarm", max time without update "<max_time_WO_update>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When waiting "65" seconds to verify orion contexts
    Then Validate that visual rule is triggered successfully
    And delete a visual rule created
    And delete orion database fake
  Examples:
    | rule_name           | identity_id | interval | max_time_WO_update | action           | response                                                                                            | parameters          |
    | test_50000_card_001 | room_1      | 1        | 10                 | SendEmailAction  | ALARM attribute has value <<<${alarm}>>> in the interval ${reportInterval} to last time ${lastTime} | noupdated@rules.com |
    | test_50000_card_002 | room_2      | 1        | 10                 | SendSmsMibAction | ALARM attribute has value <<<${alarm}>>> , entity id ${id} and entity type ${type}                  | 123456789           |
    | test_50000_card_003 | room_3      | 1        | 10                 | updateAttribute  | danger                                                                                              | ALARM               |

  @several_cards
  Scenario Outline: launch a action if a visual rule is triggered in Perseo manager using value threshold, id and type cards and an action card
    Given Perseo manager is installed correctly to "append"
    # create a new visual rule
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature_0", operator "<operator>", data type "Quantity", parameter value "<attribute_value>" and connect to "card_5"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "<identity_type>",operator "EQUAL_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_5", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # notifications
    And a notifications with subscription_id "aaaaa" and originator "localhost"
    And add to the notification an entity with id "<identity_id>" and type "<identity_type>" with the following attributes
      | attribute_id  | attribute_type | attribute_new_value  |
      | temperature_0 | celcius        | <notification_value> |
    When the notification is sent to perseo
    Then the mock receive the action "<action>"

#    And an identity id "<identity_id>" and an identity type "<identity_type>" with attribute number "1", attribute name "temperature" and attribute type "celcius"
#    When receives a notification with attributes value "<notification_value>", metadata value "True" and content "json"
#    Then I receive an "OK" http code
#    And Validate that visual rule is triggered successfully
#    And delete a visual rule created
  Examples:
    | rule_name           | operator     | attribute_value | identity_id | identity_type | notification_value | action           | response                                                                  | parameters      |
    | test_10000_card_001 | GREATER_THAN | 3400            | room_1      | house         | 3401               | SendEmailAction  | temperature_0 attribute has value <<<${temperature_0}>>>  -- (Email rule) | erwer@sdfsf.com |
    | test_10000_card_002 | MINOR_THAN   | 240             | room_2      | room          | 239                | SendSmsMibAction | temperature_0 attribute has value <<<${temperature_0}>>>  -- (sms rule)   | 123456789       |
    | test_10000_card_003 | EQUAL_TO     | 300             | room_3      | city          | 300                | updateAttribute  | danger                                                                    | ALARM           |
