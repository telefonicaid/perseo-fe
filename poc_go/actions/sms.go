/*
 * Copyright 2013 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of perseo
 *
 * perseo is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * perseo is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with perseo.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with iot_support at tid dot es
 */

// sms
package actions

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"strings"

	"perseo/config"
	"perseo/mylog"
	"perseo/notices"
	"perseo/util"
)

type SMSAction struct {
	*ActionData
}

func (a *SMSAction) Do(n notices.Notice) (err error) {
	if mylog.Debugging {
		defer func() { mylog.Debugf("exit SMSAction.Do  %+v", err) }()
	}

	text := util.ExpandFromMap(a.ActionData.Template, n)
	mylog.Debug("SMSAction text to send:", text)
	msg := fmt.Sprintf(`{"to":["tel:%s"], "message": %q}`, a.Parameters["to"], text)
	mylog.Debug("SMSAction msg to send:", msg)
	req, err := http.NewRequest("POST", config.SMSEndpoint(), strings.NewReader(msg))
	if err != nil {
		mylog.Alert("SMSAction.Do", err)
	}
	req.Header.Add("API_KEY", config.APIKey())
	req.Header.Add("API_SECRET", config.APISecret())
	req.Header.Add("Content-Type", "application/json")
	mylog.Debug("SMSAction.Do msg:", msg)
	resp, err := httpClient.Do(req)
	if err != nil {
		mylog.Alert("SMSAction.Do", err)
		return err
	}
	respDump, err := httputil.DumpResponse(resp, true)
	mylog.Debugf("SMSAction.Do server response: (%q,%v)\n", string(respDump), err)
	return err
}
