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
__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'

from tools.general_utils import check_type


class RulesUtils(object):
    def __init__(self):
        pass

    @staticmethod
    def create_card_rule(name, active, cards):
        """
        Create a card rule with a list of cards with the format
        card_rule = {
            'name': 'card name",
            'active': 1, #if is active (1) or not (0)
            'cards': [listofcards]
        }
        :param name:
        :param cards:
        :return:
        """
        if not isinstance(cards, list):
            raise ValueError('The cards parameter has to be a list of cards')
        return {
            'name': name,
            'active': int(active),
            'cards': cards
        }

    def create_plain_rule_payload(self, name, epl, action):
        """
        Create a rule with the structure:
        {
           "name":"blood_rule_update",
           "text":"select *,\"blood_rule_update\" as ruleName, *, ev.BloodPressure? as Pression, ev.id? as Meter from pattern [every ev=iotEvent(cast(cast(BloodPressure?,String),float)>1.5 and type=\"BloodMeter\")]",
           "action":{
              "type":"update",
              "parameters":{
                 "name":"abnormal",
                 "value":"true",
                 "type":"boolean"
              }
           }
        }
        :param name:
        :param epl:
        :param action:
        :return:
        """
        check_type(action, dict)
        return {
            'name': name,
            'text': epl,
            'action': action
        }

    def create_sms_action(self, sms_text, number):
        """
        Create a sms action with the structure:
        "action": {
            "type": "sms",
            "template": "Meter ${Meter} has pression ${Pression}.",
            "parameters": {
                "to": "123456789"
            }
        }
        :return:
        """
        return {
            "type": "sms",
            "template": sms_text,
            "parameters": {
                "to": number
            }
        }

    def create_email_action(self, from_address, to_address, mail_subject, mail_body):
        """
        Create an email action with the structure:
        {
            "type": "email",
            "template": "Meter ${Meter} has pression ${Pression} (GEN RULE)",
            "parameters": {
                "to": "someone@telefonica.com",
                "from": "cep@system.org",
                "subject": "mail subject"
            }
        }
        :param mail_body:
        :param to_address:
        :param from_address:
        :return:
        """
        return {
            "type": "email",
            "template": mail_body,
            "parameters": {
                "to": to_address,
                "from": from_address,
                "subject": mail_subject
            }
        }

    def create_update_action(self, name, value, cb_id=None, cb_type=None, cb_is_pattern=None, cb_attr_type=None):
        """"
        Create an update action with the structure:
        {
            "type": "update",
            "parameters": {
                "id": "${id}_mirror",
                "type": "Room",
                "name": "abnormal",
                "attrType": "boolean",
                "value": "true",
                "isPattern": "true"
            }
        }
        :param name:
        :param value:
        :param cb_id:
        :param cb_type:
        :param cb_is_pattern:
        :param cb_attr_type:
        """
        update_dict = {
            "type": "update",
            "parameters": {
                "name": name,
                "value": value
            }
        }
        if cb_id is not None:
            update_dict['parameters'].update({'id': cb_id})
        if cb_type is not None:
            update_dict['parameters'].update({'type': cb_type})
        if cb_is_pattern is not None:
            update_dict['parameters'].update({'isPattern': cb_is_pattern})
        if cb_attr_type is not None:
            update_dict['parameters'].update({'attrType': cb_attr_type})
        return update_dict

    def create_post_action(self, body, url, type='post'):
        """
        Create a post action with the structure:
        "action": {
            "type": "post",
            "template": "Meter ${Meter} has pression ${Pression}.",
            "parameters": {
                "url": "localhost:1111"
            }
        }
        :param body:
        :param url:
        :return:
        """
        return {
            "type": type,
            "template": body,
            "parameters": {
                "url": url
            }
        }

    def create_twitter_action(self, tweet_text, consumer_key, consumer_secret, access_token_key, access_token_secret):
        """
        Create a twitter action with the structure:
        {
            "type": "twitter",
            "template": "Meter ${Meter} has pression ${Pression} (GEN RULE)",
            "parameters": {
              "consumer_key": "xvz1evFS4wEEPTGEFPHBog",
              "consumer_secret": "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg",
              "access_token_key": "xvz1evFS4wEEPTGEFPHBog",
              "access_token_secret": "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg"
            }
        }
        :param tweet_text:
        :param consumer_key:
        :param consumer_secret:
        :param access_token_key:
        :param access_token_secret:
        :return:
        """
        return {
            "type": "twitter",
            "template": tweet_text,
            "parameters": {
                "consumer_key": consumer_key,
                "consumer_secret": consumer_secret,
                "access_token_key": access_token_key,
                "access_token_secret": access_token_secret
            }
        }

    def generate_epl(self, rule_name, identity_type, attributes_number, attribute_data_type,
                     operation, value):
        """
        Generate a EPL query dinamically.
        :param rule_name: rule name for EPl query
        :param identity_type: identity type from CB notification
        :param attribute_data_type: data type of the attribute
        :param attributes_number: quantity of attributes to verify in rule
        :param operation: operation type (>, <, >=, <=, =)
        :param value: value to verify in rule
        """
        text_temp = 'select "' + rule_name + '" as ruleName"'
        pattern_temp = ', ev.id? as Meter from pattern [every ev=iotEvent('
        type_temp = 'type="' + identity_type + '")]'
        select_temp = ""
        iot_event_temp = ""
        for i in range(0, int(attributes_number)):
            attribute = "attr_" + str(i)
            select_temp = select_temp + ', ev.' + attribute + '? as ' + attribute + '_var'
            iot_event_temp = iot_event_temp + 'cast(cast(' + attribute + '?,String),' + attribute_data_type + ')' + operation + value + ' and '
        epl = text_temp + select_temp + pattern_temp + iot_event_temp + type_temp
        return epl

    def generate_epl2(self, rule_name, entity_id=None, entity_type=None, attributes=None):
        """
        attributes = [
            {
                'id': 'name',
                'type': 'string or float',
                'operation': '<';'>';'=';'!=';'<=';'>=',
                'value': 'value'
            }
        ]
        Generate a EPL query dinamically.
        :param rule_name: rule name for EPl query
        :param identity_type: identity type from CB notification
        :param attribute_data_type: data type of the attribute
        :param attributes_number: quantity of attributes to verify in rule
        :param operation: operation type (>, <, >=, <=, =)
        :param value: value to verify in rule
        """
        select = 'select *, "{rule_name}" as ruleName, '.format(rule_name=rule_name)
        attributes_text = ''
        attributes_pattern = ''
        if attributes is not None:
            for attribute in attributes:
                attributes_text += 'ev.{attribute}? , '.format(attribute=attribute['id'])
                attributes_pattern += 'cast(cast({attribute_id}?, String), {attribute_type}){attribute_operation}{attribute_value} and '.format(attribute_id=attribute['id'], attribute_type=attribute['type'], attribute_operation=attribute['operation'], attribute_value=attribute['value'])
        if attributes_text != '':
            attributes_text = attributes_text[0:len(attributes_text)-2]
        if attributes_pattern != '':
            attributes_pattern = attributes_pattern[0:len(attributes_pattern)-4]
        pattern_ini = 'from pattern [every ev=iotEvent('
        pattern_end = ')]'
        if entity_type is not None:
            pattern_end = 'and type="{entity_type}"{pattern_end}'.format(entity_type=entity_type, pattern_end=pattern_end)
        if entity_id is not None:
            pattern_end = 'and id="{entity_id}"{pattern_end}'.format(entity_id=entity_id, pattern_end=pattern_end)
        return '{select}{attributes_text}{pattern_ini}{attributes_pattern}{pattern_end}'.format(select=select, attributes_text=attributes_text, pattern_ini=pattern_ini, attributes_pattern=attributes_pattern, pattern_end=pattern_end)




    def util_create_card_rule_with_some_sensor_types(self, sensor_types, action_type, name):
        """
        Create a Rule with some sensor card with prefixed data
        :param sensor_types:
        :param action_type:
        :param name:
        :return:
        """
        card_utils = CardsUtils()
        count = 0
        cards = []
        for sensor_type in sensor_types:
            if sensor_type == 'notUpdated':
                cards.append(card_utils.create_sensor_not_updated_card(str(count), [str(count+1)], 'test', '1', 'test'))
            if sensor_type == 'type':
                cards.append(card_utils.create_sensor_type_card(str(count), [str(count+1)], 'GREATER_THAN', 'test'))
            if sensor_type == 'regexp':
                cards.append(card_utils.create_sensor_regex_card(str(count), [str(count+1)], 'test'))
            if sensor_type == 'attributeThreshold':
                cards.append(card_utils.create_sensor_attribute_threshold_card(str(count), [str(count+1)], 'GREATER_THAN', 'test', 'test', 'test'))
            if sensor_type == 'valueThreshold':
                cards.append(card_utils.create_sensor_threshold_card(str(count), [str(count+1)], 'GREATER_THAN', 'test', 'test', 'test'))
            if sensor_type == 'ceprule':
                cards.append(card_utils.create_sensor_cep_epl_card(str(count), [str(count+1)], 'test'))
            count += 1
        if action_type == 'SendEmailAction':
            cards.append(card_utils.create_action_email_card(str(count), name, [], 'test', 'test', 'test', 'test'))
        elif action_type == 'SendSmsMibAction':
            cards.append(card_utils.create_action_sms_card(str(count), name, [], 'test', 'test'))
        elif action_type == 'updateAttribute':
            cards.append(card_utils.create_action_update_card(str(count), name, [], 'test', 'test'))
        else:
            raise ValueError('Action Card "{action_type}" not supported')
        return self.create_card_rule(name, 1, cards)


