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

package actions

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"perseo/mylog"
)

func setUpTest() {
	mylog.SetLevel("debug")
}
func tearDownTest() {}

func TestActionPost(t *testing.T) {
	setUpTest()

	const jrule = `{
		"name":"blood_1",
		"epl":"@Audit select *,\"blood_1_action\" as iotcepaction,ev.BloodPressure? as Pression, ev.id? as Meter from pattern [every ev=iotEvent(cast(cast(BloodPressure?,String),float)\u003e1.5 and type=\"BloodMeter\")]",
		"action":{
			"name":"blood_1_action",
			"type":"email",
			"template":"Meter ${Meter} has pression $Pression complejo: $ev__complejo__saludo (GEN RULE)",
			"parameters":{"from":"brox@tid.es","to":"brox@tid.es"},
			"minInterval":0}}`
	req, err := http.NewRequest("POST", "http://example.com/foo", strings.NewReader(jrule))
	if err != nil {
		t.Fatal(err)
	}
	w := httptest.NewRecorder()
	controller := &controller{&actionList}
	controller.Post(w, req, nil)
	if w.Code != 200 {
		t.Fatalf("expected response code 200, actual %d", w.Code)
	}

	tearDownTest()
}

func TestActionNew(t *testing.T) {
	setUpTest()

	table := []struct {
		id         string
		actionType ActionType
		template   string
		parameters map[string]string
	}{
		{"test_action_1", SMS, "", nil},
		{"test_action_2", EMAIL, "", nil},
		{"test_action_3", UPDATE, "", nil},
		{"test_action_4", HTTP, "", nil},
	}
	for _, tc := range table {
		a, err := NewAction(tc.id, tc.actionType, tc.template, tc.parameters)
		if err != nil {
			t.Fatal(err)
		}
		if a == nil {
			t.Fatalf("expected non-nil action, actual %d", a)
		}
	}

	tearDownTest()
}
func TestActionString(t *testing.T) {
	setUpTest()

	table := []struct {
		text       string
		actionType ActionType
	}{
		{"SMS", SMS},
		{"email", EMAIL},
		{"update", UPDATE},
		{"HTTP", HTTP},
		{"unknown(99)", ActionType(99)},
	}
	for _, tc := range table {
		s := tc.actionType.String()
		if s != tc.text {
			t.Errorf("expected %s, actual %s", tc.text, s)
		}
	}

	tearDownTest()
}
func TestActionParsectionType(t *testing.T) {
	setUpTest()

	table := []struct {
		text       string
		actionType ActionType
	}{
		{"SMS", SMS},
		{"email", EMAIL},
		{"update", UPDATE},
	}
	for _, tc := range table {
		a, err := ParseActionType(tc.text)
		if err != nil {
			t.Fatal(err)
		}
		if a != tc.actionType {
			t.Errorf("expected %s, actual %s", tc.actionType, a)
		}
	}
	a, err := ParseActionType("--")
	if err == nil {
		t.Errorf("expected nil,error, actual %s %s", a, err)
	}

	tearDownTest()
}
