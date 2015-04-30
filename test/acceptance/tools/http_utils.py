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

import requests

status_codes = {'OK': 200,
                'Created': 201,
                'No Content': 204,
                'Moved Permanently': 301,
                'Redirect': 307,
                'Bad Request': 400,
                'unauthorized': 401,
                'Not Found': 404,
                'Bad Method': 405,
                'Not Acceptable': 406,
                'Conflict': 409,
                'Unsupported Media Type': 415,
                'Internal Server Error': 500}


def print_request(method, url, headers, body):
    """
    Show Request in console
    :param method: method used
    :param url: url used
    :param headers: header used
    :param body: body used
    """
    print "------------------------------ Request ----------------------------------------------"
    print "url: " + str(method) + "  " + str(url) + "\n"
    if headers is not None:
        print "Header: " + str(headers) + "\n"
    if body != '':
        print "Body: " + str(body) + "\n"
    print "----------------------------- End request ---------------------------------------------\n\n"


def print_response(response):
    """
    Show response in console
    :param response: http code, header and body returned
    """
    body = response.text
    headers = response.headers
    print "---------------------------------- Response ----------------------------------------------"
    print "status code: " + str(response.status_code) + "\n"
    if headers is not None:
        print "Header: " + str(headers) + "\n"
    if body != '':
        print "Body: " + str(body) + "\n"
    print "--------------------------------- End Response --------------------------------------------"


def request(method, **kwargs):
    """
    launch a request
    :param method: POST, GET, PUT, DELETE methods (MANDATORY)
    :param url:  endpoint (with port and path)
    :param headers: headers in request
    :param data: payload if is required
    :param Param: queries parameter if are required
    :param allow_redirects: if redirect id allowed
    :param verify: if the SSL is verified
    :return: response (code, headers and body)

    Note: two lines are comments because is only to debug, the first show the request and the second, show the response in each request

    """
    url = kwargs.get('url', '')
    headers = kwargs.get('headers', None)
    body = kwargs.get('data', '')
    parameters = kwargs.get('param', '')
    redirect = kwargs.get('allow_redirects', True)
    verifyssl = kwargs.get('verify', False)
    try:
        #print_request(method, Url, Headers, Body)
        resp = requests.request(method.lower(), url=url, headers=headers, data=body, params=parameters,
                                allow_redirects=redirect,
                                verify=verifyssl)
        #print_response(resp)
        return resp
    except Exception, e:
        raise NameError(" ERROR IN REQUEST: {error}"
                        "\nUrl\t: {url}"
                        "\nHeaders: {headers}"
                        "\nPayload: {body}".format(error=e, url=url, headers=headers, body=body))


def assert_status_code(expected, resp, error_msg):
    """
    Evaluate if the status code is the expected
    :param resp: response body
    :param error_msg: message in error case
    """
    assert resp.status_code == int(expected), \
        "{error_msg}:" \
        "\n HttpCode expected: {expected} " \
        "\n HttpCode received: {received} " \
        "\n Body: {body}".format(error_msg=error_msg, expected=expected, received=resp.status_code, body=resp.text)

