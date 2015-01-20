<a name="actions"></a>
## Available actions

The available actions are:
* **readRule**: to get working rules in CEP
* **writeRule**: to modify rules in CEP (create, delete, update)
* **notify**: to fire rules (if appropiate) with an event notification

The following tables show the map from method and path of the request to the action.

### Notifications
| Method | Path |  Action |
| ------ |:-----|:------------|
| POST   | /notices | notify|

### Rules
| Method | Path        | Action|
| ------ |:-------------|:-----------|
| GET    | /rules      | readRule  |
| GET    | /rules/{id} | readRule  |
| POST   | /rules      | writeRule |
| DELETE | /rules/{id} | writeRule |

### Visual Rules
| Method | Path    |  Action |
| ------ |:--------|:------------|
| GET    | /m2m/vrules        	| readRule |
| GET    | /m2m/vrules/{id}       | readRule |
| POST   | /m2m/vrules        	| writeRule |
| DELETE | /m2m/vrules/{id}    	| writeRule |
| PUT    | /m2m/vrules/{id}       | writeRule |
