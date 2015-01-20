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

// iotrules project main.go
package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/julienschmidt/httprouter"

	"perseo/actions"
	"perseo/config"
	"perseo/mylog"
	"perseo/notices"
	"perseo/rules"
	"perseo/util"
)

func main() {
	var err error

	fmt.Println("Hello World!")
	mylog.SetLevel("debug")
	if err = config.LoadConfig("perseo.conf"); err != nil {
		mylog.Alert(err)
		os.Exit(-1)
	}
	if err = rules.Initialize(); err != nil {
		mylog.Alert(err)
		os.Exit(-1)
	}

	rslice, err := rules.FindAll()
	if err != nil {
		mylog.Alert("main init retrieving rules", err)
		os.Exit(-1)
	}
	for _, rule := range rslice {
		axn, err := rule.GetAction()
		if err != nil {
			mylog.Alert("main init creating actions", err)
			os.Exit(-1)
		}
		actions.Add(axn)
	}
	err = rules.Refresh()
	if err != nil {
		mylog.Alert("main init refreshing ruleEndpoint", err)
		os.Exit(-1)
	}
	router := httprouter.New()
	notices.AddRoutes(router)
	actions.AddRoutes(router)
	rules.AddRoutes(router)
	err = http.ListenAndServe(config.Port(), util.PanicHandler(router))
	if err != nil {
		mylog.Alert(err)
	}

}
