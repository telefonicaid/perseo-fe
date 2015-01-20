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

#
#  Notes:
#        * The @skip tag is to skip the scenarios that still are not developed or failed
#            -tg=-skip
#        * For to see "default" values, in properties.json file
#

Feature: Append a new rule in Perseo manager
    As a Perseo user
    I want to be able to append a new rule in Perseo manager
    so that they become more functional and useful

    @happy_path
    Scenario Outline: append a new rule in Perseo manager
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
    Examples:
      |rule_name  |rule_type  |template_info |parameters        |
      |SMS____name|sms        | (SMS rule)   |123456789         |
      |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc|
      |update_name|update     |              |warning           |

    @tenant
    Scenario Outline: append a new rule with differents values in the tenant
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "<tenant>" and service "default"
         And an EPL with a rule name "name_test", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
    Examples:
      |tenant          |
      |test            |
      |test34          |
      |test_34         |
      |tenant length 20|

    @service_path
    Scenario Outline: append a new rule with differents values in the service path
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "<service_path>"
         And an EPL with a rule name "name_test", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
    Examples:
      |service_path                   |
      |/                              |
      |/test                          |
      |/test_34                       |
      |servicepath length 10 one level|
      |servicepath length 10 ten level|

    @rule_name @BUG#32
    Scenario Outline: append a new rule with differents values in the rule_name
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
    Examples:
      |rule_name                  |
    #  |                           |
      |test                       |
      |test_                      |
      |test_34                    |
      |test-34                    |
      |test 34                    |
      |test(34)                   |
      |test=34                    |
      |test&34                    |
   #   |test#34                    |
      |test.34                    |
   #   |test?34                    |
    #  |test€34                    |
    #  |test/34                    |
      |test\34                    |
      |rulename length 1024       |


   @identity_type @BUG#32
   Scenario Outline: append a new rule with differents values in the identity Type
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "<identity_type>", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
   Examples:
      |rule_name|identity_type               |
    # |test_01|                            |
      |test_02|teste                       |
      |test_03|teste_                      |
      |test_04|teste_34                    |
      |test_05|teste-34                    |
      |test_06|teste 34                    |
      |test_07|teste(34)                   |
      |test_08|teste=34                    |
      |test_09|teste&34                    |
      |test_10|teste#34                    |
      |test_11|teste.34                    |
     #|test_11 |teste€34                    |
    # |test_12 |teste/34                    |
      |test_13|teste\34                    |
      |test_14|identity Type length 1024   |

   @attribute_number
   Scenario Outline: append a new rule with differents attributes quantities
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "<attribute_number>", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
   Examples:
      |rule_name    |attribute_number|
      |tester_10000 |1               |
      |tester_11000 |5               |
      |tester_12000 |10              |
      |tester_13000 |50              |

   @attribute_type
   Scenario Outline: append a new rule with differents attributes type, operation type and values
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "<attribute_type>", an operation type "<operation>" and value "<value>"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
   Examples:
      |rule_name |attribute_type|operation|value    |
      |tester_100|float         |>        |1.4      |
      |tester_101|float         |<        |2.323    |
      |tester_102|float         |=        |-34      |
      |tester_103|string        |=        |'danger' |
      |tester_104|string        | like    | 'danger'|

   @rule_type @BUG#33
   Scenario Outline: append a new rule with differents rule types
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
   Examples:
      |rule_name   |rule_type  |template_info |parameters        |
      |tester_1100 |sms        | (SMS rule)   |123456789         |
      |tester_1200 |sms        | (SMS rule)   |001234569         |
      |tester_1300 |sms        | (SMS rule)   |+12345679         |
      |tester_1400 |sms        | (SMS rule)   |+r1234569         |
      |tester_1500 |sms        | (SMS rule)   |                  |
      |tester_1600 |sms        | (SMS rule)   |/12345679         |
      |tester_1700 |sms        | (SMS rule)   |@12345679         |
      |tester_1800 |email      | (email rule) | qwwqe@wewqe.com  |
      |tester_1900 |email      | (email rule) | qwe.sadd@qe.com  |
      |tester_1100 |email      | (email rule) | sd@qd.sd.com     |
      |tester_1110 |email      | (email rule) | qw1.s1dd@q1.c1m  |
      |tester_1120 |email      | (email rule) | qwd_sddd@qd.com  |
      |tester_1130 |email      | (email rule) | qwd-sddd@qd.com  |
      |tester_1140 |email      | (email rule) | @qd.com          |
      |tester_1150 |email      | (email rule) |                  |
      |tester_1160 |email      | (email rule) | dfsdfsdf@        |
      |tester_1170 |email      | (email rule) | dfd@.com         |
      |tester_1180 |email      | (email rule) | dssd@qd          |
      |tester_1190 |update     | (update rule)| sdfsdfsd         |
      |tester_1200 |update     | (update rule)|                  |
      |tester_1210 |udfdf      | (error rule) |                  |
      |tester_1220 |           | (error rule) |                  |
      |tester_1230 |121212     | (error rule) |                  |
    #  |tester_1240 |#~€        | (error rule) |                  |

   @tenant
   Scenario Outline: append a new rule with differents values in the tenant
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "<tenant>" and service "default"
         And an EPL with a rule name "name_test", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
        Then I receive an "OK" http code
         And Validate that rule name is created successfully
         And delete a rule created
   Examples:
      |tenant                |
      |test-34               |
      |test 34               |
      |test(34)              |
      |test=34               |
      |test&34               |
      |test#34               |
      |test.34               |
      |test/34               |
      |test\34               |
      |tenant longer than 20 |

   @multiple_rules
    Scenario Outline: appends multiples rules  in Perseo manager
       Given Perseo manager is installed correctly to "append"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "default", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        When create "<rule_number>" rules with prefix "<prefix_name>" and "sms" type
        Then I receive an "OK" http code
         And read all rules that exist in the list
         And Validate that all rules are found
         And delete all rules created
    Examples:
      |rule_number|prefix_name|
      |1          |prefix_1   |
      |5          |prefix_5   |
      |10         |prefix_10  |
      |50         |prefix_50  |
      |100        |prefix_100 |
      |500        |prefix_500 |

   @rule_exist
   Scenario: append a new rule with same name that other existing
      Given Perseo manager is installed correctly to "append"
        And configured with tenant "default" and service "default"
        And an EPL with a rule name "name_exist", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
        And append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
       When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
       Then I receive an "Bad Request" http code
        And delete a rule created

