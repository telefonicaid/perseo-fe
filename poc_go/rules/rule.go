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

// rulejson.go
package rules

import (
	"time"

	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"

	"perseo/actions"
	"perseo/config"
	"perseo/mylog"
)

type Rule struct {
	Name   string     `json:"name"`
	EPL    string     `json:"epl"`
	Action RuleAction `json:"action"`
}

type RuleAction struct {
	Name        string            `json:"name"`
	Type        string            `json:"type"`
	Template    string            `json:"template"`
	Parameters  map[string]string `json:"parameters"`
	MinInterval time.Duration     `json:"minInterval"`
}

var (
	session *mgo.Session
	index   = mgo.Index{
		Key:    []string{"name"},
		Unique: true,
	}
)

func Initialize() (err error) {
	session, err = mgo.Dial(config.RuleMongo())
	if err != nil {
		return err
	}
	session.SetMode(mgo.Monotonic, true) //????????
	//session.SetSafe(&mgo.Safe{WMode: "majority"})
	session.SetSafe(&mgo.Safe{})
	return nil
}

func Find(name string) (r *Rule, err error) {
	s := session.Clone()
	defer s.Close()
	c := session.DB("test").C("rules")
	result := new(Rule)
	err = c.Find(bson.M{"name": name}).One(result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
func FindAll() (rs []*Rule, err error) {
	s := session.Clone()
	defer s.Close()
	rs = make([]*Rule, 0)
	c := session.DB("test").C("rules")
	err = c.Find(nil).All(&rs)
	if err != nil {
		return nil, err
	}
	return rs, nil
}
func Delete(name string) (err error) {
	s := session.Clone()
	defer s.Close()
	c := session.DB("test").C("rules")
	info, err := c.RemoveAll(bson.M{"name": name})
	mylog.Debug(info, err)
	return err
}
func Save(r *Rule) (err error) {
	if mylog.Debugging {
		mylog.Debugf("enter rules.Save %+v", r)
		defer func() { mylog.Debugf("exit rules.Save %+v", err) }()
	}
	s := session.Clone()
	defer s.Close()
	c := session.DB("test").C("rules")
	err = c.EnsureIndex(index)
	if err != nil {
		return err
	}
	ci, err := c.Upsert(bson.M{"name": r.Name}, r)
	mylog.Debugf("rules.Save Upsert changeInfo %+v\n", ci)
	return err
}

func (r *Rule) GetAction() (axn actions.Action, err error) {
	if mylog.Debugging {
		mylog.Debugf("enter rules.GetAction %+v", r)
		defer func() { mylog.Debugf("exit rules.GetAction %+v, %+v ", axn, err) }()
	}
	ar := r.Action
	at, err := actions.ParseActionType(ar.Type)
	if err != nil {
		return nil, err
	}
	return actions.NewAction(ar.Name, at, ar.Template, ar.Parameters)
}
