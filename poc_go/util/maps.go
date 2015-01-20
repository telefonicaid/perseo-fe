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

// maps.go
package util

import (
	"bytes"

	"perseo/mylog"
)

//changeDot replaces '.' character in attribute names for '__'
//to avoid misunderstanding at esper server
func ChangeDot(attr string) string {
	var buffer bytes.Buffer
	for i, attrLen := 0, len(attr); i < attrLen; i++ {
		if attr[i] == '.' {
			buffer.WriteString("__")
		} else {
			buffer.WriteByte(attr[i])
		}
	}
	return buffer.String()
}

func FlattenMap(key string, targetMap map[string]interface{}) (newMap map[string]interface{}) {
	if mylog.Debugging {
		mylog.Debugf("enter flattenMap(%v,%v)\n", key, targetMap)
		defer func() { mylog.Debugf("exit flattenMap (%v)\n", newMap) }()
	}
	newMap = make(map[string]interface{})
	for k, v := range targetMap {
		if submap, isMap := v.(map[string]interface{}); isMap {
			flattened := FlattenMap(k+"__", submap)
			for fk, fv := range flattened {
				newMap[key+fk] = fv
			}
		} else {
			newMap[key+k] = v
		}
	}
	return newMap
}

/*
func FlattenMap(key string, targetMap map[string]interface{}) {
	if mylog.Debugging {
		mylog.Debugf("enter flattenMap(%v,%v,%v)\n", key, targetMap)
		defer func() { mylog.Debugf("exit flattenMap (%v)\n", targetMap) }()
	}
	for k, v := range targetMap {
		if submap, isMap := v.(map[string]interface{}); isMap {
			FlattenMap(k+"__", submap)
			for sk, sv := range submap {
				targetMap[key+sk] = sv
				delete(submap, sk)
			}
			delete(targetMap, k)
		} else {
			targetMap[key+k] = v
		}
	}
}
*/
