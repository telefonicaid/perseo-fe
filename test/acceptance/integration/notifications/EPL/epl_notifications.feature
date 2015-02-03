# -*- coding: utf-8 -*-
#
# Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
#
# This file is part of perseo
#
# perseo is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# perseo is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with perseo.
# If not, seehttp://www.gnu.org/licenses/.
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

Feature: Launch an action if a rule is triggered in Perseo manager
    As a Perseo user
    I want to be able to launch a action (sms, email or update) if a rule is triggered in Perseo manager
    so that they become more functional and useful

    @happy_path
    Scenario Outline: launch a action if a rule is triggered in Perseo manager
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "json"
        Then I receive an "OK" http code
         And Validate that rule is triggered successfully
         And delete a rule created
    Examples:
        |rule_name  |rule_type  |template_info |parameters              |
        |SMS____name|sms        | (SMS rule)   |123456789               |
        |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
        |update_name|update     |              |warning                 |
        |post___name|post       | (post rule)  |url - mock in localhost |


    @multiples_rules
    Scenario Outline: launch several actions if several rules are triggered in Perseo manager
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
        |1          |prefix_1   |email    |
        |5          |prefix_5   |email    |
        |10         |prefix_10  |email    |
        |50         |prefix_50  |email    |
        |1          |prefix_1   |update   |
        |5          |prefix_5   |update   |
        |10         |prefix_10  |update   |
        |50         |prefix_50  |update   |
        |100        |prefix_100 |update   |


    @attributes_number
    Scenario Outline: launch an action if a rule is triggered in Perseo manager with several attributes
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "<attributes_number>", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "json"
        Then I receive an "OK" http code
         And Validate that rule is triggered successfully
         And delete a rule created
    Examples:
        |rule_name  |attributes_number|rule_type  |template_info |parameters              |
        |SMS____name|1                |sms        | (SMS rule)   |123456789               |
        |SMS____name|5                |sms        | (SMS rule)   |123456789               |
        |SMS____name|10               |sms        | (SMS rule)   |123456789               |
        |SMS____name|50               |sms        | (SMS rule)   |123456789               |
        |EMAIL__name|1                |email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
        |EMAIL__name|5                |email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
        |EMAIL__name|10               |email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
        |EMAIL__name|50               |email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
        |update_name|1                |update     |              |warning                 |
        |update_name|5                |update     |              |warning                 |
        |update_name|10               |update     |              |warning                 |
        |update_name|50               |update     |              |warning                 |
        |post___name|1                |post       | (post rule)  |url - mock in localhost |
        |post___name|5                |post       | (post rule)  |url - mock in localhost |
        |post___name|10               |post       | (post rule)  |url - mock in localhost |
        |post___name|50               |post       | (post rule)  |url - mock in localhost |

    @xml_format
    Scenario Outline: not launch an action if notification is in xml format and the rule associated is not triggered in Perseo manager
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
       When  receives a notification with attributes value "300", metadata value "True" and content "xml"
        Then I receive an "Bad Request" http code
         And delete a rule created
    Examples:
      |rule_name  |rule_type  |template_info |parameters              |
      |SMS____name|sms        | (SMS rule)   |123456789               |
      |EMAIL__name|email      | (Email rule) |aaaaaaa@bbbbbb.ccc      |
      |update_name|update     |              |warning                 |
      |post___name|post       | (post rule)  |url - mock in localhost |

    @rule_type_error
    Scenario Outline: not trigger an notification because the rule type is wrong
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "json"
        Then I receive an "OK" http code
         And delete a rule created
    Examples:
        |rule_name   |rule_type |template_info |parameters        |
        |SMS____name |rtert     | (SMS rule)   |123456789         |
        |tester_1220 |          | (SMS rule)   |123456789         |
        |tester_1230 |121212    | (SMS rule)   |123456789         |
        |tester_1240 |#~&       | (SMS rule)   |123456789         |

    @rule_parameters_error
    Scenario Outline: not trigger an notification but the rule parameter is wrong
       Given Perseo manager is installed correctly to "send"
         And configured with tenant "default" and service "default"
         And an EPL with a rule name "<rule_name>", an identity type "room", an attributes Number "default", an attribute data type "default", an operation type "default" and value "1.5"
         And append a new rule with a rule type "<rule_type>", a template "<template_info>" and a parameters "<parameters>"
         And an identity_id "room2", with attribute number "4", attribute name "attrName" and attribute type "celcius"
        When receives a notification with attributes value "300", metadata value "True" and content "json"
        Then I receive an "OK" http code
         And delete a rule created
    Examples:
        |rule_name  |rule_type  |template_info |parameters        |
        |SMS____name|sms      | (SMS rule)     |345rg             |
        |SMS____name|sms      | (SMS rule)     |                  |
        |SMS____name|sms      | (SMS rule)     |$%$%              |
        |EMAIL__name|email    | (email rule)   |qwd-sddd@qd.com   |
        |EMAIL__name|email    | (email rule)   | @qd.com          |
        |EMAIL__name|email    | (email rule)   |                  |
        |EMAIL__name|email    | (email rule)   | dfsdfsdf@        |
        |EMAIL__name|email    | (email rule)   | dfd@.com         |
        |EMAIL__name|email    | (email rule)   | dssd@qd          |
        |EMAIL__name|email    | (email rule)   |                  |
        |post___name|post     | (post rule)    |                  |
        |post___name|post     | (post rule)    | htf://1.1.1.1    |
        |post___name|post     | (post rule)    | http:1.1.1.1     |
        |post___name|post     | (post rule)    | http://1.1.e.1   |

