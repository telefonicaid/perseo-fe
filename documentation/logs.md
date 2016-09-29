# Logs

Logs have levels `FATAL`, `ERROR`, `INFO` and `DEBUG`. The log level must be set in the configuration file `config.js`

```javascript
/**
 * Default log level. Can be one of: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
 * @type {string}
 */
config.logLevel = 'INFO';
```

 In order to have logs that can enable alarms being raised and ceased, `INFO` level should be set in the configuration file.
With `ERROR` level, alarms could be raised but not ceased.

Each log line contains several fields of the form *name*`=` *value*, separated by `|`
* `time` time of the log
* `lvl` log level
* `from` IP from X-Real-IP header field or client's IP if missing
* `corr` correlator from the incoming request that caused the current transaction. It allows trace a global operation through several systems. If not present as field header in the incoming request, the internal transaction id will be used.
* `trans` internal transaction id
* `op`  description of the operation being done. Generally, the path of the URL invoked.
* `msg` message

```
time=2014-12-16T12:01:46.487Z | lvl=ERROR | corr=62d2f662-37de-4dcf-ba02-013642501a2d | trans=62d2f662-37de-4dcf-ba02-013642501a2d | op=/actions/do | msg=emailAction.SendMail connect ECONNREFUSED
```

Logs for errors can show additional info in the message, giving a hint of the root cause of the problem (`ECONNREFUSED`,`ENOTFOUND`, `ECONNRESET`, ...)

The log level can be changed at run-time, with an HTTP PUT request

```
 curl --request PUT <host>:<port>/admin/log?level=<FATAL|ERROR|WARN|INFO|DEBUG>
 ```

The log level can be retrieved at run-time, with an HTTP GET request

```
 curl --request GET <host>:<port>/admin/log
 ```


# Alarms

Alarm levels

* **Critical** - The system is not working
* **Major** - The system has a problem that degrades the service and must be addressed
* **Warning** - It is happening something that must be notified

Alarms will be inferred from logs typically. For each alarm, a 'detection strategy' and a 'stop condition' is provided (note that the stop condition is not shown in the next table, but it is included in the detailed description for each alarm below). The conditions are use for detecting logs that should raise the alarm and cease it respectively. Level (`lvl`), operation  (`op`) and message (`msg`) are considerated to evaluate the condition. The message in a condition is considerated to be a prefix of the possible message in the log. Starting spaces in each field is recommended to be eliminated to avoid missing a log that should meet the condition in other case. The expressions `h:p` and `h:p/d` are used as placeholders for any combination on a host, a port and a database (usually the actual values will be taken from config file)

Some errors avoid perseo to start up. They have `FATAL` level and are caused by
* There is no connection to database
* There is no connection to perseo-core

They should be solved in order to get perseo running. Once it is got started, such errors will cause a log that should generate an alarm.



## Alarm conditions

