<a name="administration"></a>
## Administration
### Service operations

####	Start service
To start the service, use either the service command:
service perseo start

Or just the launch script:
```
/etc/init.d/perseo start
```
For testing purposes it might be interesting to launch the process directly without the service. That can be done executing the following command from the project root directory:
```
./bin/perseo
```

Take into account that when the process is executed manually the system configuration for the script is not loaded and the default configuration (in /opt/perseo/config.js) is used.

####	Stop service
To stop the service, use either the service command:
```
service perseo stop
```
Or just the launch script:
```
/etc/init.d/perseo stop
```
###	How to check service status
####	Checking the process is running
The status of the process can be retrieved using the service command:
```
service perseo status
```
It also can be checked with ps, using a filter with the command name:
```
ps -ef | grep "bin/perseo"
```
In both cases a result of 0 (echoing $?) indicates the process is supposed to be running, and an error otherwise.
#### Checking that the port is listening
The following command:
```
netstat -ntpl | grep 9090
```
can be used to check the process is listening in the appropriate port (provided the port is the standard 9090). The result should resemble this line:
```
tcp   0   0  0.0.0.0:1026     0.0.0.0:*   LISTEN   12179/node
```


### How to subscribe to Context Broker
([Orion](https://github.com/telefonicaid/fiware-orion) has detailed documentation)
In the example below,
* ‘reference’ should be the perseo's IP and port
* ‘condValues’ a list of the attributes of the entity used in rules. In a future release of Orion (Context Broker) will be possible to subscribe to changes in any attribute, but in the current version, they must be specified
* 'orion-machine:1026' should be substituted by the actual Context Broker's IP and port
* 'service' is the service associated to the subscription
* 'subservice' is the subservice associated to the subscription

```
(curl http://orion-machine:1026/v1/subscribeContext -s -S --header 'Content-Type: application/json' --header 'Accept: application/json' --header 'Fiware-Service: service' –header 'Fiware-ServicePath: subservice' -d @- | python -mjson.tool) <<EOF
{
    "entities": [
        {
            "type": "BloodMeter",
            "isPattern": "true",
            "id": ".*"
        }
    ],
    "attributes": [
    ],
    "reference": "http://perseo-machine:9090/notices",
    "duration": "P1Y",
    "notifyConditions": [
        {
            "type": "ONCHANGE",
            "condValues": [
                "BloodPressure"
            ]
        }
    ],
    "throttling": "PT1S"
}
EOF
```

