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

// action
package actions

import (
	"fmt"
	"net/http"

	"perseo/mylog"
	"perseo/notices"
)

var httpClient = &http.Client{}

type ActionType int

const (
	SMS = ActionType(iota + 1)
	EMAIL
	UPDATE
	HTTP
)

func (t ActionType) String() string {
	var s string
	switch t {
	case SMS:
		s = "SMS"
	case EMAIL:
		s = "email"
	case UPDATE:
		s = "update"
	case HTTP:
		s = "HTTP"
	default:
		s = fmt.Sprintf("unknown(%d)", t)
	}
	return s
}
func ParseActionType(s string) (at ActionType, err error) {
	if mylog.Debugging {
		mylog.Debugf("enter ParseActionType %q", s)
		defer func() { mylog.Debugf("exit ParseActionType %+v, %+v ", at, err) }()
	}

	var finalType ActionType
	switch s {
	case "SMS":
		finalType = SMS
	case "email":
		finalType = EMAIL
	case "update":
		finalType = UPDATE
	default:
		return 0, fmt.Errorf("unknown action type %q", s)
	}
	return finalType, nil
}

type Action interface {
	Do(n notices.Notice) error
	Data() *ActionData
}

type ActionData struct {
	Name       string
	Type       ActionType
	Template   string
	Parameters map[string]string
}

func (ad *ActionData) Data() *ActionData {
	return ad
}

func NewAction(id string, actionType ActionType, template string, parameters map[string]string) (axn Action, err error) {
	if mylog.Debugging {
		mylog.Debugf("enter NewAction %+v, %q, %+v", actionType, template, parameters)
		defer func() { mylog.Debugf("exit NewAction %+v, %+v ", axn, err) }()
	}

	var ad = &ActionData{Name: id, Type: actionType, Template: template, Parameters: parameters}

	switch actionType {
	case SMS:
		axn = &SMSAction{ad}
	case EMAIL:
		axn = &EmailAction{ad}
	case UPDATE:
		axn = &UpdateAction{ad}
	case HTTP:
		axn = &HTTPAction{ad}
	default:
		return nil, fmt.Errorf("unsupported action type %v", actionType)
	}
	return axn, nil
}

type HTTPAction struct {
	*ActionData
}

func (a *HTTPAction) Do(n notices.Notice) error {
	return nil
}
