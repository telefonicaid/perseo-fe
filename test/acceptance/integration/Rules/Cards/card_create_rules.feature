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
#            -tg=-skip
#        * For to see "default" values, in properties.json file
#

Feature: Append a new rule in Perseo manager using cards from portal
  As a Perseo user
  I want to be able to append a new rule in Perseo manager using cards from portal
  so that they become more functional and useful

  @happy_path @skip
  Scenario: append a new rule in Perseo manager using card from portal with all cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
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
    When append a new rule name "test_1", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created


  @value_threshold_card_without_AC
  Scenario: try to append a new rule in Perseo manager using card from portal using only value threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "<value>" and connect to "card_5"
    When append a new rule name "test0102", activate "1"
    Then I receive an "Bad Request" http code

  @value_threshold_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only value threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of value threshold type, with id "card_4", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", parameter value "<value>" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | attribute_name | operator              | data_type | value  | action           | response                                              | parameters      |
    | test01    | temperature    | GREATER_THAN          | Quantity  | 34     | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test02    | temperature    | MINOR_THAN            | Quantity  | 34.56  | SendSmsMibAction | body to response                                      | 123456789       |
    | test03    | temperature    | EQUAL_TO              | Quantity  | -34    | updateAttribute  | DANGER                                                | ALARM           |
    | test04    | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | -34.56 | SendEmailAction  | the measure is: ${measure.value}                      | erwer@sdfsf.com |
    | test05    | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | 0      | SendSmsMibAction | the latitude is: ${device_latitude}                   | 123456789       |
    | test06    | temperature    | DIFFERENT_TO          | Quantity  | 999999 | updateAttribute  | DANGER                                                | ALARM           |
    | test07    | temperature    | EQUAL_TO              | Text      | danger | SendEmailAction  | the latitude is:${device_longitude}                   | erwer@sdfsf.com |
    | test08    | temperature    | DIFFERENT_TO          | Text      | danger | SendSmsMibAction | etc, etc, etc.                                        | 123456789       |
    | test09    | sfdf_324455    | DIFFERENT_TO          | Text      | danger | updateAttribute  | DANGER                                                | ALARM           |
    | test_ 10  | sfdf_32&%85    | DIFFERENT_TO          | Text      | danger | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @attribute_threshold_card_without_AC
  Scenario: append a new rule in Perseo manager using card from portal using only attribute threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    When append a new rule name "test0101", activate "1"
    Then I receive an "Bad Request" http code

  @attribute_threshold_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only attribute threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", attribute to refer "<value>" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | attribute_name | operator              | data_type | value      | action           | response                                              | parameters      |
    | test011   | temperature    | GREATER_THAN          | Quantity  | temp_refer | SendEmailAction  | email body                                            | erwer@sdfsf.com |
    | test020   | temperature    | MINOR_THAN            | Quantity  | temp_refer | SendSmsMibAction | sms message body                                      | 123456789       |
    | test030   | temperature    | EQUAL_TO              | Quantity  | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test040   | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test050   | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test060   | temperature    | DIFFERENT_TO          | Quantity  | temp_r12er | updateAttribute  | DANGER                                                | ALARM           |
    | test070   | temperature    | EQUAL_TO              | Text      | temp_r&&er | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test080   | temperature    | DIFFERENT_TO          | Text      | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test090   | sfdf_324455    | DIFFERENT_TO          | Text      | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test_100  | sfdf_32&%85    | DIFFERENT_TO          | Text      | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @type_card_without_AC
  Scenario: append a new rule in Perseo manager using card from portal using only type card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of type type, with "card_3", identity type "temperature",operator "EQUAL_TO" and connect to "card_4"
    When append a new rule name "test0301", activate "1"
    Then I receive an "Bad Request" http code

  @type_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only type card and action cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of type type, with "card_3", identity type "<identity_type>",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | identity_type | operator     | action           | response                                              | parameters      |
    | test0300  | temperature   | EQUAL_TO     | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test0600  | temperature   | DIFFERENT_TO | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test0900  | temperature   | DIFFERENT_TO | updateAttribute  | DANGER                                                | ALARM           |

  @id_card_without_AC
  Scenario Outline: append a new rule in Perseo manager using card from portal using only id card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Bad Request" http code
  Examples:
    | rule_name | identity_id |
    | test0300  | room1       |

  @id_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only id card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | identity_id | action           | response                                              | parameters      |
    | test0300  | room1       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test0600  | room*       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test0600  | room_*      | updateAttribute  | DANGER                                                | ALARM           |
    | test0600  | room.*      | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |

  @not_updated_card_without_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only not updated card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Bad Request" http code
  Examples:
    | rule_name | interval | attribute_name | max_time |
    | test1000  | 40       | temperature    | 30       |

  @not_updated_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only not updated card ant actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | interval | attribute_name | max_time | action           | response                                              | parameters      |
    | test1000  | 40       | temperature    | 30       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test1300  | 34       | temper_23      | 12       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test1300  | 34       | temper_23      | 0        | updateAttribute  | DANGER                                                | ALARM           |

  @not_updated_card_interval_not_allowed @BUG_53 @skip
  Scenario Outline: append a new rule in Perseo manager using card from portal using only not updated card and action card but with interval not allowed
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Bad Request" http code
  Examples:
    | rule_name | interval | attribute_name | max_time | action           | response                                              | parameters      |
    | test1100  | 60       | temperature    | 10       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test1200  | 10       | temperature    | 1        | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |

  @epl_card_without_AC
  Scenario: append a new rule in Perseo manager using card from portal using only epl card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of epl type with id "card_6", epl query "were ewrwer werwe rwrwer  wer" and connect to "card_7"
    When append a new rule name "test2000", activate "1"
    Then I receive an "Bad Request" http code

  @epl_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only epl card and action cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of epl type with id "card_6", epl query "<epl_query>" and connect to "card_7"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | epl_query                     | action           | response                                              | parameters      |
    | test2000  | were ewrwer werwe rwrwer  wer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test2100  | were ewrwer werwe rwrwer  wer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test2200  | were ewrwer werwe rwrwer  wer | updateAttribute  | DANGER                                                | ALARM           |

  @elapsed_card_without_AC
  Scenario: append a new rule in Perseo manager using card from portal using only elapsed card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a time card of time elapsed type, with id "card_10", interval "8" and connect to "card_11"
    When append a new rule name "test2000", activate "1"
    Then I receive an "Bad Request" http code

  @elapsed_card
  Scenario Outline: append a new rule in Perseo manager using card from portal using only elapsed card and action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a time card of time elapsed type, with id "card_10", interval "<interval>" and connect to "card_11"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | interval | action           | response                                              | parameters      |
    | test2010  | 8        | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test2030  | -8       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 1234567890      |
    | test2040  | 0        | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using attribute threshold, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | action           | response                                              | parameters      |
    | test010   | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test020   | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test030   | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using value threshold, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | action           | response                                              | parameters      |
    | test040   | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test050   | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test060   | updateAttribute  | DANGER                                                | ALARM           |

  @several_cards
  Scenario Outline: append a new rule in Perseo manager using card from portal using not updated, id, type cards and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of notUpdated type with id "card_1", verify interval "45", attribute name "temperature", max time without update "10" and connect to "card_2"
    And create a sensor card of id type, with id "card_2", identity id "room_*" and connect to "card_3"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When append a new rule name "<rule_name>", activate "1"
    Then I receive an "Created" http code
    And Validate that rule name is created successfully in db
    And delete a rule created
  Examples:
    | rule_name | action           | response                                              | parameters      |
    | test070   | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test080   | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test090   | updateAttribute  | DANGER                                                | ALARM           |
