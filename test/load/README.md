# PERSEO Performance Tests

This is the Jmeter scripts repository for the Perseo, used for Performance tests.

#### Pre-conditions:
	
* "Jmeter" app exists in Launcher VM
* "ServerAgent" app exist in Launcher , in Perseo Nodes and Balancer (only in cluster case) 
* have a account in Loadosophia - (http://loadosophia.org)
* "nginx" app exists in Balancer VM (only in cluster case)
* Verify nginx configuration for each scenario (only in cluster case)

#### Pre-steps:

* Launch "ServerAgent" in Balancer and each Perseo Nodes 
```
nohup sh startAgent.sh --udp-port 0 --tcp-port 3450 &
```

#### Scripts:

**CEP_GenRules_v1.0.jmx**: implemented to generate Rules previously. We can to create sms action, email, action, update action and post action:

> **Scenario**:
```
		*  Append rule - sms action
		*  Append rule - email action 
		*  Append rule - update action
		*  Append rule - post action		
```	
>**Properties**:
``` 
		* HOST_CEP     - IP or hostname of Perseo Node (in case of clusters is Nginx)  (127.0.0.1 by default)	
		* PORT_CEP     - port used by Perseo (9090 by default)
		* ITERATIONS   - number of rules in each thread (1 by default)
		* THREADS      - number of concurrent threads (1 by default) 
        * TENANT       - tenant or service in header (unknownt by default) 	
	    * SERVICE_PATH - sub service or service path in header (/ by default) 
		* SMS          - configurate if the sms action rules are created (TRUE by default) 
		* EMAIL        - configurate if the email action rules are created (TRUE by default) 
		* UPDATE       - configurate if the update action rules are created (TRUE by default) 
		* POST         - configurate if the post action rules are created (TRUE by default) 
	Note: Rules total = THREADS * ITERATIONS 	
``` 	

>**example**:
```
<jmeter_path>/jmeter.sh -n -t <scripts_path>/CEP_GenRules_v1.0.jmx -JHOST_CEP="X.X.X.X" -JTHREADS=1 -JITERATIONS=1 -JPOST="FALSE" > <log_path>/RULES_perseo_`date +%FT%T`.log
```

**CEP_PerfomTest_v1.0.jmx**: implemented to generate Notifications as Context Broker:

> **Scenario**:
```
		*  Notification - JSON	
```	
>**Properties**:
``` 
		* HOST_CEP     - IP or hostname of Perseo Node (in case of clusters is Nginx)  (127.0.0.1 by default)	
		* PORT_CEP     - port used by Perseo (9090 by default)
		* ITERATIONS   - number of rules in each thread (1 by default)
		* THREADS      - number of concurrent threads (1 by default) 
        * TENANT       - tenant or service in header (unknownt by default) 	
	    * SERVICE_PATH - sub service or service path in header (/ by default) 		
	Note: Notifications total = THREADS * ITERATIONS 	
``` 	

>**example**:
```
<jmeter_path>/jmeter.sh -n -t <scripts_path>/CEP_PerfomTest_v1.0.jmx -JHOST_CEP="X.X.X.X" -JTHREADS=20 -JITERATIONS=20 > <log_path>/NOTIFICATIONS_perseo_`date +%FT%T`.log
```


