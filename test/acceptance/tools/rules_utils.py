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


import time
import http_utils
import mongo_utils
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
URL               = u'URL'
MESSAGE           = u'message'

# EPL operations
SMS_EPL_TYPE         = u'sms'
EMAIL_EPL_TYPE       = u'email'
UPDATE_EPL_TYPE      = u'update'
POST_EPL_TYPE        = u'post'




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

    def __create_headers(self, content="json"):
        """
        create the header for different requests
        :param content: "xml" or "json"
        :return: headers dictionary
        """
        return {HEADER_ACCEPT: HEADER_APPLICATION + content, HEADER_CONTENT_TYPE: HEADER_APPLICATION + content, HEADER_TENANT: self.tenant, HEADER_SERVICE_PATH: self.service_path}

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

    def __generateTemplate (self, rule_type, template_info=None):
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
                           TEMPLATE: self.__generateTemplate (rule_type, template_info),
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

    def delete_epl_rule (self, name=EMPTY):
        """
        Delete an epl rule
        :param name: rule name
        """
        if name != EMPTY: self.rule_name = name
        self.resp = http_utils.request(http_utils.DELETE, url=self.__create_url(DELETE_EPL_RULE, self.rule_name), headers=self.__create_headers())

    def delete_rules_group(self, name):
        """
        delete all rules created
        """

        for i in range (0, self.rules_number):
            self.delete_epl_rule(name+"_"+str(i)+"_"+self.rule_type)

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

