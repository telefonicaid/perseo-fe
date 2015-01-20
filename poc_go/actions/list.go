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
	"sync"

	"perseo/mylog"
)

type List struct {
	actions map[string]Action
	sync.RWMutex
}

var actionList List

func init() {
	actionList.actions = make(map[string]Action)
}

func Add(a Action) {
	if mylog.Debugging {
		mylog.Debugf("enter action.Add %+v", a)
		defer func() { mylog.Debugf("exit action.Add") }()
	}

	actionList.Lock()
	defer actionList.Unlock()
	actionList.actions[a.Data().Name] = a
}
func Remove(id string) {
	if mylog.Debugging {
		mylog.Debugf("enter action.Remove %q", id)
		defer func() { mylog.Debugf("exit action.Remove") }()
	}

	actionList.Lock()
	defer actionList.Unlock()
	delete(actionList.actions, id)
}
func Find(id string) (a Action) {
	if mylog.Debugging {
		mylog.Debugf("enter action.Find %q", id)
		defer func() { mylog.Debugf("exit action.Find %+v", a) }()
	}

	actionList.RLock()
	defer actionList.RUnlock()
	a = actionList.actions[id]
	return a

}
func FindAll() (as []Action) {
	if mylog.Debugging {
		mylog.Debugf("enter action.FindAll")
		defer func() { mylog.Debugf("exit action.FindAll %+v", as) }()
	}

	actionList.RLock()
	defer actionList.RUnlock()
	for _, a := range actionList.actions {
		as = append(as, a)
	}
	return as
}
