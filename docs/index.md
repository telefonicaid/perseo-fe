# Perseo Context-Aware CEP

Perseo is an [Esper-based](http://www.espertech.com/esper/) Complex Event Processing (CEP) software designed to be fully
_NGSI-v2_-compliant. It uses NGSI-v2 as the communication protocol for events, and thus, Perseo is able to seamless and
jointly work with _context brokers_ such as [Orion Context Broker](https://github.com/telefonicaid/fiware-orion).

![Perseo Components](images/PerseoComponents.png)

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

This project is part of [FIWARE](https://www.fiware.org). You can find more FIWARE components in the
[FIWARE catalogue](https://catalogue.fiware.org).
