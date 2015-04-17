<a name="collections"></a>
## Collections
### Rules
The collection 'rules' stores information about the rules  to be sent to the core. It includes the VisualRule passed in
by the Portal for giving it back when the Portal requests it

Fields:
* **_id** *ObjectId*: unique object id used by mongoDB
* **name**  *string*: name of the rule
* **service** *string* : service which the rule belongs to.
* **subservice** *string*: subservice which the rule belongs to.
* **tex** *string*: EPL sentence for the rule, to be propagated to core
* **action** *object*: action to be executed when the rule is fired. Each action type has different field set as described in [Plain rules](plain_rules.md#actions)
    * **type** ( *string* ): type of action.
* **VR** *object*: VisualRule object passed in by the Portal
* **nosignal** *object*: no signal condition for nosignal rules
	* **checkInterval**  *string*: time in _minutes_ for checking the attribute
	* **attribute** *string*: attribute for watch
	* **reportInterval** *string*: time in seconds to see an entity as silent
	* **id** *string*: id of the entitiy to watch
	* **idRegexp** *string*: regexp to match entities by id
	* **type** *string*: type of entities to watch

Only rules with EPL have a field *text* and only rules for no-signal detection has a field _nosignal_.

Example:
```json
{
	"_id" : ObjectId("5530d83e38f4962d13479c47"),
	"VR" : {
		"name" : "ReglaId",
		"active" : 1,
		"cards" : [
		<< ... >>
			],
		"updateTime" : "2014-05-06T10:39:47.696Z",
		"subservice" : "/",
		"service" : "unknownt"
	},
	"name" : "ReglaId",
	"action" : {
		"type" : "email",
		"template" : "${device.asset.name} ${measure.value}",
		"parameters" : {
			"to" : "brox@tid.es",
			"from" : "dca_support@tid.es",
			"subject" : "calor"
		}
	},
	"subservice" : "/",
	"service" : "unknownt",
	"text" : "select *,\"ReglaId\" as ruleName from pattern [every ev=iotEvent((cast(`id`?, String)  regexp  \"^value.*\"))]"
}

```
Example no-signal rule
```json
{
	"_id" : ObjectId("5530d8dd38f4962d13479c48"),
	"VR" : {
		"name" : "VR_nonsignal_complex",
		"active" : 1,
		"cards" : [
		<< ... >>
			],
		"updateTime" : "2014-03-26T14:29:40.561Z",
		"subservice" : "/",
		"service" : "unknownt"
	},
	"name" : "VR_nonsignal_complex",
	"action" : {
		"type" : "sms",
		"template" : "${device.asset.name}",
		"parameters" : {
			"to" : "123456789"
		}
	},
	"subservice" : "/",
	"service" : "unknownt",
	"nosignal" : {
		"checkInterval" : "1",
		"attribute" : "temperature",
		"reportInterval" : "5",
		"id" : null,
		"idRegexp" : "^value.*",
		"type" : null
	}
}
```


### Executions
The collection 'executions' stores information about the sucessfully executed actions. A TTL index deletes exectutions older than ine day

Fields:
* **_id** *ObjectId*: unique object id used by mongoDB
* **id**  *string*: entity id that fired the rule
* **service** *string* : service which the fired rule belongs to.
* **subservice** *string*: subservice which the fired rule belongs to.
* **notice** *string*: notice id that fired the rule
* **lastTime** *Date object*: timestamp of the execution

Example
```json
{
	"_id" : ObjectId("552fc1997fa3e7b1d5e97ab2"),
	"id" : "bloodm1",
	"name" : "blood_rule_email",
	"notice" : "9a140d10-e441-11e4-86f7-179be4a75b65",
	"service" : "tenant2",
	"subservice" : "/subservicio2",
	"lastTime" : ISODate("2015-04-16T14:05:13.922Z")
}
```




<a name="indexes"></a>
## Indexes

### Rules
An index guarantees that every rule is identified by the tuple (name, service, subservice)
```json
	"key" : {
			"name" : 1,
			"subservice" : 1,
			"service" : 1
		},
```

### Executions
A  TTL index deletes documents with a life longer than one day

```json

		"key" : {
			"lastTime" : 1
		},
		"expireAfterSeconds" : 86400
```

