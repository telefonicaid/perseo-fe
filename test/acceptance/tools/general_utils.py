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

import json
import random
import string
import time
import xmltodict
import xml.dom.minidom
import datetime



def string_generator(size=10, chars=string.ascii_letters + string.digits):
    """
    Method to create random strings
    :param size: define the string size
    :param chars: the characters to be use to create the string
    :return random string
    """
    return ''.join(random.choice(chars) for x in range(size))


def number_generator(size=5, decimals="%0.1f"):
    """"
    Method to create random number
    :param decimals: decimal account
    :param size: define the number size
    :return: random integer
    """
    return decimals % (random.random() * (10 ** size))


def convert_str_to_dict(body, content):
    """
    Convert string to Dictionary
    :param body: String to convert
    :param content: content type (json or xml)
    :return: dictionary
    """
    try:
        if content == 'xml':
            return xmltodict.parse(body)
        else:
            return json.loads(body)
    except Exception, e:
        assert False, " ERROR - converting string to {content} dictionary: \n{body} " \
                      "\nException error:\n{error}".format(content=content, body=body, error=e)


def convert_dict_to_str(body, content):
    """
    Convert Dictionary to String
    :param body: dictionary to convert
    :param content: content type (json or xml)
    :return: string
    """
    try:
        if content == 'xml':
            return xmltodict.unparse(body)
        else:
            return json.dumps(body)
    except Exception, e:
        assert False, " ERROR - converting {content} dictionary to string: \n{body} \n" \
                      "Exception error:\n{error}".format(content=content, body=body, error=e)


def convert_str_to_list(text, separator):
    """
    Convert String to list
    :param text: text to convert
    :param separator: separator used
    :return: list []
    """
    return text.split(separator)


def convert_list_to_string(list, separator):
    """
    Convert  List to String
    :param text: list to convert
    :param separator: separator used
    :return: string ""
    """
    return separator.join(list)


def show_times(init_value):
    """
    shows the time duration of the entire test
    :param initValue: initial time
    """
    print "**************************************************************"
    print "Initial (date & time): " + str(init_value)
    print "Final   (date & time): " + str(time.strftime("%c"))
    print "**************************************************************"


def generate_date_zulu():
    """
    generate date & time zulu
    ex: 2014-05-06T10:39:47.696Z
    :return date-time zulu formatted
    """
    return str(time.strftime("%Y-%m-%dT%H:%M:%S.095Z"))


def generate_timestamp():
    """
    generate timestamp
    ex: 1425373697
    :return  timestamp
    """
    yesterday = time.time() - datetime.timedelta(1).total_seconds()
    return yesterday


def check_type(object, type):
        """
        Check if the object is an instance of type
        :param object:
        :param type:
        :return:
        """
        if not isinstance(object, type):
            raise ValueError('The attribute "{object}" is not an instance of "{type}"')

def pretty(json_pret):
        try:
            return json.dumps(json_pret, sort_keys=True, indent=4, separators=(',', ': '))
        except Exception as e:
            try:
                return xml.dom.minidom.parse(json_pret).toprettyxml()
            except Exception:
                return json_pret


def generate_context_fake_in_cep_mongo(entity_id, entity_type, service_path, attribute_name,
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
        context_data = {'creDate': ts,
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
        return context_data



if __name__ == '__main__':
    print generate_timestamp()