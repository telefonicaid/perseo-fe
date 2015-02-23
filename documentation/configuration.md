<a name="configuration"></a>
## Configuration
All the configuration of the CEP is stored in the `config.js` file in the root of the project folder.

### Basic Configuration
In order to have perseo running, there are several basic pieces of information to fill:
* `config.logLevel`: level for log messages (`FATAL`, `ERROR`, `INFO` or `DEBUG`)
* `config.perseoCore.rulesURL`: URL for management of EPL rules at core.
* `config.perseoCore.noticesURL`: URL for processing events at core rule engine.
* `config.perseoCore.interval`: interval for refreshing rules at core rule engine (milliseconds).
* `config.smtp.port`: port for sending email.
* `config.smtp.host`:  host for sending email.
* `config.sms.URL`: URL for sending SMSs.
* `config.sms.from`: Field `from` for the outgoing SMSs. Required by the SMPP Adapter.
* `config.sms.API_KEY`: API KEY for sending SMSs, if necessary. Only for the SMPP Adapter simulator.
* `config.sms.API_SECRET`: API SECRET for sending SMSs, if necessary. Only for the SMPP Adapter simulator.
* `config.orion.URL`: URL for updating contexts at Orion (Context Broker).
* `config.mongo.URL`: URL for connecting mongoDB.
* `config.executionsTTL`: Time-To-Live for documents of action executions (seconds).

Options for HA:
* `config.isMaster`: `true` if this one is the master or `false` it it is the slave.
* `config.slaveDelay`: Slave's delay to try to execute an action (milliseconds).
* `config.nextCore.rulesURL`: URL for management of EPL rules at *replicated* core. If set, the rules will be propagated to that one also.
* `config.nextCore.noticesURL`: URL for processing events at *replicated* core rule engine. If set, the events will be propagated to that one also.


URL format for mongoDB could be found at http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
