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
package notices

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/julienschmidt/httprouter"

	"perseo/config"
	"perseo/mylog"
)

type controller struct {
}

func AddRoutes(router *httprouter.Router) {
	mylog.Debugf("enter notice.AddRoutes(%+v)", router)
	defer func() { mylog.Debugf("exit action.Handler(%+v)", router) }()

	controller := &controller{}
	router.POST("/noticeCB", controller.Post)
}

func (nc *controller) Post(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	defer r.Body.Close()
	service := r.Header.Get("fiware-service")

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	n, err := NewNoticeFromCB(data, service)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Fprintln(w, "ok notice received")
	mylog.Debug(n)
	go func() {
		text, err := json.Marshal(n)
		mylog.Debug(string(text))
		if err != nil {
			mylog.Alert(err)
			return
		}
		resp, err := http.Post(config.NoticeEndpoint(), "application/json", bytes.NewReader(text))
		mylog.Debug(resp, err)
		if err != nil {
			mylog.Alert(err)
			return
		}
	}()
}
