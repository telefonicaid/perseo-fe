<a name="configuration"></a>
## Configuration
There are two ways of configuring Perseo CEP:
* The default Basic Configuration is read from the `config.js` file in the root of the project folder.
* Some pieces of configuration can be overriden using environment variables, as it is explained in the following section.
 
### Environment Variables Configuration
The following table shows the environment variables available for Perseo configuration:

| Environment variable      | Description                            |
|:------------------------- |:-------------------------------------- |
| PERSEO_ENDPOINT_HOST      | Host where the CEP will listen.        |
| PERSEO_ENDPOINT_PORT      | Port where the CEP will listen.        |
| PERSEO_MONGO_ENDPOINT     | Endpoint list for Mongo DB.            |
| PERSEO_MONGO_REPLICASET   | ReplicaSet name for Mongo DB.          |
| PERSEO_CORE_URL           | Full URL where Perseo Core is listening (e.g: http://63.34.124.1:8080). |
| PERSEO_NEXT_URL           | Full URL where Perseo Core replicated node is listening. Same format as above. |
| PERSEO_ORION_URL          | Full URL of the Orion Context Broker (e.g: http://64.124.28.15:1026).          |
| PERSEO_LOG_LEVEL          | Log level.         |
| PERSEO_SMTP_HOST          | Host of the SMTP server |
| PERSEO_SMTP_PORT          | Port of the SMTP server |
| PERSEO_SMTP_SECURE        | `true` if SSL should be used with the SMTP server |
| PERSEO_SMTP_AUTH_USER     | Authentication data, the username |
| PERSEO_SMTP_AUTH_PASS     | Authentication data, the password for the user |
| PERSEO_SMS_URL            | URL for sending SMSs (SMPP Adapter) |
| PERSEO_SMS_API_KEY        | API KEY for sending SMSs, if necessary. Only for the SMPP Adapter simulator |
| PERSEO_SMS_API_SECRET     | API SECRET for sending SMSs, if necessary. Only for the SMPP Adapter simulator |
| PERSEO_SMS_FROM           | Field `from` for the outgoing SMSs. Required by the SMPP Adapter |
| PERSEO_SMPP_HOST          | Host of the SMPP server |
| PERSEO_SMPP_PORT          | Port of the SMPP server |
| PERSEO_SMPP_SYSTEMID      | SystemID for the user of the SMPP server |
| PERSEO_SMPP_PASSWORD      | Password for the user of the SMPP server |
| PERSEO_SMPP_FROM          | Number from SMS are sending by SMPP server |
| PERSEO_SMPP_ENABLED       | SMPP is default method for SMS instead of use SMS gateway |
| PERSEO_NOTICES_PATH       | Path for incoming notices, default value '/notices' |
| PERSEO_RULES_PATH         | Path for incoming rules, default value '/rules' |

### Basic Configuration
In order to have perseo running, there are several basic pieces of information to fill:
* `config.logLevel`: level for log messages (`FATAL`, `ERROR`, `INFO` or `DEBUG`)
* `config.perseoCore.rulesURL`: URL for management of EPL rules at core.
* `config.perseoCore.noticesURL`: URL for processing events at core rule engine.
* `config.perseoCore.interval`: interval for refreshing rules at core rule engine (milliseconds).
* `config.smtp.port`: port for sending email.
* `config.smtp.host`:  host for sending email.
* `config.smtp.secure`:  defines if the connection should use SSL (if true) or not (if false).
* `config.smtp.auth.user`:  authentication data, the username.
* `config.smtp.auth.pass`:  authentication data, the password for the user.
* `config.sms.URL`: URL for sending SMSs.
* `config.sms.from`: Field `from` for the outgoing SMSs. Required by the SMPP Adapter.
* `config.sms.API_KEY`: API KEY for sending SMSs, if necessary. Only for the SMPP Adapter simulator.
* `config.sms.API_SECRET`: API SECRET for sending SMSs, if necessary. Only for the SMPP Adapter simulator.
* `config.smpp.host`: Host of the SMPP server.
* `config.smpp.port`: Port of the SMPP server.
* `config.smpp.systemid`: SystemID for the user of the SMPP server
* `config.smpp.password`: Password for the user of the SMPP server
* `config.smpp.from`: Number from SMS are sending by SMPP server
* `config.smpp.enabled`: SMPP is default method for SMS instead of use SMS gateway.
* `config.orion.URL`: URL for updating contexts at Orion (Context Broker).
* `config.mongo.URL`: URL for connecting mongoDB.
* `config.executionsTTL`: Time-To-Live for documents of action executions (seconds).
* `config.checkDB.delay`:  Number of milliseconds to check DB connection (see [database aspects](admin.md#database-aspects) documentation for mode detail).
* `config.checkDB.reconnectTries`:  Number of of attempts to reconnect (see [database aspects](admin.md#database-aspects) documentation for mode detail).
* `config.checkDB.reconnectInterval`:  Number of milliseconds to wait between attempts to reconnect (see [database aspects](admin.md#database-aspects) documentation for mode detail).
* `config.checkDB.bufferMaxEntries`:  Number of operations buffered up before giving up on getting a working connection (see [database aspects](admin.md#database-aspects) documentation for mode detail).



Options for HA:
* `config.isMaster`: `true` if this one is the master or `false` it it is the slave.
* `config.slaveDelay`: Slave's delay to try to execute an action (milliseconds).
* `config.nextCore.rulesURL`: URL for management of EPL rules at *replicated* core. If set, the rules will be propagated to that one also.
* `config.nextCore.noticesURL`: URL for processing events at *replicated* core rule engine. If set, the events will be propagated to that one also.

Options for Authentication through PEP (for update action)
* `config.authentication.host`: host (keyStone) to exchange trust tokens for access tokens
* `config.authentication.port`: port,
* `config.authentication.user`: provisioned user for CEP in Keystone
* `config.authentication.password`: provisioned password for CEP in Keystone


URL format for mongoDB could be found at http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
