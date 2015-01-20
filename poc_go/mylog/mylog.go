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

package mylog

import (
	"fmt"
	"log"
	"log/syslog"
	"os"
	"sync"
)

var (
	dbgLog   *log.Logger
	alertLog *syslog.Writer
	level    int
	mtx      sync.Mutex
)

var Debugging = false

const (
	ALERT = 0
	INFO  = 6
	DEBUG = 7
)

func init() {
	dbgLog = log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds|log.Lshortfile)
	var err error
	alertLog, err = syslog.New(syslog.LOG_EMERG|syslog.LOG_USER, "cepiot")
	if err != nil {
		log.Fatal(err)
	}
}

func SetLevelInt(lvl int) {
	mtx.Lock()
	defer mtx.Unlock()
	level = lvl
	Debugging = level == DEBUG

}
func SetLevel(lvl string) {
	switch lvl {
	case "alert":
		SetLevelInt(ALERT)
	case "info":
		SetLevelInt(INFO)
	case "debug":
		SetLevelInt(DEBUG)
	default:
		panic("unknown log level: " + lvl)
	}
}
func Logger() *log.Logger {
	return dbgLog
}

func Debugf(f string, args ...interface{}) {
	if level >= DEBUG {
		str := fmt.Sprintf(f, args...)
		dbgLog.Output(2, str)
	}
}

func Debug(args ...interface{}) {
	if level >= DEBUG {
		str := fmt.Sprintln(args...)
		dbgLog.Output(2, str)
	}
}
func Infof(f string, args ...interface{}) {
	if level >= INFO {
		str := fmt.Sprintf(f, args...)
		dbgLog.Output(2, str)
	}
}

func Info(args ...interface{}) {
	if level >= INFO {
		str := fmt.Sprintln(args...)
		dbgLog.Output(2, str)
	}
}
func Alertf(f string, args ...interface{}) {
	str := fmt.Sprintf(f, args...)
	alert(str)
}

func Alert(args ...interface{}) {
	str := fmt.Sprintln(args...)
	alert(str)

}
func alert(str string) {
	err := alertLog.Alert(str)
	if err != nil {
		dbgLog.Println(err) // Panic would be better??
	}
	dbgLog.Output(3, str)
}
