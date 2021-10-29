# User & Programmers Manual

This document describes how to use Perseo CEP.

## Content

-   [Introduction](#introduction)
-   [Perseo Rules](#perseo-rules)
-   [Actions](#actions)
-   [String substitution syntax](#string-substitution-syntax)
-   [Metadata and object values](#metadata-and-object-values)
-   [Examples](#examples-of-epl-rules)

## Introduction

Perseo is an [Esper-based](http://www.espertech.com/esper/) Complex Event Processing (CEP) software designed to be fully
_NGSIv2_-compliant. It uses NGSIv2 as the communication protocol for events, and thus, Perseo is able to seamless and
jointly work with _context brokers_ such as [Orion Context Broker](https://github.com/telefonicaid/fiware-orion).

Perseo follows a straightforward idea: listening to events coming from context information to identify patterns
described by rules, in order to immediately react upon them by triggering actions.

By leveraging on the
[notifications mechanism](http://fiware-orion.readthedocs.io/en/latest/user/walkthrough_apiv2/index.html#subscriptions),
clients instruct Orion CB to notify Perseo of the changes in the entities they care about (`Event API`). Details of this
process are explained in the [Orion Subscription part of the User Manual](user/index.md#orion-subscription). Then, rules
to the CORE Rule Engine can be easily managed using the publicly available WireCloud operational dashboard, or making
use of any of the REST clients able to programmaticly use the Perseo's `Rule API`. These rules will identify patterns
that will trigger actions with Orion to create or update entities, or with other different components or external
systems, such as Web (HTTP), Email (SMTP) or SMS (SMPP) servers.

Perseo allows you to create/edit/delete rules through its API. You can find more accurate information about the Perseo
API [here](../API/api.md)

## Perseo Rules

Perseo rules follow a simple JSON structure made up of three mandatory _key-value_ fields: **`name`**, **`text`**, and
**`action`**. The structure of these rules is sketched in the following JSON code:

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

The `name` field refers to the name of the rule, and it is used as rule identifier. It must start by a letter, and can
contain digits (0-9), underscores (\_) and dashes (-). Their maximum length is set to 50 characters.

The `action` field states the action to be performed by Perseo when the rule triggers. You can also use an **array** of
action objects if needed. Each of those actions will be executed when the rule is fired, avoiding to duplicate a rule
only for getting several actions executed.

Last but no least, the `text` field contains the valid EPL statement to be send to the Esper-based core rule engine. The
value of this field must follow the EPL syntax, that is fully documented in the
[Esper website](http://esper.espertech.com/release-8.4.0/reference-esper/html/index.html), in
[here](http://esper.espertech.com/release-8.4.0/reference-esper/html/epl_clauses.html).

Perseo should work with any of the EPL clauses. However, you should take into consideration the following guidelines:

-   The name of the stream from which events will come is `iotEvent`.
-   A `type=` condition should be included to avoid mixing different kinds of entities.
-   Entity's attributes must be cast to `float` in case of being numeric, to `String` otherwise.
-   All the attributes of the context broker notification are available as dynamic properties of the event object `ev`.
-   A question mark `?` is _necessary_ for EPL to refer to ‘dynamic’ values (duck typing), such as `ev.id?`.
-   Metadata is also available as explained in the [metadata and object values](#metadata-and-object-values) section.

Following there is an example of a valid EPL simple clause ready to be used with Perseo:

```text
select *, ev.BloodPressure? as Pressure, ev.id? as Meter
from pattern
     [every ev=iotEvent(type="BloodMeter")]
```

You will find the complete information about Perseo Rules in [plain rules](.../API/plain_rules.md) section.

### Actions

When one or more events come from the context broker and match some of the rules stored in the rule engine, those rules
are fired. The core of Perseo (Esper), will generate a _complex event_ by using the `select` clause of the EPL, and then
it will send it back to the front-end side of Perseo, which will execute the action using the generated event as a
parameter.

Actions are set by means of the `action` field of the rule. Let's see an example:

```json
   "action": {
      "type": "update",
      "parameters": {
         "name": "abnormal",
         "value": "true",
         "type": "boolean"
      },
      "interval" : "30e3"
   }
```

The `type` field is mandatory and must be one of the following:

-   `update` - creating or updating entities and attributes of those entities in the context broker.
    [(update action details)](../API/plain_rules.md#update-attribute-action)
-   `sms` - sending a SMS. [(sms action details)](../API/plain_rules.md#sms-action)
-   `email` - sending an email. [(email action details)](../API/plain_rules.md#email-action)
-   `post` - making a HTTP request to a provided URL [(post action details)](../API/plain_rules.md#http-request-action)
-   `twitter` - sending a tweet [(twitter action details)](../API/plain_rules.md#twitter-action)

An action can _optionally_ have a field called `interval`, aimed at limiting the frequency of the action execution (for
the rule and entity which fired it). The value is expressed in milliseconds, and represents the minimum lapse between
executions. Once the action is _successfully_ executed, it won't be executed again until that period of time has
elapsed. All execution requests in between will be silently discarded.

You will find more information about Perseo Actions [here](../API/plain_rules.md#actions).

#### String substitution syntax

An `action` can include references to one or more of the available atributes of the context broker's notification. This
allows you to leverage context information in a very simple way. For example, the `sms`, `email`, and `post` actions
include a `template` field that can be used to build the body of the message/request. This text can include placeholders
for those attributes of the generated complex event. The placeholder takes the form of `${X}`, with `X` being one of the
following:

-   `id` for the id of the entity that triggers the rule.
-   `type` for the type of the entity that triggers the rule.
-   Any other value is interpreted as the name of an attribute in the entity which triggers the rule, and the
    placeholder is substituted by the value of that attribute.

All alias for simple event attributes or "complex" calculated values can be directly used in the placeholder with their
name. And any of the original event attributes (with the special cases for `id` and `type` meaning entity ID and type,
respectively) can be referred too.

This substitution can be used in the following fields:

-   `template`, `from`, `to` and `subject` for `email` action
-   `template`, `url`, `qs`, `headers`, `json` for `post` action
-   `template` for `sms` action
-   `template` for `twitter` action
-   `id`, `type`, `name`, `value`, `ìsPattern` for `update` action

You will find more information about substitution syntax in each action information:

-   [update action details](../API/plain_rules.md#update-attribute-action)
-   [sms action details](../API/plain_rules.md#sms-action)
-   [email action details](../API/plain_rules.md#email-action)
-   [post action details](../API/plain_rules.md#http-request-action)
-   [twitter action details](../API/plain_rules.md#twitter-action)

## Metadata and object values

Metadata values can be accessed by adding the suffix `__metadata__x` to the attribute name, being `x` the name of the
metadata attribute. This name can be used in the EPL text of the rule and in the parameters of the action which accept
string substitution. If the value of the metadata item is an object itself, nested fields can be referred by additional
suffixes beginning with double underscore and the hierarchy can be walked down by adding more suffixes, like
`__metadata__x__subf1__subf12`.

Generally, fields of attribute values which are objects themselves are accessible by adding to the name of the field a
double underscore prefix, so an attribute `x` with fields `a`, `b`, `c`, will allow these fields to be referred as
`x__a`, `x__b` and `x__c`.

Note: be aware of the difference between the key `metadatas` used in the context broker notificacions

You will find more information about metadata and object values
[here](../API/plain_rules.md#metadata-and-object-values).

## Examples of EPL rules

-   [Basic Perseo Rules](https://github.com/telefonicaid/perseo-fe/tree/master/examples)
-   [Rules withPatterns](http://esper.espertech.com/release-8.4.0/reference-esper/html/event_patterns.html)
-   [Rules with Match-Recognize](http://esper.espertech.com/release-8.4.0/reference-esper/html/match-recognize.html)
-   Timed Rules:
    -   [match-recognize-interval](http://esper.espertech.com/release-8.4.0/reference-esper/html/match-recognize.html#match-recognize-interval)
    -   [pattern-timer-interval](http://esper.espertech.com/release-8.4.0/reference-esper/html/event_patterns.html#pattern-timer-interval)
    -   [pattern-timer-at](http://esper.espertech.com/release-8.4.0/reference-esper/html/event_patterns.html#pattern-timer-at)
    -   [pattern-timer-schedule](http://esper.espertech.com/release-8.4.0/reference-esper/html/event_patterns.html#pattern-timer-schedule)
