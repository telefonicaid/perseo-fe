# Logs

Logs have levels `FATAL`, `ERROR`, `INFO` and `DEBUG`. The log level must be set in the configuration file `config.js`

```javascript
/**
 * Default log level. Can be one of: 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
 * @type {string}
 */
config.logLevel = "INFO";
```

In order to have logs that can enable alarms being raised and ceased, `ERROR` level (or one with more detail) should be
set in the configuration file. Generally, `ERROR` level should be used at least, as some important information can be
lost in other case (e.g. when set to `FATAL`)

Each log line contains several fields of the form _name_`=` _value_, separated by `|`

-   `time` time of the log
-   `lvl` log level
-   `from` IP from X-Real-IP header field or client's IP if missing
-   `corr` correlator from the incoming request that caused the current transaction. It allows trace a global operation
    through several systems. If not present as field header in the incoming request, the internal transaction ID will be
    used.
-   `trans` internal transaction ID
-   `op` description of the operation being done. Generally, the path of the URL invoked.
-   `msg` message

```text
time=2014-12-16T12:01:46.487Z | lvl=ERROR | corr=62d2f662-37de-4dcf-ba02-013642501a2d | trans=62d2f662-37de-4dcf-ba02-013642501a2d | op=/actions/do | msg=emailAction.SendMail connect ECONNREFUSED
```

Logs for errors can show additional info in the message, giving a hint of the root cause of the problem
(`ECONNREFUSED`,`ENOTFOUND`, `ECONNRESET`, ...)

The log level can be changed at run-time, with an HTTP PUT request

```bash
 curl --request PUT <host>:<port>/admin/log?level=<FATAL|ERROR|WARN|INFO|DEBUG>
```

The log level can be retrieved at run-time, with an HTTP GET request

```bash
 curl --request GET <host>:<port>/admin/log
```

# Alarms

Alarm levels

-   **Critical** - The system is not working
-   **Major** - The system has a problem that degrades the service and must be addressed
-   **Warning** - It is happening something that must be notified

Alarms will be inferred from logs typically. For each alarm, a 'detection strategy' and a 'stop condition' is provided
(note that the stop condition is not shown in the next table, but it is included in the detailed description for each
alarm below). The conditions are used for detecting logs that should raise the alarm and cease it respectively. The log
level for alarms is `ERROR` if no other level is said. The message in a condition should be taken as a **prefix** of the
possible message in the log. We recommend you to ignore starting spaces in each field in order to avoid missing a log
that should meet the condition in other case.

Some errors cause perseo to fail to start up. They have `FATAL` level and are caused by:

-   Lack of connection to database
-   Lack of connection to perseo-core

They should be solved in order to get perseo running.

## Alarm conditions

| Alarm ID                          | Severity | Description                                                                              |
| :-------------------------------- | :------- | :--------------------------------------------------------------------------------------- |
| [START](#start)                   | Critical | Impossible to start perseo                                                               |
| [CORE](#core)                     | Major    | Refreshing of rules at core is failing.                                                  |
| [POST_EVENT](#post_event)         | Critical | Sending an event to core is failing.                                                     |
| [EMAIL](#email)                   | Critical | Trying to execute an email action is failing.                                            |
| [SMS](#sms)                       | Critical | Trying to execute an SMS action is failing.                                              |
| [SMPP](#smpp)                     | Critical | Trying to execute an SMPP action is failing.                                             |
| [ORION](#orion)                   | Critical | Trying to execute an update action is failing                                            |
| [DATABASE](#database)             | Critical | A problem in connection to DB.                                                           |
| [DATABASE_ORION](#database_orion) | Critical | A problem in connection to Orion DB (accessed by no-signal checker)                      |
| [AUTH](#auth)                     | Major    | A problem in connection to Keystone. Update-actions to Orion through PEP are not working |
| [LOOP](#loop)                     | Major    | Some rules can be provoking an infinite loop of triggered actions                        |

<a name="start"></a>

### Alarm START

**Severity**: Critical

**Detection strategy:** `lvl`:`FATAL` `op`:`perseo`

**Stop condition**: `N/A`

**Description**: Starting perseo is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo and connectivity to the mongoDB, as set in the config
file.

---

<a name="core"></a>

### Alarm CORE

**Severity**: Major

**Detection strategy:** `msg`:`ALARM-ON [CORE]`

**Stop condition**: `msg`:`ALARM-OFF [CORE]`

**Description**: Communication with core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL
path

---

<a name="post_event"></a>

### Alarm POST_EVENT

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON [POST_EVENT]`

**Stop condition**: `msg`:`ALARM-OFF [POST_EVENT]`

**Description**: Sending an event to core is failing.

**Action**: Check HTTP connectivity to perseo-core from perseo. Also check deployment of perseo-core at the right URL
path

---

<a name="email"></a>

### Alarm EMAIL

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [EMAIL]`

**Stop condition**: `msg`:`ALARM-OFF: [EMAIL]`

**Description**: Trying to execute an email action is failing.

**Action**: Check the configured SMTP Server is accessible and working properly

---

<a name="sms"></a>

### Alarm SMS

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [SMS]`

**Stop condition**: `msg`:`ALARM-OFF: [SMS]`

**Description**: Trying to execute an SMS action is failing.

**Action**: Check the configured SMPP Adapter Server is accessible and working properly

---

<a name="smpp"></a>

### Alarm SMPP

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [SMPP]`

**Stop condition**: `msg`:`ALARM-OFF: [SMPP]`

**Description**: Trying to execute an SMPP action is failing.

**Action**: Check the configured SMPP Server is accessible and working properly

---

<a name="orion"></a>

### Alarm ORION

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [ORION]`

**Stop condition**: `msg`:`ALARM-OFF: [ORION]`

**Description**: Trying to execute an update action is failing.

**Action**: Check the configured Orion path for updating is accessible and working properly

---

<a name="database"></a>

### Alarm DATABASE

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [DATABASE]`

**Stop condition**: `msg`:`ALARM-OFF: [DATABASE]`

**Description**: There is a problem in connection to DB.

**Action**: Check configured mongoDB is up and running and is accessible from perseo. Check that databases exist.

You can find more information about DB dynamics in the [database aspects](admin.md#database-aspects) documentation.

---

<a name="database_orion"></a>

### Alarm DATABASE_ORION

**Severity**: Critical

**Detection strategy:** `msg`:`ALARM-ON: [DATABASE_ORION]`

**Stop condition**: `msg`:`ALARM-OFF: [DATABASE_ORION]`

**Description**: There is a problem in connection to Orion DB (accessed by no-signal checker)

**Action**: Check configured mongoDB is up and running and is accessible from perseo. Check that databases exist.

---

<a name="auth"></a>

### Alarm AUTH

**Severity**: Major

**Detection strategy:** `msg`:`ALARM-ON: [AUTH]`

**Stop condition**: `msg`:`ALARM-ON: [AUTH]`

**Description**: There is a problem in connection to Keystone. Update-actions to Orion through PEP are not working.

**Action**: Check HTTP connectivity to Keystone. Check provisioned user and roles/grants.

---

<a name="loop"></a>

### Alarm LOOP

**Severity**: Major

**Detection strategy:** `msg`:`check infinite loop`

**Stop condition**: `N/A`

**Description**: Some rules can be provoking an infinite loop of triggered actions.

**Action**: Report to client/product about possible loop with the pointed rule. Check log for the correlator in the log
message