class CardsUtils(object):

    @staticmethod
    def create_sensor_card(id, connected_to, type, condition_list, time_data, sensor_data, config_data):
        """
        Create a sensor card with format:
        {
            'id': id,
            'type': 'SensorCard',
            'sensorCardType': type,
            'connectedTo': connected_to,
            'conditionList': [
                {
                    'scope': 'LAST_MEASURE',
                    'parameterName': parameter_name,
                    'parameterValue': parameter_value,
                    'Not': False,
                    'operator': operator
                }
            ],
            'timeData': {
                'interval': interval,
                'repeat': '-1',
                'context': ''
            },
            'sensorData': {
                'measureName': measure_name,
                'dataType': data_type
            },
            'configData': {}
        }
        :param id:
        :param connected_to:
        :param type:
        :param condition_list:
        :param time_data:
        :param sensor_data:
        :param config_data:
        :return:
        """
        check_type(connected_to, list)
        check_type(condition_list, list)
        check_type(time_data, dict)
        check_type(sensor_data, dict)
        check_type(config_data, dict)
        return {
            'id': id,
            'type': 'SensorCard',
            'sensorCardType': type,
            'connectedTo': connected_to,
            'conditionList': condition_list,
            'timeData': time_data,
            'sensorData': sensor_data,
            'configData': config_data
        }

    @staticmethod
    def __create_condition_list(scope, parameter_name, parameter_value, not_, operator):
        """

        :param scope:
        :param parameter_name:
        :param parameter_value:
        :param not_:
        :param operator:
        :return:
        """
        return [
            {
                'scope': scope,
                'parameterName': parameter_name,
                'parameterValue': parameter_value,
                'Not': not_,
                'operator': operator
            }
        ]

    @staticmethod
    def __create_time_data(interval, repeat, context):
        """
        Create a time data dict for a sensor card
        :param interval:
        :param repeat:
        :param context:
        :return:
        """
        return {
            'interval': interval,
            'repeat': repeat,
            'context': context
        }

    @staticmethod
    def __create_sensor_data(measure_name, data_type):
        """
        Create a sensor data dict for a sensor card
        :param measure_name:
        :param data_type:
        :return:
        """
        return {
            'measureName': measure_name,
            'dataType': data_type
        }

    @staticmethod
    def __create_config_data(time_type=None):
        """
        Create dict for config data cards
        :param time_type:
        :return:
        """
        if time_type:
            return {
                'timeType': time_type
            }
        else:
            return {}

    def create_sensor_not_updated_card(self, id, connected_to, parameter_value, interval, measure_name):
        """
        Create a sensor card of type not updated card

        :param id:
        :param connected_to:
        :param type:
        :param operator:
        :param parameter_name:
        :param parameter_value:
        :param interval:
        :param measure_name:
        :param data_type:
        :return:
        """
        condition_list = self.__create_condition_list('LAST_MEASURE', '', parameter_value,
                                                                  False, 'EQUAL_TO')
        time_data = self.__create_time_data(interval, '-1', '')
        sensor_data = self.__create_sensor_data(measure_name, '')
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'notUpdated', condition_list, time_data, sensor_data, config_data)

    def create_sensor_regex_card(self, id, connected_to, regex):
        """
        Create a sensor card of type regex card

        :param id:
        :param connected_to:
        :param parameter_value:
        :return:
        """
        condition_list = self.__create_condition_list('XPATH', 'id', regex, False, 'MATCH')
        time_data = self.__create_time_data('', '-1', '')
        sensor_data = self.__create_sensor_data('', '')
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'regexp', condition_list, time_data, sensor_data, config_data)

    def create_sensor_type_card(self, id, connected_to, operator, parameter_value):
        """
        Create a sensor card of type "type" card

        :param id:
        :param connected_to:
        :param type:
        :param operator: EQUAL or DIFFERENT
        :param parameter_value:
        :param interval:
        :param measure_name:
        :return:
        """
        condition_list = self.__create_condition_list('XPATH', 'type', parameter_value, False, operator)
        time_data = self.__create_time_data('', '-1', '')
        sensor_data = self.__create_sensor_data('', 'Text')
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'type', condition_list, time_data, sensor_data, config_data)

    def create_sensor_threshold_card(self, id, connected_to, operator, parameter_value, measure_name, data_type):
        """
        Create a sensor card of type threshold card

        :param id:
        :param connected_to:
        :param type:
        :param operator:
        :param parameter_name:
        :param parameter_value:
        :param interval:
        :param measure_name:
        :param data_type:
        :return:
        """
        condition_list = self.__create_condition_list('OBSERVATION', '', parameter_value, False,
                                                                  operator)
        time_data = self.__create_time_data('', '-1', '')
        sensor_data = self.__create_sensor_data(measure_name, data_type)
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'valueThreshold', condition_list, time_data, sensor_data, config_data)

    def create_sensor_attribute_threshold_card(self, id, connected_to, operator, parameter_value, measure_name, data_type):
        """
        Create a sensor card of type attribute threshold card

        :param id:
        :param connected_to:
        :param type:
        :param operator:
        :param parameter_name:
        :param parameter_value:
        :param interval:
        :param measure_name:
        :param data_type:
        :return:
        """
        condition_list = self.__create_condition_list('OBSERVATION', '', "${" + parameter_value + "}", False,
                                                                  operator)
        time_data = self.__create_time_data('', '-1', '')
        sensor_data = self.__create_sensor_data(measure_name, data_type)
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'attributeThreshold', condition_list, time_data, sensor_data, config_data)

    def create_sensor_cep_epl_card(self, id, connected_to, parameter_value):
        """
        Create a sensor card of type cep epel card

        :param id:
        :param connected_to:
        :param type:
        :param parameter_name:
        :param parameter_value:
        :param interval:
        :param data_type:
        :return:
        """
        condition_list = self.__create_condition_list('OBSERVATION', '', "${" + parameter_value + "}", False,
                                                                  'EQUAL_TO')
        time_data = self.__create_time_data('', '-1', '')
        sensor_data = self.__create_sensor_data('EPL', '')
        config_data = {}
        return self.create_sensor_card(id, connected_to, 'ceprule', condition_list, time_data, sensor_data, config_data)

    # Action cards
    @staticmethod
    def create_action_card(id, name, connected_to, user_parms, type):
        """
        Create a dict with an action card
        :return:
        """
        check_type(connected_to, list)
        if type != 'updateAttribute':
            check_type(user_parms, list)
        return {
            'id': id,
            'connectedTo': connected_to,
            'type': 'ActionCard',
            'actionData': {
                'userParams': user_parms,
                'name': name,
                'type': type
            }
        }

    def create_action_email_card(self, id, name, connected_to, from_address, to_address, subject, body):
        """
        Build an email action card
        :param id:
        :param name:
        :param connected_to:
        :param from_address:
        :param to_address:
        :param subject:
        :param body:
        :return:
        """
        email_parms = [
            {
                'name': 'mail.from',
                'value': from_address
            },
            {
                'name': 'mail.to',
                'value': to_address
            },
            {
                'name': 'mail.subject',
                'value': subject
            },
            {
                'name': 'mail.message',
                'value': body
            },
        ]
        return self.create_action_card(id, name, connected_to, email_parms, 'SendEmailAction')

    def create_action_sms_card(self, id, name, connected_to, number, text):
        """
        Build an sms action card
        :param id:
        :param name:
        :param connected_to:
        :param number:
        :param text:
        :return:
        """
        sms_parms = [
            {
                'name': 'sms.to',
                'value': number
            },
            {
                'name': 'sms.message',
                'value': text
            }
        ]
        return self.create_action_card(id, name, connected_to, sms_parms, 'SendSmsMibAction')


    # TODO: Esta pendiente de hablar con portal para poner a que entidad actualizar, ahora mismo, es la que dispara la regla
    def create_action_update_card(self, id, name, connected_to, attribute, value):
        """
        Build an email action card
        :param id:
        :param name:
        :param connected_to:
        :param attribute:
        :param value:
        :return:
        """
        # update_parms = [
        #     {
        #         'name': attribute,
        #         'value': value
        #     },
        # ]
        update_parms = {
                'name': attribute,
                'value': value
            }
        return self.create_action_card(id, name, connected_to, update_parms, 'updateAttribute')

    @staticmethod
    def create_time_card(id, type, connected_to, time_data, config_data):
        """
        Create a time card with format
        {
            'id': id,
            'type': 'TimeCard',
            'connectedTo': connected_to,
            'sensorCardType': type,
            'timeData': {
                'interval': interval,
                'repeat': repeat,
                'context': context
            },
            'configData': {
                'timeType': time_type
            }
        }
        :param id:
        :param type:
        :param connected_to:
        :param time_data:
        :param config_data:
        :return:
        """
        check_type(connected_to, list)
        check_type(time_data, dict)
        check_type(config_data, dict)
        return {
            'id': id,
            'type': 'TimeCard',
            'connectedTo': connected_to,
            'sensorCardType': type,
            'timeData': time_data,
            'configData': config_data
        }

    def create_time_enlapsed_card(self, id, connected_to, interval):
        """
        create time enlapsed card
        :param id:
        :param type:
        :param connected_to:
        :param time_data:
        :return:
        """
        time_data = self.__create_time_data(interval, '0', 'ASSET')
        config_data = self.__create_config_data('timeElapsed')
        return self.create_time_card(id, 'timeElapsed', connected_to, time_data, config_data)

