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

Feature: Get a rule in Perseo manager
    As a Perseo user
    I want to be able to get a  rule in Perseo manager
    so that they become more functional and useful

    @happy_path
    Scenario Outline: get a rule in Perseo manager
       Given Perseo manager is installed correctly to "read"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
        When Read the rule name in perseo
        Then I receive an "OK" http code
         And Validate that rule name is found
         And delete a rule created
    Examples:
      |rule_name  |rule_type  |template_info |parameters              |
      |SMS____name|sms        | (SMS rule)   |123456789               |
      |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
      |update_name|update     |              |warning                 |
      |post_name  |post       | (post rule)  |url - mock in localhost |

    @multiples_rules
    Scenario Outline: get rules list in Perseo manager
       Given Perseo manager is installed correctly to "read"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "default", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
         And create "<rule_number>" rules with prefix "<prefix_name>" and "sms" type
        When read all rules that exist in the list
        Then I receive an "OK" http code
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


   