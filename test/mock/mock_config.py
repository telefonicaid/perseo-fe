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
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with:
#   Ivan Arias (ivan.ariasleon@telefonica.com)
#

import socket

#constants
SMTP_BIND     = u'0.0.0.0'
SMTP_PORT     = 9999
HTTP_BIND     = u'0.0.0.0'
HTTP_PORT     = 9998
ERROR         = u'ERROR - '
WARN          = u'WARN - '
MOCK_HOST     = socket.gethostname()  # Return mock hostname

#header
OK               = 200
CONTENT_LENGTH   = u'Content-length'
CONTENT_TYPE     = u'Content-type'
APPLICATION_JSON = u'application/json'

#Paths
GET_EMAIL      = u'get/email'
GET_SMS        = u'get/sms'
GET_UPDATE     = u'get/update'
GET_POST       = u'get/post'
SEND_SMS       = u'send/sms'
SEND_UPDATE    = u'send/update'
SEND_POST      = u'send/post'
RESET_EMAIL    = u'reset/email'
RESET_SMS      = u'reset/sms'
RESET_UPDATE   = u'reset/update'
RESET_POST     = u'reset/post'
COUNTER_SMS    = u'counter/sms'
COUNTER_EMAIL  = u'counter/email'
COUNTER_UPDATE = u'counter/update'
COUNTER_POST   = u'counter/post'

#body responses
SMTP_RECEIVING_MSG_FROM = u'Receiving message from: '
SMTP_MSG_ADDRESSED_TO   = u'Message addressed to  : '
SMTP_MSG_LENGTH         = u'Message length        : '
SMTP_MSG_ADDRESSED_FROM = u'Message addressed from: '
SMTP_DATA_INFO          = u'data info             :\n'


MORE_INFO     = False
SMTP_COUNTER  = u'smtp_counter'
SMTP_PEER     = u'smtp_peer'
SMTP_MAILFROM = u'smtp_mailfrom'
SMTP_RCPTTOS  = u'smtp_rcpttos'
SMTP_DATA     = u'smtp_data'

#messages
INITIAL_EMAIL_MSG         = u'Email has not been sent yet'
INITIAL_SMS_MSG           = u'{"message": "SMS has not been sent yet"}'
INITIAL_UPDATE_MSG        = u'{"message": "Update context has not been sent yet"}'
INITIAL_POST_MSG          = u'POST action has not been sent yet'
CONTENT_LENGTH_WARN_MSG   = u' content-length header does not exist and payload is empty... '
MULTIPROCESSING_ERROR_MSG = u' unable to start multiprocessing...'
ONE_LINE                  = u'------------------------------------------------------------------------------------------------------------'

def __usage():
    """
    usage message
    """
    print " ****************************************************************************************"
    print " * This mock is used to simulate a behaviour of email client (smtp), sms client (smpp), *"
    print " * an update context to Context Broker and send by API REST the content received (http).*"
    print " * Keep a counter for each action (sms, email, update, post and twitter).               *"
    print " *                                                                                      *"
    print " *  usage: python perseo_mock.py <-u> <-sp=port> <-hp=port> <-i>                        *"
    print " *           ex: python perseo_mock.py -sp=9999 -hp=9998 -i                             *"
    print " *  parameters:                                                                         *"
    print " *         -u: show this usage.                                                         *"
    print " *         -h: help to request into the mock.                                           *"
    print " *        -sp: change smtp port (by default is 9999).                                   *"
    print " *        -hp: change http port (by default is 9998).                                   *"
    print " *         -i: show more info in console (by default is False).                         *"
    print " *                                                                                      *"
    print " *  Comments:                                                                           *"
    print " *         In More Info: show Message addressed from and data.                          *"
    print " *                                                                                      *"
    print " *                                     ( use <Ctrl-C> to stop )                         *"
    print " ****************************************************************************************"
    exit(0)

def __help():
    """
    help to request into the mock
    """
    with open("help.txt") as help_file:
        try:
            content = help_file.read().splitlines()
            for i in range (len (content)):
                print content[i]

        except Exception, e:
            print 'Error parsing help file: %s' % (e)
            exit(1)
    exit(0)

def __config_print():
    """
    show of the current configuration and te paths mocked
    """
    print " ***********************************************************************************************************"
    print " *                         ... Running fake smtp and http servers ...                                      *"
    print " * Current configuration:                                                                                  *"
    print "        Mock host  : "+ str(MOCK_HOST)
    print "        SMTP port  : "+ str(SMTP_PORT)
    print "        HTTP port  : "+ str(HTTP_PORT)
    if MORE_INFO:
        print "        More info is enabled (counter, etc)"
    else:
        print "        More info is disabled"
    print " *                                     ( use <Ctrl-C> to stop )                                            *"
    print " ***********************************************************************************************************"

def configuration (arguments):
    """
    Define values for configuration
    :param arguments: parameters in command line
    """
    global SMTP_PORT, HTTP_PORT,  MORE_INFO
    for i in range(len(arguments)):
        if arguments[i].find('-u') >= 0: __usage()
        if arguments[i].find('-h') >= 0: __help()
        try:
            if arguments[i].find('-sp') >= 0:
                 error_msg = "smtp port parameter"
                 SMTP_PORT= int (str(arguments[i]).split("=")[1])
            if arguments[i].find('-hp') >= 0:
                 error_msg = "http port parameter"
                 HTTP_PORT = int (str(arguments[i]).split("=")[1])
            if arguments[i].find('-i') >= 0:
                 error_msg = "More info parameter"
                 MORE_INFO = True
        except Exception, e:
            print ERROR+" in "+error_msg+" see usage below -  "+ str(e)
            __usage()
    __config_print()