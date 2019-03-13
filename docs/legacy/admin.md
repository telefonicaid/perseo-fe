<a name="administration"></a>

## Administration

### Service operations

#### Start service

To start the service, use either the service command:

```bash
service perseo start
```

Or just the launch script:

```bash
/etc/init.d/perseo start
```

For testing purposes it might be interesting to launch the process directly without the service. That can be done
executing the following command from the project root directory:

```bash
./bin/perseo
```

Take into account that when the process is executed manually the system configuration for the script is not loaded and
the default configuration (in /opt/perseo/config.js) is used.

#### Stop service

To stop the service, use either the service command:

```bash
service perseo stop
```

Or just the launch script:

```bash
/etc/init.d/perseo stop
```

### How to check service status

#### Checking the process is running

The status of the process can be retrieved using the service command:

```bash
service perseo status
```

It also can be checked with ps, using a filter with the command name:

```bash
ps -ef | grep "bin/perseo"
```

In both cases a result of 0 (echoing $?) indicates the process is supposed to be running, and an error otherwise.

#### Checking that the port is listening

The following command:

```bash
netstat -ntpl | grep 9090
```

can be used to check the process is listening in the appropriate port (provided the port is the standard 9090). The
result should resemble this line:

```text
tcp   0   0  0.0.0.0:1026     0.0.0.0:*   LISTEN   12179/node
```

### Database aspects

Perseo FE uses MongoDB for persistence (have a look to the [data models](models.md) document for more detail regarding
how the data in the DB is structured). Perseo FE supports both standalone and replica set configurations for the DB.

At startup time, Perseo tries to connect to CB. If this connection fails, then Perseo will decline to run and log a
`FATAL` error pointing out the problem with DB.

At runtime the connection to DB is managed by the driver. The driver keeps a buffer of operations waiting for
connection. There is a limit for that buffer, established by the `checkDB.bufferMaxEntries` configuration parameter.
Thus, if a connection problem persist, then the buffer size will eventually overpass the limit (all the operations
waiting in the buffer will result in error in this case). In addition, an DB alarm at `ERROR` level is traced in the
logs.

Moreover, in standalone mode (and _not_ in replica set mode) the driver also use a couple of parameters:
`checkDB.reconnectTries` and `checkDB.reconnectInterval` to manage DB connections retries in the case of connection
problems. If the connection to the server fails in this case, then the driver will try to reconnect as many times as
`reconnectTries`, waiting `reconnectInterval` between attemps. Overpassed the limit, Perseo will end with `FATAL` error
log in the traces (as it does when connection fails at startup time).

Finally, note that perseo does periodical pings to DB in order to check if it is active. The pinging period is
configured with the `checkDB.delay` parameter. This is a measure to "stimulate" the connection with DB and early
discover possible connection problems. Even in the case of no other operations (i.e. Perseo is idle) the ping will
accumulate in the buffer, eventually overpassing `checkDB.bufferMaxEntries` and raising the DB alarm.

In a DB alarm situation, the ping operation also allows to release the alarm, once the DB connection is OK again.

The different configuration parameters introduced above are described also in the
[configuration document](configuration.md).

### How to subscribe to Context Broker

([Orion](https://github.com/telefonicaid/fiware-orion) has detailed documentation) In the example below,

-   ‘reference’ should be the perseo's IP and port
-   ‘condValues’ a list of the attributes of the entity used in rules. In a future release of Orion (Context Broker)
    will be possible to subscribe to changes in any attribute, but in the current version, they must be specified
-   'orion-machine:1026' should be substituted by the actual Context Broker's IP and port
-   'service' is the service associated to the subscription
-   'subservice' is the subservice associated to the subscription

```bash
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