Alarm ID | Severity | Description | Action
---|---|---|---|
[START](#start)|Critical|Impossible to start perseo|Check HTTP connectivity to perseo-core from perseo and connectivity to the mongoDB, as set in the config file.
[REFRESH](#refresh)|Major|Refreshing of rules at core is failing.|Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path.
[POST_RULE](#post_rule)|Major|Adding a rule at core is failing.|Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path.
[DEL_RULE](#del_rule)|Major|Deleting a rule at core is failing.|Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path.
[PUT_RULE](#put_rule)|Major|Updating a rule at core is failing.|Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path.
[POST_EVENT](#post_event)|Critical|Sending an event to core is failing.|Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path.
[EXEC_ACTION](#exec_action)|Critical|Trying to execute an action is failing. (The endpoint can be Orion for update actions or the SMS Gateway for sending SMS)|Check HTTP connectivity to endpoint from perseo. Check the endpoint is working properly.
[EXEC_EMAIL](#exec_email)|Critical|Trying to execute an email action is failing.|Check the configured SMTP Server is accessible and working properly.
[CHECK_MASTER](#check_master)|Major|A "slave" perseo has lost visibility of master.|Check the configured SMTP Server is accessible and working properly.
[DATABASE](#database)|Critical|There is a problem in connection to DB. It can be the perseo database or the Orion database (accessed by no-signal checker|Check configured mongoDB is up and running and is accessible from perseo. Check that databases exist in mongoDB.
[AUTH](#auth)|Major|There is a problem in connection to Keystone. Update-actions to Orion through PEP are not working|Check HTTP connectivity to Keystone. Check provisioned user and roles/grants.
[LOOP](#loop)|Major|Some rules can be provoking an infinite loop of triggered actions|Report to client/product about possible loop with the pointed rule. Check log for the correlator in teh log message.
<a name="start"></a>
### Alarm START

**Severity**: Critical

**Detection strategy:** `lvl`:`FATAL` `op`:`perseo`

**Stop condition**: `lvl`:`INFO` `op`:`perseo` `msg`:`perseo started`

**Description**: Starting perseo is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo and connectivity to the mongoDB, as set in the config file.

____
<a name="refresh"></a>
### Alarm REFRESH

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `op`:`refreshCore` `msg`:`error put to http://h:p/perseo-core/rules`

**Stop condition**: `lvl`:`INFO` `op`:`refreshCore` `msg`:`done put to http://h:p/perseo-core/rules`

**Description**: Refreshing of rules at core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path

____
<a name="post_rule"></a>
### Alarm POST_RULE

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `op`:`/rules` `msg`:`error post to http://h:p/perseo-core/rules`

**Stop condition**: `lvl`:`INFO` `op`:`/rules` `msg`:`done post to http://h:p/perseo-core/rules`

**Description**: Adding a rule at core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path

____
<a name="del_rule"></a>
### Alarm DEL_RULE

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `op`:`/rules` `msg`:`error del to http://h:p/perseo-core/rules`

**Stop condition**:`lvl`:`INFO` `op`:`/rules` `msg`:`done del to http://h:p/perseo-core/rules`

**Description**: Deleting a rule at core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path

____
<a name="put_rule"></a>
### Alarm PUT_RULE

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `op`:`/rules` `msg`:`error put to http://h:p/perseo-core/rules`

**Stop condition**: `lvl`:`INFO` `op`:`/rules` `msg`:`done put to http://h:p/perseo-core/rules`

**Description**: Updating a rule at core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path

____
<a name="post_event"></a>
### Alarm POST_EVENT

**Severity**: Critical

**Detection strategy:** `lvl`:`ERROR` `op`:`/notices` `msg`:`error post to http://` *h:p* `/perseo-core/events`

**Stop condition**: `lvl`:`INFO` `op`:`/notices` `msg`:`done post to http://` *h:p* `/perseo-core/events`

**Description**: Sending an event to core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL path

____

<a name="exec_action"></a>
### Alarm EXEC_ACTION

**Severity**: Critical

**Detection strategy:** `lvl`:`ERROR` `op`:`/actions/do` `msg`:`error post to http://` *h:p*

**Stop condition**: `lvl`:`INFO` `op`:`/actions/do` `msg`:`done post to http://` *h:p*

**Description**: Trying to execute an action is failing. (The endpoint can be Orion for update actions or the SMS Gateway for sending SMS)

**Action**: Check HTTP connectivity to h:p from perseo. Check the endpoint is working properly

____
<a name="exec_email"></a>
### Alarm EXEC_EMAIL

**Severity**: Critical

**Detection strategy:** `lvl`:`ERROR` `op`:`/actions/do` `msg`:`emailAction.SendMail`

**Stop condition**: `lvl`:`INFO` `op`:`/actions/do` `msg`:`done emailAction.SendMail`

**Description**: Trying to execute an email action is failing.

**Action**: Check the configured SMTP Server is accessible and working properly
____
<a name="check_master"></a>
### Alarm CHECK_MASTER

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `op`:`checkMaster` `msg`:`master http://` *h:p* `/check is not available`

**Stop condition**: `lvl`:`INFO` `op`:`checkMaster` `msg`:`master http://` *h:p* `/check availability has changed to true`

**Description**: A "slave" perseo has lost visibility of master.

**Action**: Check perseo-master is up and running and is accessible from perseo-slave

____
<a name="database"></a>
### Alarm DATABASE

**Severity**: Critical

**Detection strategy:** `lvl`:`ERROR` `msg`:`database error mongodb://` *h:p/db*

**Stop condition**: `lvl`:`INFO` `msg`:`database ping done: mongodb://` *h:p/db*

**Description**: There is a problem in connection to DB. It can be the perseo database or the Orion database (accessed by no-signal checker)

**Action**: Check configured mongoDB is up and running and is accessible from perseo. Check that databases exist.

____
<a name="auth"></a>
### Alarm AUTH

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `msg`:`error retrieving token from Keystone`

**Stop condition**: `lvl`:`INFO` `msg`:`token generated successfully`

**Description**: There is a problem in connection to Keystone. Update-actions to Orion through PEP are not working.

**Action**: Check HTTP connectivity to Keystone. Check provisioned user and roles/grants.

____
<a name="loop"></a>
### Alarm LOOP

**Severity**: Major

**Detection strategy:** `lvl`:`ERROR` `msg`:`check infinite loop`

**Stop condition**: `N/A`

**Description**: Some rules can be provoking an infinite loop of triggered actions.

**Action**: Report to client/product about possible loop with the pointed rule. Check log for the correlator in teh log message


