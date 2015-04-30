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
# iot_support at tid.es
#
__author__ = 'Iván Arias León (ivan.ariasleon@telefonica.com)'



# Generals constants
import time
from general_utils import *
from http_utils import *

EMPTY = u''

# init constants
SEND_SMS_URL = u'send_sms_url'
SEND_EMAIL_URL = u'send_email_url'
SEND_UPDATE_URL = u'send_update_url'

# url constants
GET_SMS = u'get/sms'
GET_EMAIL = u'get/email'
GET_UPDATE = u'get/update'

# actions type
SMS_EPL_TYPE = u'sms'
EMAIL_EPL_TYPE = u'email'
UPDATE_EPL_TYPE = u'update'
POST_EPL_TYPE = u'post'
EMAIL_CARD_TYPE = u'SendEmailAction'
SMS_CARD_TYPE = u'SendSmsMibAction'
UPDATE_CARD_TYPE = u'updateAttribute'

# response constants
MESSAGE = u'message'
SMTP_DATA = u'smtp_data'
CONTEXT_ELEMENTS = u'contextElements'
ATTRIBUTES = u'attributes'
VALUE = u'value'


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
        self.send_sms_url = kwargs.get(SEND_SMS_URL, EMPTY)
        self.send_email_url = kwargs.get(SEND_EMAIL_URL, EMPTY)
        self.send_update_url = kwargs.get(SEND_UPDATE_URL, EMPTY)
        self.resp = None

    def __create_url(self, operation, rule_type):
        """
        create the url for different requests
        :param rule_type: ms | email | update | post |twitter
        :param operation: several operations such as get, counter, etc
        :return: request url
        """
        # TODO: Si se usa el constructor con send_update_url vacio, que es posible, la url se construye mal
        return "{send_update_url}/{operation}/{rule_type}".format(send_update_url=self.send_update_url,
                                                                  operation=operation, rule_type=rule_type)

    def verify_response_mock(self, rule_type, attributes_value, parameters_value):
        """
        verify the response returned from mock
        If the rule type is update_epl compare with parameters value, if the type is other, with attributes value
        """
        time.sleep(5)  # delay for 5 secs, waiting to arrived the
        if rule_type not in [EMAIL_CARD_TYPE, EMAIL_EPL_TYPE, SMS_CARD_TYPE, SMS_EPL_TYPE, POST_EPL_TYPE,
                             UPDATE_CARD_TYPE, UPDATE_EPL_TYPE]:
            print "exit because rule_type"
            return False
        else:
            # Transform from CARD to EPL
            if rule_type == EMAIL_CARD_TYPE:
                rule_type = EMAIL_EPL_TYPE
            if rule_type == SMS_CARD_TYPE:
                rule_type = SMS_EPL_TYPE
            if rule_type == UPDATE_CARD_TYPE:
                rule_type = UPDATE_EPL_TYPE

        # Get the info from the mock
        self.resp = request('GET', url=self.__create_url("get", rule_type))
        response = convert_str_to_dict(self.resp.text, 'json')
        print response
        print rule_type
        print parameters_value
        if rule_type == UPDATE_EPL_TYPE:
            try:
                if str(response[CONTEXT_ELEMENTS][0][ATTRIBUTES][0][VALUE]) == parameters_value:
                    return True
                else:
                    return False
            except Exception, e:
                assert False, " ERROR - %s does not exists.\n Probably the rule has not been triggered." % (str(e))
        else:
            if rule_type == SMS_EPL_TYPE:
                resp_temp = response[MESSAGE]
            elif rule_type == EMAIL_EPL_TYPE:
                resp_temp = response[SMTP_DATA]
            elif rule_type == POST_EPL_TYPE:
                template_post = convert_str_to_dict(response, 'json')
                resp_temp = template_post[MESSAGE]
            else:
                raise ValueError('The rule_type "{rule_type}" is not supported'.format(rule_type=rule_type))

        # Get the attribute from the string
        attribute_value_position_init = resp_temp.find("<<<") + 3
        attribute_value_position_end = resp_temp.find(">>>")
        try:
            if str(resp_temp[attribute_value_position_init:attribute_value_position_end]) == attributes_value:
                return True
        except Exception, e:
            assert False, " ERROR - %s does not exists.\n Probably the rule has not been triggered." % (str(e))
        return False

    def reset_counters(self, rule_type):
        """
        reset a counter in mock
        :param rule_type: sms | email | update | post |twitter
        """
        self.resp = request('PUT', url=self.__create_url("reset", rule_type))
        assert_status_code(status_codes['OK'], self.resp,
                           "ERROR - " + rule_type + " reset in mock...")

    def get_counter_value(self, rule_type):
        """
        get counter value in a rule type
        :param rule_type: sms | email | update | twitter
        :return: int
        """
        resp = request('GET', url=self.__create_url("counter", rule_type))
        resp_split = resp.text.split(": ")
        return int(resp_split[1])





