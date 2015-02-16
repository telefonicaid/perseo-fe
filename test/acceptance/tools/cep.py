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
__author__ = 'Iván Arias León (ivan.ariasleon@telefonica.com)'


import string
from lettuce import world
import time
import http_utils
import general_utils
from tools.notification_utils import Notifications
from tools.rules_utils import Rules
from tools.mock_utils import Mock

#generals constants
DEFAULT                      = u'default'
RANDOM                       = u'random'

# init constants
DEFAULT_VALUE                = u'test'
CEP_VERSION                  = u'version'
CEP_SEND_SMS_URL             = u'send_sms_url'
CEP_SEND_EMAIL_URL           = u'send_email_url'
CEP_SEND_UPDATE_URL          = u'send_update_url'
CEP_RULE_POST_URL            = u'rule_post_url'
CEP_RULE_NAME_DEFAULT        = u'rule_name_default'
CEP_TENANT_DEFAULT           = u'tenant_default'
CEP_SERVICE_PATH_DEFAULT     = u'service_path_default'
CEP_IDENTITY_TYPE_DEFAULT    = u'identity_type_default'
CEP_IDENTITY_ID_DEFAULT      = u'identity_id_default'
CEP_ATTRIBUTE_NUMBER_DEFAULT = u'attribute_number_default'
CEP_RULES_NUMBER_DEFAULT     = u'rules_number_default'
CEP_EPL_ATTRIBUTES_DATA_TYPE = u'epl_attribute_data_type'
CEP_EPL_OPERATION            = u'epl_operation'
CEP_EPL_VALUE                = u'epl_value'
CEP_CARD_ACTIVE              = u'card_active'
CEP_RETRIES_RECEIVED_IN_MOCK = u'retries_number'
CEP_DELAY_TO_RETRY           = u'retry_delay'

# Headers constants
MAX_TENANT_LENGTH = 50
TENANT_LENGTH_ALLOWED = u'tenant length 50'
TENANT_LONGER_THAN_ALLOWED = u'tenant longer than 50'
MAX_SERVICE_PATH_LENGTH = 50
SERVICE_PATH_LENGTH_ALLOWED_ONE_LEVEL = u'servicepath length 50 one level'
SERVICE_PATH_LENGTH_ALLOWED_TEN_LEVEL = u'servicepath length 50 ten level'
CHARS_ALLOWED = string.ascii_letters + string.digits+ u'_'
MAX_RULE_NAME_LENGTH  = 950
RULE_NAME_LENGTH_ALLOWED = u'rulename length allowed'
RULE_NAME_RANDOM         = u'rulename random'
RULE_NAME_LONGER_THAN_LENGTH_ALLOWED = u'rulename longer than length allowed'
MAX_IDENTITY_TYPE_LENGTH  = 1024
IDENTITY_TYPE_LENGTH_1024 = u'identity Type length 1024'
MOCK_IN_LOCALHOST = u'url - mock in localhost'

# notifications constants
perseo_notification_path      = u'/notices'

