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

Feature: Update a rule in Perseo manager using cards from portal
  As a Perseo user
  I want to be able to update a rule in Perseo manager using cards from portal
  so that they become more functional and useful

  @value_threshold_card_without_action_card
  Scenario: try to update a rule in Perseo manager using card from portal using only value threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a action card of "SendEmailAction" type, with id "card_7", response "${device_latitude}${device_longitude}${measure.value}", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_10000000001", activate "1"
    # update the same visual rule without an action card
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "MINOR_THAN", data type "Quantity", parameter value "67" and connect to "card_5"
    When update a visual rule "test_10000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @value_threshold_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only value threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of value threshold type, with id "card_4", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", parameter value "<value>" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of value threshold type, with id "card_4", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", parameter value "345345" and connect to "card_5"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | attribute_name | operator              | data_type | value  | action           | response                                              | parameters      |
    | test_20000000001 | temperature    | GREATER_THAN          | Quantity  | 34     | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_20000000002 | temperature    | MINOR_THAN            | Quantity  | 34.56  | SendSmsMibAction | body to response                                      | 123456789       |
    | test_20000000003 | temperature    | EQUAL_TO              | Quantity  | -34    | updateAttribute  | DANGER                                                | ALARM           |
    | test_20000000004 | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | -34.56 | SendEmailAction  | the measure is: ${measure.value}                      | erwer@sdfsf.com |
    | test_20000000005 | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | 0      | SendSmsMibAction | the latitude is: ${device_latitude}                   | 123456789       |
    | test_20000000006 | temperature    | DIFFERENT_TO          | Quantity  | 999999 | updateAttribute  | DANGER                                                | ALARM           |
    | test_20000000007 | temperature    | EQUAL_TO              | Text      | danger | SendEmailAction  | the latitude is:${device_longitude}                   | erwer@sdfsf.com |
    | test_20000000008 | temperature    | DIFFERENT_TO          | Text      | danger | SendSmsMibAction | etc, etc, etc.                                        | 123456789       |
    | test_20000000009 | sfdf_324455    | DIFFERENT_TO          | Text      | danger | updateAttribute  | DANGER                                                | ALARM           |
    | test_20000000010 | sfdf_32&%85    | DIFFERENT_TO          | Text      | danger | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @attribute_threshold_card_without_action_card
  Scenario: try to update a rule in Perseo manager using card from portal using only attribute threshold card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
     # create a new visual rule
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_30000000001", activate "1"
    # update the same visual rule without an action card
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temp_refer" and connect to "card_6"
    When update a visual rule "test_30000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @attribute_threshold_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only attribute threshold card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", attribute to refer "<value>" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "<attribute_name>", operator "<operator>", data type "<data_type>", attribute to refer "temp_changed" and connect to "card_6"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | attribute_name | operator              | data_type | value      | action           | response                                              | parameters      |
    | test_40000000001 | temperature    | GREATER_THAN          | Quantity  | temp_refer | SendEmailAction  | email body                                            | erwer@sdfsf.com |
    | test_40000000002 | temperature    | MINOR_THAN            | Quantity  | temp_refer | SendSmsMibAction | sms message body                                      | 123456789       |
    | test_40000000003 | temperature    | EQUAL_TO              | Quantity  | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test_40000000004 | temperature    | GREATER_OR_EQUAL_THAN | Quantity  | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_40000000005 | temperature    | MINOR_OR_EQUAL_THAN   | Quantity  | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_40000000006 | temperature    | DIFFERENT_TO          | Quantity  | temp_r12er | updateAttribute  | DANGER                                                | ALARM           |
    | test_40000000007 | temperature    | EQUAL_TO              | Text      | temp_r&&er | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_40000000008 | temperature    | DIFFERENT_TO          | Text      | temp_refer | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_40000000009 | sfdf_324455    | DIFFERENT_TO          | Text      | temp_refer | updateAttribute  | DANGER                                                | ALARM           |
    | test_40000000010 | sfdf_32&%85    | DIFFERENT_TO          | Text      | temp_refer | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |

  @type_card_without_action_card
  Scenario: ty to update a rule in Perseo manager using card from portal using only type card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of type type, with "card_3", identity type "temperature",operator "EQUAL_TO" and connect to "card_4"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_50000000001", activate "1"
     # update the same visual rule without an action card
    And create a sensor card of type type, with "card_3", identity type "temperature_error",operator "EQUAL_TO" and connect to "card_4"
    When update a visual rule "test_50000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @type_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only type card and action cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of type type, with "card_3", identity type "<identity_type>",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of type type, with "card_3", identity type "house",operator "<operator>" and connect to "card_4"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | identity_type | operator     | action           | response                    | parameters      |
    | test_60000000001 | temperature   | EQUAL_TO     | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_60000000002 | temperature   | DIFFERENT_TO | SendSmsMibAction | sms body ${measure.value}   | 123456789       |
    | test_60000000003 | temperature   | DIFFERENT_TO | updateAttribute  | DANGER                      | ALARM           |

  @id_card_without_action_card
  Scenario: try to update a rule in Perseo manager using card from portal using only id card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of id type, with id "card_2", identity id "room1" and connect to "card_3"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_70000000001", activate "1"
    # update the same visual rule without an action card
    And create a sensor card of id type, with id "card_2", identity id "room4" and connect to "card_3"
    When update a visual rule "test_70000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @id_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only id card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "parameter_changed" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | identity_id | action           | response                     | parameters      |
    | test_80000000001 | room1       | SendEmailAction  | email body ${measure.value}  | erwer@sdfsf.com |
    | test_80000000002 | room*       | SendSmsMibAction | sms body ${measure.value}    | 123456789       |
    | test_80000000003 | room_*      | updateAttribute  | DANGER                       | ALARM           |
    | test_80000000004 | room.*      | SendSmsMibAction | lemail body ${measure.value} | 123456789       |

  @id_card_error
  Scenario Outline: try to update a rule created previously in Perseo manager using card from portal using only id card and actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of id type, with id "card_2", identity id "<identity_id>" and connect to "card_3"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "parameter_changed" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "Bad Request" http code in rules request
  Examples:
    | rule_name        | identity_id | action           | response                    | parameters      |
    | test_80000000005 | *****       | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_80000000006 | r[1-        | SendSmsMibAction | sms body ${measure.value}   | 123456789       |

  @not_updated_card_without_action_card
  Scenario: try to update a rule in Perseo manager using card from portal using only not updated card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of notUpdated type with id "card_1", verify interval "40", attribute name "temperature", max time without update "30" and connect to "card_2"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_90000000001", activate "1"
    # update the same visual rule without an action card
    And create a sensor card of notUpdated type with id "card_1", verify interval "90", attribute name "temperature", max time without update "10" and connect to "card_2"
    When update a visual rule "test_90000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @not_updated_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only not updated card ant actions cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of notUpdated type with id "card_1", verify interval "<interval>", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of notUpdated type with id "card_1", verify interval "56", attribute name "<attribute_name>", max time without update "<max_time>" and connect to "card_2"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | interval | attribute_name | max_time | action           | response                                              | parameters      |
    | test_01000000001 | 40       | temperature    | 30       | SendEmailAction  | ${device_latitude}${device_longitude}${measure.value} | erwer@sdfsf.com |
    | test_01000000002 | 34       | temper_23      | 12       | SendSmsMibAction | ${device_latitude}${device_longitude}${measure.value} | 123456789       |
    | test_01000000003 | 34       | temper_23      | 0        | updateAttribute  | DANGER                                                | ALARM           |

  @epl_card_without_action_card
  Scenario: try to update a rule in Perseo manager using card from portal using only epl card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of epl type with id "card_6", epl query "were ewrwer werwe rwrwer  wer" and connect to "card_7"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_11000000001", activate "1"
    # update the same visual rule without an action card
    And create a sensor card of epl type with id "card_6", epl query "dfgdfg fgdfg fdgdfg" and connect to "card_7"
    When update a visual rule "test_11000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @epl_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only epl card and action cards
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a sensor card of epl type with id "card_6", epl query "<epl_query>" and connect to "card_7"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a sensor card of epl type with id "card_6", epl query "<epl_query>" and connect to "card_7"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "parameters changed" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | epl_query                     | action           | response                    | parameters      |
    | test_21000000001 | were ewrwer werwe rwrwer  wer | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_21000000002 | were ewrwer werwe rwrwer  wer | SendSmsMibAction | sms body l${measure.value}  | 123456789       |
    | test_21000000003 | were ewrwer werwe rwrwer  wer | updateAttribute  | DANGER                      | ALARM           |

  @elapsed_card_without_action_card
  Scenario: try to update a new rule in Perseo manager using card from portal using only elapsed card without action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a time card of time elapsed type, with id "card_10", interval "8" and connect to "card_11"
    And create a action card of "SendEmailAction" type, with id "card_7", response "body email", parameters "erwer@sdfsf.com" and connect to "card_8"
    And append a new rule name "test_31000000001", activate "1"
    # update the same visual rule without an action card
    And create a time card of time elapsed type, with id "card_10", interval "28" and connect to "card_11"
    When update a visual rule "test_31000000001"
    Then I receive an "Bad Request" http code in rules request
    And delete a visual rule created

  @elapsed_card
  Scenario Outline: update a rule created previously in Perseo manager using card from portal using only elapsed card and action card
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "my_tenant" and service "/my_service"
    # create a new visual rule
    And create a time card of time elapsed type, with id "card_10", interval "<interval>" and connect to "card_11"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    # update the same visual rule with an action card
    And create a time card of time elapsed type, with id "card_10", interval "45" and connect to "card_11"
    And create a action card of "<action>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    When update a visual rule "<rule_name>"
    Then I receive an "OK" http code in rules request
    And Validate that rule name is created successfully in db
    And delete a visual rule created
  Examples:
    | rule_name        | interval | action           | response                    | parameters      |
    | test_41000000001 | 8        | SendEmailAction  | email body ${measure.value} | erwer@sdfsf.com |
    | test_41000000002 | -8       | SendSmsMibAction | sms body ${measure.value}   | 1234567890      |
    | test_41000000003 | 0        | updateAttribute  | DANGER                      | ALARM           |
