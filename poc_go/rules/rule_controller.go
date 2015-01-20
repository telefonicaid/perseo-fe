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
package rules

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/julienschmidt/httprouter"
	"labix.org/v2/mgo"

	"perseo/actions"
	"perseo/config"
	"perseo/mylog"
)

var httpClient = &http.Client{}

type controller struct {
}

func AddRoutes(router *httprouter.Router) {
	mylog.Debugf("enter rule.AddRoutes(%+v)", router)
	defer func() { mylog.Debugf("exit rule.AddRoutes(%+v)", router) }()

	controller := &controller{}
	router.GET("/rules", controller.GetAll)
	router.GET("/rules/:name", controller.Get)
	router.POST("/rules", controller.Post)
	router.DELETE("/rules/:name", controller.Del)
}

func (rs *controller) Get(w http.ResponseWriter, request *http.Request, p httprouter.Params) {
	rl, err := Find(p[0].Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	text, err := json.Marshal(rl)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "%s\n", text)
}
func (rs *controller) GetAll(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	rslice, err := FindAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	text, err := json.Marshal(rslice)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "%s\n", text)
}

func (rs *controller) Del(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	err := Delete(p[0].Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	actions.Remove(p[0].Value)
	req, err := http.NewRequest("DELETE", config.RuleEndpoint()+"/"+p[0].Value, nil)
	if err != nil {
		mylog.Alert("rule controller DELETE", err)
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		mylog.Alert("rule controller DELETE", err, resp)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp.StatusCode/100 != 2 {
		mylog.Alert("rule controller DELETE", resp.Status)
		http.Error(w, resp.Status, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "deleted", p[0].Value)
}
func (rs *controller) Post(w http.ResponseWriter, request *http.Request, p httprouter.Params) {
	defer request.Body.Close()

	data, err := ioutil.ReadAll(request.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	var rule Rule
	err = json.Unmarshal(data, &rule)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ruleJSON := fmt.Sprintf("{\"name\":%q,\"epl\":%q}", rule.Name, rule.EPL)
	req, err := http.NewRequest("POST", config.RuleEndpoint(), strings.NewReader(ruleJSON))
	if err != nil {
		mylog.Alert("rule controller POST", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	resp, err := httpClient.Do(req)
	if err != nil {
		mylog.Alert("rule controller POST", err, resp)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if resp.StatusCode/100 != 2 {
		mylog.Alert("rule controller POST", resp.Status)
		http.Error(w, resp.Status, http.StatusInternalServerError)
		return
	}
	err = Save(&rule)
	if err != nil {
		if mgo.IsDup(err) {
			http.Error(w, err.Error(), http.StatusBadRequest)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	axn, err := rule.GetAction()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	actions.Add(axn)

	w.WriteHeader(http.StatusCreated)
	dataBack, err := json.Marshal(rule)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(dataBack)

}
