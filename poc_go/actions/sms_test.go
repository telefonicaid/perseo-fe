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
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"

	"perseo/config"
	"perseo/notices"
)

func TestActionSMS(t *testing.T) {
	setUpTest()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		body, _ := ioutil.ReadAll(r.Body)
		fmt.Fprintln(w, string(body))
	}))
	defer ts.Close()
	config.SetSMSEndpoint("http://" + ts.Listener.Addr().String())
	a, err := NewAction("testing_sms", SMS, "${Meter} has pression $Pression", map[string]string{"to": "123456789"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"Meter": "meter", "Pression": "2"})
	if err != nil {
		t.Fatal(err)
	}

	tearDownTest()
}
func TestActionSMSErrorServer(t *testing.T) {
	setUpTest()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.NotFound(w, r)
	}))
	defer ts.Close()
	config.SetSMSEndpoint("http://" + ts.Listener.Addr().String())
	a, err := NewAction("testing_sms", SMS, "${Meter} has pression $Pression", map[string]string{"to": "123456789"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"Meter": "meter", "Pression": "2"})
	if err != nil {
		t.Fatal(err)
	}
}
func TestActionSMSErrorClient(t *testing.T) {
	setUpTest()

	config.SetSMSEndpoint("http://inexistent.nowhere.noland")
	a, err := NewAction("testing_sms", SMS, "${Meter} has pression $Pression", map[string]string{"to": "123456789"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"Meter": "meter", "Pression": "2"})
	if err == nil {
		t.Fatal("expected error non-nil, actual %s", err)
	}

	tearDownTest()
}
