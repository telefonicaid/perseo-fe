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

Feature: Delete a rule in Perseo manager from portal
  As a Perseo user
  I want to be able to delete a rule in Perseo manager from portal
  so that they become more functional and useful

  @happy_path
  Scenario: delete a rule in Perseo manager from portal with all cards
    Given Perseo manager is installed correctly to "delete"
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
    And append a new rule name "test_0001", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db

  @notUpdated_card
  Scenario Outline: delete a rule in Perseo manager from portal with not updated and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of notUpdated type with id "card_1", verify interval "45", attribute name "temperature", max time without update "10" and connect to "card_2"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0002  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0003  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00004  | updateAttribute  | DANGER                                                | ALARM           |

  @id_card
  Scenario Outline: delete a rule in Perseo manager from portal with id and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of id type, with id "card_2", identity id "room2" and connect to "card_3"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0005  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0006  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00007  | updateAttribute  | DANGER                                                | ALARM           |

  @type_card
  Scenario Outline: delete a rule in Perseo manager from portal with type and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of type type, with "card_3", identity type "room",operator "DIFFERENT_TO" and connect to "card_4"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0008  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0009  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00010  | updateAttribute  | DANGER                                                | ALARM           |

  @value_threshold_card
  Scenario Outline: delete a rule in Perseo manager from portal with value threshold and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0011  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0012  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00013  | updateAttribute  | DANGER                                                | ALARM           |

  @attribute_threshold_card
  Scenario Outline: delete a rule in Perseo manager from portal with attribute threshold and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of attribute threshold type, with id "card_5", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", attribute to refer "temperature_refer" and connect to "card_6"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0014  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0015  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00016  | updateAttribute  | DANGER                                                | ALARM           |

  @epl_card
  Scenario Outline: delete a rule in Perseo manager from portal with epl and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of epl type with id "card_6", epl query "sdfsdfsd dfsdfsdf sdfsdfsdf" and connect to "card_7"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0017  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0018  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00019  | updateAttribute  | DANGER                                                | ALARM           |

  @elapsed_card
  Scenario Outline: delete a rule in Perseo manager from portal with elapsed and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a time card of time elapsed type, with id "card_10", interval "8" and connect to "card_11"
    And create a action card of "<action_card>" type, with id "card_7", response "<response>", parameters "<parameters>" and connect to "card_8"
    And append a new rule name "<rule_name>", activate "1"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
  Examples:
    | rule_name  | action_card      | response                                              | parameters      |
    | test_0020  | SendEmailAction  | response in email body ${measure.value}               | erwer@sdfsf.com |
    | test-0021  | SendSmsMibAction | response in sms body ${measure.value}                 | 123456789       |
    | TEST00022  | updateAttribute  | DANGER                                                | ALARM           |

  @rule_not_exist
  Scenario: delete a rule in Perseo manager from portal with value threshold and action cards
    Given Perseo manager is installed correctly to "delete"
    And configured with tenant "my_tenant" and service "/my_service"
    And create a sensor card of value threshold type, with id "card_4", attribute name "temperature", operator "GREATER_THAN", data type "Quantity", parameter value "34" and connect to "card_5"
    And create a action card of "SendEmailAction" type, with id "card_7", response "response in email body ${measure.value}  ", parameters "erwer@sdfsf.com" and connect to "card_8"
    When delete a rule created
    Then I receive an "No Content" http code
    And Validate that rule name is deleted successfully in db
