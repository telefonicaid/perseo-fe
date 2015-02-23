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


import time
import http_utils
from tools.mongo_utils import Mongo
import general_utils


# general constants
EMPTY                = u''
DEFAULT              = u'default'

# url constants
RULES_EPL_PATH       = u'rules'
RULE_CARD_PATH       = u'm2m/vrules'
APPEND_EPL_RULE      = u'append_epl_rule'
APPEND_CARD_RULE     = u'append_card_rule'
DELETE_EPL_RULE      = u'delete_epl_rule'
DELETE_CARD_RULE     = u'delete_card_rule'
GET_EPL_RULE         = u'get_epl_rule'
GET_CARD_RULE        = u'get_card_rule'


# Headers constants
HEADER_ACCEPT       = u'Accept'
HEADER_CONTENT_TYPE = u'Content-Type'
HEADER_APPLICATION  = u'application/'
HEADER_TENANT       = u'Fiware-Service'
HEADER_SERVICE_PATH = u'Fiware-ServicePath'
HEADER_USER_AGENT   = u'User-Agent'


#REQUESTs
#append labels
DATA              = u'data'
NAME              = u'name'
ATTR_NAME         = u'attrName'
ATTR_TYPE         = u'attrType'
CONTEXTTYPE       = u'contextType'
ATTRIBUTE         = u'attribute'
VALUE             = u'value'
TEXT              = u'text'
ACTION            = u'action'
TYPE              = u'type'
TEMPLATE          = u'template'
PARAMETERS        = u'parameters'
TO                = u'to'
FROM              = u'from'
URL               = u'url'
MESSAGE           = u'message'

# EPL operations
SMS_EPL_TYPE         = u'sms'
EMAIL_EPL_TYPE       = u'email'
UPDATE_EPL_TYPE      = u'update'
POST_EPL_TYPE        = u'post'

# Visual Rules constants
ID                   = u'id'
SENSOR_CARD          = u'SensorCard'
ACTION_CARD          = u'ActionCard'
TIME_CARD            = u'TimeCard'
SENSOR_CARD_TYPE     = u'sensorCardType'
ACTION_CARD_TYPE     = u'actionCardType'
TIME_CARD_TYPE       = u'timeCardType'
SC_NOT_UPDATED       = u'notUpdated'
SC_REGEXP            = u'regexp'
SC_TYPE              = u'type'
SC_VALUE_THRESHOLD   = u'valueThreshold'
SC_ATTR_THRESHOLD    = u'attributeThreshold'
SC_CEP_EPL           = u'ceprule'
AC_SMS_TYPE          = u'SendSmsMibAction'
AC_EMAIL_TYPE        = u'SendEmailAction'
AC_UPDATE_TYPE       = u'updateAttribute'
TC_TIME_ELAPSED      = u'timeElapsed'

VISUAL_RULES         = u'visual_rules'
CONNECTED_TO         = u'connectedTo'
CONDITION_LIST       = u'conditionList'
SENSOR_DATA          = u'sensorData'
CONFIG_DATA          = u'configData'
TIME_DATA            = u'timeData'
TIME_TYPE            = u'timeType'
PARAMETER_VALUE      = u'parameterValue'
OPERATOR             = u'operator'
OP_EQUAL_TO          = u'EQUAL_TO'
OP_MATCH             = u'MATCH'
OP_DIFFERENT_TO      = u'DIFFERENT_TO'
OP_GREATER_THAN      = u'GREATER_THAN'
INTERVAL             = u'interval'
MEASURE_NAME         = u'measureName'
DATA_TYPE            = u'dataType'
DATA_TYPE_TEXT       = u'Text'
DATA_TYPE_QUANTITY   = u'Quantity'
SCOPE                = u'scope'
SCOPE_LAST_MEASURE   = u'LAST_MEASURE'
SCOPE_XPATH          = u'XPATH'
SCOPE_OBSERVATION    = u'OBSERVATION'
NOT                  = u'Not'
REPEAT               = u'repeat'
REPEAT_VALUE         = u'-1'
CONTEXT              = u'context'
ASSET                = u'ASSET'
PARAMETER_NAME       = u'parameterName'
EPL                  = u'EPL'

