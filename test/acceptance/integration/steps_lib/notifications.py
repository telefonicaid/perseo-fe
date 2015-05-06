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
from tools.general_utils import pretty
from tools.notifications_utils import NotificationsUtils, ContextElement


__author__ = 'Jon Calderín Goñi <jon.caldering@gmail.com>'
from lettuce import step, world

@step('a notifications with subscription_id "([^"]*)" and originator "([^"]*)"')
def a_notification_with_the_following_information(step, subscription_id, originator):
    """
    Create a new notification
    {
      "subscriptionId" : "51c0ac9ed714fb3b37d7d5a8",
      "originator" : "localhost",
      "contextResponses" : []
    }
    :param step:
    :return:
    """
    world.log.debug('Setting the notfication instance with the subscription_id "{subscription_id}" and originator "{originator}"'.format(subscription_id=subscription_id, originator=originator))
    world.notification = NotificationsUtils(subscription_id, originator)
    world.epl_attributes = []

@step('add to the notification an entity with id "([^"]*)" and type "([^"]*)" with the following attributes')
def add_to_the_notification_an_entity_with_id_and_type_with_the_attributes(step, entity_id, entity_type):
    """
      | attribute_id | attribute_type | attribute_new_value |
      | temperature  | celcius        | 300                 |
    :param step:
    :param entity_id:
    :param entity_type:
    :return:
    """
    world.log.debug('Add a new context element to the notification with the entity id "{entity_id}" and the entity type "{entity_type}"'.format(entity_id=entity_id, entity_type=entity_type))
    # Create a context element
    context_element = ContextElement(entity_id, entity_type)
    # Add attributes to the context element created
    for row in step.hashes:
        world.log.debug('Add attribute to the context element with attribute id "{attribute_id}", attribute type "{attribute_type}" and attirbute new value "{attribute_new_value}"'.format(attribute_id=row['attribute_id'], attribute_type=row['attribute_type'], attribute_new_value=row['attribute_new_value']))
        context_element.add_attribute(row['attribute_id'], row['attribute_type'], row['attribute_new_value'])
    # Add the context element to the notification
    world.notification.add_context_response(context_element.get_context_element())

@step('add to the notification an entity with id "([^"]*)" and type "([^"]*)" with the amount of "([^"]*)" equal attributes with the following data')
def add_to_the_notification_an_entity_with_id_and_type_with_the_amount_of_equal_attributes_with_the_following_data(step, entity_id, entity_type, attributes_number):
    """
    Add an entity with a number of attributes changing the id with a prefix. The attributes data is only one line
          | attribute_id_prefix | attribute_type | attribute_new_value |
          | temperature         | celcius        | 300                 |
    :param step:
    :param entity_id:
    :param entity_type:
    :param attributes_number:
    :return:

    """
    # Check there is at las one row
    example = """
      | attribute_id_prefix | attribute_type | attribute_new_value |
      | temperature         | celcius        | 300                 |
    """
    assert len(step.hashes) == 1, 'The line (only one) attributes data is mandatory in this steps, with the format: \n {example}'.format(example=example)
    # Create a context element
    context_element = ContextElement(entity_id, entity_type)
    for i in range(0, int(attributes_number)):
        attribute_id = '{prefix}_{iterator}'.format(prefix=step.hashes[0]['attribute_id_prefix'], iterator=i)
        world.log.debug('Add attribute to the context element with attribute id "{attribute_id}", attribute type "{attribute_type}" and attirbute new value "{attribute_new_value}"'.format(attribute_id=attribute_id, attribute_type=step.hashes[0]['attribute_type'], attribute_new_value=step.hashes[0]['attribute_new_value']))
        world.epl_attributes.append(context_element.add_attribute(attribute_id, step.hashes[0]['attribute_type'], step.hashes[0]['attribute_new_value']))
    world.log.debug('Setting the EPL attributes as \n"{attributes}"'.format(attributes=pretty(world.epl_attributes)))
    world.notification.add_context_response(context_element)

@step('the notification is sent to perseo$')
def the_notification_is_sent_to_perseo(step):
    payload = world.notification.get_notification_payload()
    world.log.debug('Sent to cep the notification payload: \n {payload}'.format(payload=pretty(payload)))
    world.resp = world.cep.notify(payload)

@step('the notification is sent to perseo in xml format')
def the_notification_is_sent_to_perseo_in_xml_format(step):
    payload = world.notification.get_notification_xml_payload()
    world.log.debug('Sent to cep the notification payload: \n {payload}'.format(payload=pretty(payload)))
    world.resp = world.cep.notify(payload)