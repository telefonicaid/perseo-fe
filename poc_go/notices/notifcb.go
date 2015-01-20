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

package notices

import (
	"encoding/json"
	"time"

	"code.google.com/p/go-uuid/uuid"

	"perseo/mylog"
	"perseo/util"
)

type Notice map[string]interface{}

type NotifyContextRequest struct {
	SubscriptionId   string
	Originator       string
	ContextResponses []struct{ ContextElement ContextElement }
}
type ContextElement struct {
	Id         string
	IsPattern  string
	Type       string
	Attributes []Attribute
}
type Attribute struct {
	Name  string
	Type  string
	Value interface{}
}

func NewNoticeFromCB(ngsi []byte, service string) (n map[string]interface{}, err error) {
	if mylog.Debugging {
		mylog.Debugf("enter NewNoticeFromCB(%s,%d)\n", ngsi, service)
		defer func() { mylog.Debugf("exit NewNotifFromCB (%+v,%v)\n", n, err) }()
	}

	n = make(map[string]interface{})
	n["noticeId"] = uuid.New()
	n["received"] = time.Now()

	var ncr NotifyContextRequest
	err = json.Unmarshal(ngsi, &ncr)
	if err != nil {
		return nil, err
	}
	mylog.Debugf("in NewNoticeFromCB NotifyContextRequest: %+v\n", ncr)

	n["id"] = ncr.ContextResponses[0].ContextElement.Id
	n["type"] = ncr.ContextResponses[0].ContextElement.Type
	n["isPattern"] = ncr.ContextResponses[0].ContextElement.IsPattern
	n["service"] = service

	//Transform name-value-type
	for _, attr := range ncr.ContextResponses[0].ContextElement.Attributes {
		n[attr.Name] = attr.Value
		n[attr.Name+"__type"] = attr.Type
	}
	n = util.FlattenMap("", n)
	n2 := make(map[string]interface{}, len(n))
	for k, v := range n {
		n2[util.ChangeDot(k)] = v
	}
	return n2, nil
}
