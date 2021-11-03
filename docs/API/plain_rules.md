# Plain rules

-   [Introduction](#introduction)
-   [EPL text](#epl-text)
    -   [Pre-SELECT clauses](#pre-select-clauses)
-   [No signal conditions](#no-signal-conditions)
-   [Actions](#actions)
    -   [String substitution syntax](#string-substitution-syntax)
    -   [SMS action](#sms-action)
    -   [email action](#email-action)
    -   [update attribute action](#update-attribute-action)
    -   [HTTP request action](#http-request-action)
    -   [twitter action](#twitter-action)
-   [Metadata and object values](#metadata-and-object-values)
-   [Location fields](#location-fields)
-   [Time fields](#time-fields)
-   [JSON and Array fields in attributes](#json-and-array-fields-in-attributes)

## Introduction

There are two kind of rules:

-   Esper-based rules, which include the final EPL statement used by the Esper engine inside perseo-core. In order to
    work with perseo (front-end) properly, the EPL statement must fulfill several conventions for the rule to be able to
    operate on the incoming events and trigger adequate actions. Example:

```json
{
    "name": "humidity_rule",
    "text": "select *, humidity? from iotEvent where type?='WheatherStation' AND cast(cast(humidity?, String), double)<20",
    "action": {
        "type": "update",
        "parameters": {
            "attributes": [
                {
                    "name": "dryFloor",
                    "value": "true",
                    "type": "boolean"
                }
            ]
        }
    }
}
```

-   No signal rules. They are triggered when a given attribute is not updated in a given interval of time. They don't
    use Esper at persero-core (they are checked and triggered by perseo frontend). Example:

```json
{
    "name": "check_temp_no_signal",
    "nosignal": {
        "checkInterval": "1",
        "attribute": "temperature",
        "reportInterval": "5",
        "id": null,
        "idRegexp": "^value.*",
        "type": null
    },
    "action": {
        "type": "email",
        "template": "No signal in temperature",
        "parameters": {
            "to": "brox@tid.es",
            "from": "dca_support@tid.es",
            "subject": "temperature no signal"
        }
    }
}
```

In both types of rules the following fields are mandatory:

-   **name**: name of the rule, used as identifier
-   **action**: action to be performed by perseo if the rule is fired from the core

For EPL-based rules the following field is mandatory:

-   **text**: EPL statement for the rule engine in perseo-core.

For no signal rules the following field is mandatory:

-   **nosignal**: a description of the no signal condition.

The rule name must consist of the ASCII characters from A to Z, from a to z, digits (0-9), underscore (\_) and dash (-).
It can have a maximum length of 50 characters.

The field `action` can be also an array of "actions", objects with the same structure than the single action described
in the rest of the documentation. Each of those actions will be executed when the rule is fired, avoiding to duplicate a
rule only for getting several actions executed. For practical purposes, it is the same result that would be obtained
with multiple rules with the same condition.

## EPL text

The field `text` of the rule must be a valid EPL statement and additionally must honor several restrictions to match
expectations of perseo and perseo-core.

EPL is documented in [Esper site](http://www.espertech.com/esper/esper-documentation), in particular
[version 8.4.0](http://esper.espertech.com/release-8.4.0/reference-esper/html/).

A EPL statement to use with perseo could be:

```sql
select *, bloodPressure? as Pressure
from iotEvent
where (cast(cast(bloodPressure?,String),double)>1.5 and type="BloodMeter")]
```

You should take into consideration the following guidelines:

-   Include `*,` in EPL select clause
-   The event stream from which take events must be `iotEvent`
-   A `type=` condition may be concatenated for avoiding mixing different kinds of entities
-   Entity's attributes must be cast to `float` in case of being numeric, to `String` otherwise.
-   All the attributes of the context broker notification are available as dynamic properties of the event object `ev`.
-   A question mark `?` is _necessary_ for EPL to refer to ‘dynamic’ values (duck typing), such as `ev.id?`.
-   Metadata is also available as explained in the [metadata and object values](#metadata-and-object-values) section.
-   The variable `ruleName` in automatically added to the action, even if it is not present in the EPL text. The
    ruleName automatically added this way is retrieved as part of the EPL text when the rule is recovered using `GET
    /rules` or `GET /rules/{name}`.

Some hightligths in the Esper 8.x version, that allow to write simpler and cleaner EPL statements:

-   [Alias](http://esper.espertech.com/release-8.4.0/reference-esper/html/epl_clauses.html#epl-syntax-expression-alias) usage, e.g. `expression twoPI alias for { Math.PI * 2 }`
-   [Functions](http://esper.espertech.com/release-8.4.0/reference-esper/html/epl_clauses.html#epl-syntax-expression-decl) usage, e.g. `expression DOUBLE {(v) => cast(cast(v,string), double)}`

**Backward compatibility note:** since perseo-fe version 1.8.0 it is not mandatory to specify the name of the rule as
part of the EPL text. In fact, it is not recommendable to do that. However, for backward compatibility, it can be
present as _ruleName_ alias (e.g: `select *, "blood_rule_update" as ruleName...`) in the select clause. If present, it
must be equal to the ‘name’ field of the rule object.

The used entity's attributes must be cast to `double` in case of being numeric (like in the example). Alphanumeric values
must be cast to `String`. Nested cast to string and to double is something we are analyzing, and could be unnecessary in
a future version. Use it by now. All the attributes in the notification from Orion are available in the event object,
**ev**, like _ev.BlodPressure?_ and _ev.id?_. A question mark is _necessary_ for EPL referring ‘dynamic’ values.
Metadata is also available as explained in [Metadata and object values](#metadata-and-object-values).
Moreover under _ev.stripped are in JSON format all the notification fields (like id, type, attrs, etc.), so you can access to it in an EPL text using:

```sql
cast(stripped?, java.util.Map).get("id")
```
A full example of `ev` notification processed is avaiable at buttom of [JSON and Array fields in attributes](#json-and-array-fields-in-attributes)

Please, be careful with using non-ASCII characters in the EPL syntax. It will provoke an error. You can find information
on how to scape characters at
[Esper site](https://esper.espertech.com/release-8.4.0/reference-esper/html/event_representation.html#eventrep-properties-escaping)

### Pre-SELECT clauses

There are support for pre select clauses. Specifically we support `expression VAR for alias {myexpression}`. This allow
us to use local VARS in the definition of an EPL rule, i.e:

```
expression num alias for {34+4}
expression cas alias for {cast("1323", long)}
select num+10 as sum, cas as casting  from iotEvent;
```

## No signal conditions

The no signal condition is specified in the `nosignal` configuration element, which is an object with the following
fields:

-   **checkInterval**: _mandatory_, time in minutes for checking the attribute. Min value is 0.5 and max is 35791, other
    values are truncated to them (a warning log message is generated if such truncation occurs)
-   **attribute**: _mandatory_, attribute for watch
-   **reportInterval**: _mandatory_, time in seconds to see an entity as silent
-   **id** or **idRegexp**: _mandatory_ (but not both at the same time), ID or regular expression of the entity to watch
-   type: _optional_, type of entities to watch

Is recommended to set checkInterval at least double of reportInterval. Howeer, note that a very demanding value of
checkInterval could impact on performance.

<a name="actions"></a>

## Actions

When a rule is fired, the "complex event" generated by the select clause is sent to perseo (front-end) which executes
the action using the generated event as parameter to the action.

There are a predefined set of actions: sending a SMS, sending a email, updating an attribute of the entity that fired
the rule and making a HTTP POST to a provided URL.

The action must be provided in the `action` field of rule. An example:

```json
   "action":{
      "type":"update",
      "parameters":{
         "name":"abnormal",
         "value":"true",
         "type":"boolean"
      },
      "interval" : "30e3"
   }
```

The `type` field is mandatory and must be one of the following

-   `update` - creating or updating entities and attributes of those entities in the context broker.
    [(update action details)](../API/plain_rules.md#update-attribute-action)
-   `sms` - sending a SMS. [(sms action details)](../API/plain_rules.md#sms-action)
-   `email` - sending an email. [(email action details)](../API/plain_rules.md#email-action)
-   `post` - making a HTTP request to a provided URL [(post action details)](../API/plain_rules.md#http-request-action)
-   `twitter` - sending a tweet [(twitter action details)](../API/plain_rules.md#twitter-action)

An action can _optionally_ have a field `interval` for limiting the frequency of the action execution (for the rule and
entity which fired it). The value is expressed in milliseconds and is the minimum period between executions. Once the
action is executed _successfully_, it won't be executed again until that period has elapsed. All the request from core
to execute it are silently discarded. This way, the rate of executions for an entity and rule can be limited. (Strictly,
the minimum time between executions)

### String substitution syntax

Some of the fields of an `action` (see detailed list below) can include a reference to one of the fields of the
notification/event. This allows include information as the received "pressure" value, the ID of the device, etc. For
example, the actions `sms`, `email`, `post` include a field `template` used to build the body of message/request. This
text can include placeholders for attributes of the generated event. That placeholder has the form `${X}` where `X` may
be one of the following posibilities:

-   `{$id}` for the ID of the entity that triggers the rule.
-   `{$type}` for the type of the entity that triggers the rule
-   The name of an attribute in the entity which triggers the rule and the placeholder is substituted by the value of
    that attribute, e.g. `${temperature}`
-   Alias defined in the [EPL text](#epl-text) of the associated rule. Some examples:
    -   If we have in the EPL text this `select *, bloodPressure? as Pressure` then `${Pressure}` can be used
    -   If we have in the EPL text `expression twoPI alias for { Math.PI * 2 }` then `${twoPI}` can be used
-   Any other field generated by Perseo FE into the event sent to Perseo Core. This includes:
    -   [Metadata](#metadata-and-object-values), e.g. `${temperature_metadata_accuracy}`
    -   [Specific keys within attribute object values](#metadata-and-object-values), e.g. `${myObj__a}` (being an attribute `myObj` of value
        `{"a": 1, "b": 2}`).
    -   [Specific items within attribute array values](#json-and-array-fields-in-attributes), e.g. `${myArray__0}` (being an attribute `myArray` of value
        `["green", "blue"]`).
    -   [Location fields](#location-fields), e.g. `${position__lat}`
    -   [Time fields](#time-fields), e.g. `${x__day}`

This substitution can be used in the following fields:

-   `template`, `from`, `to` and `subject` for `email` action
-   `template`, `url`, `qs`, `headers`, `json` for `post` action
-   `template` for `sms` action
-   `template` for `twitter` action
-   `id`, `type`, `name`, `value`, `ìsPattern` for `update` action

Attribute value of `update` action and template of `post` action are expanded to numerical, boolean or JSON stringyfied
values instead of string values when is possible. For example, if we have `{"a": "${x}"}`:

-   If the value of attribute `x` is `42` then it will expand do `{"a": 42}` and not to `{"a": "42"}`
-   If the value of attribute `x` is `{"hello": "world"}` then it will expand to `{"a": "{\"hello\":\"world\"}"}`
    (expand to native JSON, i.e. `{"a": {"hello": "world"}}`, is not supported)

### SMS action

Sends a SMS to a number set as an action parameter with the body of the message built from the template

```json
 "action": {
        "type": "sms",
        "template": "Meter ${Meter} has pressure ${Pressure}.",
        "parameters": {
            "to": "123456789"
        }
    }
```

Additionally SMS action could include a `sms` field to include SMS configuration which overwrites global sms
configuration:

```json
 "action": {
        "type": "sms",
        "template": "Meter ${Meter} has pressure ${Pressure}.",
        "parameters": {
            "to": "123456789",
            "sms": {
                 "URL": "http://sms-endpoint/smsoutbound",
                 "API_KEY": "MYAPIKEY",
                 "API_SECRET": "MYSECRET",
                 "from": "tel:22012;phone-context=+34"
            }
        }
    }
```

or include a `smpp` field to include SMPP configuration which overwrites global smpp configuration:

```json
 "action": {
        "type": "sms",
        "template": "Meter ${Meter} has pressure ${Pressure}.",
        "parameters": {
            "to": "123456789",
            "smpp": {
                "from": "myfrom",
                "host": "host",
                "port": "port",
                "systemid": "6666666",
                "password": "mypwd"
            }
        }
    }
```

The field `parameters` include a field `to` with the number, or numbers separated by whiestpace charaters, to send the
message to.

The `template` and `to` fields perform [attribute substitution](#string-substitution-syntax).

### email action

Sends an email to the recipient set in the action parameters, with the body mail build from the `template` field. A
field `to` in `parameters` sets the recipient and a field `from`sets the sender's email address. Also the subject of the
email can be set in the field `subject` in `parameters`.

```json
 "action": {
        "type": "email",
        "template": "Meter ${Meter} has pressure ${Pressure} (GEN RULE)",
        "parameters": {
            "to": "someone@telefonica.com",
            "from": "cep@system.org",
            "subject": "It's The End Of The World As We Know It (And I Feel Fine)"
        }
    }
```

The `template`, `from`, `to` and `subject` fields perform [string substitution](#string-substitution-syntax).

Additionally, Email action could include a `smtp` field to include SMTP configuration (see
[nodemailer transport options for full detail](https://nodemailer.com/smtp/) which overwrites global SMTP configuration:

```json
 "action": {
        "type": "email",
        "template": "Meter ${Meter} has pressure ${Pressure} (GEN RULE)",
        "parameters": {
            "to": "someone@telefonica.com",
            "from": "cep@system.org",
            "subject": "It's The End Of The World As We Know It (And I Feel Fine)",
            "smtp": {
               "port": 25,
               "host": "smtpserver",
               "secure": false,
               "auth": {
                  "user": "abc",
                  "pass": "xyz"
               },
               "tls": {
                  "rejectUnauthorized": false
               }
            }
        }
    }
```

### update attribute action

Updates one or more attributes of a given entity or as a result of filter (in the Context Broker instance specified in
the Perseo configuration). The `parameters` map includes the following fields:

-   id: optional, the ID of the entity which attribute is to be updated (by default the ID of the entity that triggers
    the rule is used, i.e. `${id}`)
-   type: optional, the type of the entity which attribute is to be updated (by default the type of the entity that
    triggers the rule is usedi.e. `${type}`)
-   version: optional, The NGSI version for the update action. Set this attribute to `2` or `"2"` if you want to use
    NGSv2 format. `2` by default.
-   isPattern: optional, `false` by default. (Only for NGSIv1. If `version` is set to 2, this attribute will be ignored)
-   attributes: _mandatory_, array of target attributes to update. Each element of the array must contain the fields
    -   **name**: _mandatory_, attribute name to set
    -   **value**: _mandatory_, attribute value to set
    -   type: optional, type of the attribute to set. By default, not set (in which case, only the attribute value is
        changed).
-   actionType: optional, type of CB action: APPEND, UPDATE or DELETE. By default is APPEND.
    -   APPEND: updated attributes (if previously exist in the entity) or append them to the entity (if previously
        doesn't exist in the entity)
    -   UPDATE: update attributes, asumming they exist (otherwise the update operation fails at CB)
    -   DELETE: delete attributes (or the entity itself if the attributes list is empty)
-   trust: optional, trust for getting an access token from Auth Server which can be used to get to a Context
    Broker behind a PEP. A trust is a way of Keystone to allow an user (trustor) delegates a role to another user (trustee) for a
    subservice. Complete info could be found at:
    -   [Trusts concept](https://docs.openstack.org/keystone/stein/user/trusts)
    -   [Trusts API](https://docs.openstack.org/keystone/stein/api_curl_examples.html#post-v3-os-trust-trusts)
-   service: optional, service that will be used by updateAction rule instead of current event service. In this case, Orion PEP URL will be
    used instead of Orion URL, and then no token for auth will be negotiated.
-   subservice: optional, subservice that will be used by updateAction rule instead of current event subservice. In this case, Orion PEP URL
    will be used instead of Orion URL, and then no token for auth will be negotiated.
-   filter: optional, a NGSI-v2 filter (see Simple Query Language section at
    [NGSIv2 specification](https://telefonicaid.github.io/fiware-orion/api/v2/stable)). If provided then updateAction is
    done over result of query. This overrides the `id` field (in other words, if you use `filter` then `id` field is
    ignored, in fact you should not use `id` and `filter` in the same rule). Needs `version: 2` option (if `version` is
    `1` the filter is ignored). The value of this field is an object which keys are the possible options described in
    [ngsijs options](https://conwetlab.github.io/ngsijs/stable/NGSI.Connection.html#.%22v2.listEntities%22__anchor),
    e.g: `type`, `q`, `georel`, `geometry`, `georel`, etc. However, note that the options related with pagination
    (`limit`, `offset` and `count`) are ignored, as Perseo implements its own way of processing large filter results.
    Moreover if a filter contains a `geojsonpolygon` dict with the following format:

```json
    "filter": {
      "geojsonpolygon": {
          "features": [
             {
              "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [ 9.84375, 54.36775852406841 ],
                    [ -4.921875, 42.032974332441405 ],
                    [ 34.80468749999999, 40.713955826286046 ],
                    [ 29.53125, 53.54030739150022 ],
                    [ 9.84375, 54.36775852406841 ]
                 ]]
              }
            }
          ]
      }
    }
```

is translated to equivalent filter replacing `geojsonpolygon` with `georel`, `geometry` and `coords` :

```json
    "filter": {
      "georel": "coveredBy",
      "geometry": "polygon",
      "coords": "54.36775852406841,9.84375;42.032974332441405,-4.921875;40.713955826286046,34.80468749999999;53.54030739150022,29.53125;54.36775852406841,9.84375"
    }
```

NGSIv1 example:

```json
"action":{
        "type":"update",
        "parameters":{
            "id":"${id}_mirror",
            "attributes": [
                {
                    "name":"abnormal",
                    "type":"boolean",
                    "value":"true"
                }
            ],
            "actionType": "UPDATE"
        }
    }
```

The `name` parameter cannot take `id` or `type` as a value, as that would refer to the entity's ID and the entity's type
(which are not updatable) and not to an attribute with any of those names. Trying to create such action will return an
error.

The `id`, `type`, `name`, `value`, `ìsPattern` fields perform [string substitution](#string-substitution-syntax).

First time an update action using trust token is triggered, Perseo interacts with Keystone to get the temporal auth
token corresponding to that trust token. This auth token is cached and used in every new update associated to the same
action. Eventually, Perseo can receive a 401 Not Authorized due to auth token expiration. In that case, Perseo interacts
again with Keystone to get a fresh auth token, then retries the update that causes the 401 (and the cache is refreshed
with the new auth token for next updates).

It could happen (in theory) that a just got auth token also produce a 401 Not authorized, however this would be an
abnormal situation: Perseo logs the problem with the update but doesn't try to get a new one from Keystone. Next time
Perseo triggers the action, the process may repeat, i.e. first update attempt fails with 401, Perseo requests a fresh
auth token to Keystone, the second update attempt fails with 401, Perseo logs the problem and doesn't retry again.

NGSIv2 example:

```json
"action":{
        "type":"update",
        "parameters":{
            "id":"${id}_mirror",
            "version": 2,
            "attributes": [
                {
                    "name":"abnormal",
                    "type":"Number",
                    "value": 7
                },
                {
                   "name": "locationCopy",
                   "type": "MyCustomTypo",
                   "value": "{\"type\":\"Point\",\"coordinates\":[${Lat},${Lon}]}"
              }
            ]
        }
    }
```

When using NGSIv2 in the update actions, the value field perform [string substitution](#string-substitution-syntax). If
`value` is a String, Perseo will try cast value to number, boolean or null (without paying attention to the attribute
type). If the casting fails then String is used. _`Boolean`_ and _`None`_ types.

**Data Types for NGSIv2:**

With `Number` type attributes, Perseo can be able to manage a int/double number or a String to parse in value field.

-   Number from variable:

```json
{
    "name": "numberFromValue",
    "type": "Number",
    "value": "${NumberValue}"
}
```

If `NumberValue` value is for example `32.12`, this attribute will take `32.12` as value.

-   Literal Number:

```json
{
    "name": "numberLiteral",
    "type": "Number",
    "value": 12
}
```

This attribute will take `12` as value.

-   Number as String from variable:

```json
{
    "name": "numberFromStringValue",
    "type": "Number",
    "value": "${NumberValueAsString}"
}
```

If `NumberValueAsString` value is for example `"4.67"`, this attribute will take `4.67` as value.

-   Number as String:

```json
{
    "name": "numberStringLiteral",
    "type": "Number",
    "value": "67.8"
}
```

This attribute will take `67.8` as value.

With `Text` type attributes, Perseo will put the value field parsed as string.

-   Text as variable:

```json
{
    "name": "textFromValue",
    "type": "Text",
    "value": "${varValue}"
}
```

If `varValue` value is for example `"Good morning"`, this attribute will take `"Good morning"` as value.

If `varValue` value is for example `1234`, this attribute will take `"1234"` as value.

-   Literal Text:

```json
{
    "name": "textLiteral",
    "type": "Text",
    "value": "Hello world"
}
```

This attribute will take `"Hello world"` as value.

-   Literal Number:

```json
{
    "name": "textNumberLiteral",
    "type": "Text",
    "value": 67.8
}
```

This attribute will take `"67.8"` as value.

-   Literal Boolean:

```json
{
    "name": "textBoolLiteral",
    "type": "Text",
    "value": true
}
```

This attribute will take `"true"` as value.

With `DateTime` type attributes, Perseo will try to parse the value to DateTime format.

Date as String:

```json
{
    "name": "dateString",
    "type": "DateTime",
    "value": "2018-12-05T11:31:39.00Z"
}
```

This attribute will take `"2018-12-05T11:31:39.000Z"` as value.

Date as Number in milliseconds:

```json
{
    "name": "dateString",
    "type": "DateTime",
    "value": 1548843229832
}
```

This attribute will take `"2019-01-30T10:13:49.832Z"` as value.

Date from variable.

```json
{
    "name": "dateString",
    "type": "DateTime",
    "value": "${dateVar}"
}
```

If `dateVar` value is for example `1548843229832` (as Number or String), this attribute will take
`"2019-01-30T10:13:49.832Z"` as value.

You can use the `__ts` field of a Perseo DateTime attribute to fill a DateTime attribute value without using any
`cast()`. For example, if the var are defined as follow in the rule text, `ev.timestamp__ts? as dateVar`, `dateVar` will
be a String with the Date in milliseconds, for example `"1548843060657"` and Perseo will parse this String with to a
valid DateTime as `2019-01-30T10:11:00.657Z`.

With `None` type attributes, Perseo will set the value to `null` in all cases.

None Attribute:

```json
{
    "name": "nullAttribute",
    "type": "None",
    "value": "It does not matter what you put here"
}
```

This attribute will take `null` as value.

```json
{
    "name": "nullAttribute2",
    "type": "None",
    "value": null
}
```

This attribute will take `null` as value.

**Complete example using NGSv2 update action in a rule:**

```json
{
    "name": "blood_rule_update",
    "text": "select *,\"blood_rule_update\" as ruleName, bloodPressure? as Pressure from iotEvent where bloodPressure? > 1.5 and type=\"BloodMeter\"",
    "action": {
        "type": "update",
        "parameters": {
            "id": "${id}_example",
            "version": 2,
            "attributes": [
                {
                    "name": "pressure",
                    "type": "Number",
                    "value": "${Pressure}"
                }
            ]
        }
    }
}
```

Note that using NGSIv2 the BloodPressure attribute is a Number and therefore it is not necessary to use `cast()`.

**Complete example using NGSv2 update action with filter in a rule:**

```json
{
    "name": "blood_rule_update",
    "text": "select *,\"blood_rule_update\" as ruleName, bloodPressure? as Pressure from iotEvent where bloodPressure? > 1.5 and type=\"BloodMeter\"",
    "action": {
        "type": "update",
        "parameters": {
            "filter": {
                "type": "SensorMetter",
                "q": "status:on;level:ok"
            },
            "version": 2,
            "attributes": [
                {
                    "name": "pressure",
                    "type": "Number",
                    "value": "${Pressure}"
                }
            ]
        }
    }
}
```

```json
{
    "name": "myrule",
    "text": "select *,'myrule' as ruleName from iotEvent(type='SensorMetter')",
    "action": {
        "type": "update",
        "parameters": {
            "filter": {
                "type": "SensorMetter"
            },
            "version": 2,
            "attributes": [
                {
                    "name": "power",
                    "type": "Text",
                    "value": "on"
                }
            ]
        }
    }
}
```

### HTTP request action

Makes an HTTP request to an URL specified in `url` inside `parameters`, sending a body built from `template`. The
`parameters` field can specify

-   method: _optional_, HTTP method to use, POST by default
-   **URL**: _mandatory_, URL target of the HTTP method
-   headers: _optional_, an object with fields and values for the HTTP header
-   qs: _optional_, an object with fields and values to build the query string of the URL
-   json: _optional_, an object that will be sent as JSON. String substitution will be performed in the keys and values
    of the object's fields. If present, it overrides `template` from `action`

```json
 "action":{
      "type":"post",
      "template":"BloodPressure is ${BloodPressure}",
      "parameters":{
         "url": "http://localhost:9182/${type}/${id}",
         "method": "PUT",
         "headers": {
            "Content-type": "text/plain",
            "X-${type}-pressure": "${BloodPressure}"
         },
         "qs": {
            "${id}": "${BloodPressure}"
         }
      }
   }
```

Note that you can encode a JSON in the `template` field:

```json
 "action": {
        "type": "post",
        "template": "{\"meter\":\"${Meter}\", \"pressure\": ${Pressure}}",
        "parameters": {
            "url": "http://${target_host}:${target_port}/myapp/${id}",
            "headers": {
                        "Content-type": "application/json",
                        "X-${type}-pressure": "${BloodPressure}"
            },
            "qs": {
                        "${id}": "${BloodPressure}"
            }
        }
    }
```

or use the `json` parameter

```json
 "action": {
        "type": "post",
        "parameters": {
            "url": "http://${target_host}:${target_port}/myapp/${id}",
            "headers": {
                        "Content-type": "application/json",
                        "X-${type}-pressure": "${BloodPressure}"
            },
            "qs": {
                        "${id}": "${BloodPressure}"
            },
            "json": {
               "meter": "${meter}",
               "${id}": "${type}",
               "pressure": "${pressure}"
            }
        }
    }
```

The `template` and `url` fields and both the field names and the field values of `qs` and `headers` and `json` perform
[string substitution](#string-substitution-syntax).

### twitter action

Updates the status of a twitter account, with the text build from the `template` field. The field `parameters` must
contain the values for the consumer key and secret and the access token key and access token secret of the
pre-provisioned application associated to the twitter user.

```json
 "action": {
        "type": "twitter",
        "template": "Meter ${Meter} has pressure ${Pressure} (GEN RULE)",
        "parameters": {
          "consumer_key": "xvz1evFS4wEEPTGEFPHBog",
          "consumer_secret": "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg",
          "access_token_key": "xvz1evFS4wEEPTGEFPHBog",
          "access_token_secret": "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg"
        }
    }
```

The `template` field performs [string substitution](#string-substitution-syntax).

## Metadata and object values

Metadata values can be accessed by adding the suffix `__metadata__x` to the attribute name, being `x` the name of the
metadata attribute. This name can be used in the EPL text of the rule and in the parameters of the action which accept
string substitution. If the value of the metadata item is an object itself, nested fields can be referred by additional
suffixes beginning with double underscore and the hierarchy can be walked down by adding more suffixes, like
`__metadata__x__subf1__subf12`.

For example: The metadata in an event/notice like

```json
{
    "subscriptionId": "51c04a21d714fb3b37d7d5a7",
    "originator": "localhost",
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "BloodPressure",
                        "type": "centigrade",
                        "value": "2",
                        "metadatas": [
                            {
                                "crs": {
                                    "value": { "system": "WGS84" }
                                }
                            }
                        ]
                    },
                    {
                        "name": "TimeInstant",
                        "type": "urn:x-ogc:def:trs:IDAS:1.0:ISO8601",
                        "value": "2014-04-29T13:18:05Z"
                    }
                ],
                "type": "BloodMeter",
                "isPattern": "false",
                "id": "bloodm1"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}
```

could be used by a rule so

```json
{
    "name": "blood_rule_email_md",
    "text": "select *, bloodPressure? as Pression, id? as Meter from iotEvent where cast(bloodPressure__metadata__crs__system?,String)=\"WGS84\" and type=\"BloodMeter\"",
    "action": {
        "type": "email",
        "template": "Meter ${Meter} has pression ${Pression} (GEN RULE) and system is ${BloodPressure__metadata__crs__system}",
        "parameters": {
            "to": "someone@org.com",
            "from": "perseo_cep@telefonica.com",
            "subject": "MD VALUE: ${BloodPressure__metadata__crs__system}"
        }
    }
}
```

Generally, fields of attribute values which are objects themselves are accessible by adding to the name of the field a
double underscore prefix, so an attribute `x` with fields `a`, `b`, `c`, will allow these fields to be referred as
`x__a`, `x__b` and `x__c`.

Note: be aware of the difference between the key `metadatas` used in the context broker notificacions (v1), ending in
`s` and the infix `metadata`, without the final `s`, used to access fields from EPL and actions.

## Location fields

Fields with geolocation info representing a point with the formats recognized by NGSIv2, are parsed and generate two pairs of
pseudo-attributes, the first pair is for the latitude and the longitude and the second pair is for the x and y UTMC
coordinates for the point. These pseudo-attributes ease the use of the position in the EPL sentence of the rule. These
derived attributes have the same name of the attribute with a suffix of `__lat` and `__lon` , and `__x` and `__y`
respectively.

The formats are described in [NGSI-v2 spec](http://telefonicaid.github.io/fiware-orion/api/v2/stable/), section
"Geospatial properties of entities"

So, a notification in "geo:point" format like

```json
{
    "subscriptionId": "57f73930e0e2c975a712b8fd",
    "data": [
      {
        "type": "Vehicle",                
        "id": "Car1",
        "position": {
          "type": "geo:point",
          "value": "40.418889, -3.691944"
        }
      }
    ]
}
```

or the equivalent `geo:json` of type `Point` like this

```
{
    "subscriptionId": "57f73930e0e2c975a712b8fd",
    "data": [
      {
        "type": "Vehicle",                
        "id": "Car1",
        "position": {
          "type": "geo:json",
          "value": {
            "type": "Point",
            "coordinates": [-3.691944, 40.418889]
          }
        }
      }
    ]
}
```

will propagate to the core, (and so making available to the EPL sentence) the fields `position__lat`, `position__lon` ,
`position__x`, `position__y` (geo:point case):

```json
{
    "noticeId": "7b8f1c50-8eda-11e6-838d-0b633312661c",
    "id": "Car1",
    "type": "Vehicle",
    "isPattern": "false",
    "subservice": "/",
    "service": "unknownt",
    "location": "\"40.418889, -3.691944\"",
    "position__type": "geo:point",
    "position__lat": 40.418889,
    "position__lon": -3.691944,
    "position__x": 657577.4234800448,
    "position__y": 9591797.935076647
}
```

or (geo:json case):


```json
{
    "noticeId": "7b8f1c50-8eda-11e6-838d-0b633312661c",
    "id": "Car1",
    "type": "Vehicle",
    "isPattern": "false",
    "subservice": "/",
    "service": "unknownt",
    "location": "{\"type\": \"Point\",\"coordinates\": [-3.691944, 40.418889]}",
    "position__type": "Point",
    "position__coordinates__0": -3.691944,
    "position__coordinates__1": 40.418889,
    "position__lat": 40.418889,
    "position__lon": -3.691944,
    "position__x": 657577.4234800448,
    "position__y": 9591797.935076647
}
```

Note that in this case the type in GeoJSON overrides the type at NGSI attribute level.

The mapping to `__lat`, `__lon`, `__x` and `__y` also works for metadata. For example, a notification with metadata "geo:point" format like

```json
{
    "subscriptionId": "57f73930e0e2c975a712b8fd",
    "data": [
      {
        "type": "Vehicle",                
        "id": "Car1",
        "A": {
          "value": "OK",
          "type": "Text",
          "metadata": {
            "loc": {
              "type": "geo:point",
              "value": "2, 1"
            }            
          }
        }
      }
    ]
}
```

or the equivalent `geo:json` of type `Point` like this

```
{
    "subscriptionId": "57f73930e0e2c975a712b8fd",
    "data": [
      {
        "type": "Vehicle",                
        "id": "Car1",
        "A": {
          "value": "OK",
          "type": "Text",
          "metadata": {
            "loc": {
              "type": "geo:json",
              "value": {
                "type": "Point",
                "coordinates": [1, 2]
              }
            }
          }
        }
      }
    ]
}
```

will propagate to the core the following with regards to attribute A (geo:point case):

```
...
"A__type":"Text",
"A":"OK",
"A__metadata__loc":"2, 1",
"A__metadata__loc__type":"geo:point",
"A__metadata__loc__lat":2,
"A__metadata__loc__lon":1,
"A__metadata__loc__x":277539.36338870926,
"A__metadata__loc__y":221196.538733437,"
...
}
```

or (geo:json case):

```
...
"A__type":"Text",
"A":"OK",
"A__metadata__loc":"{"type":"Point","coordinates":[1,2]}",
"A__metadata__loc__type":"Point",
"A__metadata__loc__coordinates__0":1,
"A__metadata__loc__coordinates__1":2,
"A__metadata__loc__lat":2,
"A__metadata__loc__lon":1,
"A__metadata__loc__x":277539.36338870926,
"A__metadata__loc__y":221196.538733437,"
...
```

Note that in this case the type in GeoJSON overrides the type at NGSI metadata level.

An example of rule taking advantage of these derived attributes could be:

```json
{
    "name": "rule_distance",
    "text": "select * from iotEvent where Math.pow((cast(cast(position__x?,String),float) - 618618.8286057833), 2) + Math.pow((cast(cast(position__y?,String),float) - 9764160.736945232), 2) < Math.pow(5e3,2)",
    "action": {
        "type": "email",
        "template": "${id} (${type}) is at ${position__lat}, ${position__lon} (${position__x}, ${position__y})",
        "parameters": {
            "to": "someone@tid.es",
            "from": "system@iot.tid.es",
            "subject": "${id} is coming"
        }
    }
}
```

that will send an email when the entity with attribute `position` is less than 5 km far away from Cuenca. It uses the
circle equation, `(x - a)^2 + (y - b)^2 = d^2`, being `(a, b)` 618618.8286057833 and 9764160.736945232 the UTMC
coordinates of Cuenca and `d` the distance of 5 000 m.

Notes:

-   NGSI-v2 allows several geo location formats (`geo:point`, `geo:line`, `geo:box`, `geo:polygon` and `geo:json`). This
    feature only works with `geo:point` and `geo:json` of type `Point`. However, note that all the other cases will
    take advantage of the [JSON object expansion](#json-and-array-fields-in-attributes) done by Perseo. You can have
    a look to [this link](https://github.com/telefonicaid/perseo-fe/issues/576#issuecomment-945697894) to have a
    couple of examples with `geo:json` representing `LineString` and `Polygon`.
-   NGSI-v2 doesn't provide location semantics to medatata information (i.e. a metadata with type `geo:json` will not
    be used as location by Orion Context Broker). Perseo provides special mappings for them as extra feature.
-   For long distances the precision of the computations and the distortion of the projection can introduce some degree
    of inaccuracy.

## Time fields

Some attributes and metadata, supposed to contain a time in ISO8601 format, will generate a pseudo-attribute with the
same name as the attribute (or metadata field) and a suffix "\_\_ts", with the parsed value as milliseconds for Unix
epoch. This value makes easier to write the EPL text which involves time comparisons. The fields (attribute or metadata)
supposed to convey time information are

-   Fields named `TimeInstant`
-   Fields of type `DateTime`
-   Fields of type `urn:x-ogc:def:trs:IDAS:1.0:ISO8601`

Additionally, some derived pseudo-attributes are included also

-   `x__day`: the day of the month (1-31) for the specified date according to local time.
-   `x__month`: the month (1-12) in the specified date according to local time.
-   `x__year`: the year (4 digits) of the specified date according to local time.
-   `x__hour`: the hour (0-23) in the specified date according to local time.
-   `x__minute`: the minutes (0-59) in the specified date according to local time.
-   `x__second`: the seconds (0-59) in the specified date according to local time.
-   `x__millisecond`: the milliseconds (0-999) in the specified date according to local time.
-   `x__dayUTC`: the day of the month (1-31) in the specified date according to universal time.
-   `x__monthUTC`: the month (1-12) in the specified date according to universal time.
-   `x__yearUTC`: the year (4 digits) of the specified date according to universal time.
-   `x__hourUTC`: the hour (0-23) in the specified date according to universal time.
-   `x__minuteUTC`: the minutes (0-59) in the specified date according to universal time.
-   `x__secondUTC`: the seconds (0-59) in the specified date according to universal time.
-   `x__millisecondUTC`: the milliseconds (0-999) in the specified date according to universal time.

So, an incoming notification like

```json
{
    "subscriptionId": "51c04a21d714fb3b37d7d5a7",
    "originator": "localhost",
    "contextResponses": [
        {
            "contextElement": {
                "attributes": [
                    {
                        "name": "TimeInstant",
                        "value": "2014-04-29T13:18:05Z"
                    },
                    {
                        "name": "birthdate",
                        "type": "urn:x-ogc:def:trs:IDAS:1.0:ISO8601",
                        "value": "2014-04-29T13:18:05Z"
                    },
                    {
                        "name": "hire",
                        "type": "DateTime",
                        "value": "2016-10-13T12:10:44.149Z"
                    },
                    {
                        "name": "role",
                        "value": "benevolent dictator for life",
                        "metadatas": [
                            {
                                "name": "when",
                                "value": "2014-04-29T13:18:05Z",
                                "type": "DateTime"
                            }
                        ]
                    }
                ],
                "type": "employee",
                "isPattern": "false",
                "id": "John Doe"
            },
            "statusCode": {
                "code": "200",
                "reasonPhrase": "OK"
            }
        }
    ]
}
```

will send to core the "event"

```json
{
    "noticeId": "799635b0-914f-11e6-836b-bf1691c99768",
    "noticeTS": 1476368120971,
    "id": "John Doe",
    "type": "employee",
    "isPattern": "false",
    "subservice": "/",
    "service": "unknownt",
    "TimeInstant": "2014-04-29T13:18:05Z",
    "TimeInstant__ts": 1398777485000,
    "TimeInstant__day": 29,
    "TimeInstant__month": 4,
    "TimeInstant__year": 2014,
    "TimeInstant__hour": 15,
    "TimeInstant__minute": 18,
    "TimeInstant__second": 5,
    "TimeInstant__millisecond": 0,
    "TimeInstant__dayUTC": 29,
    "TimeInstant__monthUTC": 4,
    "TimeInstant__yearUTC": 2014,
    "TimeInstant__hourUTC": 13,
    "TimeInstant__minuteUTC": 18,
    "TimeInstant__secondUTC": 5,
    "TimeInstant__millisecondUTC": 0,
    "birthdate": "2014-04-29T13:18:05Z",
    "birthdate__type": "urn:x-ogc:def:trs:IDAS:1.0:ISO8601",
    "birthdate__ts": 1398777485000,
    "birthdate__day": 29,
    "birthdate__month": 4,
    "birthdate__year": 2014,
    "birthdate__hour": 15,
    "birthdate__minute": 18,
    "birthdate__second": 5,
    "birthdate__millisecond": 0,
    "birthdate__dayUTC": 29,
    "birthdate__monthUTC": 4,
    "birthdate__yearUTC": 2014,
    "birthdate__hourUTC": 13,
    "birthdate__minuteUTC": 18,
    "birthdate__secondUTC": 5,
    "birthdate__millisecondUTC": 0,
    "hire": "2014-04-29T13:18:05Z",
    "hire__type": "DateTime",
    "hire__ts": 1398777485000,
    "hire__day": 29,
    "hire__month": 4,
    "hire__year": 2014,
    "hire__hour": 15,
    "hire__minute": 18,
    "hire__second": 5,
    "hire__millisecond": 0,
    "hire__dayUTC": 29,
    "hire__monthUTC": 4,
    "hire__yearUTC": 2014,
    "hire__hourUTC": 13,
    "hire__minuteUTC": 18,
    "hire__secondUTC": 5,
    "hire__millisecondUTC": 0,
    "role": "benevolent dictator for life",
    "role__metadata__when": "2014-04-29T13:18:05Z",
    "role__metadata__when__type": "DateTime",
    "role__metadata__when__ts": 1398777485000,
    "role__metadata__when__day": 29,
    "role__metadata__when__month": 4,
    "role__metadata__when__year": 2014,
    "role__metadata__when__hour": 15,
    "role__metadata__when__minute": 18,
    "role__metadata__when__second": 5,
    "role__metadata__when__millisecond": 0,
    "role__metadata__when__dayUTC": 29,
    "role__metadata__when__monthUTC": 4,
    "role__metadata__when__yearUTC": 2014,
    "role__metadata__when__hourUTC": 13,
    "role__metadata__when__minuteUTC": 18,
    "role__metadata__when__secondUTC": 5,
    "role__metadata__when__millisecondUTC": 0
}
```

A rule that will check if the employee has been hired in the last half hour, could be

```json
{
    "name": "rule_time",
    "text": "select * from iotEvent where cast(cast(hire__ts?,String),double) > current_timestamp - 30*60*1000",
    "action": {
        "type": "email",
        "template": "So glad with our new ${role}, ${id}!",
        "parameters": {
            "to": "someone@tid.es",
            "from": "system@iot.tid.es",
            "subject": "Welcome ${id}!"
        }
    }
}
```

## JSON and Array fields in attributes

Some attributes like JSON and Array based, will generate a pseudo-attribute with the same name as the attribute and a
suffix "\_\_" followed by element name (for the case of JSON) or the ordinal (for the case of arrays), with the parsed
value. This value makes easier to write the EPL text which involves time comparisons.

Aditionally attribute objects are provided also in a json format (stringified).

So, an incoming notification like this:

```json
{
    "subscriptionId": "51c04a21d714fb3b37d7d5a7",
    "data": [
        {
            "id": "John Doe",
            "type": "employee",
            "myJsonValue": {
                "type": "myType1",
                "value": { "color": "blue" }
            },
            "myArrayValue": {
                "type": "myType2",
                "value": ["green", "blue"]
            },
            "TimeInstant": "2021-10-19T10:15:37.050Z",
            "location": {
                "type": "geo:json",
                "value": {
                    "type": "Point",
                    "coordinates": [53.120405283, 53.0859375]
                },
                "metadata": {}
            }
        }
    ]
}
```

will send to core the "event"

```json
{
    "noticeId": "799635b0-914f-11e6-836b-bf1691c99768",
    "noticeTS": 1476368120971,
    "id": "John Doe",
    "type": "employee",
    "isPattern": "false",
    "subservice": "/",
    "service": "unknownt",
    "myJsonValue__color": "blue",
    "myJsonValue": "{\"type\":\"myType1\",\"value\":{\"color\":\"blue\"}}",
    "myArrayValue__0": "green",
    "myArrayValue__1": "black",
    "myArrayValue": "{ \"type\": \"myType2\", \"value\": [\"green\", \"blue\"] }",
    "TimeInstant__type": "DateTime",
    "TimeInstant": "2021-10-19T10:15:37.050Z",
    "TimeInstant__ts": 1634638537050,
    "TimeInstant__day": 19,
    "TimeInstant__month": 10,
    "TimeInstant__year": 2021,
    "TimeInstant__hour": 10,
    "TimeInstant__minute": 15,
    "TimeInstant__second": 37,
    "TimeInstant__millisecond": 50,
    "TimeInstant__dayUTC": 19,
    "TimeInstant__monthUTC": 10,
    "TimeInstant__yearUTC": 2021,
    "TimeInstant__hourUTC": 10,
    "TimeInstant__minuteUTC": 15,
    "TimeInstant__secondUTC": 37,
    "TimeInstant__millisecondUTC": 50,
    "location__type": "Point",
    "location__coordinates__0": 53.120405283,
    "location__coordinates__1": 53.0859375,
    "location__lat": 53.0859375,
    "location__lon": 53.120405283,
    "location__x": 642009.4673614734,
    "location__y": 5883931.8311913265,
    "location":"{\"type\":\"Point\",\"coordinates\":[53.120405283,53.0859375]}"
}
```

Additionally all attributes are also included in non flatten format in the event into the `stripped` section:

```json
{
    "noticeId": "799635b0-914f-11e6-836b-bf1691c99768",
    "noticeTS": 1476368120971,
    "id": "John Doe",
    "type": "employee",
    "isPattern": "false",
    "subservice": "/",
    "service": "unknownt",
    "myJsonValue__color": "blue",
    "myJsonValue": "{\"type\":\"myType1\",\"value\":{\"color\":\"blue\"}}",
    "myArrayValue__0": "green",
    "myArrayValue__1": "black"
    "myArrayValue": "{ \"type\": \"myType2\", \"value\": [\"green\", \"blue\"] }",
    "location__type": "Point",
    "location__coordinates__0": 53.120405283,
    "location__coordinates__1": 53.0859375,
    "location__lat": 53.0859375,
    "location__lon": 53.120405283,
    "location__x": 642009.4673614734,
    "location__y": 5883931.8311913265,
    "location":"{\"type\":\"Point\",\"coordinates\":[53.120405283,53.0859375]}"
    "stripped": {
        "id": "John Doe",
        "type": "employee",
        "myJsonValue": {
            "type": "myType1",
            "value": { "color": "blue" }
        },
        "myArrayValue": {
            "type": "myType2",
            "value": ["green", "blue"]
        },
        "TimeInstant": {
            "type": "DateTime",
            "value": "2021-10-19T10:15:37.050Z",
            "metadata": {}
        },
        "location": {
            "type": "geo:json",
            "value": {
                "type": "Point",
                "coordinates": [53.120405283, 53.0859375]
            },
            "metadata": {}
        }
    }
}
```
