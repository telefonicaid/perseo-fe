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

func TestActionUpdate(t *testing.T) {
	setUpTest()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer r.Body.Close()
		body, _ := ioutil.ReadAll(r.Body)
		fmt.Fprintln(w, string(body))
	}))
	defer ts.Close()
	config.SetUpdateEndpoint("http://" + ts.Listener.Addr().String())
	a, err := NewAction("testing_update", UPDATE, "", map[string]string{"name": "attr_nombre", "value": "attr_valor", "type": "attr_tipo"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"ev__type": "type_ev", "ev__isPattern": "false", "ev__id": "id_ev"})
	if err != nil {
		t.Fatal(err)
	}
}

func TestActionUpdateErrorServer(t *testing.T) {
	setUpTest()

	ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.NotFound(w, r)
	}))
	defer ts.Close()
	config.SetUpdateEndpoint("http://" + ts.Listener.Addr().String())
	a, err := NewAction("testing_update", UPDATE, "", map[string]string{"name": "attr_nombre", "value": "attr_valor", "type": "attr_tipo"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"ev__type": "type_ev", "ev__isPattern": "false", "ev__id": "id_ev", "ev__service": "6767"})
	if err != nil {
		t.Fatal(err)
	}
}

func TestActionUpdateErrorClient(t *testing.T) {
	setUpTest()

	config.SetUpdateEndpoint("http://inexistent.nowhere.noland")
	a, err := NewAction("testing_update", UPDATE, "", map[string]string{"name": "attr_nombre", "value": "attr_valor", "type": "attr_tipo"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"ev__type": "type_ev", "ev__isPattern": "false", "ev__id": "id_ev"})
	if err == nil {
		t.Fatal("expected error non-nil, actual %s", err)
	}
}
