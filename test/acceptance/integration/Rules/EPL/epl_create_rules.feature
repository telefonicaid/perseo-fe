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
    | rule_name   | rule_type | template_info | parameters              |
    | SMS____name | sms       | (SMS rule)    | 123456789               |
    | EMAIL__name | email     | (Email rule)  | aaaaaaa@bbbbbb.ccc      |
    | update_name | update    |               | warning                 |
    | post_name   | post      | (post rule)   | url - mock in localhost |

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
    | tenant                |
    | test                  |
    | test34                |
    | test_34               |
    | tenant length allowed |

  @tenant_error @BUG_29
  Scenario Outline: try to append a new rule with differents values in the tenant
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "<tenant>" and service "default"
    And an EPL with a rule name "name_test", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "Bad Request" http code
  Examples:
    | tenant                            |
    | test-34                           |
    | test 34                           |
    | test(34)                          |
    | test=34                           |
    | test&34                           |
    | test#34                           |
    | test.34                           |
    | test/34                           |
    | test\34                           |
    | tenant longer than length allowed |

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
    | service_path                         |
    | /                                    |
    | /test                                |
    | /test34                              |
    | /test34_2                            |
    | servicepath length allowed one level |

  @service_path_error @BUG_32
  Scenario Outline: try to append a new rule with differents values in the service path
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "tenant" and service "<service_path>"
    And an EPL with a rule name "name_test", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "Bad Request" http code
  Examples:
    | service_path                            |
    | test                                    |
    | test45                                  |
    | test45_5                                |
    | /test-34                                |
    | /test 34                                |
    | /test(34)                               |
    | /test=34                                |
    | /test&34                                |
    | /test#34                                |
    | /test.34                                |
    | /test\34                                |
    | service path longer than length allowed |

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
    | rule_name    | attribute_number |
    | tester_10000 | 1                |
    | tester_11000 | 5                |
    | tester_12000 | 10               |
    | tester_13000 | 50               |

  @rule_name
  Scenario Outline: append a new rule with differents values in the rule_name
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "OK" http code
    And Validate that rule name is created successfully
    And delete a rule created
  Examples:
    | rule_name               |
    | test                    |
    | test_                   |
    | test-                   |
    | test34                  |
    | test_34                 |
    | test-34                 |
    | TEST45                  |
    | rulename length allowed |

  @rule_name_error @BUG15 @BUG44
  Scenario Outline: try to append a new rule with wrong values in the rule_name
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "Bad Request" http code
  Examples:
    | rule_name                           |
    |                                     |
    | test 34                             |
    | test(34)                            |
    | test=34                             |
    | test&34                             |
    | test.34                             |
    | test\34                             |
    | test/34                             |
    | rulename longer than length allowed |

  @identity_type_name
  Scenario Outline: append a new rule with differents values in the identity Type
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "<identity_type>", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "OK" http code
    And Validate that rule name is created successfully
    And delete a rule created
  Examples:
    | rule_name | identity_type             |
    | test_02   | teste                     |
    | test_03   | teste_                    |
    | test_04   | teste_34                  |
    | test_05   | teste-34                  |
    | test_06   | teste 34                  |
    | test_07   | teste(34)                 |
    | test_08   | teste=34                  |
    | test_09   | teste&34                  |
    | test_10   | teste#34                  |
    | test_11   | teste.34                  |
    | test_13   | teste\34                  |
    | test_14   | identity Type length 1024 |

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
    | rule_name  | attribute_type | operation | value    |
    | tester_100 | float          | >         | 1.4      |
    | tester_101 | float          | <         | 2.323    |
    | tester_102 | float          | =         | -34      |
    | tester_103 | string         | =         | 'danger' |
    | tester_104 | string         | like      | 'danger' |

  @rule_type
  Scenario Outline: append a new rule with differents rule types
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
    Then I receive an "OK" http code
    And Validate that rule name is created successfully
    And delete a rule created
  Examples:
    | rule_name   | rule_type | template_info | parameters         |
    | tester_1100 | sms       | (SMS rule)    | 00123456789        |
    | tester_1220 | email     | (email rule)  | qwwqe@wewqe.com    |
    | tester_1330 | update    | (update rule) | sdfsdfsd           |
    | tester_1440 | post      | (post rule)   | http://10.10.10.10 |

  @rule_type_error @issue35
  Scenario Outline: try to append a new rule with rule types wrong
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
    Then I receive an "Bad Request" http code
  Examples:
    | rule_name    | rule_type | template_info | parameters         |
    | tester_11001 |           | (SMS rule)    | 00123456789        |
    | tester_11002 | SMS       | (SMS rule)    | 00123456789        |
    | tester_11003 | fdsfsd    | (SMS rule)    | 00123456789        |
    | tester_12204 | EMAIL     | (email rule)  | qwwqe@wewqe.com    |
    | tester_13305 | UPDATE    | (update rule) | sdfsdfsd           |
    | tester_14406 | POST      | (post rule)   | http://10.10.10.10 |
    | tester_14407 | 11111     | (post rule)   | http://10.10.10.10 |

  @rule_parameters
  Scenario Outline: append a new rule with differents rule types
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    When append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
    Then I receive an "OK" http code
    And Validate that rule name is created successfully
    And delete a rule created
  Examples:
    | rule_name    | rule_type | template_info | parameters                   |
    | tester_11000 | sms       | (SMS rule)    | 0034123456789                |
    | tester_11010 | sms       | (SMS rule)    | +34123456789                 |
    | tester_12000 | email     | (email rule)  | qwwqe@wewqe.com              |
    | tester_12010 | email     | (email rule)  | qwe.sadd@qe.com              |
    | tester_12020 | email     | (email rule)  | sd@qd.sd.com                 |
    | tester_12130 | email     | (email rule)  | qw1.s1dd@q1.c1m              |
    | tester_14000 | update    | (update rule) | sdfsdfsd                     |
    | tester_15000 | post      | (post rule)   | http://10.10.10.10:8000/path |
    | tester_15010 | post      | (post rule)   | http://10.10.10.10:8000      |
    | tester_15020 | post      | (post rule)   | http://10.10.10.10           |
    | tester_15020 | post      | (post rule)   | https://10.10.10.10          |

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
    | rule_number | prefix_name |
    | 1           | prefix_1    |
    | 5           | prefix_5    |
    | 10          | prefix_10   |
    | 50          | prefix_50   |
    | 100         | prefix_100  |
    | 500         | prefix_500  |

  @rule_exist
  Scenario: append a new rule with same name that other existing
    Given Perseo manager is installed correctly to "append"
    And configured with tenant "default" and service "default"
    And an EPL with a rule name "name_exist", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
    And append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    When append a new rule with a rule type "sms", a template " (SMS rule)" and a parameters "123456789"
    Then I receive an "Bad Request" http code
    And delete a rule created

