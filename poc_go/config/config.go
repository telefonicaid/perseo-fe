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

package config

import (
	"fmt"

	"perseo/mylog"
)

var port string
var (
	smsEndpoint string
	apiSecret   string
	apiKey      string
)
var (
	smtpServer string
)
var (
	updateEndpoint string
)
var (
	noticeEndpoint string
	ruleEndpoint   string
	ruleMongo      string
)

var loaded bool = false

func LoadConfig(filename string) (err error) {
	if mylog.Debugging {
		mylog.Debugf("enter config.LoadConfig %q", filename)
		defer func() { mylog.Debugf("exit config.LoadConfig %+v", err) }()
	}

	err = loadFile(filename)
	if err != nil {
		return err
	}

	var found bool

	port, found = str("port")
	if !found {
		return fmt.Errorf("config port is mandatory")
	}

	smsEndpoint, found = str("SMS.endpoint")
	if !found {
		return fmt.Errorf("config SMS.endpoint is mandatory")
	}

	apiKey, found = str("API_KEY")
	if !found {
		return fmt.Errorf("config SMS.endpoint is mandatory")
	}

	apiSecret, found = str("API_SECRET")
	if !found {
		return fmt.Errorf("config SMS.endpoint is mandatory")
	}

	smtpServer, found = str("email.SMTP.server")
	if !found {
		return fmt.Errorf("config SMS.endpoint is mandatory")
	}

	updateEndpoint, found = str("update.endpoint")
	if !found {
		return fmt.Errorf("config update.endpoint is mandatory")
	}
	noticeEndpoint, found = str("notice.endpoint")
	if !found {
		return fmt.Errorf("config notice.endpoint is mandatory")
	}
	ruleEndpoint, found = str("rule.endpoint")
	if !found {
		return fmt.Errorf("config rule.endpoint is mandatory")
	}
	ruleMongo, found = str("rule.mongodb")
	if !found {
		return fmt.Errorf("config rule.mongodb is mandatory")
	}
	return nil
}

func Port() string           { return port }
func SMSEndpoint() string    { return smsEndpoint }
func APIKey() string         { return apiKey }
func APISecret() string      { return apiSecret }
func SMTPServer() string     { return smtpServer }
func UpdateEndpoint() string { return updateEndpoint }
func NoticeEndpoint() string { return noticeEndpoint }
func RuleEndpoint() string   { return ruleEndpoint }
func RuleMongo() string      { return ruleMongo }

func SetPort(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetPort %q", v)
		defer func() { mylog.Debugf("exit config.SetPort") }()
	}
	port = v
}
func SetSMSEndpoint(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetSMSEndpoint %q", v)
		defer func() { mylog.Debugf("exit config.SetSMSEndpoint") }()
	}
	smsEndpoint = v
}
func SetAPIKey(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetAPIKey %q", v)
		defer func() { mylog.Debugf("exit config.SetAPIKey") }()
	}
	apiKey = v
}
func SetAPISecret(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetAPISecret %q", v)
		defer func() { mylog.Debugf("exit config.SetAPISecret") }()
	}
	apiSecret = v
}
func SetSMTPServer(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetSMTPServer %q", v)
		defer func() { mylog.Debugf("exit config.SetSMTPServer") }()
	}
	smtpServer = v
}
func SetUpdateEndpoint(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetUpdateEndpoint %q", v)
		defer func() { mylog.Debugf("exit config.SetUpdateEndpoint") }()
	}
	updateEndpoint = v
}
func SetNoticeEndpoint(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetNoticeEndpoint %q", v)
		defer func() { mylog.Debugf("exit config.SetNoticeEndpoint") }()
	}
	noticeEndpoint = v
}
func SetRuleEndpoint(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetRuleEndpoint %q", v)
		defer func() { mylog.Debugf("exit config.SetRuleEndpoint") }()
	}
	ruleEndpoint = v
}
func SetRuleMongo(v string) {
	if mylog.Debugging {
		mylog.Debugf("enter config.SetRuleMongo %q", v)
		defer func() { mylog.Debugf("exit config.SetRuleMongo") }()
	}
	ruleMongo = v
}
