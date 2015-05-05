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

import time
from http_utils import *
from tools.mongo_utils import Mongo
from general_utils import *


# general constants
DEFAULT = 'default'

# url constants
RULES_EPL_PATH = 'rules'
RULE_CARD_PATH = 'm2m/vrules'
APPEND_EPL_RULE = 'append_epl_rule'
APPEND_CARD_RULE = 'append_card_rule'
DELETE_EPL_RULE = 'EPL'
DELETE_CARD_RULE = 'visual_rules'
GET_EPL_RULE = 'get_epl_rule'
GET_CARD_RULE = 'get_card_rule'
UPDATE_CARD_RULE = 'update_card_rule'


# Headers constants
HEADER_ACCEPT = 'Accept'
HEADER_CONTENT_TYPE = 'Content-Type'
HEADER_APPLICATION = 'application/'
HEADER_TENANT = 'Fiware-Service'
HEADER_SERVICE_PATH = 'Fiware-ServicePath'
HEADER_USER_AGENT = 'User-Agent'


# REQUESTs
# append labels
DATA = 'data'
NAME = 'name'
ATTR_NAME = 'attrName'
ATTR_TYPE = 'attrType'
CONTEXTTYPE = 'contextType'
ATTRIBUTE = 'attribute'
VALUE = 'value'
TEXT = 'text'
ACTION = 'action'
TYPE = 'type'
TEMPLATE = 'template'
PARAMETERS = 'parameters'
TO = 'to'
FROM = 'from'
URL = 'url'
MESSAGE = 'message'

# EPL operations
SMS_EPL_TYPE = 'sms'
EMAIL_EPL_TYPE = 'email'
UPDATE_EPL_TYPE = 'update'
POST_EPL_TYPE = 'post'

# Visual Rules constants
ID = 'id'
SENSOR_CARD = 'SensorCard'
ACTION_CARD = 'ActionCard'
TIME_CARD = 'TimeCard'
SENSOR_CARD_TYPE = 'sensorCardType'
ACTION_CARD_TYPE = 'actionCardType'
TIME_CARD_TYPE = 'timeCardType'
SC_NOT_UPDATED = 'notUpdated'
SC_REGEXP = 'regexp'
SC_TYPE = 'type'
SC_VALUE_THRESHOLD = 'valueThreshold'
SC_ATTR_THRESHOLD = 'attributeThreshold'
SC_CEP_EPL = 'ceprule'
AC_SMS_TYPE = 'SendSmsMibAction'
AC_EMAIL_TYPE = 'SendEmailAction'
AC_UPDATE_TYPE = 'updateAttribute'
TC_TIME_ELAPSED = 'timeElapsed'

VISUAL_RULES = 'visual_rules'
CONNECTED_TO = 'connectedTo'
CONDITION_LIST = 'conditionList'
SENSOR_DATA = 'sensorData'
CONFIG_DATA = 'configData'
TIME_DATA = 'timeData'
TIME_TYPE = 'timeType'
PARAMETER_VALUE = 'parameterValue'
OPERATOR = 'operator'
OP_EQUAL_TO = 'EQUAL_TO'
OP_MATCH = 'MATCH'
OP_DIFFERENT_TO = 'DIFFERENT_TO'
OP_GREATER_THAN = 'GREATER_THAN'
INTERVAL = 'interval'
MEASURE_NAME = 'measureName'
DATA_TYPE = 'dataType'
DATA_TYPE_TEXT = 'Text'
DATA_TYPE_QUANTITY = 'Quantity'
SCOPE = 'scope'
SCOPE_LAST_MEASURE = 'LAST_MEASURE'
SCOPE_XPATH = 'XPATH'
SCOPE_OBSERVATION = 'OBSERVATION'
NOT = 'Not'
REPEAT = 'repeat'
REPEAT_VALUE = '-1'
CONTEXT = 'context'
ASSET = 'ASSET'
PARAMETER_NAME = 'parameterName'
EPL = 'EPL'

