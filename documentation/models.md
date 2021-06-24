<a name="collections"></a>

## Collections

### Rules

The collection 'rules' stores information about the rules to be sent to the core. It includes the VisualRule passed in
by the Portal for giving it back when the Portal requests it

Fields:

-   **\_ID** _ObjectId_: unique object ID used by mongoDB
-   **name** _string_: name of the rule
-   **description** _string_: (optional) description of the rule
-   **misc** _string_: (optional) miscelanea data of the rule
-   **service** _string_ : service which the rule belongs to.
-   **subservice** _string_: subservice which the rule belongs to.
-   **text** _string_: EPL sentence for the rule, to be propagated to core
-   **action** _object_: action to be executed when the rule is fired. Each action type has different field set as
    described in [Plain rules](plain_rules.md#actions)
    -   **type** ( _string_ ): type of action.
    -   Other subfields, depending on the rule type.
-   **VR** _object_: VisualRule object passed in by the Portal
-   **nosignal** _object_: no signal condition for nosignal rules
    -   **checkInterval** _string_: time in _minutes_ for checking the attribute
    -   **attribute** _string_: attribute for watch
    -   **reportInterval** _string_: time in seconds to see an entity as silent
    -   **ID** _string_: ID of the entity to watch
    -   **idRegexp** _string_: regular expression to match entities by ID
    -   **type** _string_: type of entities to watch
    -   **internalCurrentTime** _string_: current UTC Time in ISO 8601 to use as reference of time in the rule (i.e. the
        "t0" of the no signal checkings)

Only rules with EPL have a field _text_ and only rules for no-signal detection has a field _nosignal_.

Example:

```json
{
    "_id": ObjectId("5530d83e38f4962d13479c47"),
    "VR": {
        "name": "ReglaId",
        "active": 1,
        "cards": [],
        "updateTime": "2014-05-06T10:39:47.696Z",
        "subservice": "/",
        "service": "unknownt"
    },
    "name": "ReglaId",
    "action": {
        "type": "email",
        "template": "${device.asset.name} ${measure.value}",
        "parameters": {
            "to": "brox@tid.es",
            "from": "dca_support@tid.es",
            "subject": "calor"
        }
    },
    "subservice": "/",
    "service": "unknownt",
    "text": "select * from pattern [every ev=iotEvent((cast(`id`?, String)  regexp  \"^value.*\"))]"
}
```

Example no-signal rule

```json
{
    "_id": ObjectId("5530d8dd38f4962d13479c48"),
    "VR": {
        "name": "VR_nonsignal_complex",
        "active": 1,
        "cards": [],
        "updateTime": "2014-03-26T14:29:40.561Z",
        "subservice": "/",
        "service": "unknownt"
    },
    "name": "VR_nonsignal_complex",
    "action": {
        "type": "sms",
        "template": "${device.asset.name}",
        "parameters": {
            "to": "123456789"
        }
    },
    "subservice": "/",
    "service": "unknownt",
    "nosignal": {
        "checkInterval": "1",
        "attribute": "temperature",
        "reportInterval": "5",
        "id": null,
        "idRegexp": "^value.*",
        "type": null
    }
}
```

### Executions

The collection 'executions' stores information about the successfully executed actions. A TTL index deletes exectutions
older than ine day

Fields:

-   **\_ID** _ObjectId_: unique object ID used by mongoDB
-   **ID** _string_: entity ID that fired the rule
-   **name** _string_: name fo the fired rule
-   **notice** _string_: notice ID that fired the rule
-   **service** _string_ : service which the fired rule belongs to.
-   **subservice** _string_: subservice which the fired rule belongs to.
-   **lastTime** _Date object_: timestamp of the execution

Example

```json
{
    "_id": ObjectId("552fc1997fa3e7b1d5e97ab2"),
    "id": "bloodm1",
    "name": "blood_rule_email",
    "notice": "9a140d10-e441-11e4-86f7-179be4a75b65",
    "service": "tenant2",
    "subservice": "/subservicio2",
    "lastTime": ISODate("2015-04-16T14:05:13.922Z")
}
```

<a name="indexes"></a>

## Indexes

### Rules

An index guarantees that every rule is identified by the tuple (name, service, subservice)

The index is created/ensured when perseo-fe starts, but it can be created from a mongoDB shell with

```javascript
db.rules.ensureIndex({ name: 1, subservice: 1, service: 1 }, { unique: true });
```

### Executions

A TTL index deletes documents with a life longer than one day

The index is created/ensured when perseo-fe starts, but it can be created from a mongoDB shell with

```javascript
db.executions.ensureIndex({ lastTime: 1 }, { expireAfterSeconds: 86400 });
```
