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
from lettuce import step, world
from tools.general_utils import pretty


# @step('append a new rule with a rule type "([^"]*)", a template "([^"]*)" and a parameters "([^"]*)"')
# def when_append_a_new_rule_with_a_rule_type_a_template_a_parameters(step, rule_type, template, parameters):
#     """
#     Create a payload creating the action depending of the type given
#     :param step:
#     :param rule_type:
#     :param template_info:
#     :param parameters:
#     :return:
#     """
#     # The update action has no body
#     if rule_type != 'update':
#         body = template
#     if rule_type == 'sms':
#         action = world.rules_utils.create_sms_action(body, parameters)
#     elif rule_type == 'email':
#         action = world.rules_utils.create_email_action(body, parameters, parameters)
#     elif rule_type == 'post':
#         action = world.rules_utils.create_post_action(body, parameters)
#     elif rule_type == 'update':
#         action = world.rules_utils.create_update_action('ALARM', parameters)
#     elif rule_type == 'bad_type':
#         action = world.rules_utils.create_post_action(body, parameters, rule_type)
#     else:
#         raise ValueError('The rule type "{rule_type}" is not supported'.format(rule_type=rule_type))
#     plain_rule_payload = world.rules_utils.create_plain_rule_payload(world.rule_name, world.epl_sentence, action)
#     world.rules.append(plain_rule_payload)
#     world.log.debug("Creating a plain rule in cep with the payload: \n {payload}".format(payload=pretty(plain_rule_payload)))
#     world.resp = world.cep.create_plain_rule(world.rules[len(world.rules) - 1])

@step('append a new rule name "([^"]*)", activate "([^"]*)"')
def append_a_new_rule_name_activate(step, name, active):
    world.rules.append(world.rules_utils.create_card_rule(name, active, world.cards))
    world.cards = []
    world.log.debug('Creating the visual rule: \n {visual_rule}'.format(visual_rule=pretty(world.rules[len(world.rules)-1])))
    world.resp = world.cep.create_visual_rule(world.rules[len(world.rules) - 1])

@step('set the post action with payload "([^"]*)" and url "([^"]*)"')
def set_the_post_action_with_payload_and_url(step, payload, url):
    """
    Generate the post action
    :param step:
    :param text:
    :param number:
    :return:
    """
    # Generate the action of the rule
    if url == 'mock_url':
        # Set the mock url of the properties file
        url = 'http://{mock_host}:{mock_port}/send/post'.format(mock_host=world.config['Mock']['host'], mock_port=world.config['Mock']['port'])
    world.action = world.rules_utils.create_post_action(payload, url)

@step('set the sms action with text "([^"]*)" and number "([^"]*)"')
def set_the_post_action_with_payload_and_url(step, text, number):
    """
    Generate the sms action
    :param step:
    :param text:
    :param number:
    :return:
    """
    # Generate the action of the rule
    world.action = world.rules_utils.create_sms_action(text, number)

@step('set the email action with from "([^"]*)" to "([^"]*)" subject "([^"]*)" and body "([^"]*)"')
def set_the_post_action_with_payload_and_url(step, from_, to, subject, body):
    """
    Generate the email action
    :param step:
    :param text:
    :param number:
    :return:
    """
    # Generate the action of the rule
    world.action = world.rules_utils.create_email_action(from_, to, subject, body)

@step('set the update action with attribute name "([^"]*)" attribute value "([^"]*)" attribute type "([^"]*)" entity id "([^"]*)" is pattern "([^"]*)"')
def set_the_post_action_with_payload_and_url(step, attribute_name, attribute_value, attribute_type, entity_id, is_pattern):
    """
    Generate the email action, take into account there are parameters optionals
    :param step:
    :param text:
    :param number:
    :return:
    """
    # Generate the action of the rule
    # Gen the parameters to gen the action
    parameters = {
        'name': attribute_name,
        'value': attribute_value
    }
    if attribute_type != 'empty':
        parameters.update({'cb_attr_type': attribute_type})
    if entity_id != 'empty':
        parameters.update({'cb_id': entity_id})
    if is_pattern != 'empty':
        parameters.update({'cb_is_pattern': is_pattern})
    world.action = world.rules_utils.create_update_action(**parameters)

@step('set a bad type action with post structure, payload "([^"]*)" and url "([^"]*)"')
def set_the_post_action_with_payload_and_url(step, payload, url):
    """
    Generate the post action
    :param step:
    :param text:
    :param number:
    :return:
    """
    # Generate the action of the rule
    if url == 'mock_url':
        # Set the mock url of the properties file
        url = 'http://{mock_host}:{mock_port}/send/post'.format(mock_host=world.config['Mock']['host'], mock_port=world.config['Mock']['port'])
    world.action = world.rules_utils.create_post_action(payload, url, 'bad_type')
    
