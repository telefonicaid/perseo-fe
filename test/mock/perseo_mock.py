#!/usr/bin/env python
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
#   iot_support at tid dot es
#
import BaseHTTPServer
import smtpd
import asyncore
import time
import mock_config
import sys
import json
from multiprocessing import Process, Manager


class FakeSMTPServer(smtpd.SMTPServer):
    """A Fake smtp server"""

    def __init__(*args, **kwargs):
        """
        constructor
        """
        smtpd.SMTPServer.__init__(*args, **kwargs)

    def process_message(self, peer, mailfrom, rcpttos, data):
        """
        receive a email
        """
        body_email[mock_config.SMTP_COUNTER] = body_email[mock_config.SMTP_COUNTER] + 1
        body_email[mock_config.SMTP_PEER]     = peer
        body_email[mock_config.SMTP_MAILFROM] = mailfrom
        body_email[mock_config.SMTP_RCPTTOS]  = rcpttos
        body_email[mock_config.SMTP_DATA]     = data
        print mock_config.ONE_LINE
        print mock_config.SMTP_RECEIVING_MSG_FROM, body_email[mock_config.SMTP_PEER]
        print mock_config.SMTP_MSG_ADDRESSED_TO, body_email[mock_config.SMTP_RCPTTOS]
        print mock_config.SMTP_MSG_LENGTH, len(body_email[mock_config.SMTP_DATA])
        if mock_config.MORE_INFO:   # -i option
            print mock_config.SMTP_MSG_ADDRESSED_FROM, body_email[mock_config.SMTP_MAILFROM]
            print mock_config.SMTP_DATA_INFO, str(body_email[mock_config.SMTP_DATA])
            print mock_config.SMTP_COUNTER, str(body_email[mock_config.SMTP_COUNTER])

body_sms    = mock_config.INITIAL_SMS_MSG
body_update = mock_config.INITIAL_UPDATE_MSG
sms_number    = 0
update_number = 0

class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    """A http server"""
    def do_POST (s):
       """
       Respond to a POST request.
       """
       global body_sms, body_update, sms_number, update_number
       try:
           #POST response - socket hang up
           s.send_response(mock_config.OK)
           s.send_header(mock_config.CONTENT_TYPE, mock_config.APPLICATION_JSON)
           s.send_header(mock_config.CONTENT_LENGTH, 0)
           s.end_headers()
           s.wfile.write("")
           # get the request body
           length = int(s.headers[mock_config.CONTENT_LENGTH])
           body = s.rfile.read(length)
           print mock_config.ONE_LINE
           if s.path.find(mock_config.SEND_SMS) >= 0:
               body_sms = str(body)
               sms_number = sms_number+1
               print body_sms
           elif s.path.find(mock_config.SEND_UPDATE) >= 0:
               body_update = str(body)
               update_number = update_number+1
               print body_update
       except Exception, e:
           print mock_config.WARN + mock_config.CONTENT_LENGTH_WARN_MSG

    def do_GET(s):
        """
        Respond to a GET request.
        """
        global body_sms, body_update, sms_number, update_number
        s.send_response(mock_config.OK)
        s.send_header(mock_config.CONTENT_TYPE, mock_config.APPLICATION_JSON)
        if s.path.find(mock_config.GET_EMAIL) >= 0:     # /get/email
            bodyDict = json.dumps(dict(body_email))
            s.send_header(mock_config.CONTENT_LENGTH, len (str(bodyDict)))
            s.end_headers()
            s.wfile.write(bodyDict)
        elif s.path.find(mock_config.GET_SMS) >= 0:      # /get/sms
            s.send_header(mock_config.CONTENT_LENGTH, len (str(body_sms)))
            s.end_headers()
            s.wfile.write(str(body_sms))
        elif  s.path.find(mock_config.GET_UPDATE) >= 0:   # /get/update
            s.send_header(mock_config.CONTENT_LENGTH, len (str(body_update)))
            s.end_headers()
            s.wfile.write(str(body_update))
        elif  s.path.find(mock_config.COUNTER_EMAIL) >= 0:   # /counter/email
            body_temp = "email counter: " + str(body_email[mock_config.SMTP_COUNTER])
            s.send_header(mock_config.CONTENT_LENGTH, len (str(body_temp)))
            s.end_headers()
            s.wfile.write(str(body_temp))
        elif  s.path.find(mock_config.COUNTER_SMS) >= 0:   # /counter/sms
            body_temp = "sms counter: " + str(sms_number)
            s.send_header(mock_config.CONTENT_LENGTH, len (str(body_temp)))
            s.end_headers()
            s.wfile.write(str(body_temp))
        elif s.path.find(mock_config.COUNTER_UPDATE) >= 0:   # /counter/updates
            body_temp = "update counter: " + str(update_number)
            s.send_header(mock_config.CONTENT_LENGTH, len (str(body_temp)))
            s.end_headers()
            s.wfile.write(str(body_temp))

    def do_PUT (s):
        """
        Respond to a PUT request.
        """
        text=" counter is reset..."
        global sms_number, update_number
        s.send_response(mock_config.OK)
        if s.path.find(mock_config.RESET_EMAIL) >= 0:      #/reset/email
            body_email[mock_config.SMTP_COUNTER] = 0
            s.send_header(mock_config.CONTENT_LENGTH, len(text)+5)
            s.end_headers()
            s.wfile.write("Email"+text)
        elif s.path.find(mock_config.RESET_SMS) >= 0:      # /reset/sms
            sms_number = 0
            s.send_header(mock_config.CONTENT_LENGTH, len(text)+3)
            s.end_headers()
            s.wfile.write("SMS"+text)
        elif s.path.find(mock_config.RESET_UPDATE) >= 0:   # /reset/updates
            update_number = 0
            s.send_header(mock_config.CONTENT_LENGTH, len(text)+6)
            s.end_headers()
            s.wfile.write("Update"+text)


if __name__ == "__main__":
    mock_config.configuration(sys.argv)
    smtp_server = FakeSMTPServer((mock_config.SMTP_BIND, mock_config.SMTP_PORT), None)
    server_class = BaseHTTPServer.HTTPServer
    httpd = server_class((mock_config.HTTP_BIND, mock_config.HTTP_PORT), MyHandler)
    print "Servers Starts at %s " % (time.asctime())
    try:
        manager = Manager()  # share between process
        body_email = manager.dict()
        body_email[mock_config.SMTP_COUNTER] = 0
        body_email[mock_config.SMTP_DATA] = mock_config.INITIAL_EMAIL_MSG

        p2 = Process(target=asyncore.loop)
        p1 = Process(target=httpd.serve_forever)
        p2.start()
        p1.start()
        p1.join()
        p2.join()
    except KeyboardInterrupt:
        p1.terminate()
        p2.terminate()
    except:
       print mock_config.ERROR+mock_config.MULTIPROCESSING_ERROR_MSG
    finally:
        smtp_server.close()
        httpd.server_close()
        print "Servers Stop at %s " % (time.asctime())