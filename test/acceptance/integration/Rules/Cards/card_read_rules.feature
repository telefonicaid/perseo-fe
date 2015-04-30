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

Feature: get rules in Perseo manager from portal
  As a Perseo user
  I want to be able to get rules in Perseo manager from portal
  so that they become more functional and useful

  @happy_path @value_threshold_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only value threshold card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of value threshold type, with id "card_4", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", parameter value "<value>" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
  Examples:
    | rule_name     | attribute_name | operator     | data_type | value | action           | response                                              | parameters      |
    | test_00000001 | temperature    | GREATER_THAN | Quantity  | 34    | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_00000002 | temperature    | MINOR_THAN   | Quantity  | 34.56 | SendSmsMibAction | body to response                                      | 123456789       |
    | test_00000003 | temperature    | EQUAL_TO     | Quantity  | -34   | updateAttribute  | DANGER                                                | ALARM           |

  @attribute_threshold_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only attribute threshold card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", attribute to refer "<value>" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
    
  Examples:
    | rule_name     | attribute_name | operator     | data_type | value      | action           | response                          | parameters      |
    | test_10000001 | temperature    | GREATER_THAN | Quantity  | temp_refer | SendEmailAction  | email body ${measure.value}       | erwer@sdfsf.com |
    | test_10000002 | temperature    | MINOR_THAN   | Quantity  | temp_refer | SendSmsMibAction | sms message body ${measure.value} | 123456789       |
    | test_10000003 | temperature    | EQUAL_TO     | Quantity  | temp_refer | updateAttribute  | DANGER                            | ALARM           |

  @type_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only type card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of type type, with "card_3", identity type "<identity_type>",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
    
  Examples:
    | rule_name     | identity_type | operator     | action           | response                    | parameters      |
    | test_20000001 | temperature   | EQUAL_TO     | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_20000002 | temperature   | DIFFERENT_TO | SendSmsMibAction | sms body ${measure.value}   | 123456789       |
    | test_20000003 | temperature   | DIFFERENT_TO | updateAttribute  | DANGER                      | ALARM           |

  @regexp_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only regexp card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
    
  Examples:
    | rule_name     | identity_id | action           | response                    | parameters      |
    | test_30000001 | room1       | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_30000002 | room*       | SendSmsMibAction | sms body ${measure.value}   | 123456789       |
    | test_30000003 | room_*      | updateAttribute  | DANGER                      | ALARM           |

  @notUpdated_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only not updated card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
    
  Examples:
    | rule_name     | interval | attribute_name | max_time | action           | response                    | parameters      |
    | test_40000001 | 40       | temperature    | 30       | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_40000002 | 34       | temper_23      | 12       | SendSmsMibAction | sms body ${measure.value} } | 123456789       |
    | test_40000003 | 34       | temper_23      | 0        | updateAttribute  | DANGER                      | ALARM           |

  @epl_card
  Scenario Outline: get a visual rule in Perseo manager using card from portal using only epl card and actions cards
    Given Perseo manager is installed correctly to "get"
    And create a sensor card of epl type with id "card_6", epl query "<epl_query>" and connect to "card_7"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When read a visual rule in perseo
    Then I receive an "200" http code in rules request
    And validate that all visual rules are returned
    
  Examples:
    | rule_name     | epl_query                            | action           | response                    | parameters      |
    | test_50000001 | were ewrwer werwe rwrwer  wer        | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_50000002 | were ewrwer werwe ()                 | SendSmsMibAction | sms body ${measure.value}   | 123456789       |
    | test_50000003 | were 123123 ewrwer werwe rwrwer  wer | updateAttribute  | DANGER                      | ALARM           |

  @multiples_rules
  Scenario Outline: read multiples visual rules in Perseo manager from portal
    Given Perseo manager is installed correctly to "get"
     # Sensor cards
    And create visual rules "<rules_number>" with prefix "<prefix>", sensor cards and an action card "SendEmailAction"
      | sensorCardType |
      | valueThreshold |
      | regexp         |
      | type           |
    When list all rules
    Then I receive an "200" http code in rules request
    And validate that all visual rules are listed
  Examples:
    | rules_number | prefix     |
    | 1            | vrules_1   |
    | 5            | vrules_5   |
    | 10           | vrules_10  |
#    | 50           | vrules_50  |
#    | 100          | vrules_100 |
#    | 500          | vrules_500 |

