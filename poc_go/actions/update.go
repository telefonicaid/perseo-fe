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

// update
package actions

import (
	"net/http"
	"net/http/httputil"
	"strings"

	"perseo/config"
	"perseo/mylog"
	"perseo/notices"
	"perseo/util"
)

const updateTemplateText = `{
    "contextElements": [
        {
            "type": "$ev__type",
            "isPattern": "$ev__isPattern",
            "id": "$ev__id",
            "attributes": [
            {
                "name": "${__attrName}",
                "type": "${__attrType}",
                "value": "${__attrValue}"
            }
            ]
        }
    ],
    "updateAction": "APPEND"
}`

type UpdateAction struct {
	*ActionData
}

func (a *UpdateAction) Do(n notices.Notice) (err error) {

	// A litle (or very) dirty. Add "hidden" parameters as notification data
	// and remove them after executing template (better copy first level fields in a new map?)
	n["__attrName"] = a.ActionData.Parameters["name"]
	n["__attrValue"] = a.ActionData.Parameters["value"]
	n["__attrType"] = a.ActionData.Parameters["type"]
	text := util.ExpandFromMap(updateTemplateText, n)
	mylog.Debug("UpdateAction text to send:", text)
	delete(n, "__attrName")
	delete(n, "__attrValue")
	delete(n, "__attrType")

	req, err := http.NewRequest("POST", config.UpdateEndpoint(), strings.NewReader(text))
	if err != nil {
		mylog.Alert("UpdateAction.Do", err)
	}
	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Accept", "application/json")
	service, ok := n["ev__service"]
	if ok {
		req.Header.Add("Fiware-service", service.(string))
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		mylog.Alert("UpdateAction.Do", err)
		return err
	}
	respDump, err := httputil.DumpResponse(resp, true)
	mylog.Debugf("UpdateAction.Do server response: (%q,%v)\n", string(respDump), err)
	return err
}