AC_MAIL_FROM         = u'mail.from'
AC_MAIL_FROM_VALUE   = u'iot_support@tid.es'
AC_MAIL_TO           = u'mail.to'
AC_MAIL_SUBJECT      = u'mail.subject'
AC_MAIL_MESSAGE      = u'mail.message'
AC_MAIL_SUBJ_VALUE   = u'IoT message'
AC_SMS_NAME          = u'sms'
AC_SMS_TO            = u'sms.to'
AC_SMS_MESSAGE       = u'sms.message'
RESPONSE             = u'response'
ACTION_DATA          = u'actionData'
USER_PARAMS          = u'userParams'
ACTIVE               = u'active'
CARDS                = u'cards'
X_AUTH_TOKEN         = u'X-Auth-Token'
X_AUTH_TOKEN_VALUE   = u'tokenValue'
CONTEXT_LENGTH       = u'Content-Length'
COUNT                = u'count'

RULE_CARD_DICT = {NAME: None,
                 ACTIVE: None,
                 CARDS: []
}

CEP_MONGO_RULES_COLLECTION =u'rules'


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

    def __create_url(self, operation=None, name=EMPTY):
        """
        create the url for different requests
        :param operation: several operations such as create, read, delete rules
        :param name: label name
        :return: request url
        """
        if operation == APPEND_EPL_RULE:
            value = "%s/%s" % (self.cep_url, RULES_EPL_PATH)
        if operation == DELETE_EPL_RULE or operation == GET_EPL_RULE:
            value = "%s/%s/%s" % (self.cep_url, RULES_EPL_PATH, name)
        if operation == APPEND_CARD_RULE:
            value = "%s/%s" % (self.cep_url,RULE_CARD_PATH)
        if operation == DELETE_CARD_RULE or operation == GET_CARD_RULE:
            value = "%s/%s/%s" % (self.cep_url,RULE_CARD_PATH, name)
        return value

    def __create_headers(self, operation=EPL):
        """
        create the header for different requests
        :param content: "xml" or "json"
        :return: headers dictionary
        """
        content="json"
        value = {HEADER_ACCEPT: HEADER_APPLICATION + content, HEADER_CONTENT_TYPE: HEADER_APPLICATION + content, HEADER_TENANT: self.tenant, HEADER_SERVICE_PATH: self.service_path}
        if operation == VISUAL_RULES:
            value[X_AUTH_TOKEN] = X_AUTH_TOKEN_VALUE
        return value

    # -------------------------- EPL ----------------------------------------------------------------

    def tenant_and_service(self, tenant, service_path):
        """
        configure the tenant and service_path used
        :param tenant: tenant (multi-channels)
        :param service_path: service path
        """
        self.tenant = tenant
        self.service_path = service_path

    def generate_EPL (self, rule_name, identity_type,  attributes_number, attribute_data_type, operation, value):
        """
        generate a EPL query dinamically.
        :param rule_name: rule name for EPl query
        :param identity_type: identity type from CB notification
        :param attribute_data_type: data type of the attribute
        :param attributes_number: quantity of attributes to verify in rule
        :param operation: operation type (>, <, >=, <=, =)
        :param value: value to verify in rule
        """
        self.rule_name = rule_name
        self.identity_type = identity_type
        self.attributes_number = int (attributes_number)
        self.epl_attribute_data_type = attribute_data_type
        self.epl_operation = operation
        self.epl_value = value

        selectTemp    = ""
        iotEventTemp  = ""
        textTemp      = u'select *,"' + self.rule_name + '" as ruleName, "'+self.service_path+'" as service, "'+self.tenant+'" as tenant, *'

        patternTemp   = ', ev.id? as Meter from pattern [every ev=iotEvent('
        typeTemp      = 'type="'+self.identity_type+'")]'
        for i in range(0, int(self.attributes_number)):
            attribute    = ATTR_NAME+"_"+str(i)
            selectTemp   = selectTemp + ', ev.'+attribute+'? as '+attribute+'_var'
            iotEventTemp = iotEventTemp +'cast(cast('+attribute+'?,String),'+self.epl_attribute_data_type+')'+self.epl_operation+self.epl_value+' and '

        return textTemp + selectTemp+patternTemp+iotEventTemp+typeTemp

    def __generate_parameters (self,rule_type, parameter_info=None):
        """
        generate a new parameter according to the rule type
        :param rule_type: (SMS, email, update, twitter)
        :param parameter_info: several parameter depending of rule type
        """
        if rule_type == SMS_EPL_TYPE:
            return {TO:parameter_info}
        elif rule_type == EMAIL_EPL_TYPE:
            return {TO:parameter_info, FROM: parameter_info}
        elif rule_type == UPDATE_EPL_TYPE:
            return {NAME: "ALARM", VALUE: parameter_info, TYPE: "message"}
        elif rule_type == POST_EPL_TYPE:
            return {URL:parameter_info}

    def __generateTemplate (self, template_info=None):
        """
        generate a new template according to the attributes number
        :param template_info: additional info in template
        """
        template_str = EMPTY
        for i in range(0,int(self.attributes_number)):
            attrVar = ATTR_NAME+"_"+str(i)+'_var'
            template_str = template_str + "Element ${Meter} has value <<<${"+attrVar+"}"+">>> \n"
        template_str = template_str + " -- " + template_info
        return template_str

    def create_epl_rule (self, rule_type, template_info, parameters, EPL):
        """
         Create a new epl rule
        :param template_info: template info to sms or email types
        :param rule_type: rule type
        :param parameters: several parameter depending of rule type
        """
        self.parameters = {}
        self.parameters=self.__generate_parameters(rule_type, parameters)
        payload_dict = {NAME: self.rule_name,
                   TEXT: EPL,
                   ACTION: {
                           TYPE: rule_type,
                           TEMPLATE: self.__generateTemplate (template_info),
                           PARAMETERS: self.parameters
                    }
        }

        if rule_type == UPDATE_EPL_TYPE:  # update action does not use template
            del payload_dict [ACTION][TEMPLATE]
        if rule_type == POST_EPL_TYPE:
              template_post = {MESSAGE: payload_dict[ACTION][TEMPLATE]}
              template_post_str = general_utils.convert_dict_to_str(template_post, general_utils.JSON)
              payload_dict[ACTION][TEMPLATE] = template_post_str
        payload = general_utils.convert_dict_to_str(payload_dict, general_utils.JSON)

        self.resp =  http_utils.request(http_utils.POST, url=self.__create_url(APPEND_EPL_RULE), headers=self.__create_headers(),data=payload)
        return self.resp

    def create_several_epl_rules(self, prefix_name, rule_number, rule_type):
        """
        create N rules with the same rule type
        :param rule_number: quantity of rules created
        :param rule_type: rule type
        """
        self.prefix_name= prefix_name
        self.rule_type = rule_type
        self.rules_number = int(rule_number)
        template_info = " (triggered rule)"

        if rule_type == SMS_EPL_TYPE:  parameters    = "34123456789"
        elif rule_type == EMAIL_EPL_TYPE:  parameters    = "xxxxxx@fffff.com"
        elif rule_type == UPDATE_EPL_TYPE:  parameters    = "danger"
        for i in range (0, self.rules_number):
            self.rule_name = self.prefix_name+"_"+str(i)+"_"+self.rule_type
            epl = self.generate_EPL (self.rule_name, self.identity_type, self.attributes_number, self.epl_attribute_data_type, self.epl_operation, self.epl_value)
            self.create_epl_rule (self.rule_type, template_info, parameters, epl)

    def get_parameters (self):
        """
        get parameters
        """
        return self.parameters

    def get_rules_number(self):
        """
        get rules number
        :return: int
        """
        return self.rules_number

    def read_a_rule_name (self, name):
        """
         Read the rule name in perseo
        """
        return  http_utils.request(http_utils.GET, url=self.__create_url(GET_EPL_RULE, name), headers=self.__create_headers())

    def read_a_rules_list(self):
        """
        read all rules that exist in the list
        """
        self.resp = http_utils.request(http_utils.GET, url=self.__create_url(GET_EPL_RULE), headers=self.__create_headers())

    # -------------------------- CARDS ------------------------------------------------------------

    def __one_parameter (self, name, value):
        """
        create one parameter to userParams in action card
        :return: dict with name and value
        """
        return {NAME:EMPTY.join(name), VALUE:EMPTY.join(value)}

    def __generate_card_parameters (self, action_type, response, parameters):
        """
        generate the several parameters in all action card type
        :param action_type: SendEmailAction | SendSmsAction
        :param response: message in email or sms
        :param parameters: mobile number or address email account
        """
        temp_list = []
        email_parameters_list  = [{AC_MAIL_FROM: AC_MAIL_FROM_VALUE}, {AC_MAIL_TO: parameters}, {AC_MAIL_SUBJECT: AC_MAIL_SUBJ_VALUE}, {AC_MAIL_MESSAGE: response + " -- (Email rule)"}]
        sms_parameters_list    = [{AC_SMS_TO: parameters}, {AC_SMS_MESSAGE: response + " -- (SMS rule)"}]
        update_parameters_list = [{parameters: response}]

        if action_type == AC_EMAIL_TYPE:
            user_params = email_parameters_list
        elif action_type == AC_SMS_TYPE:
            user_params = sms_parameters_list
        elif action_type == AC_UPDATE_TYPE:
            user_params = update_parameters_list
        for i in range(0, len(user_params)):
            temp_list.append(self.__one_parameter (user_params[i].keys(), user_params[i].values()))
        return  temp_list

    def init_rule_card_dict(self):
        """
        Initialize the rule card dictionary
        """
        global RULE_CARD_DICT
        RULE_CARD_DICT = {NAME: None,
                          ACTIVE: None,
                          CARDS: []
        }

    def create_sensor_card (self, **kwargs):
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
        sc_id_card       = kwargs.get(ID, EMPTY)
        sensor_card_type = kwargs.get(SENSOR_CARD_TYPE, EMPTY)
        connected_to     = kwargs.get(CONNECTED_TO, EMPTY)
        parameter_value  = kwargs.get(PARAMETER_VALUE, EMPTY)
        interval         = kwargs.get(INTERVAL, EMPTY)
        operator         = kwargs.get(OPERATOR, EMPTY)
        measure_name     = kwargs.get(MEASURE_NAME, EMPTY)
        data_type        = kwargs.get(DATA_TYPE, EMPTY)
        parameter_name   = EMPTY

        assert sensor_card_type == SC_NOT_UPDATED or sensor_card_type == SC_REGEXP or sensor_card_type == SC_TYPE or sensor_card_type == SC_VALUE_THRESHOLD or sensor_card_type == SC_ATTR_THRESHOLD or sensor_card_type == SC_CEP_EPL, \
            "ERROR - Sensor Card type does not is allowed: %s" % (sensor_card_type)
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
                parameter_value = "${"+parameter_value+"}"
        elif sensor_card_type == SC_CEP_EPL:
            scope = SCOPE_OBSERVATION
            operator = OP_EQUAL_TO
            measure_name = EPL

        sensor_card = {ID:sc_id_card,
                       TYPE: SENSOR_CARD,
                       SENSOR_CARD_TYPE: sensor_card_type,
                       CONNECTED_TO: [connected_to],
                       CONDITION_LIST: [{
                            SCOPE: scope,
                            PARAMETER_VALUE: parameter_value,
                            PARAMETER_NAME:parameter_name,
                            NOT: False,
                            OPERATOR: operator
                       }],
                       TIME_DATA: {
                           INTERVAL: interval,
                           REPEAT: REPEAT_VALUE,
                           CONTEXT: EMPTY
                       },
                       SENSOR_DATA: {
                           MEASURE_NAME: measure_name,
                            DATA_TYPE: data_type
                       },
                       CONFIG_DATA: {
                       }
        }
        RULE_CARD_DICT [CARDS].append(sensor_card)

    def create_action_card (self, **kwargs):
        """
        Create a new action card
        :param id: card identifier used in connectedTo field
        :param sensorCardType: action card type ( updateAttribute | SendSmsMibAction | SendEmailAction )
        :param connectedTo: next card connected to this card
        :param response: used by sms and email messages, and update attribute value
        :param: parameters: used sms(mobile number), email (email.to) and update (attribute)
        """
        ac_id_card       = kwargs.get(ID,EMPTY)
        action_card_type = kwargs.get(ACTION_CARD_TYPE, EMPTY)
        connected_to     = kwargs.get(CONNECTED_TO, EMPTY)
        response         = kwargs.get(RESPONSE, EMPTY)
        parameters       = kwargs.get(PARAMETERS, EMPTY)

        assert action_card_type == AC_EMAIL_TYPE or action_card_type == AC_SMS_TYPE or action_card_type == AC_UPDATE_TYPE, \
            "ERROR - ActionCard type does not is allowed: %s" % (action_card_type)
        action_card = {ID:ac_id_card,
                       CONNECTED_TO:[connected_to],
                       TYPE:ACTION_CARD,
                       ACTION_DATA:{
                                    USER_PARAMS: self.__generate_card_parameters (action_card_type, response, parameters),
                                    NAME: action_card_type,
                                    TYPE: action_card_type
                                   }
                       }
        RULE_CARD_DICT [CARDS].append(action_card)

    def create_time_card (self, **kwargs):
        """
        Create a new time card
        :param id: card identifier used in connectedTo field
        :param timeCardType: time card type ( timeElapsed )
        :param connectedTo: next card connected to this card
        :param interval: Interval to wait
        """
        tc_id_card   = kwargs.get(ID,EMPTY)
        time_card_type = kwargs.get(TIME_CARD_TYPE, EMPTY)
        interval     = kwargs.get(INTERVAL, EMPTY)
        connected_to = kwargs.get(CONNECTED_TO, EMPTY)

        assert time_card_type == TC_TIME_ELAPSED, \
            "ERROR - TimeCard type does not is allowed: %s" % (time_card_type)
        time_card = {ID:tc_id_card,
                     TYPE: TIME_CARD,
                     CONNECTED_TO: [connected_to],
                     SENSOR_CARD_TYPE: time_card_type,
                     TIME_DATA:{CONTEXT: ASSET,
                                INTERVAL: interval,
                                REPEAT: "0"
                               },
                     CONFIG_DATA: {TIME_TYPE: time_card_type}
                    }
        RULE_CARD_DICT [CARDS].append(time_card)

    def create_rule_card (self, rule_name, active):
        """
        create a new card rule
        :param rule_name: rule name
        :param active: if is active or not (0 | 1)
        :return: card rule dict
        """
        RULE_CARD_DICT[NAME]   = rule_name
        self.rule_name = RULE_CARD_DICT[NAME]
        RULE_CARD_DICT[ACTIVE] =  int(active)
        payload = general_utils.convert_dict_to_str(RULE_CARD_DICT, general_utils.JSON)
        self.resp = http_utils.request(http_utils.POST, url=self.__create_url(APPEND_CARD_RULE), headers=self.__create_headers(VISUAL_RULES), data=payload)
        return RULE_CARD_DICT

    def create_several_visual_rules(self, step, rule_number, prefix, ac_card_type):
        """
        Create N visual rules with N sensor cards and an action card
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
        self.rules_number  = int(rule_number)
        self.rule_type     = ac_card_type
        sensor_card_type   = EMPTY
        attribute_name     = u'temperature'
        attribute_to_refer = u'temp_refer'
        identity_id        = u'room1'
        identity_type      = u'room'
        epl_query          = u'sadada sadsadas asdasd asdasd'
        for line in step.hashes:
            # sensor cards
            sensor_card_type = line[SENSOR_CARD_TYPE]
            if sensor_card_type == SC_NOT_UPDATED:
                self.create_sensor_card (sensorCardType=SC_NOT_UPDATED, id="card_1", interval="50", measureName=attribute_name, parameterValue="250", connectedTo="card_2")
            elif sensor_card_type == SC_REGEXP:
                self.create_sensor_card (sensorCardType=SC_REGEXP, id="card_2", parameterValue=identity_id, connectedTo="card_3")
            elif sensor_card_type == SC_TYPE:
                self.create_sensor_card (sensorCardType=SC_TYPE, id="card_3", parameterValue=identity_type, operator=OP_EQUAL_TO, connectedTo="card_4")
            elif sensor_card_type == SC_VALUE_THRESHOLD:
                self.create_sensor_card (sensorCardType=SC_VALUE_THRESHOLD, id="card_4",  measureName=attribute_name, operator=OP_GREATER_THAN, dataType=DATA_TYPE_QUANTITY, parameterValue="1",  connectedTo="card_5")
            elif sensor_card_type == SC_ATTR_THRESHOLD:
                self.create_sensor_card (sensorCardType=SC_ATTR_THRESHOLD, id="card_5",  measureName=attribute_name, operator=OP_GREATER_THAN, dataType=DATA_TYPE_QUANTITY, parameterValue=attribute_to_refer,  connectedTo="card_6")
            elif sensor_card_type == SC_CEP_EPL:
                self.create_sensor_card (sensorCardType=SC_CEP_EPL, id="card_6",  parameterValue=epl_query,  connectedTo="card_7")
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
            self.create_action_card (id="card_7", actionCardType=ac_card_type, connectedTo="card_8", response=response, parameters=parameters)
        # multiples rules
        for i in range(int(self.rules_number)):
            self.create_rule_card(prefix+"_"+str(i)+"_"+self.rule_type, "1")

    def get_all_visual_rules(self):
        """
        get all visual rules stored
        """
        self.resp = http_utils.request(http_utils.GET, url=self.__create_url(GET_CARD_RULE), headers=self.__create_headers(VISUAL_RULES))

    def get_one_visual_rules(self, name=EMPTY):
        """
        get only visual rule
        :param name:
        """
        if name != EMPTY: self.rule_name = name
        self.resp = http_utils.request(http_utils.GET, url=self.__create_url(DELETE_CARD_RULE, self.rule_name), headers=self.__create_headers())

    def rule_name_to_try_to_delete_but_it_does_not_exists (self, name):
        """
        rule name to try to delete but it does not exists
        :param name: this name does not exists
        """
        self.rule_name = name

    #---------------------- DELETE ----------------------------------------------------------------
    def delete_one_rule(self, method, name=EMPTY):
        """
        Delete an rule (epl or visual rule)
        :param method: method used. Values allowed (EPL or visual_rules)
        :param name: rule name
        """
        if name != EMPTY: self.rule_name = name
        if method == EPL:
            url=self.__create_url(DELETE_EPL_RULE, self.rule_name)
        if method == VISUAL_RULES:
            if name == EMPTY: self.rule_name = RULE_CARD_DICT[NAME]
            url=self.__create_url(DELETE_CARD_RULE, self.rule_name)
        self.resp = http_utils.request(http_utils.DELETE, url=url, headers=self.__create_headers())


    def delete_rules_group(self, method, prefix):
        """
        delete all rules created with a prefix and a rule type in a method (EPL or visual_rules)
        """
        for i in range (0, self.rules_number):
            self.delete_one_rule(method, prefix+"_"+str(i)+"_"+self.rule_type)

    #---------------------- VALIDATIONS -----------------------------------------------------------
    def validate_HTTP_code(self, expected_status_code):
        """
        validate http status code
        :param expected_status_code: Http code expected
        """
        http_utils.assert_status_code(http_utils.status_codes[expected_status_code], self.resp, "Wrong status code received: %s. Expected: %s. \n\nBody content: %s" \
                                                                            % (str(self.resp.status_code), str(http_utils.status_codes[expected_status_code]), str(self.resp.text)))

    def validate_rule_response(self):
        """
        validate rule in response
        :param name: rule name
        :param code: http code
        """
        temp_dict=general_utils.convert_str_to_dict(self.resp.text,general_utils.JSON)
        assert temp_dict["error"] == None, \
            "Error - in create rule received:  \n %s." % (str(self.resp.text))

    def validate_delete_rule (self, exist=1):
        """
        validate that the rule is deleted
        """
        dict_temp = general_utils.convert_str_to_dict(self.resp.text,general_utils.JSON)
         #1 exist rule before delete  - 0 rule does not exist before delete

        assert  dict_temp[DATA][0] == exist,\
            "ERROR - the rule %s does not exist..." % (self.rule_name)

    def validate_get_a_rule (self):
        """
        Validate that rule name exists in perseo
        """
        dict_temp = general_utils.convert_str_to_dict(self.resp.text,general_utils.JSON)

        assert dict_temp["error"] == None, \
              "Error - in read a rule received:  \n %s." % (str(self.resp.text))

        assert dict_temp[DATA][2][NAME] == self.rule_name, \
                "Error - name is wrong:  \n %s. \n " % (str(self.resp.text))

    def validate_all_rules(self):
        """
        Validate that all rules are found
        """
        dict_temp = general_utils.convert_str_to_dict(self.resp.text,general_utils.JSON)
        assert dict_temp["error"] == None, \
            "Error - in read a rule received:  \n %s." % (str(self.resp.text))
        for i in range (0, self.rules_number):       # review each rule created
            resp = False
            for j in range(0, len(dict_temp[DATA])):  # against each element in DB, returned in the response
                if dict_temp[DATA][j][NAME] == self.prefix_name+"_"+str(i)+"_"+self.rule_type:
                    resp = True
                    break
        assert resp,\
            "Error - name %s does not exist:  \n %s." % (self.prefix_name+"_"+str(i)+"_"+self.rule_type, str(self.resp.text))

    def validate_card_rule_in_mongo(self, driver):
        """
        Validate that card rule is created successfully in db
        """
        temp_name = None
        collection_dict = driver.current_collection(CEP_MONGO_RULES_COLLECTION)
        cursor =  driver.find_data(collection_dict, {NAME: RULE_CARD_DICT[NAME]})
        for doc in cursor:
            temp_name = doc[NAME]
        assert temp_name == RULE_CARD_DICT[NAME], "The rule %s has not been created..." % (RULE_CARD_DICT[NAME])

    def card_rule_does_not_exists_in_mongo(self, driver):
        """
        Validate that card rule does not exists in db
        """
        collection_dict = driver.current_collection(CEP_MONGO_RULES_COLLECTION)
        cursor =  driver.find_data(collection_dict, {NAME: RULE_CARD_DICT[NAME]})
        for doc in cursor:
            if doc[NAME] == RULE_CARD_DICT[NAME]:
                return True
        return False

    def validate_that_all_visual_rules_are_returned(self):
        """
        validate that all visual rules are returned
        """
        dict_temp = general_utils.convert_str_to_dict(self.resp.text, general_utils.JSON)
        if dict_temp.has_key (COUNT):
            assert str(dict_temp [COUNT]) == str(self.rules_number), "ERROR - all visual rules have not been returned.\n    sent: %s\n    stored:%s" % (str(self.rules_number), str(dict_temp [COUNT]))
