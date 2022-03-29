# Perseo CEP Roadmap

This product is an Incubated FIWARE Generic Enabler. If you would like to learn about the overall Roadmap of FIWARE,
please check section "Roadmap" on the FIWARE Catalogue.

## Introduction

This section elaborates on proposed new features or tasks which are expected to be added to the product in the
foreseeable future. There should be no assumption of a commitment to deliver these features on specific dates or in the
order given. The development team will be doing their best to follow the proposed dates and priorities, but please bear
in mind that plans to work on a given feature or task may be revised. All information is provided as a general
guidelines only, and this section may be revised to provide newer information at any time.

Disclaimer:

-   This section has been last updated in March 2022. Please take into account its content could be obsolete.
-   Note we develop this software in Agile way, so development plan is continuously under review. Thus, this roadmap has
    to be understood as rough plan of features to be done along time which is fully valid only at the time of writing
    it. This roadmap has not be understood as a commitment on features and/or dates.
-   Some of the roadmap items may be implemented by external community developers, out of the scope of GE owners. Thus,
    the moment in which these features will be finalized cannot be assured.

## Short term

The following list of features are planned to be addressed in the short term, and incorporated in the next release:

-   Swagger documentation
-   Upgrade Esper to 8.8

## Medium term

The following list of features are planned to be addressed in the medium term, typically within the subsequent
release(s) generated in the next **9 months** after next planned release:

-   Rule scope beyond subservice: support dynamic creation of EPL context associated to notification path
-   Accept scripts and java snipets
-   No signal rules based in NGSIv2 API instead of MongoDB direct access #549

## Long term

The following list of features are proposals regarding the longer-term evolution of the product even though development
of these features has not yet been scheduled for a release in the near future. Please feel free to contact us if you
wish to get involved in the implementation or influence the roadmap

-   Support for geospatial analysis (geo-fencing, point-based actions, movement-based actions)
-   Rule templates (i.e. having a rule template that can be instantiated to create particular instances of the rule).
    The idea is be able to create complex rules only providing some parameters.
-   Include AI models as part of the rule (condition).

## Done

-   Full support for pagination in APIs /rules and /vrules #364
-   "nosignal" actions supported in HA scenarios
-   Add astronomic clock support to timed rules (included sunrise and sunset functions for EPL statements)
-   Timezone support in EPL statements
-   Support of NGSI filter to support updating to groups of entities (commands)
-   Upgrade Esper library from 6.1.0 to 7.1.0   !Probablemente versión 8
-   Software quality improvement based on ISO25010 recommendations
-   Enhanced multi-tenancy support. Leverage different "Fiware-Service" and "Fiware-ServicePath" in rules
-   Improve template processing, extending it to StructuredValue/JSON attributes.
-   Support for dealing with several Context Brokers from the same Perseo instance. To do so, update actions will
    support to configure target context broker, if not provided such configuration, the default context broker will be
    used.
-   Usage of EPL scripts beyond select statement
-   Task/set internal timer resolution #195
