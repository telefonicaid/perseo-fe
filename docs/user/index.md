# User & Programmers Manual

This document describes how to use Perseo...

## Content

-   [Setting things up](#Setting things up)
- Qué necesito para funcionar?
- Cómo conecto con Orion para que me notifique?
- Cómo creo reglas en perseo?
-  [Perseo Rules](#Perseo Rules)
	- EPL
	- Acciones
-   

## Setting things up

  

## Perseo Rules

Perseo rules follow a simple JSON structure made up of three mandatory *key-value* fields: **`name`**, **`text`**, and **`action`**. The structure of these rules is sketched in the following JSON code:

```json
{
   "name":"<The name of the rule>",
   "text":"<Insert here a valid EPL statement>",
   "action":{
      "type":"[update|sms|email|post|twitter]",
      "parameters":{
         ...
      }
   }
}
```

The `name` field refers to the name of the rule, and it is used as rule identifier. It must start by a letter, and can contain digits (0-9), underscores (_) and dashes (-). Their maximum length is set to 50 characters.

The `action` field states the action to be performed by Perseo when the rule triggers. You can also use an **array** of action objects if needed. Each of those actions will be executed when the rule is fired, avoiding to duplicate a rule only for getting several actions executed.

Last but no least, the `text` field contains the valid EPL statement to be send to the Esper-based core rule engine. The value of this field must follow the EPL syntax, that is fully documented in the [Esper website](http://esper.espertech.com/release-6.1.0/esper-reference/html/index.html), in [here](http://esper.espertech.com/release-6.1.0/esper-reference/html/epl_clauses.html).

Late 2018 `-ficodes` versions of Perseo should work with any of the EPL clauses. However, you should take into consideration the following guidelines:

* The name of the stream from which events will come is `iotEvent`.
* A `type=` condition should be included to avoid mixing different kinds of entities.
* Entity's attributes must be cast to `float` in case of being numeric, to `String` otherwise. 
* All the attributes of the context broker notification are available as dynamic properties of the event object `ev`.
* A question mark `?` is *necessary* for EPL to refer to ‘dynamic’ values (duck typing), such as `ev.id?`.
* Metadata is also available as explained in the [metadata and object values](#metadata-and-object-values) section.

Following there is an example of a valid EPL clause ready to be used with Perseo:

```
select *, ev.BloodPressure? as Pressure, ev.id? as Meter
from pattern
     [every ev=iotEvent(cast(cast(BloodPressure?,String),float)>1.5 and type="BloodMeter")]
```

You will find more examples of valid rules in the [Examples of rules]() section.



### Actions

When one or more events come from the context broker and match some of the rules stored in the rule engine, those rules are fired. The core of Perseo (Esper), will generate a *complex event* by using the `select` clause of the EPL, and then it will send it back to the front-end side of Perseo, which will execute the action using the generated event as a parameter.

Actions are set by means of the `action` field of the rule. Let's see an example:

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

The `type` field is mandatory and must be one of the following:

* `update` - creating or updating entities and attributes of those entities in the context broker
* `sms` - sending a SMS
* `email` - sending an email
* `post` - making a HTTP POST request to a provided URL 
* `twitter` - sending a tweet

An action can *optionally* have a field called `interval`, aimed at limiting the frequency of the action execution (for the rule and entity which fired it). The value is expressed in milliseconds, and represents the minimum lapse between executions. Once the action is _successfully_ executed, it won't be executed again until that period of time has elapsed. All execution requests in between will be silently discarded.

#### String substitution syntax

An `action` can include references to one or more of the available atributes of the context broker's notification. This allows you to leverage context information in a very simple way. For example, the `sms`, `email`, and `post` actions include a `template` field that can be used to build the body of the message/request. This text can include placeholders for those attributes of the generated complex event. The placeholder takes the form of `${X}`, with `X` being one of the following:

* `id` for the id of the entity that triggers the rule.
* `type` for the type of the entity that triggers the rule.
* Any other value is interpreted as the name of an attribute in the entity which triggers the rule, and the placeholder is substituted by the value of that attribute.

This also implies for 

All alias for simple event attributes or "complex" calculated values can be directly used in the placeholder with their name. And any of the original event attributes (with the special cases for `id` and `type` meaning entity ID and type, respectively) can be referred too.

This substitution can be used in the the following fields:
* `template`, `from`, `to` and `subject` for `email` action
* `template`, `url`, `qs`, `headers`, `json` for `post` action
* `template` for `sms` action
* `template` for `twitter` action
* `id`, `type`, `name`, `value`, `ìsPattern` for `update` action


#### SMS action

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
The field `parameters` include a field `to` with the number to send the message to.

The `template` and `to` fields perform [attribute substitution](#string-substitution-syntax).

#### email action

Sends an email to the recipient set in the action parameters, with the body mail build from the `template` field. A field `to` in `parameters` sets the recipient and a field `from`sets the sender's email address. Also the subject of the email can be set in the field `subject` in `parameters`.

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

#### update attribute action
Updates one or more attributes of a given entity (in the Context Broker instance specified in the Perseo configuration). 
The `parameters` map includes the following fields:

* id: optional, the id of the entity which attribute is to be updated (by default the id of the entity that triggers the rule is used, i.e. `${id}`)
* type: optional, the type of the entity which attribute is to be updated (by default the type of the entity that triggers the rule is usedi.e. `${type}`)
* isPattern: optional, `false` by default
* attributes: *mandatory*, array of target attributes to update. Each element of the array must contain the fields
    * **name**: *mandatory*, attribute name to set
    * **value**: *mandatory*, attribute value to set
    * type: optional, type of the attribute to set. By default, not set (in which case, only the attribute value is changed).
* trust: optional, trust token for getting an access token from Auth Server which can be used to get to a Context Broker behind a PEP.


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
            ]
        }
    }
```
The `name` parameter cannot take `id` or `type` as a value, as that would refer to the entity's id and the entity's type (which are not updatable) and not to an attribute with any of those names. Trying to create such action will return an error.

The `id`, `type`, `name`, `value`, `ìsPattern` fields perform [string substitution](#string-substitution-syntax).

First time an update action using trust token is triggered, Perseo interacts with Keystone to get the temporal auth token corresponding to that trust token. This auth token is cached and used in every new update associated to the same action. Eventually, Perseo can receive a 401 Not Authorized due to auth token expiration. In that case, Perseo interacts again with Keystone to get a fresh auth token, then retries the update that causes the 401 (and the cache is refreshed with the new auth token for next updates).

It could happen (in theory) that a just got auth token also produce a 401 Not authorized, however this would be an abnormal situation: Perseo logs the problem with the update but doesn't try to get a new one from Keystone. Next time Perseo triggers the action, the process may repeat, i.e. first update attemp fails with 401, Perseo requests a fresh auth token to Keystone, the second update attemp fails with 401, Perseo logs the problem and doesn't retry again.


#### HTTP request action
Makes an HTTP request to an URL specified in `url` inside `parameters`, sending a body built from `template`. 
The `parameters` field can specify
* method: *optional*, HTTP method to use, POST by default
* **url**: *mandatory*, URL target of the HTTP method
* headers: *optional*, an object with fields and values for the HTTP header
* qs: *optional*, an object with fields and values to build the query string of the URL
* json: *optional*, an object that will be sent as JSON. String substitution will be performed in the keys and 
values of the object's fields. If present, it overrides `template` from `action` 

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

The `template` and `url` fields and both the field names and the field values of `qs` and `headers` and `json`
perform [string substitution](#string-substitution-syntax).

#### twitter action

Updates the status of a twitter account, with the text build from the `template` field. The field `parameters` must contain the values for the consumer key and secret and the access token key and access token secret of the pre-provisioned application associated to the twitter user.

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

### Metadata and object values

Metadata values can be accessed by adding the suffix `__metadata__x` to the attribute name, being `x` the name of the 
metadata attribute. This name can be used in the EPL text of the rule and in the parameters of the action which accept 
string substitution. If the value of the metadata item is an object itself, nested fields can be referred by additional 
suffixes beginning with double underscore and the hierarchy can be walked down by adding more suffixes, like
 `__metadata__x__subf1__subf12`.

For example:
The metadata in an event/notice like

```
{
  "subscriptionId" : "51c04a21d714fb3b37d7d5a7",
  "originator" : "localhost",
  "contextResponses" : [
    {
      "contextElement" : {
        "attributes" : [
          {
            "name" : "BloodPressure",
            "type" : "centigrade",
            "value" : "2",
            "metadatas": [{
              "crs": {
                "value": {"system": "WGS84"}
              }]
            }
          },
		{
            "name" : "TimeInstant",
            "type" : "urn:x-ogc:def:trs:IDAS:1.0:ISO8601",
            "value" : "2014-04-29T13:18:05Z"
          }
        ],
        "type" : "BloodMeter",
        "isPattern" : "false",
        "id" : "bloodm1"
      },
      "statusCode" : {
        "code" : "200",
        "reasonPhrase" : "OK"
      }
    }
  ]
}
```

could be used by a rule so

```json
{
    "name": "blood_rule_email_md",
    "text": "select *,\"blood_rule_email_md\" as ruleName, *,ev.BloodPressure? as Pression, ev.id? as Meter from pattern [every ev=iotEvent(cast(BloodPressure__metadata__crs__system?,String)=\"WGS84\" and type=\"BloodMeter\")]",
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

Note: be aware of the difference between the key `metadatas` used in the context broker notificacions (v1), ending in `s`
 and the infix `metadata`, without the final `s`, used to access fields from EPL and actions. 
 
### Location fields

Fields with geolocation info with the formats recognized by NGSI v1, are parsed and generate two pairs of 
pseudo-attributes, the first pair is for the latitude and the longitude and the second pair is for the x and y 
UTMC coordinates for the point. These pseudo-attributes ease the use of the position in the EPL sentence of the rule. 
These derived attributes have the same name of the attribute with a suffix of `__lat` and `__lon` , and `__x` and 
`__y` respectively.

The formats are 
* [NGSV1 deprecated format](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/Publish/Subscribe_Broker_-_Orion_Context_Broker_-_User_and_Programmers_Guide_R3#Defining_location_attribute)
* [NGSIV1 current format](https://github.com/telefonicaid/fiware-orion/blob/master/doc/manuals/user/geolocation.md#defining-location-attribute)


So, a notification in the deprecated format like
 
 ```json
 {
    "subscriptionId":"57f73930e0e2c975a712b8fd",
    "originator":"localhost",
    "contextResponses":[
       {
          "contextElement":{
             "type":"Vehicle",
             "isPattern":"false",
             "id":"Car1",
             "attributes":[
                {
                   "name":"position",
                   "type":"coords",
                   "value":"40.418889, -3.691944",
                   "metadatas":[
                      {
                         "name":"location",
                         "type":"string",
                         "value":"WGS84"
                      }
                   ]
                }
             ]
          }
       }
    ]
 }
 ```
 
will propagate to the core, (and so making available to the EPL sentence) the fields `position__lat`, `position__lon` ,
`position__x`, `position__y`

```json
{  
   "noticeId":"169b0920-8edb-11e6-838d-0b633312661c",
   "id":"Car1",
   "type":"Vehicle",
   "isPattern":"false",
   "subservice":"/",
   "service":"unknownt",
   "position":"40.418889, -3.691944",
   "position__type":"coords",
   "position__metadata__location":"WGS84",
   "position__metadata__location__type":"string",
   "position__lat":40.418889,
   "position__lon":-3.691944,
   "position__x":657577.4234800448,
   "position__y":9591797.935076647
}
```

Analogously, a notification in "geopoint" format, like

```json
{
   "subscriptionId":"57f73930e0e2c975a712b8fd",
   "originator":"localhost",
   "contextResponses":[
      {
         "contextElement":{
            "type":"Vehicle",
            "isPattern":"false",
            "id":"Car1",
            "attributes":[
               {
                  "name":"position",
                  "type":"geo:point",
                  "value":"40.418889, -3.691944"
               }
            ]
         },
         "statusCode":{
            "code":"200",
            "reasonPhrase":"OK"
         }
      }
   ]
}
```

will send to core an event with the fields `position__lat`, `position__lon`, `position__x`, `position__y` also

```json
{  
   "noticeId":"7b8f1c50-8eda-11e6-838d-0b633312661c",
   "id":"Car1",
   "type":"Vehicle",
   "isPattern":"false",
   "subservice":"/",
   "service":"unknownt",
   "position":"40.418889, -3.691944",
   "position__type":"geo:point",
   "position__lat":40.418889,
   "position__lon":-3.691944,
   "position__x":657577.4234800448,
   "position__y":9591797.935076647
```

An example of rule taking advantage of these derived attributes could be:

```json
{
    "name": "rule_distance",
    "text": "select *, \"rule_distance\" as ruleName from pattern [every ev=iotEvent(Math.pow((cast(cast(position__x?,String),float) - 618618.8286057833), 2) + Math.pow((cast(cast(position__y?,String),float) - 9764160.736945232), 2) < Math.pow(5e3,2))]",
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
circle equation, `(x - a)^2 + (y - b)^2 = d^2`, being `(a, b)` 618618.8286057833 and 9764160.736945232 the UTMC coordinates
of Cuenca and `d` the distance of 5 000 m. 

Note: for long distances the precision of the computations and the distortion of the projection can introduce some degree 
of inaccuracy.

### Time fields
Some attributes and metadata, supposed to contain a time in ISO8601 format, will generate a pseudo-attribute with the 
same name as the attribute (or metadata field) and a suffix "__ts", with the parsed value as milliseconds for Unix epoch. 
This value makes easier to write the EPL text which involves time comparisons. The fields (attribute or metadata) supposed 
to convey time information are

* Fields named `TimeInstant`
* Fields of type `DateTime`
* Fields of type `urn:x-ogc:def:trs:IDAS:1.0:ISO8601`

Additionally, some derived pseudo-attributes are included also

*   `x__day`: the day of the month (1-31) for the specified date according to local time.
*   `x__month`: the month (1-12) in the specified date according to local time.
*   `x__year`: the year (4 digits) of the specified date according to local time.
*   `x__hour`: the hour (0-23) in the specified date according to local time.
*   `x__minute`: the minutes (0-59) in the specified date according to local time.
*   `x__second`: the seconds (0-59) in the specified date according to local time.
*   `x__millisecond`: the milliseconds (0-999) in the specified date according to local time.
*   `x__dayUTC`: the day of the month (1-31) in the specified date according to universal time.
*   `x__monthUTC`: the month (1-12) in the specified date according to universal time.
*   `x__yearUTC`: the year (4 digits) of the specified date according to universal time.
*   `x__hourUTC`: the hour (0-23) in the specified date according to universal time.
*   `x__minuteUTC`: the minutes (0-59) in the specified date according to universal time.
*   `x__secondUTC`: the seconds (0-59) in the specified date according to universal time.
*   `x__millisecondUTC`: the milliseconds (0-999) in the specified date according to universal time.

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
                        "metadatas": [{
                            "name": "when",
                            "value": "2014-04-29T13:18:05Z",
                            "type": "DateTime"
                        }]
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
   "noticeId":"799635b0-914f-11e6-836b-bf1691c99768",
   "noticeTS":1476368120971,
   "id":"John Doe",
   "type":"employee",
   "isPattern":"false",
   "subservice":"/",
   "service":"unknownt",
   "TimeInstant":"2014-04-29T13:18:05Z",
   "TimeInstant__ts":1398777485000,
   "TimeInstant__day":29,
   "TimeInstant__month":4,
   "TimeInstant__year":2014,
   "TimeInstant__hour":15,
   "TimeInstant__minute":18,
   "TimeInstant__second":5,
   "TimeInstant__millisecond":0,
   "TimeInstant__dayUTC":29,
   "TimeInstant__monthUTC":4,
   "TimeInstant__yearUTC":2014,
   "TimeInstant__hourUTC":13,
   "TimeInstant__minuteUTC":18,
   "TimeInstant__secondUTC":5,
   "TimeInstant__millisecondUTC":0,
   "birthdate":"2014-04-29T13:18:05Z",
   "birthdate__type":"urn:x-ogc:def:trs:IDAS:1.0:ISO8601",
   "birthdate__ts":1398777485000,
   "birthdate__day":29,
   "birthdate__month":4,
   "birthdate__year":2014,
   "birthdate__hour":15,
   "birthdate__minute":18,
   "birthdate__second":5,
   "birthdate__millisecond":0,
   "birthdate__dayUTC":29,
   "birthdate__monthUTC":4,
   "birthdate__yearUTC":2014,
   "birthdate__hourUTC":13,
   "birthdate__minuteUTC":18,
   "birthdate__secondUTC":5,
   "birthdate__millisecondUTC":0,
   "hire":"2014-04-29T13:18:05Z",
   "hire__type":"DateTime",
   "hire__ts":1398777485000,
   "hire__day":29,
   "hire__month":4,
   "hire__year":2014,
   "hire__hour":15,
   "hire__minute":18,
   "hire__second":5,
   "hire__millisecond":0,
   "hire__dayUTC":29,
   "hire__monthUTC":4,
   "hire__yearUTC":2014,
   "hire__hourUTC":13,
   "hire__minuteUTC":18,
   "hire__secondUTC":5,
   "hire__millisecondUTC":0,
   "role":"benevolent dictator for life",
   "role__metadata__when":"2014-04-29T13:18:05Z",
   "role__metadata__when__type":"DateTime",
   "role__metadata__when__ts":1398777485000,
   "role__metadata__when__day":29,
   "role__metadata__when__month":4,
   "role__metadata__when__year":2014,
   "role__metadata__when__hour":15,
   "role__metadata__when__minute":18,
   "role__metadata__when__second":5,
   "role__metadata__when__millisecond":0,
   "role__metadata__when__dayUTC":29,
   "role__metadata__when__monthUTC":4,
   "role__metadata__when__yearUTC":2014,
   "role__metadata__when__hourUTC":13,
   "role__metadata__when__minuteUTC":18,
   "role__metadata__when__secondUTC":5,
   "role__metadata__when__millisecondUTC":0
}
```

A rule that will check if the employee has been hired in the last half hour, could be

```json
{
    "name": "rule_time",
    "text": "select *, \"rule_time\" as ruleName from pattern [every ev=iotEvent(cast(cast(hire__ts?,String),float) > current_timestamp - 30*60*1000)]",
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


## Examples of rules

* Rules with [Patterns](http://esper.espertech.com/release-6.1.0/esper-reference/html/event_patterns.html)
* Rules with [Match-Recognize](http://esper.espertech.com/release-6.1.0/esper-reference/html/match-recognize.html)
* Rules using Funtions and Methods (date time? Spatial method?)
* Timer rules (Estas son de Perseo o de EPL?)