@step('with the epl generated and the action, append a new rule in perseo with name "([^"]*)"')
def with_the_epl_generated_and_the_action_append_a_new_rule_in_perseo(step, rule_name):
    """
    Generate the plain rule with the action and create it in perseo
    :param step:
    :param rule_name
    :return:
    """
    # Check the name is the same name of the EPL
    if not world.epl_sentence.find(rule_name) >= 0:
        world.log.warning('The rule name is not the same in the rule and in the epl.\n The epl is: {epl_sentence} \n The rule name is "{rule_name}"'.format(epl_sentence=world.epl_sentence, rule_name=rule_name))
    # Generate the payload
    plain_rule_payload = world.rules_utils.create_plain_rule_payload(rule_name, world.epl_sentence, world.action)
    world.rules.append(plain_rule_payload)
    world.log.debug("Creating a plain rule in cep with the payload: \n {payload}".format(payload=pretty(plain_rule_payload)))
    # Crteate the plain rule in perseo
    world.resp = world.cep.create_plain_rule(world.rules[len(world.rules) - 1])

@step('with the epl generated and the action, append an amount of "([^"]*)" rules in perseo with prefix name "([^"]*)"')
def with_the_epl_generated_and_the_action_append_an_amount_of_rules_in_perseo_with_prefix_name(step, rules_number, prefix_name):
    """
    Generate the number of rules indicated, changing the name, formed the new name with the prefix given
    """
    for i in range(0, int(rules_number)):
        new_rule_name = '{prefix}_{iterator}'.format(prefix=prefix_name, iterator=i)
        world.log.debug('Creating a new rule with the name {new_rule_name}'.format(new_rule_name=new_rule_name))
        # Change the rule name in the epl sentence
        # Save the original epl with the original name (this is needed, because if not, in the next iteration the replace will be done in a "part" of the name"
        world.epl_original = world.epl_sentence
        # Change the name
        world.epl_sentence = world.epl_sentence.replace(prefix_name, new_rule_name)
        world.log.debug('Changing the epl name from "{prefix_name}" to "{new_rule_name}"'.format(prefix_name=prefix_name, new_rule_name=new_rule_name))
        # Call the step that create one rule
        with_the_epl_generated_and_the_action_append_a_new_rule_in_perseo(step, new_rule_name)
        # Restore the original epl
        world.epl_sentence = world.epl_original



# @step('create "([^"]*)" rules with prefix "([^"]*)", "([^"]*)" type and parameters "([^"]*)"')
# def create_rules_with_prefix_and_type(step, rules_number, name_prefix, type, parameter):
#     """
#     Create a number of rules with the same data, only changing the name based in a prefix
#     :param step:
#     :param rules_number:
#     :param name_prefix:
#     :param type:
#     :param parameter:
#     :return:
#     """
#     world.epl_sentence_original = world.epl_sentence
#     rule_name_original = world.rule_name
#     for i in range(0, int(rules_number)):
#         # Change epl name for new one formed with the iterator
#         new_name = rule_name_original + '_{iterator}'.format(iterator=i)
#         # Change the name in the epl sentence
#         world.epl_sentence = world.epl_sentence_original.replace(rule_name_original, new_name)
#         # Change the name of the rule
#         world.rule_name = new_name
#         # Create a new plain rule with the EPL
#         when_append_a_new_rule_with_a_rule_type_a_template_a_parameters(step, type, '', parameter)

@step('delete a visual rule created')
def delete_a_visual_rule_created(step):
    world.resp = world.cep.delete_visual_rule(world.rules[len(world.rules) - 1]['name'])

@step('delete a plain rule created')
def delete_a_plain_rule_created(step):
    world.resp = world.cep.delete_plain_rule(world.rules[len(world.rules) - 1]['name'])

@step('delete a plain rule with name "([^"]*)"')
def delete_a_plain_rule_created(step, name):
    world.resp = world.cep.delete_plain_rule(name)


@step('read a visual rule in perseo')
def read_a_visual_rule_in_perseo(step):
    world.resp = world.cep.get_visual_rule(world.rules[len(world.rules) - 1]['name'])

@step('read a plain rule in perseo')
def read_a_visual_rule_in_perseo(step):
    world.resp = world.cep.get_plain_rule(world.rules[len(world.rules) - 1]['name'])


@step('create visual rules "([^"]*)" with prefix "([^"]*)", sensor cards and an action card "([^"]*)"')
def create_visual_rules_group1_with_prefix_group2_sensor_cards_and_an_action_card_group3(step, number, prefix, action):
    sensor_types = []
    for hash in step.hashes:
        sensor_types.append(hash['sensorCardType'])
    for i in range(0, int(number)):
        name = prefix + str(i)
        world.rules.append(world.rules_utils.util_create_card_rule_with_some_sensor_types(sensor_types, action, name))
        world.resp = world.cep.create_visual_rule(world.rules[len(world.rules) - 1])
        assert world.resp.status_code == 201, 'There was an error creating the visual rule: \n {visual_rule}'.format(
            visual_rule=pretty(world.rules[len(world.rules) - 1]))


@step('list all rules')
def read_all_rules(step):
    world.resp = world.cep.list_visual_rules()


@step('list all plain rules')
def read_all_plain_rules(step):
    world.resp = world.cep.list_plain_rules()


@step('update a visual rule "([^"]*)"')
def update_a_visual_rule_group1(step, name):
    world.rules.append(world.rules_utils.create_card_rule(name, '1', world.cards))
    world.cards = []
    world.resp = world.cep.update_visual_rule(name, world.rules[len(world.rules) - 1])