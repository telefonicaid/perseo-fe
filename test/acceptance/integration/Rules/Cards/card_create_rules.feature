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

Feature: Append a new rule in Perseo manager using cards from portal
  As a Perseo user
  I want to be able to append a new rule in Perseo manager using cards from portal
  so that they become more functional and useful

  @happy_path
  Scenario: append a new rule in Perseo manager using card from portal with all cards
    Given Perseo manager is installed correctly to "append"
     # Sensor cards
    And create a sensor card of notUpdated type with id "card_1", verify interval "45", attribute name "temperature", max time without update "10" and connect to "card_2"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temperature_refer" and connect to "card_6"
    And create a sensor card of epl type with id "card_6", epl query "sdfsdfsd dfsdfsdf sdfsdfsdf" and connect to "card_7"
     # Action cards
    And create a action card of "SendEmailAction" type, with id "card_7", response "${device_latitude}${device_longitude}${measure.value}", parameters "erwer@sdfsf.com" and connect to "card_8"
    And create a action card of "SendSmsMibAction" type, with id "card_8", response "${device_latitude}${device_longitude}${measure.value}", parameters "123456789" and connect to "card_9"
    And create a action card of "updateAttribute" type, with id "card_9", response "DANGER", parameters "ALARM" and connect to "card_10"
     # Time cards
    And create a time card of time elapsed type, with id "card_10", interval "8" and connect to "card_11"
     # end cards
    When append a new rule name "test_000001", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db

  @value_threshold_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only value threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "<value>" and connect to "card_5"
    When append a new rule name "test_100001", activate "1"
    Then I receive an "400" http code in rules request

  @value_threshold_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only value threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of value threshold type, with id "card_4", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", parameter value "<value>" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | attribute_name | operator              | data_type | value  | action           | response                                              | parameters      |
    | test_300001 | temperature    | GREATER_THAN          | Quantity  | 34     | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_300002 | temperature    | MINOR_THAN            | Quantity  | 34.56  | SendSmsMibAction | body to response                                      | 123456789       |
    | test_300003 | temperature    | EQUAL_TO              | Quantity  | -34    | updateAttribute  | DANGER                                                | ALARM           |
    | test_300004 | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | -34.56 | SendEmailAction  | the measure is: ${measure.value}                      | erwer@sdfsf.com |
    | test_300005 | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | 0      | SendSmsMibAction | the latitude is: ${device_latitude}                   | 123456789       |
    | test_300006 | temperature    | DIFFERENT_TO          | Quantity  | 999999 | updateAttribute  | DANGER                                                | ALARM           |
    | test_300007 | temperature    | EQUAL_TO              | Text      | danger | SendEmailAction  | the latitude is:${device_longitude}                   | erwer@sdfsf.com |
    | test_300008 | temperature    | DIFFERENT_TO          | Text      | danger | SendSmsMibAction | etc, etc, etc.                                        | 123456789       |
    | test_300009 | sfdf_324455    | DIFFERENT_TO          | Text      | danger | updateAttribute  | DANGER                                                | ALARM           |
    | test_300010 | sfdf_32&%85    | DIFFERENT_TO          | Text      | danger | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @attribute_threshold_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only attribute threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    When append a new rule name "test_400001", activate "1"
    Then I receive an "400" http code in rules request

  @attribute_threshold_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only attribute threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", attribute to refer "<value>" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | attribute_name | operator              | data_type | value      | action           | response                                              | parameters      |
    | test_500001 | temperature    | GREATER_THAN          | Quantity  | temp_refer | SendEmailAction  | email body                                            | erwer@sdfsf.com |
    | test_500002 | temperature    | MINOR_THAN            | Quantity  | temp_refer | SendSmsMibAction | sms message body                                      | 123456789       |
    | test_500003 | temperature    | EQUAL_TO              | Quantity  | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test_500004 | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_500005 | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_500006 | temperature    | DIFFERENT_TO          | Quantity  | temp_r12er | updateAttribute  | DANGER                                                | ALARM           |
    | test_500007 | temperature    | EQUAL_TO              | Text      | temp_r&&er | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_500008 | temperature    | DIFFERENT_TO          | Text      | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_500009 | sfdf_324455    | DIFFERENT_TO          | Text      | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test_500010 | sfdf_32&%85    | DIFFERENT_TO          | Text      | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @type_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only type card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of type type, with "card_3", identity type "temperature",operator "EQUAL_TO" and connect to "card_4"
    When append a new rule name "test_600001", activate "1"
    Then I receive an "400" http code in rules request

  @type_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only type card and action cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of type type, with "card_3", identity type "<identity_type>",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | identity_type | operator     | action           | response                                              | parameters      |
    | test_700001 | temperature   | EQUAL_TO     | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_700002 | temperature   | DIFFERENT_TO | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_700003 | temperature   | DIFFERENT_TO | updateAttribute  | DANGER                                                | ALARM           |

  @id_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only id card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of id type, with id "card_2", identity id "room1" and connect to "card_3"
    When append a new rule name "test_800001", activate "1"
    Then I receive an "400" http code in rules request

  @id_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only id card and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | identity_id | action           | response                                              | parameters      |
    | test_900001 | room1       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_900002 | room*       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_900003 | room_*      | updateAttribute  | DANGER                                                | ALARM           |
    | test_900004 | room.*      | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |

  @id_card_error
  Scenario Outline: try to a new rule in Perseo manager using card from portal using only id card and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "400" http code in rules request
  Examples:
    | rule_name   | identity_id | action           | response                                              | parameters      |
    | test_900005 | *****       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_900006 | r[1-        | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |

  @not_updated_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only not updated card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of notUpdated type with id "card_1", verify interval "40", attribute name "temperature", max time without update "30" and connect to "card_2"
    When append a new rule name "test_010001", activate "1"
    Then I receive an "400" http code in rules request

  @not_updated_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only not updated card ant actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | interval | attribute_name | max_time | action           | response                                              | parameters      |
    | test_110001 | 40       | temperature    | 30       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_110002 | 34       | temper_23      | 12       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_110003 | 34       | temper_23      | 0        | updateAttribute  | DANGER                                                | ALARM           |

  @not_updated_card_interval_not_allowed @BUG_ISSUE_53
  Scenario Outline: try to append a new rule in Perseo manager using card from portal using only not updated card and action card but with interval not allowed
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "400" http code in rules request
  Examples:
    | rule_name   | interval | attribute_name | max_time | action           | response                                              | parameters      |
    | test_210001 | -60      | temperature    | 10       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_210002 | 0        | temperature    | 1        | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |

  @epl_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only epl card without action card
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of epl type with id "card_6", epl query "were ewrwer werwe rwrwer  wer" and connect to "card_7"
    When append a new rule name "test_310001", activate "1"
    Then I receive an "400" http code in rules request

  @epl_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only epl card and action cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of epl type with id "card_6", epl query "<epl_query>" and connect to "card_7"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | epl_query                     | action           | response                                              | parameters      |
    | test_410001 | were ewrwer werwe rwrwer  wer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_410002 | were ewrwer werwe rwrwer  wer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_410003 | were ewrwer werwe rwrwer  wer | updateAttribute  | DANGER                                                | ALARM           |

  @elapsed_card_without_action_card
  Scenario: try to append a new rule in Perseo manager using card from portal using only elapsed card without action card
    Given Perseo manager is installed correctly to "append"
    And create a time card of time elapsed type, with id "card_10", interval "8" and connect to "card_11"
    When append a new rule name "test_510001", activate "1"
    Then I receive an "400" http code in rules request

  @elapsed_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only elapsed card and action card
    Given Perseo manager is installed correctly to "append"
    And create a time card of time elapsed type, with id "card_10", interval "<interval>" and connect to "card_11"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | interval | action           | response                                              | parameters      |
    | test_610001 | 8        | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_610002 | -8       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 1234567890      |
    | test_610003 | 0        | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using attribute threshold, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | action           | response                                              | parameters      |
    | test_710001 | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_710002 | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_710003 | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using value threshold, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | action           | response                                              | parameters      |
    | test_810001 | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_810002 | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_810003 | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using not updated, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And create a sensor card of notUpdated type with id "card_1", verify interval "45", attribute name "temperature", max time without update "10" and connect to "card_2"
    And create a sensor card of id type, with id "card_2", identity id "room_*" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "201" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name   | action           | response                                              | parameters      |
    | test_910001 | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_910002 | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_910003 | updateAttribute  | DANGER                                                | ALARM           |
