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
	"testing"

	"perseo/config"
	"perseo/notices"
)

func TestActionEmail(t *testing.T) {
	setUpTest()

	config.SetSMTPServer("tid:25")
	a, err := NewAction("testing_email", EMAIL, "${Meter} has pression $Pression", map[string]string{"to": "brox@tid.es"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"Meter": "meter", "Pression": "2"})
	if err != nil {
		t.Fatal(err)
	}

	tearDownTest()
}

func TestActionEmailErrorClient(t *testing.T) {
	setUpTest()

	config.SetSMTPServer("http://inexistent.nowhere.noland")
	a, err := NewAction("testing_email", EMAIL, "${Meter} has pression $Pression", map[string]string{"to": "brox@tid.es"})
	if err != nil {
		t.Fatal(err)
	}
	err = a.Do(notices.Notice{"Meter": "meter", "Pression": "2"})
	if err == nil {
		t.Fatal("expected error non-nil, actual %s", err)
	}

	tearDownTest()
}