class CEP:
    """
    CEP class
    """

    def __init__(self, cep_url, **kwargs):
        """
        constructor with values by default
        :param cep_url:  cep endpoint (MANDATORY)
        :param send_sms_url: send sms url (OPTIONAL)
        :param send_email_url: send email url (OPTIONAL)
        :param send_update_url: send update url (OPTIONAL)
        :param version: cep version (OPTIONAL)
        :param rule_name_default: rule name by default (OPTIONAL)
        :param tenant_default: tenant by default (OPTIONAL)
        :param service_path_default: service path by default (OPTIONAL)
        :param identity_type_default: identity type by default (OPTIONAL)
        :param identity_id_default: identity id by default (OPTIONAL)
        :param attribute_number_default: attribute number by default (OPTIONAL)
        :param rules_number_default: rules number by default (OPTIONAL)
        :param epl_attribute_data_type: data type by default in epl rules (OPTIONAL)
        :param epl_operation: operation type by default in EPL rules (OPTIONAL)
        :param epl_value: attribute value by default in EPL rules (OPTIONAL)
        :param card_active: active field value by default in Visual rules (OPTIONAL)
        """
        self.cep_url                 = cep_url
        self.cep_send_sms_url        = kwargs.get(CEP_SEND_SMS_URL, DEFAULT_VALUE)
        self.cep_send_email_url      = kwargs.get(CEP_SEND_EMAIL_URL, DEFAULT_VALUE)
        self.cep_send_update_url     = kwargs.get(CEP_SEND_UPDATE_URL, DEFAULT_VALUE)
        self.cep_rule_post_url       = kwargs.get(CEP_RULE_POST_URL, DEFAULT_VALUE)
        self.cep_version             = kwargs.get(CEP_VERSION, DEFAULT_VALUE)
        self.rule_name               = kwargs.get(CEP_RULE_NAME_DEFAULT, DEFAULT_VALUE)
        self.tenant                  = kwargs.get(CEP_TENANT_DEFAULT, DEFAULT_VALUE)
        self.service_path            = kwargs.get(CEP_SERVICE_PATH_DEFAULT, DEFAULT_VALUE)
        self.identity_type           = kwargs.get(CEP_IDENTITY_TYPE_DEFAULT, DEFAULT_VALUE)
        self.identity_id             = kwargs.get(CEP_IDENTITY_ID_DEFAULT, DEFAULT_VALUE)
        self.attributes_number       = int(kwargs.get(CEP_ATTRIBUTE_NUMBER_DEFAULT, 1))
        self.rules_number            = int(kwargs.get(CEP_RULES_NUMBER_DEFAULT, 1))
        self.epl_attribute_data_type = kwargs.get(CEP_EPL_ATTRIBUTES_DATA_TYPE, "float")
        self.epl_operation           = kwargs.get(CEP_EPL_OPERATION, ">")
        self.epl_value               = kwargs.get(CEP_EPL_VALUE, "3")
        self.card_active             = kwargs.get(CEP_CARD_ACTIVE, "1")
        self.retries_number          = kwargs.get(CEP_RETRIES_RECEIVED_IN_MOCK, 5)
        self.retry_delay             = kwargs.get(CEP_DELAY_TO_RETRY, 10)

        world.rules                   = Rules (self.cep_url)
        world.mock                    = Mock (send_sms_url= self.cep_send_sms_url, send_email_url=self.cep_send_email_url, send_update_url=self.cep_send_update_url)

    def verify_CEP (self):
        """
         verify if CEP is running
        """
        resp =  http_utils.request(http_utils.GET, url=self.cep_url+"/check")
        http_utils.assert_status_code(http_utils.status_codes[http_utils.OK], resp, "ERROR - Perseo is not running...")
        world.rules.init_rule_card_dict()  # Initialize the rule card dictionary

    def config_tenant_and_service(self, tenant, service_path):
        """
        configure the tenant and service_path used
        :param tenant: tenant (multi-channels)
        :param service_path: service path
        """
        temp = ""
        if tenant == TENANT_LENGTH_ALLOWED:        self.tenant = general_utils.string_generator(MAX_TENANT_LENGTH, CHARS_ALLOWED)
        elif tenant == TENANT_LONGER_THAN_ALLOWED: self.tenant = general_utils.string_generator(MAX_TENANT_LENGTH+1, CHARS_ALLOWED)
        elif tenant != DEFAULT:                    self.tenant = tenant

        if service_path == SERVICE_PATH_LENGTH_ALLOWED_ONE_LEVEL: self.service_path = "/"+general_utils.string_generator(MAX_SERVICE_PATH_LENGTH, CHARS_ALLOWED)
        elif  service_path == SERVICE_PATH_LENGTH_ALLOWED_TEN_LEVEL:
            for i in range(0, MAX_SERVICE_PATH_LENGTH):
                temp = temp + "/"+general_utils.string_generator(MAX_SERVICE_PATH_LENGTH, CHARS_ALLOWED)
            self.service_path = temp
        elif service_path != DEFAULT: self.service_path = service_path
        world.rules.tenant_and_service(self.tenant, self.service_path)

    def __generate_rule_name (self, rule_name):
        """
        generate rule name if it is not normal
        """

        if rule_name.find(RULE_NAME_RANDOM) >= 0:
            rule_name_length = int (rule_name.split("= ")[1])
            rule_name_temp = general_utils.string_generator(rule_name_length)
        elif rule_name == RULE_NAME_LENGTH_ALLOWED:             rule_name_temp = general_utils.string_generator(MAX_RULE_NAME_LENGTH)
        elif rule_name == RULE_NAME_LONGER_THAN_LENGTH_ALLOWED: rule_name_temp = general_utils.string_generator(MAX_RULE_NAME_LENGTH+1)
        elif rule_name == DEFAULT:                              rule_name_temp = self.rule_name
        else:
            rule_name_temp = rule_name
        return rule_name_temp

    def generate_EPL (self, rule_name, identity_type,  attributes_number, attribute_data_type, operation, value):
        """
        generate a EPL query dinamically.
        """
        self.rule_name = self.__generate_rule_name(rule_name)

        if identity_type == MAX_IDENTITY_TYPE_LENGTH: self.identity_type = general_utils.string_generator(IDENTITY_TYPE_LENGTH_1024)
        elif identity_type != DEFAULT:                self.identity_type = identity_type

        if attributes_number != DEFAULT: self.attributes_number = int (attributes_number)
        if attribute_data_type != DEFAULT: self.epl_attribute_data_type = attribute_data_type
        if operation != DEFAULT:  self.epl_operation = operation
        if value != DEFAULT: self.epl_value = value
        return world.rules.generate_EPL(self.rule_name, self.identity_type, self.attributes_number, self.epl_attribute_data_type, self.epl_operation, self.epl_value)

    def notif_configuration(self, identity_id,attribute_number, attributes_name, attribute_type):
        """
        configuration to notifications
        """
        if identity_id != DEFAULT: self.identity_id = identity_id
        if attribute_number != DEFAULT: self.attribute_number = attribute_number
        if attributes_name != DEFAULT: self.attributes_name = attributes_name
        if attribute_type != DEFAULT: self.attribute_type = attribute_type

    def received_notification(self, attributes_value, metadata_value, content):
        """
        notifications
        :param attributes_value: attribute value
        :param metadata_value: metadata value (true or false)
        :param content: xml or json
        """
        self.content = content
        self.metadata_value = metadata_value
        metadata_attribute_number = 1
        self.notification = Notifications (self.cep_url+perseo_notification_path,tenant=self.tenant, service_path=self.service_path, content=self.content)
        if self.metadata_value:
            self.notification.create_metadatas_attribute(metadata_attribute_number, RANDOM, RANDOM, RANDOM)
        self.notification.create_attributes (self.attributes_number, self.attributes_name, self.attribute_type, attributes_value)
        return self.notification.send_notification(self.identity_id, self.identity_type)

    def validate_HTTP_code(self, expected_status_code, resp):
        """
        validate http status code
        :param expected_status_code: Http code expected
        """
        http_utils.assert_status_code(http_utils.status_codes[expected_status_code], resp, "Wrong status code received: %s. Expected: %s. \n\nBody content: %s" \
                                                                            % (str(resp.status_code), str(http_utils.status_codes[expected_status_code]), str(resp.text)))

    def set_rule_type_and_parameters (self, rule_type, parameters=""):
        """
        set rule type and parameters
        """
        if rule_type == "post":
             if parameters == MOCK_IN_LOCALHOST: parameters = self.cep_rule_post_url + "/send/post"
        self.rule_type=rule_type
        return parameters

    #   --------------  Visual Rules  -----------------------------
    def new_visual_rule (self, rule_name, active):
        """
        create a new visual rule
        :param rule_name:
        :param active:
        """
        self.rule_name = self.__generate_rule_name(rule_name)
        self.card_active = active
        world.rules.create_rule_card(self.rule_name, self.card_active)


    #   --------------  Validations  -----------------------------

    def validate_that_rule_was_triggered(self):
        """
         Validate that rule is triggered successfully
        """
        self.attributes_value = self.notification.get_attributes_value()
        self.parameters=world.rules.get_parameters()
        status=world.mock.verify_response_mock (self.rule_type, self.attributes_value, self.parameters)
        world.mock.validate_that_rule_was_triggered(status)

    def validate_that_all_rule_were_triggered(self):
        """
        Validate that all rules were triggered successfully
        """
        c=0
        self.rules_number = world.rules.get_rules_number()
        for i in range(int(self.retries_number)):
            value = world.mock.get_counter_value(self.rule_type)
            if value == self.rules_number:
                break
            c+=1
            print " WARN - Retry to get counter value in the mock. No: ("+ str(c)+")"
            time.sleep(self.retry_delay)
        if self.rules_number != value: world.rules.delete_rules_group(world.prefix_name)
        assert self.rules_number == value, "ERROR - All notifications are not received. Sent: %s and received: %s" % (str(self.rules_number), str(value))

