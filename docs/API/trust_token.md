### Full Trust Token Flow:

Given the following keystone ids:

- project id: 0984fc0e319c4b3d8b9d9f5e441eca1e
- adm1: 6669270e8a2b45d5b984b7df6f352294
- smartcity: d6a6e375072045fca4b9ebcadb6edded
- token: gAAAAABheRNWN_hK1h7COoLylc99j8iPhoSUfsZ7_r-kSlhhp5chRpWxh0Aa6NBmERaEIF9s83NGN1nsD1oA2LNHtImmRD9mK3ZwoceiPvcX8fQYOIyLQ3MNYc1MFgefodz0VGRsaduDv9bFaim18FGbFga3nAGJ_YBQorBDtMn8waAorLD78ufmxg0DrCUWyhvUM80K0db
- pep: 1e15e74598b34f5790dbe3fbad45d939

#### Request a trust token:

```
curl -s \
-H "X-Auth-Token: gAAAAABheRWS1YKGbxeRmOU-vk3oIrmTGK4OQXIhmhRpXgrOY6RzdSlYIyFJJbJEsV1hU528trOY3ls0dpvwWJqEFlqT5rnJhAjbDYAvbjYWMfcMRxXR5qtO3ER1YiuCDlsdQozX2Gl7OiYHE2g0S97qRKvaBC1qNoVMb2KyxDyIfJlwkJmpbfdEXxMeFKTMRFtiOa73BTIP" \
-H "Content-Type: application/json" \
-d '
{ "trust": {
"impersonation": false,
"project_id": "0984fc0e319c4b3d8b9d9f5e441eca1e",
"roles": [
{ "name": "d6a6e375072045fca4b9ebcadb6edded#SubServiceAdmin" }
],
"trustee_user_id": "1e15e74598b34f5790dbe3fbad45d939",
"trustor_user_id": "6669270e8a2b45d5b984b7df6f352294"
}}'\
"http://localhost:5001/v3/OS-TRUST/trusts" | python -mjson.tool
```

Response
```
{
"trust": {
"deleted_at": null,
"expires_at": null,
"id": "6a263aa4e9e3467d8c3ab0a2bd03ad41",
"impersonation": false,
"links": {
"self": "http://localhost:5001/v3/OS-TRUST/trusts/6a263aa4e9e3467d8c3ab0a2bd03ad41"
},
"project_id": "0984fc0e319c4b3d8b9d9f5e441eca1e",
"redelegation_count": 0,
"remaining_uses": null,
"roles": [
{
"description": null,
"domain_id": null,
"id": "1cdf14507157494c9ac58ecea0f1ed84",
"links": {
"self": "http://localhost:5001/v3/roles/1cdf14507157494c9ac58ecea0f1ed84"
},
"name": "d6a6e375072045fca4b9ebcadb6edded#SubServiceAdmin"
}
],
"roles_links": {
"next": null,
"previous": null,
"self": "http://localhost:5001/v3/6a263aa4e9e3467d8c3ab0a2bd03ad41/roles"
},
"trustee_user_id": "1e15e74598b34f5790dbe3fbad45d939",
"trustor_user_id": "6669270e8a2b45d5b984b7df6f352294"
}
}
```


### Request Token using trust id (done by PEP internally using trust and `pep` user):

```
curl -i -s \
-H "Content-Type: application/json" \
-d '
{ "auth": {
"identity": {
"methods": ["password"],
"password": {
"user": {
"domain": {
"name": "admin_domain"
},
"name": "pep",
"password": "PWD"
}
}
},
"scope": {
"OS-TRUST:trust" : {
"id": "6a263aa4e9e3467d8c3ab0a2bd03ad41"
}
}
}
}'\
"http://localhost:5001/v3/auth/tokens"
```

Response (a keystone token):
```
X-Subject-Token: gAAAAABheRtZG6styyO2uSsJbXKF7b6B5lSlJN8kvR6FpqgJOBleAAvL9jnxtAoRXOKkmtfqsIyvRUjh_qrJvUaYIkJUdg8ek2FBFNuiZPh1Eo1TJ1M6SxO-zZojVd_iI3EJA2g7pZm8mhxDjYUpKITmZopgR91n5JMZg5-8Gcw7h0u9cFj2OZZJZ9pUfzaDycS5os9O0V9d
```