AC_MAIL_FROM = 'mail.from'
AC_MAIL_FROM_VALUE = 'iot_support@tid.es'
AC_MAIL_TO = 'mail.to'
AC_MAIL_SUBJECT = 'mail.subject'
AC_MAIL_MESSAGE = 'mail.message'
AC_MAIL_SUBJ_VALUE = 'IoT message'
AC_SMS_NAME = 'sms'
AC_SMS_TO = 'sms.to'
AC_SMS_MESSAGE = 'sms.message'
RESPONSE = 'response'
ACTION_DATA = 'actionData'
USER_PARAMS = 'userParams'
ACTIVE = 'active'
CARDS = 'cards'
X_AUTH_TOKEN = 'X-Auth-Token'
X_AUTH_TOKEN_VALUE = 'tokenValue'
CONTEXT_LENGTH = 'Content-Length'
COUNT = 'count'


class Rules:
    """
    Manage Perseo requests / responses.
    """

    def __init__(self, cep_url):
        """
        constructor
        :param cep_url:  cep endpoint (MANDATORY)
        """
        self.cep_url = cep_url
        self.tenant = None
        self.service_path = None

    def __create_url(self, operation=None, name=''):
        """
        create the url for different requests
        :param operation: several operations such as create, read, delete rules
        :param name: label name
        :return: request url
        """
        if operation == APPEND_EPL_RULE:
            url = "%s/%s" % (self.cep_url, RULES_EPL_PATH)
        elif operation == DELETE_EPL_RULE or operation == GET_EPL_RULE:
            url = "%s/%s/%s" % (self.cep_url, RULES_EPL_PATH, name)
        elif operation == APPEND_CARD_RULE:
            url = "%s/%s" % (self.cep_url, RULE_CARD_PATH)
        elif operation == DELETE_CARD_RULE or operation == GET_CARD_RULE or operation == UPDATE_CARD_RULE:
            url = "%s/%s/%s" % (self.cep_url, RULE_CARD_PATH, name)
        else:
            raise ValueError('The operation selected "{operation}" is not permited'.format(operation=operation))
        return url

    def __create_headers(self, operation=EPL):
        """
        create the header for different requests
        :param operation: EPL o visual_rules
        :return: headers dictionary
        """
        content = 'json'
        headers = {
            HEADER_ACCEPT: HEADER_APPLICATION + content,
            HEADER_CONTENT_TYPE: HEADER_APPLICATION + content,
            HEADER_TENANT: self.tenant,
            HEADER_SERVICE_PATH: self.service_path
        }
        if operation == VISUAL_RULES:
            headers[X_AUTH_TOKEN] = X_AUTH_TOKEN_VALUE
        return headers

    # -------------------------- EPL ----------------------------------------------------------------

    def set_tenant_and_service(self, tenant, service_path):
        """
        configure the tenant and service_path used
        :param tenant: tenant (multi-channels)
        :param service_path: service path
        """
        self.tenant = tenant
        self.service_path = service_path

    def generate_epl(self, rule_name, identity_type, attributes_number, attribute_data_type, operation, value):
        """
        Generate a EPL query dinamically.
        :param rule_name: rule name for EPl query
        :param identity_type: identity type from CB notification
        :param attribute_data_type: data type of the attribute
        :param attributes_number: quantity of attributes to verify in rule
        :param operation: operation type (>, <, >=, <=, =)
        :param value: value to verify in rule
        """
        text_temp = 'select *,"' + rule_name + '" as ruleName, "' + self.service_path + '" as service, "' + self.tenant + '" as tenant, *'
        pattern_temp = ', ev.id? as Meter from pattern [every ev=iotEvent('
        type_temp = 'type="' + identity_type + '")]'
        select_temp = ""
        iot_event_temp = ""
        for i in range(0, int(attributes_number)):
            attribute = ATTR_NAME + "_" + str(i)
            select_temp = select_temp + ', ev.' + attribute + '? as ' + attribute + '_var'
            iot_event_temp = iot_event_temp + 'cast(cast(' + attribute + '?,String),' + attribute_data_type + ')' + operation + value + ' and '
        epl = text_temp + select_temp + pattern_temp + iot_event_temp + type_temp
        return epl

    @staticmethod
    def generate_parameters(rule_type, parameter_info=None):
        """
        generate a new parameter according to the rule type
        :param rule_type: (SMS, email, update, twitter)
        :param parameter_info: several parameter depending of rule type
        """
        if rule_type == SMS_EPL_TYPE:
            return {TO: parameter_info}
        elif rule_type == EMAIL_EPL_TYPE:
            return {TO: parameter_info, FROM: parameter_info}
        elif rule_type == UPDATE_EPL_TYPE:
            return {NAME: "ALARM", VALUE: parameter_info, TYPE: "message"}
        elif rule_type == POST_EPL_TYPE:
            return {URL: parameter_info}
        else:
            return {}

    def __generate_template(self, template_info=None, attributes_number=0):
        """
        generate a new template according to the attributes number
        :param template_info: additional info in template
        """
        template_str = ''
        for i in range(0, int(attributes_number)):
            attrVar = ATTR_NAME + "_" + str(i) + '_var'
            template_str = template_str + "Element ${Meter} has value <<<${" + attrVar + "}" + ">>> \n"
        template_str = template_str + " -- " + template_info
        return template_str

    def create_epl_rule(self, rule_name, rule_type, template_info, parameters, EPL, attributes_number):
        """
         Create a new epl rule
        :param EPL: EPL query
        :param template_info: template info to sms or email types
        :param rule_type: rule type
        :param parameters: several parameter depending of rule type
        """
        if attributes_number == 'default':
            attributes_number = 1
        else:
            int(attributes_number)
        payload_dict = {
            NAME: rule_name,
            TEXT: EPL,
            ACTION: {
                TYPE: rule_type,
                TEMPLATE: self.__generate_template(template_info, attributes_number),
                PARAMETERS: self.generate_parameters(rule_type, parameters)
            }
        }
        if rule_type == UPDATE_EPL_TYPE:  # update action does not use template
            del payload_dict[ACTION][TEMPLATE]
        if rule_type == POST_EPL_TYPE:
            template_post = {
                MESSAGE: payload_dict[ACTION][TEMPLATE]
            }
            payload_dict[ACTION][TEMPLATE] = convert_dict_to_str(template_post, 'json')
        payload = convert_dict_to_str(payload_dict, 'json')
        return request('POST', url=self.__create_url(APPEND_EPL_RULE),
                       headers=self.__create_headers(), data=payload)

    def create_several_epl_rules(self, prefix_name, rules_number, rule_type, identity_type, attributes_number,
                                 epl_attribute_data_type, epl_operation, epl_value, parameters=''):
        """
        create N rules with the same rule type
        :param prefix_name:
        :param parameters:
        :param rule_number: quantity of rules created
        :param rule_type: rule type
        """
        template_info = " (triggered rule)"

        if rule_type == SMS_EPL_TYPE:
            parameters = "34123456789"
        elif rule_type == EMAIL_EPL_TYPE:
            parameters = "xxxxxx@fffff.com"
        elif rule_type == UPDATE_EPL_TYPE:
            parameters = "danger"
        for i in range(0, rules_number):
            rule_name = "%s_%s_%s" % (prefix_name, str(i), rule_type)
            epl = self.generate_epl(rule_name, identity_type, attributes_number,
                                    epl_attribute_data_type, epl_operation, epl_value)
            self.create_epl_rule(rule_name, rule_type, template_info, parameters, epl, attributes_number)

    def get_rule_by_name(self, name):
        """
         Read the rule name in perseo
        :param name:
        """
        return request('GET', url=self.__create_url(GET_EPL_RULE, name),
                       headers=self.__create_headers())

    def read_a_rules_list(self):
        """
        read all rules that exist in the list
        """
        return request('GET', url=self.__create_url(GET_EPL_RULE),
                       headers=self.__create_headers())

    # -------------------------- CARDS ------------------------------------------------------------
    @staticmethod
    def __one_parameter(name, value):
        """
        create one parameter to userParams in action card
        :param name: parameter name
        :param value: parameter value
        :return: dict with name and value
        """
        return {
            NAME: ''.join(name),
            VALUE: ''.join(value)
        }

    def __generate_card_parameters(self, action_type, response, parameters):
        """
        generate the several parameters in all action card type
        :param action_type: SendEmailAction | SendSmsAction
        :param response: message in email or sms
        :param parameters: mobile number or address email account
        """
        temp_list = []
        email_parameters_list = [
            {
                AC_MAIL_FROM: AC_MAIL_FROM_VALUE
            },
            {
                AC_MAIL_TO: parameters
            },
            {
                AC_MAIL_SUBJECT: AC_MAIL_SUBJ_VALUE
            },
            {
                AC_MAIL_MESSAGE: response + " -- (Email rule)"
            }
        ]
        sms_parameters_list = [
            {
                AC_SMS_TO: parameters
            },
            {
                AC_SMS_MESSAGE: response + " -- (SMS rule)"
            }
        ]
        update_parameters_list = {
            parameters: response
        }  # update action card is not a list
        if action_type in [AC_EMAIL_TYPE, AC_SMS_TYPE]:
            if action_type == AC_EMAIL_TYPE:
                user_params = email_parameters_list
            else:
                user_params = sms_parameters_list
            for i in range(0, len(user_params)):
                temp_list.append(self.__one_parameter(user_params[i].keys(), user_params[i].values()))
            return temp_list
        elif action_type == AC_UPDATE_TYPE:
            # self.parameters_value = response
            return self.__one_parameter(update_parameters_list.keys(), update_parameters_list.values())
        else:
            raise ValueError('The action type "{action_type}" is not supported'.format(action_type=action_type))


    # def init_rule_card_dict(self):
    # """
    # Initialize the rule card dictionary
    # """
    # self.rule_card_dict = {NAME: None,
    # ACTIVE: None,
    # CARDS: []
    # }

    def create_sensor_card(self, sc_id_card='', sensor_card_type='', connected_to='', parameter_value='', interval='',
                           operator='', measure_name='', data_type='', parameter_name=''):
        """
        Create a new sensor card
        :param id: card identifier used in connectedTo field
        :param sensorCardType: sensor card type ( notUpdated | id | type | valueThreshold | attributeThreshold | EPL )
        :param connectedTo: next card connected to this card
        :param parameterValue: value to match
        :param interval: Interval to verify
        :param operator: GREATER_THAN|MINOR_THAN|EQUAL_TO|GREATER_OR_EQUAL_THAN|MINOR_OR_EQUAL_THAN |DIFFERENT_TO
        :param dataType: used in valueThreshold and attributeThreshold cards. Possible values ( Quantity | Text )
        :param measureName: name of property monitored
       :return: sensor card dictionary
        """
        if sensor_card_type == SC_NOT_UPDATED:
            scope = SCOPE_LAST_MEASURE
            operator = OP_EQUAL_TO
        elif sensor_card_type == SC_REGEXP:
            scope = SCOPE_XPATH
            operator = OP_MATCH
            parameter_name = ID
        elif sensor_card_type == SC_TYPE:
            scope = SCOPE_XPATH
            parameter_name = TYPE
            data_type = DATA_TYPE_TEXT
        elif sensor_card_type == SC_VALUE_THRESHOLD or sensor_card_type == SC_ATTR_THRESHOLD:
            scope = SCOPE_OBSERVATION
            if sensor_card_type == SC_ATTR_THRESHOLD:
                parameter_value = "${" + parameter_value + "}"
        elif sensor_card_type == SC_CEP_EPL:
            scope = SCOPE_OBSERVATION
            operator = OP_EQUAL_TO
            measure_name = EPL
        else:
            raise ValueError("ERROR - Sensor Card type does not is allowed: {sensor_card_type}".format(
                sensor_card_type=sensor_card_type))

        sensor_card = {
            ID: sc_id_card,
            TYPE: SENSOR_CARD,
            SENSOR_CARD_TYPE: sensor_card_type,
            CONNECTED_TO: [connected_to],
            CONDITION_LIST: [
                {
                    SCOPE: scope,
                    PARAMETER_VALUE: parameter_value,
                    PARAMETER_NAME: parameter_name,
                    NOT: False,
                    OPERATOR: operator
                }
            ],
            TIME_DATA: {
                INTERVAL: interval,
                REPEAT: REPEAT_VALUE,
                CONTEXT: ''
            },
            SENSOR_DATA: {
                MEASURE_NAME: measure_name,
                DATA_TYPE: data_type
            },
            CONFIG_DATA: {
            }
        }
        return sensor_card

    def create_action_card(self, ac_id_card='', rule_type='', connected_to='', response='', parameters=''):
        """
        Create a new action card
        :param id: card identifier used in connectedTo field
        :param sensorCardType: action card type ( updateAttribute | SendSmsMibAction | SendEmailAction )
        :param connectedTo: next card connected to this card
        :param response: used by sms and email messages, and update attribute value
        :param: parameters: used sms(mobile number), email (email.to) and update (attribute)
        """
        if rule_type not in [AC_EMAIL_TYPE, AC_SMS_TYPE, AC_UPDATE_TYPE]:
            raise ValueError("ERROR - ActionCard type does not is allowed: {rule_type}".format(rule_type=rule_type))
        action_card = {
            ID: ac_id_card,
            CONNECTED_TO: [connected_to],
            TYPE: ACTION_CARD,
            ACTION_DATA: {
                USER_PARAMS: self.__generate_card_parameters(rule_type, response, parameters),
                NAME: rule_type,
                TYPE: rule_type
            }
        }
        return action_card

    def create_time_card(self, tc_id_card='', time_card_type='', interval='', connected_to=''):
        """
        Create a new time card
        :param id: card identifier used in connectedTo field
        :param timeCardType: time card type ( timeElapsed )
        :param connectedTo: next card connected to this card
        :param interval: Interval to wait
        """
        if time_card_type != TC_TIME_ELAPSED:
            raise ValueError(
                "ERROR - TimeCard type does not is allowed: {time_card_type}".format(time_card_type=time_card_type))
        time_card = {
            ID: tc_id_card,
            TYPE: TIME_CARD,
            CONNECTED_TO: [connected_to],
            SENSOR_CARD_TYPE: time_card_type,
            TIME_DATA: {
                CONTEXT: ASSET,
                INTERVAL: interval,
                REPEAT: "0"
            },
            CONFIG_DATA: {
                TIME_TYPE: time_card_type
            }
        }
        return time_card

    def create_rule_card(self, rule_name, active, cards):
        """
        create a new card rule
        :param rule_name: rule name
        :param active: if is active ("1") or not ("0")
        """
        rule_card_dict = {
            NAME: rule_name,
            ACTIVE: int(active),
            CARDS: cards
        }
        payload = convert_dict_to_str(rule_card_dict, 'json')
        return request('POST', url=self.__create_url(APPEND_CARD_RULE),
                       headers=self.__create_headers(VISUAL_RULES), data=payload)

    def create_several_visual_rules(self, step, rules_number, prefix, ac_card_type):
        """
        Create N visual rules with N sensor cards and an action card
        :param prefix: prefix used in rule name
        :param ac_card_type: rule type in action card
        :param step: append sensor cards into the visual rule [{"sensorCardType", "notUpdated"}, {"sensorCardType", "regexp"}]
                     the format of the table is:
                     | sensorCardType |
                      values allowed: notUpdated, regexp, type, valueThreshold, attributeThreshold or ceprule
        :param rule_number: number of visual rules created
        :param action_card_type: action card used in all visual rules
        """

        assert len(step.hashes) > 0, "ERROR - it is necessary to append a sensor card." \
                                     "\n   ex:\n      | sensorCardType |\n      | regexp           |" \
                                     "\n     values allowed: notUpdated, regexp, type, valueThreshold, attributeThreshold or ceprule "
        attribute_name = 'temperature'
        attribute_to_refer = 'temp_refer'
        identity_id = 'room1'
        identity_type = 'room'
        epl_query = 'sadada sadsadas asdasd asdasd'
        cards = []
        for line in step.hashes:
            # sensor cards
            sensor_card_type = line[SENSOR_CARD_TYPE]
            if sensor_card_type == SC_NOT_UPDATED:
                self.create_sensor_card(sensor_card_type=SC_NOT_UPDATED, sc_id_card="card_1", interval="50",
                                        measure_name=attribute_name, parameter_value="250", connected_to="card_2")
            elif sensor_card_type == SC_REGEXP:
                self.create_sensor_card(sensor_card_type=SC_REGEXP, sc_id_card="card_2", parameter_value=identity_id,
                                        connected_to="card_3")
            elif sensor_card_type == SC_TYPE:
                self.create_sensor_card(sensor_card_type=SC_TYPE, sc_id_card="card_3", parameter_value=identity_type,
                                        operator=OP_EQUAL_TO, connected_to="card_4")
            elif sensor_card_type == SC_VALUE_THRESHOLD:
                self.create_sensor_card(sensor_card_type=SC_VALUE_THRESHOLD, sc_id_card="card_4",
                                        measure_name=attribute_name,
                                        operator=OP_GREATER_THAN, data_type=DATA_TYPE_QUANTITY, parameter_value="1",
                                        connected_to="card_5")
            elif sensor_card_type == SC_ATTR_THRESHOLD:
                self.create_sensor_card(sensor_card_type=SC_ATTR_THRESHOLD, sc_id_card="card_5",
                                        measure_name=attribute_name,
                                        operator=OP_GREATER_THAN, data_type=DATA_TYPE_QUANTITY,
                                        parameter_value=attribute_to_refer, connected_to="card_6")
            elif sensor_card_type == SC_CEP_EPL:
                self.create_sensor_card(sensor_card_type=SC_CEP_EPL, sc_id_card="card_6", parameter_value=epl_query,
                                        connected_to="card_7")
            # action card
            if ac_card_type == AC_EMAIL_TYPE:
                response = "response in email body ${measure.value}"
                parameters = "sdfsdfsd@dfdsfds.com"
            elif ac_card_type == AC_SMS_TYPE:
                response = "response in sms body ${measure.value}"
                parameters = "1234567890"
            elif ac_card_type == AC_UPDATE_TYPE:
                response = "DANGER"
                parameters = "ALARM"
            else:
                raise ValueError('The ac card type "{ac_card_type}" is not supported'.format(ac_card_type=ac_card_type))
            cards.append(self.create_action_card(ac_id_card="card_7", rule_type=ac_card_type, connected_to="card_8",
                                                 response=response,
                                                 parameters=parameters))
        # multiples rules
        for i in range(int(rules_number)):
            # The dictionary is initialized when finished to create a rule
            status_code = self.create_rule_card("%s_%s_%s" % (prefix, str(i), ac_card_type), "1", cards).status_code
            if status_code != status_codes['Created']:
                raise ValueError('Error al crear las tarjetas')
                # Restore the same dictionary to repeat multiples rules, only change the name

    def get_all_visual_rules(self):
        """
        get all visual rules stored
        """
        return request('GET', url=self.__create_url(GET_CARD_RULE),
                       headers=self.__create_headers(VISUAL_RULES))

    def get_one_visual_rules(self, name=''):
        """
        get only visual rule
        :param name:
        """
        return request('GET', url=self.__create_url(GET_CARD_RULE, name),
                       headers=self.__create_headers())

    def update_a_visual_rule(self, rule_name, active=None, cards=None):
        """
        update a visual rule existent
        :param rule_name:
        """
        rule_card_dict = {
            NAME: rule_name,
        }
        if active is not None:
            rule_card_dict.update({ACTIVE: int(active)})
        if cards is not None:
            rule_card_dict.update({CARDS: cards})
        payload = convert_dict_to_str(rule_card_dict, 'json')
        return request('PUT', url=self.__create_url(UPDATE_CARD_RULE, rule_name),
                       headers=self.__create_headers(VISUAL_RULES), data=payload)

    # ---------------------- DELETE ----------------------------------------------------------------
    def delete_one_rule(self, method, name=''):
        """
        Delete an rule (epl or visual rule)
        :param method: method used. Values allowed (EPL or visual_rules)
        :param name: rule name
        """
        return request('DELETE', url=self.__create_url(method, name),
                       headers=self.__create_headers())

    def delete_rules_group(self, method, prefix, rules_number, rule_type):
        """
        delete all rules created with a prefix and a rule type in a method (EPL or visual_rules)
        :param method: method (EPL or visual_rules)
        :param prefix: prefix used in rule name
        """
        for i in range(0, int(rules_number)):
            self.delete_one_rule(method, "%s_%s_%s" % (prefix, str(i), rule_type))

    # ---------------------- VALIDATIONS -----------------------------------------------------------
    def validate_HTTP_code(self, expected_status_code, resp):
        """
        validate http status code
        :param expected_status_code: Http code expected
        """
        assert_status_code(status_codes[expected_status_code], resp,
                           "Wrong status code received: %s. Expected: %s. \n\nBody content: %s" \
                           % (str(resp.status_code), str(status_codes[expected_status_code]),
                              str(resp.text)))

    def validate_rule_response(self, resp):
        """
        validate rule in response
        """
        temp_dict = convert_str_to_dict(resp.text, 'json')
        assert temp_dict["error"] == None, \
            "Error - in create rule received:  \n %s." % (str(resp.text))

    def validate_delete_rule(self, resp, exist=1):
        """
        validate that the rule is deleted
        :param exist: 1 exist rule before delete  - 0 rule does not exist before delete
        """
        dict_temp = convert_str_to_dict(resp.text, 'json')
        assert dict_temp[DATA][0] == exist, \
            "ERROR - the rule does not exist..."

    def validate_get_a_rule(self, resp, name):
        """
        Validate that rule name exists in perseo
        """
        dict_temp = convert_str_to_dict(resp.text, 'json')

        assert dict_temp["error"] == None, \
            "Error - in read a rule received:  \n %s." % (str(resp.text))

        assert dict_temp[DATA][NAME] == name, \
            "Error - name is wrong:  \n %s. \n " % (str(resp.text))

    def validate_all_rules(self, resp, number, prefix_name, rule_type):
        """
        Validate that all rules are found
        """
        print resp.text
        dict_temp = convert_str_to_dict(resp.text, 'json')
        print dict_temp
        print resp.text
        assert dict_temp["error"] == None, \
            "Error - in read a rule received:  \n %s." % (str(resp.text))
        for i in range(0, int(number)):  # review each rule created
            resp = False
            for j in range(1, len(dict_temp[DATA])):  # against each element in DB, returned in the response
                if dict_temp[DATA][j][NAME] == "{prefix_name}_{i}_{rule_type}".format(prefix_name=prefix_name, i=i,
                                                                                      rule_type=rule_type):
                    resp = True
                    break
        assert resp, \
            "Error - name %s_%s_%s does not exist:  \n %s." % (
                prefix_name, str(i), rule_type, str(resp.text))

    def validate_all_rules_mongo(self, mongo, number, prefix_name, rule_type):
        """
        Generate the names generated before and check if they are in mongo
        :param resp:
        :param number:
        :param prefix_name:
        :param rule_type:
        :return:
        """

        for i in range(0, int(number)):
            rule_name = "%s_%s_%s" % (prefix_name, str(i), rule_type)
            mongo.connect()
            mongo.choice_database('cep')
            mongo.choice_collection('rules')
            if mongo.find_data({'name': rule_name}).count() == 1:
                for line in mongo.find_data({'name': rule_name}):
                    print line
                print mongo.find_data({'name': rule_name}).count()
                continue
            else:
                print mongo.find_data({'name': rule_name}).count()
                return False
        return True


    @staticmethod
    def validate_card_rule_in_mongo(driver, name):
        """
        Validate that card rule is created successfully in db
        :param driver: Mongo class into mongo_utils.py
        """
        temp_name = None
        cursor = driver.find_data({NAME: name})
        for doc in cursor:
            temp_name = doc[NAME]
        assert temp_name == name, "The rule %s has not been created..." % (
            name)

    def card_rule_does_not_exists_in_mongo(self, driver, name):
        """
        Validate that card rule does not exists in db
        :param driver: Mongo class into mongo_utils.py
        """
        cursor = driver.find_data({NAME: name})
        for doc in cursor:
            if doc[NAME] == name:
                return True
        return False

    @staticmethod
    def validate_that_all_visual_rules_are_returned(resp, rules_number=1):
        """
        validate that all visual rules are returned
        """
        dict_temp = convert_str_to_dict(resp.text, 'json')
        if dict_temp.has_key(COUNT):
            assert str(dict_temp[COUNT]) == str(
                rules_number), "ERROR - all visual rules have not been returned.\n    sent: %s\n    stored:%s" % (
                str(rules_number), str(dict_temp[COUNT]))

    @staticmethod
    def generate_context_fake_in_cep_mongo(driver, entity_id, entity_type, service_path, attribute_name,
                                           attribute_value, attribute_type="void"):
        """
        generate context fake in cep mongo that is used in not updated card (no-signal)
        :param attribute_type:
        :param entity_id:
        :param entity_type:
        :param service_path:
        :param attribute_name:
        :param attribute_value:
        :param driver: Mongo class into mongo_utils.py
        """
        ts = generate_timestamp()
        CONTEXT_DATA = {'creDate': ts,
                        '_id': {
                            'type': entity_type,
                            'id': entity_id,
                            'servicePath': service_path},
                        'attrs': [{
                                      'creDate': ts,
                                      'type': attribute_type,
                                      'name': attribute_name,
                                      'value': attribute_value,
                                      'modDate': ts}],
                        'modDate': ts}
        # insert a context in mongo to simulate a context in orion
        driver.insert_data(CONTEXT_DATA)

