<a name="configuration"></a>
## Configuration
All the configuration of the CEP is stored in the `config.js` file in the root of the project folder.

### Basic Configuration
In order to have perseo running, there are several basic pieces of information to fill:
* `config.perseoCore.rulesURL`: URL for management of EPL rules at core.
* `config.perseoCore.noticesURL`: URL for processing events at core rule engine.
* `config.perseoCore.interval`: interval for refreshing rules at core rule engine (milliseconds).
* `config.smtp.port`: port for sending email.
* `config.smtp.host`:  host for sending email.
* `config.sms.URL`: URL for sending SMSs.
* `config.sms.API_KEY`: API KEY for sending SMSs, if necessary.
* `config.sms.API_SECRET`: API SECRET for sending SMSs, if necessary.
* `config.orion.URL`: URL for updating contexts at Orion (Context Broker).
* `config.mongo.URL`: URL for connecting mongoDB.

Options for HA:
* `config.isMaster`: `true` if this one is the master or `false` it it is the slave.
* `config.master.checkURL`: URL for the slave to check master is alive.
* `config.master.interval`: interval for the slave to check master is alive (milliseconds).
* `config.master.reportInterval`: interval for repeating the log about master is not alive (milliseconds).
* `config.nextCore.rulesURL`: URL for management of EPL rules at *replicated* core. If set, the rules will be propagated to that one also.
* `config.nextCore.noticesURL`: URL for processing events at *replicated* core rule engine. If set, the events will be propagated to that one also.


URL format for mongoDB could be found at http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
