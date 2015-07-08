<a name="deployment"></a>
## Deployment

### Dependencies

The CEP is a standard Node.js app and doesn't require more dependencies than the Node.js interpreter (0.10 or higher) and the NPM package utility.

A mongoDB 2.4 database should be working and accesible before perseo can be started

### Installation using Docker

The last development version is uploaded as a Docker image to Docker Hub for every PR merged into the `develop` branch.
Perseo FE needs some components to be present event to be started. Those components can be configured using:

* Environment variables, as in the following example:
```
docker run -e "PERSEO_MONGO_HOST=127.0.0.1" -e "PERSEO_CORE_URL=http://127.0.0.1:8080" fiwareiotplatform/perseocore
```

* Or links to other docker images running in the same docker host, as in the following example:
```
docker run --link corehost:corehost --link mongodb:mongodb fiwareiotplatform/perseocore
```

### Installation from RPM

This project provides the specs to create the RPM Package for the project, that may (in the future) be installed in a
package repository.

To generate the RPM, checkout the project to a machine with the RPM Build Tools installed, and, from the `rpm/` folder,
execute the following command:

```
./create-rpm.sh 0.1 1
```

The create-rpm.sh script uses the following parameters:

* CEP version (0.1 in the example above), which is the base version of the software
* CEP release (1 in the example above), tipically set with the commit number corresponding to the RPM.

This command will generate some folders, including one called RPMS, holding the RPM created for every architecture
(x86_64 is currently generated).

In order to install the generated RPM from the local file, use the following command:

```
yum --nogpgcheck localinstall  perseo-cep-0.1-1.x86_64.rpm
```

It should automatically download all the dependencies provided they are available (Node.js and NPM may require the
EPEL repositories to be added).

The RPM package can also be deployed in a artifact repository and the installed using:

```
yum install perseo-cep
```

NOTE: Perseo CEP Core is not installed as part of the dependencies in the RPM, so the URL of an existing Perseo Core
must be provided and configured for Perseo to work properly.

#### Activate service
The perseo service is disabled once its installed. In order to enable it, use the following command:
```
service perseo start
```

### Installation from Sources
#### Installation

Just checkout this directory and install the Node.js dependencies using:

```
npm install --production
```

The CEP should be then ready to be configured and used.

#### Undeployment
In order to undeploy the proxy just kill the process and remove the directory.


### Log Rotation
Independently of how the service is installed, the log files will need an external rotation (e.g.: the logrotate command) to avoid disk full problems.

Logrotate is installed as RPM dependency along with perseo. The system is configured to rotate every day and whenever the log file size is greater than 100MB (checked very 30 minutes by default):
* For daily rotation: /etc/logrotate.d/logrotate-perseo-daily: which enables daily log rotation
* For size-based rotation:
	* /etc/sysconfig/logrotate-perseo-size: in addition to the previous rotation, this file ensures log rotation if the log file grows beyond a given threshold (100 MB by default)
	* /etc/cron.d/cron-logrotate-perseo-size: which ensures the execution of etc/sysconfig/logrotate-perseo-size at a regular frecuency (default is 30 minutes)
