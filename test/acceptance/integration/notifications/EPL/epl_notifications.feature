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

Feature: Launch a notification if a rule is triggered in Perseo manager
    As a Perseo user
    I want to be able to launch a notification if a rule is triggered in Perseo manager
    so that they become more functional and useful

    @happy_path
    Scenario Outline: launch a notification if a rule is triggered in Perseo manager
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "<content>"
        Then I receive an "OK" http code
         And Validate that rule is triggered successfully
         And delete a rule created
    Examples:
        |rule_name  |rule_type  |template_info |parameters        |content|
        |SMS____name|sms        | (SMS rule)   |123456789         |json   |
        |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc|json   |
        |update_name|update     |              |warning           |json   |


    @multiples_rules
    Scenario Outline: get rules list in Perseo manager
       Given Perseo manager is installed correctly to "read"
         And configured with tenant "default" and service "default"
         And reset counters in mock "<rule_type>"
         And an EPL with a rule name "rules", an identity type "default", an attributes Number "default", an attribute data type "default", an operation type "default" and value "default"
         And create "<rule_number>" rules with prefix "<prefix_name>" and "<rule_type>" type
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "json"
        Then I receive an "OK" http code
         And Validate that all rules are triggered successfully
         And delete all rules created
       Examples:
        |rule_number|prefix_name|rule_type|
        |1          |prefix_1   |sms      |
        |5          |prefix_5   |sms      |
        |10         |prefix_10  |sms      |
        |50         |prefix_50  |sms      |
        |100        |prefix_100 |sms      |
        |500        |prefix_500 |sms      |
        |1          |prefix_1   |email    |
        |5          |prefix_5   |email    |
        |10         |prefix_10  |email    |
        |50         |prefix_50  |email    |
        |100        |prefix_100 |email    |
        |500        |prefix_500 |email    |
        |1          |prefix_1   |update   |
        |5          |prefix_5   |update   |
        |10         |prefix_10  |update   |
        |50         |prefix_50  |update   |
        |100        |prefix_100 |update   |
        |500        |prefix_500 |update   |


    @attributes_number
    Scenario Outline: launch a notification if a rule is triggered in Perseo manager
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "<attributes_number>", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "<content>"
        Then I receive an "OK" http code
         And Validate that rule is triggered successfully
         And delete a rule created
    Examples:
        |rule_name  |attributes_number|rule_type  |template_info |parameters        |content|
        |SMS____name|1                |sms        | (SMS rule)   |123456789         |json   |
        |SMS____name|5                |sms        | (SMS rule)   |123456789         |json   |
        |SMS____name|10               |sms        | (SMS rule)   |123456789         |json   |
        |SMS____name|50               |sms        | (SMS rule)   |123456789         |json   |
        |EMAIL__name|1                |email      | (Email rule) |aaaaaaa@bbbbbb.ccc|json   |
        |EMAIL__name|5                |email      | (Email rule) |aaaaaaa@bbbbbb.ccc|json   |
        |EMAIL__name|10               |email      | (Email rule) |aaaaaaa@bbbbbb.ccc|json   |
        |EMAIL__name|50               |email      | (Email rule) |aaaaaaa@bbbbbb.ccc|json   |
        |update_name|1                |update     |              |warning           |json   |
        |update_name|5                |update     |              |warning           |json   |
        |update_name|10               |update     |              |warning           |json   |
        |update_name|50               |update     |              |warning           |json   |

    @xml_format
    Scenario Outline: launch a notification in xml format and the rule associated is not triggered in Perseo manager
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
       When  receives a notification with attributes value "300", metadata value "True" and content "<content>"
        Then I receive an "Bad Request" http code
         And delete a rule created
    Examples:
      |rule_name  |rule_type  |template_info |parameters        |content|
      |SMS____name|sms        | (SMS rule)   |123456789         |xml    |
      |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc|xml    |
      |update_name|update     |              |warning           |xml    |