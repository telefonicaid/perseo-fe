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

package rules

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"perseo/config"
	"perseo/mylog"
)

func Refresh() error {
	rslice, err := FindAll()
	if err != nil {
		mylog.Alert("rule refresh", err)
		return err
	}
	ruleList, err := json.Marshal(rslice)
	req, err := http.NewRequest("PUT", config.RuleEndpoint(), bytes.NewReader(ruleList))
	mylog.Debug("rule refresh, posting rule:", req)
	if err != nil {
		mylog.Alert("rule refresh", err)
		return err
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		mylog.Alert("rule refresh", err, resp)
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode/100 != 2 {
		mylog.Alert("rule refresh", resp.Status)
		body, _ := ioutil.ReadAll(resp.Body)
		return fmt.Errorf("error refreshing rule endpoint %s %s", resp.Status, body)
	}
	return nil
}
