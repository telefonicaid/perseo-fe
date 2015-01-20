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
	"reflect"
	"testing"
)

func TestActionList(t *testing.T) {
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
	all := make([]Action, 0, len(table))
	for _, tc := range table {
		a, err := NewAction(tc.id, tc.actionType, tc.template, tc.parameters)
		if err != nil {
			t.Fatal(err)
		}
		Add(a)
		all = append(all, a)
	}
	for i := len(all) - 1; i >= 0; i-- {
		a := all[i]
		a2 := Find(a.Data().Name)
		if a != a2 {
			t.Fatalf("expected %#v, actual %#v", a, a2)
		}
	}

	all2 := FindAll()
	if !reflect.DeepEqual(all, all2) {
		t.Fatalf("expected %#v, actual %#v", all, all2)
	}

	for _, tc := range table {
		Remove(tc.id)
		a := Find(tc.id)
		if a != nil {
			t.Fatalf("expected nil, found %#v", a)
		}
	}
	if len(actionList.actions) != 0 {
		t.Fatalf("expected len(actionList.actions)==0, found %d", len(actionList.actions))
	}

	tearDownTest()
}
