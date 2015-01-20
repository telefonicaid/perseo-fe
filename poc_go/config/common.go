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

// config
package config

import (
	"fmt"
	"io/ioutil"
	"strconv"
	"strings"

	"perseo/mylog"
)

var cfg = map[string]string{}

func str(name string) (str string, found bool) {
	if mylog.Debugging {
		mylog.Debugf("enter config.str %q", name)
		defer func() { mylog.Debugf("exit config.str %q %+v", str, found) }()
	}

	str, found = cfg[name]
	return str, found
}
func f64(name string) (f float64, found bool) {
	if mylog.Debugging {
		mylog.Debugf("enter config.f64 %q", name)
		defer func() { mylog.Debugf("exit config.str %+v %+v", f, found) }()
	}

	str, found := cfg[name]
	f, err := strconv.ParseFloat(str, 64)
	found = err == nil
	return f, found
}

func loadFile(filename string) (err error) {
	if mylog.Debugging {
		mylog.Debugf("enter config.loadFile %q", filename)
		defer func() { mylog.Debugf("exit config.loadFile %+v", err) }()
	}

	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}
	err = parse(data)
	return err
}

func parse(data []byte) (err error) {
	if mylog.Debugging {
		mylog.Debugf("enter config.parse %q", data)
		defer func() {
			mylog.Debugf("exit config.parse %+v", err)
			mylog.Debugf("after config.parse cfg=%+v", cfg)
		}()
	}
	text := string(data)
	for i, line := range strings.Split(text, "\n") {
		lnumber := i + 1
		line = strings.TrimSpace(line)
		if len(line) == 0 || line[0] == '#' {
			continue
		}
		keyvalue := strings.SplitN(line, "=", 2)
		if len(keyvalue) != 2 {
			return fmt.Errorf("no-parseable config line %q at line %d", line, lnumber)
		}
		key, value := strings.TrimSpace(keyvalue[0]), strings.TrimSpace(keyvalue[1])
		if key == "" {
			return fmt.Errorf("empty config key at line %d", lnumber)
		}
		if _, found := cfg[key]; found {
			return fmt.Errorf("overwriting config key %q at line", key, lnumber)
		}
		cfg[key] = value
	}
	return nil
}
