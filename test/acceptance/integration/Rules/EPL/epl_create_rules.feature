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

Feature: Append a new rule in Perseo manager
  As a Perseo user
  I want to be able to append a new rule in Perseo manager
  so that they become more functional and useful

  # append rules
  @happy_path
  Scenario: Append a email rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the email action with from "from@from.com" to "to@to.com" subject "test_subject" and body "the new temperature is ${temperature}"
    And with the epl generated and the action, append a new rule in perseo with name "email_rule"
    # Validations
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db


  @happy_path
  Scenario: Append a sms rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "sms_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "sms_rule"
    # Validations
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db


  @happy_path
  Scenario: Append a post rule in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "post_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the post action with payload "the new temperature is ${temperature}" and url "mock_url"
    And with the epl generated and the action, append a new rule in perseo with name "post_rule"
    # Validations
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db


  @happy_path
  Scenario: Append a update rule in Perseo manager
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
    # Validations
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
   #-----------------------------------------------------------------------

  @tenant
  Scenario Outline: append a new rule with differents values in the tenant
    Given set service "<service>" and service path "/"
    # Gen EPL
    And an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | service                                            |
    | test                                               |
    | test34                                             |
    | test_34                                            |
    | 12345678901234567890123456789012345678901234567890 |

  @tenant_error @BUG__ISSUE_29
  Scenario Outline: try to append a new rule with differents values in the tenant
    Given set service "<service>" and service path "/"
    # Gen EPL
    And an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "400" http code in rules request
  Examples:
    | service                                                       |
    | test-34                                                       |
    | test 34                                                       |
    | test(34)                                                      |
    | test=34                                                       |
    | test&34                                                       |
    | test#34                                                       |
    | test.34                                                       |
    | test/34                                                       |
    | test\34                                                       |
    | 0123456789012345678901234567890123456789012345678901234567890 |

  @service_path
  Scenario Outline: append a new rule with differents values in the service path
    Given set service "service" and service path "<service_path>"
    # Gen EPL
    And an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | service_path                                        |
    | /                                                   |
    | /test                                               |
    | /test34                                             |
    | /test34_2                                           |
    | /01234567890123456789012345678901234567890123456789 |

  @service_path_error @BUG__ISSUE_32 
  Scenario Outline: try to append a new rule with differents values in the service path
    Given set service "service" and service path "<service_path>"
    # Gen EPL
    And an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "400" http code in rules request
  Examples:
    | service_path                                         |
    | test                                                 |
    | test45                                               |
    | test45_5                                             |
    | /test-34                                             |
    | /test 34                                             |
    | /test(34)                                            |
    | /test=34                                             |
    | /test&34                                             |
    | /test#34                                             |
    | /test.34                                             |
    | /test\34                                             |
    | /012345678901234567890123456789012345678901234567890 |

#  @attribute_number
#  Scenario Outline: append a new rule with differents attributes quantities
#
#    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "<attribute_number>", an attribute data type "default", an operation type "default" and value "default"
#    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
#    Then I receive an "OK" http code in rules request
#    And Validate that rule name is created successfully
#    And delete a EPL rule created
#  Examples:
#    | rule_name    | attribute_number |
#    | tester_10000 | 1                |
#    | tester_11000 | 5                |
#    | tester_12000 | 10               |
#    | tester_13000 | 50               |

  @rule_name 
  Scenario Outline: append a new rule with differents values in the rule_name
    # Gen EPL
    Given an EPL sentence with name "<rule_name>"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "<rule_name>"
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | rule_name                                 |
    | test                                      |
    | test_                                     |
    | test-                                     |
    | test34                                    |
    | test_34                                   |
    | test-34                                   |
    | TEST45                                    |
    | 01234567890123456789012345678901234567890 |

  @rule_name_error @BUG15 @BUG44 
  Scenario Outline: try to append a new rule with wrong values in the rule_name
    # Gen EPL
    Given an EPL sentence with name "<rule_name>"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "<rule_name>"
    Then I receive an "400" http code in rules request
  Examples:
    | rule_name                                             |
    |                                                       |
    | test 34                                               |
    | test(34)                                              |
    | test=34                                               |
    | test&34                                               |
    | test.34                                               |
    | test\34                                               |
    | test/34                                               |
    | 01234567890123456789012345678901234567890123456789012 |

  @identity_type_name
  Scenario Outline: append a new rule with differents values in the identity Type
    # Gen EPL
    Given an EPL sentence with name "id_type"
    And the entity_type "<entity_type>" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "id_type"
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | entity_type                               |
    | teste                                     |
    | teste_                                    |
    | teste_34                                  |
    | teste-34                                  |
    | teste 34                                  |
    | teste(34)                                 |
    | teste=34                                  |
    | teste&34                                  |
    | teste#34                                  |
    | teste.34                                  |
    | teste\34                                  |
    | 01234567890123456789012345678901234567890 |

  @attribute_type 
  Scenario Outline: append a new rule with differents attributes type, operation type and values
    # Gen EPL
    Given an EPL sentence with name "attributes_arguments"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | <attribute_type>     | <operation>         | <value>         |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "200" http code in rules request
    And Validate that rule name is created successfully in db
  Examples:
    | attribute_type | operation | value    |
    | float          | >         | 1.4      |
    | float          | <         | 2.323    |
    | float          | =         | -34      |
    | string         | =         | 'danger' |
    | string         | like      | 'danger' |


  @rule_type_error @issue35
#  Scenario Outline: try to append a new rule with rule types wrong
#
#    And an EPL with a rule name "<rule_name>", an identity type "Room", an attributes Number "1", an attribute data type "float", an operation type ">" and value "1"
#    When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
#    Then I receive an "400" http code in rules request
#  Examples:
#    | rule_name    | rule_type | template_info | parameters         |
#    | tester_11001 |           | (SMS rule)    | 00123456789        |
#    | tester_11002 | SMS       | (SMS rule)    | 00123456789        |
#    | tester_11003 | fdsfsd    | (SMS rule)    | 00123456789        |
#    | tester_12204 | EMAIL     | (email rule)  | qwwqe@wewqe.com    |
#    | tester_13305 | UPDATE    | (update rule) | sdfsdfsd           |
#    | tester_14406 | POST      | (post rule)   | http://10.10.10.10 |
#    | tester_14407 | 11111     | (post rule)   | http://10.10.10.10 |


  @multiple_rules
  Scenario Outline: appends multiples rules  in Perseo manager
    # Gen EPL
    Given an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    # Create the Rule
    And set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append an amount of "<rule_number>" rules in perseo with prefix name "<rule_prefix_name>"
    Then I receive an "200" http code in rules request
    And list all plain rules
    And validate the rules are "<rule_number>"
  Examples:
    | rule_number | rule_prefix_name |
    | 1           | prefix_1    |
    | 5           | prefix_5    |
#    | 10          | prefix_10   |
#    | 50          | prefix_50   |
#    | 100         | prefix_100  |
#    | 500         | prefix_500  |

  @rule_exist 
  Scenario: append a new rule with same name that other existing
    # Gen EPL
    Given an EPL sentence with name "email_rule"
    And the entity_type "Room" for the EPL
    And the attributes for the EPL
      | attribute_id | attribute_value_type | attribute_operation | attribute_value |
      | temperature  | float                | >                   | 1.5             |
    And generate the epl sentence with the data defined before
    When set the sms action with text "the new temperature is ${temperature}" and number "666999666"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    And with the epl generated and the action, append a new rule in perseo with name "update_rule"
    Then I receive an "400" http code in rules request

