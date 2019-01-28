# Perseo CEP Roadmap

This product is an Incubated FIWARE Generic Enabler. If you would like to learn about the overall Roadmap of FIWARE, please check section "Roadmap" on the FIWARE Catalogue.

## Introduction

This section elaborates on proposed new features or tasks which are expected to be added to the product in the foreseeable future. There should be no assumption of a commitment to deliver these features on specific dates or in the order given. The development team will be doing their best to follow the proposed dates and priorities, but please bear in mind that plans to work on a given feature or task may be revised. All information is provided as a general guidelines only, and this section may be revised to provide newer information at any time.


## Short term

The following list of features are planned to be addressed in the short term, and incorporated in the next release:

-   Initial NGSIv2 support imported from the Ficodes repo.

-   Simplify rule creation by not requiring manually adding rule name inside the EPL code.

-   Support for dealing with several Context Brokers from the same Perseo instance. To do so, update actions will support to configure target context broker, if not provided such configuration, the default context broker will be used.

-   Improve template processing, extending it to StructuredValue/JSON attributes.


## Medium term

The following list of features are planned to be addressed in the medium term, typically within the subsequent release(s) generated in the next **9 months** after next planned release:

-   Include a new endpoint for manage the Context Broker subscriptions.

-   Support more Context Broker actions (create, append, appendStrict, update, delete, replace, etc) and analyse other possible operations: batch operations, operations over subscriptions, operations over registrations.


## Long term

The following list of features are proposals regarding the longer-term evolution of the product even though development of these features has not yet been scheduled for a release in the near future. Please feel free to contact us if you wish to get involved in the implementation or influence the roadmap

-   Support for geospatial analysis (geo-fencing, point-based actions, movement-based actions)

-   Enhanced multi-tenancy support. Leverage different “Fiware-Service” and “Fiware-ServicePath” in rules

