# Perseo Context-Aware CEP Admin Guide

## Deployment of Perseo

Perseo can be built and installed directly from sources, but we strongly recommend deploying it using
[Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).

If you need to install Docker, refer to the [Docker Installation](https://docs.docker.com/engine/installation/) web
page. Then, checkout the docker-compose [install documentation](https://docs.docker.com/compose/install/) to install it
if you don't already have.

You can check if it works by running the following shell commands:

```text
# Docker
docker --version

# docker-compose
docker-compose --version
```

Just in case, if you don't want Docker, take into account that Perseo CEP is a standard
[Node.js](https://nodejs.org/es/) application and does not require more dependencies than the _Node.js interpreter_ and
the [NPM](https://www.npmjs.com/) package utility.

A [MongoDB](https://www.mongodb.com/) database should be working and accesible in order for Perseo to be started.

### Using docker-compose

If you want to quickly deploy all the Perseo CEP components to start experimenting ASAP, do the following:

-   Download (or create locally) a copy of this
    [docker-compose.yml](https://github.com/telefonicaid/perseo-fe/blob/master/docker-compose.yml) file.

```yml
version: '3.4'
services:
    perseo-mongo:
        image: mongo:4.2
        volumes:
            - ./mongodata:/data/db
        networks:
            - perseo
        deploy:
            replicas: 1
            restart_policy:
                condition: on-failure
    perseo-core:
        image: fiware/perseo-core
        environment:
            - PERSEO_FE_URL=http://perseo-fe:9090
            - MAX_AGE=6000
        networks:
            - perseo
        depends_on:
            - perseo-mongo
        deploy:
            replicas: 1
            restart_policy:
                condition: on-failure
    perseo-fe:
        image: fiware/perseo
        networks:
            perseo:
            main:
        ports:
            - 9090:9090
        depends_on:
            - perseo-core
        environment:
            - PERSEO_MONGO_ENDPOINT=perseo-mongo
            - PERSEO_CORE_URL=http://perseo-core:8080
            - PERSEO_LOG_LEVEL=debug
            - PERSEO_ORION_URL=http://orion:1026/
        deploy:
            replicas: 1
            restart_policy:
                condition: on-failure

networks:
    perseo:
    main:
```

-   Then start it up:

```bash
# same path were you have placed the docker-compose.yml
docker-compose up -d
```

-   After a while, check that all containers are running (up):

```bash
docker ps
```

-   Now you're ready to use Perseo as instructed in the [User & Programmer Manual](../user/index.md).

-   When you are done experimenting, remember to teardown the compose.

```bash
docker-compose down -v
```

#### Reuse External Orion Instance

Previous `docker-compose` assumes you already have Orion running somewhere else and you just want to deploy Perseo.
However, you can easily add the definition of the `orion:` and `orion-mongo:` services in the `docker-compose.yml` file.
You will also need to change the references to them in the `environment:` section of the `perseo-fe` service.

### Service Environment Variables

Perseo service can be configured using the following environment variables. Keep in mind that `perseo-fe` and
`perseo-core` services need to be configured with different variables. The variables marked with ✅ are mandatory.

You can see an example of using some of the environment variables in this
[docker-compose.yml](<(../../docker-compose.yml)>)

#### perseo-fe

| Environment variable       | Default Value | Description                                                                                                                                                                     |
| :------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PERSEO_ENDPOINT_HOST`     |               | Host where the CEP will listen to.                                                                                                                                              |
| `PERSEO_ENDPOINT_PORT`     |               | Port where the CEP will listen to.                                                                                                                                              |
| `PERSEO_MONGO_ENDPOINT`✅  |               | Endpoint (host[:port]) list for Mongo DB.                                                                                                                                       |
| `PERSEO_MONGO_REPLICASET`  |               | ReplicaSet name for Mongo DB.                                                                                                                                                   |
| `PERSEO_MONGO_AUTH_SOURCE` |               | The database name associated with the user's credentials for Mongo DB, see https://docs.mongodb.com/manual/reference/connection-string/#mongodb-urioption-urioption.authSource. |
| `PERSEO_MONGO_USER`        |               | User for Mongo DB.                                                                                                                                                              |
| `PERSEO_MONGO_PASSWORD`    |               | Password for Mongo DB.                                                                                                                                                          |
| `PERSEO_CORE_URL`✅        |               | URL where Perseo Core is listening (e.g: http://host_or_ip:port).                                                                                                               |
| `PERSEO_NEXT_URL`          |               | URL where Perseo Core replicated node is listening.                                                                                                                             |
| `PERSEO_ORION_URL`✅       |               | URL of the Orion Context Broker.                                                                                                                                                |
| `PERSEO_LOG_LEVEL`         |               | Log level.                                                                                                                                                                      |
| `PERSEO_SMTP_HOST`         |               | Host of the SMTP server                                                                                                                                                         |
| `PERSEO_SMTP_PORT`         |               | Port of the SMTP server                                                                                                                                                         |
| `PERSEO_SMTP_VERIFY_CA`    | `false`       | `true` if self-signed or invalid TLS certificate should be rejected                                                                                                             |
| `PERSEO_SMTP_SECURE`       | `false`       | `true` if SSL should be used with the SMTP server                                                                                                                               |
| `PERSEO_SMTP_AUTH_USER`    |               | Authentication data, the username                                                                                                                                               |
| `PERSEO_SMTP_AUTH_PASS`    |               | Authentication data, the user password                                                                                                                                          |
| `PERSEO_NOTICES_PATH`      | `'/notices'`  | Path for incoming notices                                                                                                                                                       |
| `PERSEO_RULES_PATH`        | `'/rules'`    | Path for incoming rules                                                                                                                                                         |

-   For legacy SMS and SMPP support, please refer to [this file](configuration.md).

#### perseo-core

| Variable          | Default Value | Description                                         |
| ----------------- | ------------- | --------------------------------------------------- |
| `PERSEO_FE_URL`✅ |               | URL where `perseo-fe` listens to.                   |
| `MAX_AGE`         | 60000         | Expiration time for dangling rules in milliseconds. |
