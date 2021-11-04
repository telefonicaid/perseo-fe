## Blood rules examples

All the files in this directory prefixed by `blood_` are part of the same familiy of examples, described in this section.

To run the examples, `config.env` has to be modified to point to perseo and orion machines at your installation.

The examples use an entity with id “bloodm1”,  of type “BloodMeter” and with an attribute “BloodPressure”.

`blood_onchange.sh` will subscribe perseo (CEP) to Orion (Content Broker) for changes on “bloodPressure” for entities of type “BloodMeter”

`blood_update.sh` will update the value of the attribute BloodPressure of  “bloodm1” (with the value passed as first argument). If the value changes, it will cause a ‘notify' from Context Broker (Orion) to CEP (perseo)

Examples of rules are

`blood_rule_email.json`: if the blood pressure is greater than 1.5, send an email

`blood_rule_email_metadata.json`: if the blood pressure metadata named `crs` with `system` field is `"WGS84"`, send an email

`blood_rule_sms.json`: if the blood pressure is greater than 1.5, send a sms

`blood_rule_twitter.json`: if the blood pressure is greater than 1.5, publish in Twitter

`blood_rule_update.json`: if the blood pressure is greater than 1.5, update the attribute ’abnornal’ to ‘true’ in the entity

`blood_rule_update_mirror.json`: similar to previous rule, but updating an entity with different id

`blood_rule_post.json`: if the blood pressure is greater than 1.5, publish on a given REST service

`blood_rule_complex.json`: send an complex event with stats (average, total, stddev) of the last three blood pressure measures


Rules can be added to CEP  using its REST API


```
curl localhost:9090/rules/ -H "content-type: application/json" -d @blood_rule_update.json
```

Or deleted

```
curl localhost:9090/rules/blood_rule_update -X DELETE
```

With one or more rules working at CEP, you can update the value of the blood pressure with

```./blood_update.sh 1```

And  every time we  provide a new value, the CEP will be notified  (the subscription was of type ONCHANGE)

```./blood_update.sh 2```


The “anatomy” of a rule is as follows

```json
{
   "name":"blood_rule_update",
   "text":"select *,\"blood_rule_update\" as ruleName from pattern [every ev=iotEvent(cast(cast(BloodPressure?,String),float)>1.5 and type=\"BloodMeter\")]",
   "action":{
      "type":"update",
      "parameters":{
         "name":"abnormal",
         "value":"true",
         "type":"boolean"
      }
   }
}
```

The text is the EPL sentence and it has to honor certain constraints in order to work with the event treatment at perseo/perseo-core. (In bold, 'constants' and in cursive, values that must match ‘external’ values)

select * ,
*"blood_rule_update"* as **ruleName**,
 ev.BloodPressure? as Pression,
 ev.id? as Meter
 from pattern [every **ev**= **iotEvent**(cast(cast(BloodPressure?,String),float)>1.5 and type="BloodMeter”)]


* The rule name must be present with **ruleName** alias. It must be equal to ‘name’ field of the rule object
* The ‘from' pattern must name the event as **ev** and the event stream from which take events must be **iotEvent**
* A type= condition must be concatenated for avoiding mixing different kinds of entities

The measure must be cast to float in case of being numeric (like  in the example) (‘Double’ cast to string and to float is something we are analyzing, and could be unnecessary  in a future version. Use it  now). All the attributes in the notification from Orion are available in the event object, **ev**,  like *ev.BlodPressure?* and *ev.id?*. A question mark is necessary for EPL  referring ‘dynamic’ values.

The example shows two additional alias that can be used  in the action of the rule. This action will cause to update the attribute ‘abnormal’ of the entity to ‘true’  (`blood_query.sh` displays the values of the entity and `blood_reset_changed.sh` sets the ‘abnormal’ attribute to ‘false’, undoing the action of this rule for example)

The rule for sending an email is

```json
{
   "name":"blood_rule_email",
   "text":"select *,\"blood_rule_email\" as ruleName, *,ev.BloodPressure? as Pressure, ev.id? as Meter from pattern [every ev=iotEvent(cast(cast(BloodPressure?,String),float)>1.5 and type=\"BloodMeter\")]",
   "action":{
      "type":"email",
      "template":"Meter ${Meter} has pressure ${Pressure} (GEN RULE)",
      "parameters":{
         "to":"control@hospital.org",
         "from":"cep@hospital.org"
      }
   }
}
```

In this case, the action can use the ‘aliased’ values in the template for the email body

The actions currently available are
* Send an email, with a template for the body
* Send an SMS, with a template for the body
* Update the entity which fired the rule, setting an attribute to a value
* Make a generic HTTP POST to an URL set as an action parameter

## Other examples

* `rule_delta.json`, rule using `previousValue` metadata to calculate deltas in attribute values
* `rule_distance.json`, rule which triggers if the distance to a given point is closer to a given value
* `rule_time.json`, rule based on time using the `__ts` timestamp
* `timewindow_send_alert_if_2.json`, rule to send an email when two or more different entities has reported an alert status within 60sec time window
* `timewindow_threeshold_if_2.json`, rule to update an alert attribute of a given entity when its value attibute is greater than 10 at least twice in a 60sec time window

## More info

Detailed information about [EPL](http://esper.espertech.com/release-8.4.0/reference-esper/html/epl_clauses.html)
