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

#Generals constants
import time
import general_utils
import http_utils

EMPTY              = u''

# init constants
SEND_SMS_URL       = u'send_sms_url'
SEND_EMAIL_URL     = u'send_email_url'
SEND_UPDATE_URL    = u'send_update_url'

#url constants
GET_SMS              = u'get/sms'
GET_EMAIL            = u'get/email'
GET_UPDATE           = u'get/update'

# EPL operations
SMS_EPL_TYPE         = u'sms'
EMAIL_EPL_TYPE       = u'email'
UPDATE_EPL_TYPE      = u'update'

# response constants
MESSAGE                  = u'message'
SMTP_DATA                = u'smtp_data'
CONTEXT_ELEMENTS         = u'contextElements'
ATTRIBUTES               = u'attributes'
VALUE                    = u'value'

class Mock:
    """
    mock utils
    """
    def __init__(self, **kwargs):
        """
        constructor
        :param send_sms_url:    send sms url (endpoint) (OPTIONAL)
        :param send_email_url:  send email url (endpoint) (OPTIONAL)
        :param send_update_url: send update url (endpoint) (OPTIONAL)
        """
        self.send_sms_url      = kwargs.get(SEND_SMS_URL, EMPTY)
        self.send_email_url    = kwargs.get(SEND_EMAIL_URL, EMPTY)
        self.send_update_url   = kwargs.get(SEND_UPDATE_URL, EMPTY)

    def __create_url(self, operation, rule_type):

        """
        create the url for different requests
        :param operation: several operations such as get, counter, etc
        :return: request url
        """
        value = "%s/%s/%s" % (self.send_update_url, operation, rule_type)
        return value

    def verify_response_mock (self, rule_type, attributes_value, parameters):
        """
        verify the response returned from mock
        """
        time.sleep(5) # delay for 5 secs
        self.resp = None
        if rule_type == SMS_EPL_TYPE or rule_type == EMAIL_EPL_TYPE or rule_type == UPDATE_EPL_TYPE:
            self.resp = http_utils.request(http_utils.GET, url=self.__create_url("get", rule_type))
            response = general_utils.convert_str_to_dict(self.resp.text,general_utils.JSON)

        if rule_type == SMS_EPL_TYPE:
            attribute_value_position_init = response[MESSAGE].find ("<<<")+3
            attribute_value_position_end  = response[MESSAGE].find (">>>")
            if str(response[MESSAGE][attribute_value_position_init:attribute_value_position_end])  ==  attributes_value: return True
        if rule_type == EMAIL_EPL_TYPE:
            attribute_value_position_init = response[SMTP_DATA].find ("<<<")+3
            attribute_value_position_end  = response[SMTP_DATA].find (">>>")
            if str(response[SMTP_DATA][attribute_value_position_init:attribute_value_position_end])  ==  attributes_value: return True
        if rule_type == UPDATE_EPL_TYPE:
            if str(response[CONTEXT_ELEMENTS][0][ATTRIBUTES][0][VALUE])  ==  parameters[VALUE]: return True
        return False

    def validate_that_rule_was_triggered(self, status):
        """
        Validate that rule is triggered successfully
        """
        assert status, "ERROR - the rule  has not been launched \n        Body: %s" % (str(self.resp.text))

    def reset_counters(self, rule_type):
       """
       reset a counter in mock or all counters
       :param rule_type: sms | email | update | all
       """
       if rule_type == SMS_EPL_TYPE or rule_type == "all":
            self.resp = http_utils.request(http_utils.PUT, url=self.__create_url("reset", SMS_EPL_TYPE))
            http_utils.assert_status_code(http_utils.status_codes[http_utils.OK], self.resp, "ERROR - sms reset in mock...")
       if rule_type == EMAIL_EPL_TYPE or rule_type == "all":
            self.resp = http_utils.request(http_utils.PUT, url=self.__create_url("reset", EMAIL_EPL_TYPE))
            http_utils.assert_status_code(http_utils.status_codes[http_utils.OK], self.resp, "ERROR - email reset in mock...")
       if rule_type == UPDATE_EPL_TYPE or rule_type == "all":
            self.resp = http_utils.request(http_utils.PUT, url=self.__create_url("reset", UPDATE_EPL_TYPE))
            http_utils.assert_status_code(http_utils.status_codes[http_utils.OK], self.resp, "ERROR - update reset in mock...")

    def get_counter_value(self, rule_type):
        """
        get counter value in a rule type
        :param rule_type: sms | email | update
        :return: int
        """
        resp = http_utils.request(http_utils.GET, url=self.__create_url("counter", rule_type))
        resp_split = resp.text.split (": ")
        return int(resp_split [1])




