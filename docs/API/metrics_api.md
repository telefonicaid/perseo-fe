## <a name="top"></a>Metrics API

-   [Introduction](#introduction)
-   [Operations](#operations)
    -   [Get metrics](#get-metrics)
    -   [Reset metrics](#reset-metrics)
    -   [Get and reset](#get-and-reset)
-   [Metrics](#metrics)

### Introduction

Perseo implements a REST-based API that can be used to get relevant operational metrics.

[Top](#top)

### Operations

#### Get metrics

```text
GET /admin/metrics
```

The response payload is a multi-level JSON tree storing the information in an structured way. This structure is based on
service and subservice (sometimesrefered to as "service path"). At any point of the tree, the value of a key could be
`{}` to mean that there isn't actual information associated to that key.

At the first level there are two keys: **services** and **sum**. In sequence, **services** value is an object whose keys
are service names and whose values are objects with information about the corresponding service. The **sum** value is an
object with information for the aggregated information for all services.

```json
{
  "services": {
    "service1": <service 1 info>,
    "service2": <service 2 info>,
    ...
    "serviceN": <service N info>
  },
  "sum": <aggregated info for all services>
}
```

Regarding service information objects, they use two keys: **subservs** and **sum**. In sequence, **subservs** value is
an object whose keys are subservice names and whose values are objects with information about the corresponding
subservice. The **sum** value is an object with information for the aggregated information for all subservices in the
given services.

```json
{
  "subservs": {
    "subservice1": <subservice 1 info>,
    "subservice2": <subservice 2 info>,
    ...
    "subserviceN": <subservice N info>
  },
  "sum": <aggregated info for all subservice in the given service>
}
```

Subservice names in the above structure are shown without the initial slash. E.g. if the subservice name is (as used in
the `Fiware-ServicePath` header) `/gardens` then the key used for it would be `gardens` (without `/`).

Regarding subservice information object, keys are the name of the different metrics.

```json
{
  "metric1": <metric 1>,
  "metric2": <metric 2>,
  ...
  "metricN": <metric N>
}
```

The list of metrics is provided in [metrics section](#metrics).

Some additional remarks:

-   Requests corresponding to invalid services or subservices are not included in the payload (i.e. their associated
    metrics are just ignored).

[Top](#top)

#### Reset metrics

```text
DELETE /admin/metrics
```

This operation resets all metrics, as if Perseo would had just been started.

[Top](#top)

#### Get and reset

```text
GET /admin/metrics?reset=true
```

This operation (in fact, a variant of [get metrics](#get-metrics)) get results and, at the same time in an atomical way,
resets metrics.

[Top](#top)

### Metrics

The following metrics are common with other IoT platform componentes (e.g. Orion Contex Broker):

-   **incomingTransactions**: number of requests consumed by Perseo. All kind of transactions (no matter if they are ok
    transactions or error transactions) count for this metric.
-   **incomingTransactionRequestSize**: total size (bytes) in requests associated to incoming transactions ("in" from
    the point of view of Perseo). All kind of transactions (no matter if they are OK transactions or error transactions)
    count for this metric.
-   **incomingTransactionResponseSize**: total size (bytes) in responses associated to incoming transactions ("out" from
    the point of view of Perseo). All kind of transactions (no matter if they are OK transactions or error transactions)
    count for this metric.
-   **incomingTransactionErrors**: number of incoming transactions resulting in error.
-   **serviceTime**: average time to serve a transaction. All kind of transactions (no matter if they are ok
    transactions or error transactions) count for this metric.
-   **outgoingTransactions**: number of requests sent by Perseo (both notifications and forward requests to CPrs). All
    kind of transactions (no matter if they are OK transactions or error transactions) count for this metric.
-   **outgoingTransactionRequestSize**: total size (bytes) in requests associated to outgoing transactions ("out" from
    the point of view of Perseo). All kind of transactions (no matter if they are OK transactions or error transactions)
    count for this metric.
-   **outgoingTransactionResponseSize**: total size (bytes) in responses associated to outgoing transactions ("in" from
    the point of view of Perseo). All kind of transactions (no matter if they are OK transactions or error transactions)
    count for this metric.
-   **outgoingTransactionErrors**: number of outgoing transactions resulting in error.

The following metrics are used only by Perseo:

-   Notifications received from CB
    -   **notifications**: total notifications
    -   **okNotifications**: invalid notifications
    -   **failedNotifications**: valid notifications
-   rules creation operation
    -   **ruleCreation**: number of rule creation operations
    -   **okRuleCreation**: number of successful rule creation operations
    -   **failedRuleCreation**: number of unsuccessful rule creation operations
-   rules deletion operation
    -   **ruleDeletion**: number of rule deletion operations
    -   **okRuleDeletion**: number of successful rule deletion operations
    -   **failedRuleDeletion**: number of unsuccessful rule deletion operations
-   rules update operation
    -   **ruleUpdate**: number of rule update operations
    -   **okRuleUpdate**: number of successful rule update operations
    -   **failedRuleUpdate**: number of unsuccessful rule update operations
-   **firedRules**: rules fired: number of fired rules
-   actions executed (per action type and total) successfully, that is:
    -   **okActionEntityUpdate**
    -   **okActionSms**
    -   **okActionEmail**
    -   **okActionHttpPost**
    -   **okActionTwitter**
-   actions executed (per action type and total) with failure, that is:
    -   **failedActionEntityUpdate**
    -   **failedActionSms**
    -   **failedActionEmail**
    -   **failedActionHttpPost**
    -   **failedActionTwitter**

[Top](#top)
