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

// server.go
package actions

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"perseo/mylog"
	"perseo/util"
)

type controller struct {
	actions *List
}

func AddRoutes(router *httprouter.Router) {
	mylog.Debugf("enter notice.AddRoutes(%+v)", router)
	defer func() { mylog.Debugf("exit action.Handler(%+v)", router) }()

	controller := &controller{&actionList}
	router.POST("/action", controller.Post)
}

func (ac *controller) Post(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	defer r.Body.Close()
	mylog.Debug("Action received")
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var object map[string]interface{}
	err = json.Unmarshal(body, &object)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	object = util.FlattenMap("", object)

	text, _ := json.MarshalIndent(object, "", " ")
	mylog.Debug("action text", string(text))
	var axn Action
	switch actionID := object["iotcepaction"].(type) {
	case string:
		axn = Find(actionID)
		if axn == nil {
			http.Error(w, fmt.Sprintf("unknown action %q ", actionID), http.StatusNotFound)
			return
		}
		axn.Do(object)
	}

	fmt.Fprintln(w, "Perfect for now")
}
