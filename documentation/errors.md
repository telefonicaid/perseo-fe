# Errors

A list of errors returned by perseo-fe

## Notices

| label | HTTP code | message | description |
| ----- | --------- | ------- | ----------- |
| INVALID_NOTICE | 400 | invalid notice format | there is a generic problem with the notice content. Missing fields |
| ID_ATTRIBUTE | 400 | id as attribute | an attribute has name "id" |
| TYPE_ATTRIBUTE | 400 |type as attribute | an attribute has name "type" |
| INVALID_LOCATION | 400 | invalid location | a field for location has an invalid format |
| INVALID_LONGITUDE | 400 | longitude is not valid | the longitude component is not valid |
| INVALID_LATITUDE | 400 | latitude is not valid | the latitude component is not valid |
| INVALID_DATETIME | 400 | datetime is not valid | a field for date is not valid |

## Paths

| label | HTTP code | message | description |
| ----- | --------- | ------- | ----------- |
| EMPTY | 400 | service/subservice: empty component| the servicepath has an empty component |
| INVALID_CHAR | 400 | service/subservice: invalid character | invalid character in service/servicepath |
| ABS_PATH | 400 | subservice: must be absolute | the servicepath must be absolute, i.e must begin with /|
| TOO_LONG | 400 | service/subservice: too long string | service, servicepath or an indivual component is too long|
| TOO_MANY | 400 | service/subservice: too many components | the service path has too many components |


## Rules

| label | HTTP code | message | description |
| ----- | --------- | ------- | ----------- |
| MISSING_RULE_NAME | 400 | missing rule name | the name of the rule is missing |
| EMPTY_RULE | 400 | empty rule, missing text or nosignal | the text and nosignal fields are missing |
| EXISTING_RULE | 400 | rule exists | the rule exits already and cannot be created |
| MUST_BE_STRING_RULE_NAME | 400 | name must be a string | the rule name field is not a string |
| TOO_LONG_RULE_NAME | 400 | rule name too long | the name of the rule exceeds the max length |
| INVALID_RULE_NAME | 400 | invalid char in name | the name of the rule contains an invalid character |
| INVALID_CHECK_INTERVAL | 400 | invalid check interval | the check interval for a nosignal rule is not valid |
| RULE_NOTFOUND | 400 | rule not found | the rule does not exits (for retrieving or updating) |
    

## Log level

| label | HTTP code | message | description |
| ----- | --------- | ------- | ----------- |
| INVALID_LOG_LEVEL | 400 | invalid log level | The log level sent is not valid value|


## Actions

| label | HTTP code | message | description |
| ----- | --------- | ------- | ----------- |
| MISSING_ACTION_TYPE | 400 | missing type in action | the field type for the action is missing |
| UNKNOWN_ACTION_TYPE | 400 | unknown action type | the field type has an invalid value |
| MISSING_ACTION_RULE_NAME | 400 | missing rule name for action | the field for the rule name is missing |
| ID_ATTRIBUTE | 400 | id as attribute | an attribute has 'id' as name |
| TYPE_ATTRIBUTE | 400 | type as attribute | an attribute has 'type' as name |
   


