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

## Features already completed

The following list contains all features that were in the roadmap and have already been implemented.

-   Support for dealing with several Context Brokers from the same Perseo instance. Add: externalCBUrl as action
    parameters for updateAction (<https://github.com/telefonicaid/perseo-fe/issues/625>)
    ([1.21.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.21.0))
-   Usage of EPL scripts beyond select statement (<https://github.com/telefonicaid/perseo-fe/issues/630>)
    ([1.21.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.21.0))
-   Enhanced multi-tenancy support. Leverage different "Fiware-Service" and "Fiware-ServicePath" in rules
    (<https://github.com/telefonicaid/perseo-fe/issues/349>)
    ([1.13.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.13.0))
-   Software quality improvement based on ISO25010 recommendations
    (<https://github.com/telefonicaid/perseo-fe/issues/428>)
    ([1.12.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.12.0))
-   Nosignal actions supported in HA scenarios
    (<https://github.com/telefonicaid/perseo-fe/issues/624>)
    ([1.12.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.12.0))
-   Full support for pagination in APIs /rules and /vrules (<https://github.com/telefonicaid/perseo-fe/issues/364>)
    ([1.10.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.10.0))
-   Support of NGSI filter to support updating to groups of entities (commands)
    (<https://github.com/telefonicaid/perseo-fe/issues/335>)
    ([1.10.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.10.0))
-   Explicit casting in EPL rules is no longer needed (full support of NGSI-v2 based typing)
    (<https://github.com/telefonicaid/perseo-fe/issues/376>)
    ([1.10.0](https://github.com/telefonicaid/perseo-fe/releases/tag/1.10.0))
-   Task/set internal timer resolution (<https://github.com/telefonicaid/perseo-core/pull/195>)
    ([Core 1.9.0](https://github.com/telefonicaid/perseo-core/releases/tag/1.9.0))
-   Upgrade to use Esper 8.4 from Exper 7.X (<https://github.com/telefonicaid/perseo-core/issues/136>)
    ([Core 1.8.0](https://github.com/telefonicaid/perseo-core/releases/tag/1.8.0))
-   Timezone support in EPL statements (<https://github.com/telefonicaid/perseo-core/pull/143>)
    ([Core 1.5.0](https://github.com/telefonicaid/perseo-core/releases/tag/1.5.0))
-   Add astronomic clock support to timed rules (included sunrise and sunset functions for EPL statements)
    (<https://github.com/telefonicaid/perseo-core/issues/130>)
    ([Core 1.4.0](https://github.com/telefonicaid/perseo-core/releases/tag/1.4.0))

