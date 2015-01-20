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

// email
package actions

import (
	"net/smtp"

	"perseo/config"
	"perseo/mylog"
	"perseo/notices"
	"perseo/util"
)

type EmailAction struct {
	*ActionData
}

func (a *EmailAction) Do(n notices.Notice) (err error) {
	if mylog.Debugging {
		mylog.Debugf("enter EmailAction.Do %+v %+v", a, n)
		defer func() { mylog.Debugf("exit EmailAction.Do  %+v", err) }()
	}

	text := util.ExpandFromMap(a.ActionData.Template, n)
	mylog.Debugf("text to send %q", text)
	err = smtp.SendMail(config.SMTPServer(), nil,
		a.Parameters["from"],
		[]string{a.Parameters["to"]},
		[]byte(text))
	if err != nil {
		mylog.Alert("EmailAction.Do", err)
	}
	return err
}
