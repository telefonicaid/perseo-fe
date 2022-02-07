### Full Trust Token Flow:

This flow explains how a user `adm1` gives permisson to another user `pep` just for a subservice.

Given the following keystone ids:

- domain_id: `d6a6e375072045fca4b9ebcadb6edded` (service named smartcity)
- project_id: `0984fc0e319c4b3d8b9d9f5e441eca1e` (subservice)
- user `adm1` id:: `6669270e8a2b45d5b984b7df6f352294` (user `adm1` belongs to service `smartcity`)
- role name: `d6a6e375072045fca4b9ebcadb6edded#SubServiceAdmin` (role of user `adm1` in subsrvice)
- token of `adm1` in project_id: `gAAAAABheRNWN_hK1h7COoLylc99j8iPhoSUfsZ7_r`
- user `pep` id: 1e15e74598b34f5790dbe3fbad45d939 (user `pep` belongs to service `admin_domain`)

#### Request a trust token:

```
curl -s \
-H "X-Auth-Token: gAAAAABheRNWN_hK1h7COoLylc99j8iPhoSUfsZ7_r" \
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
X-Subject-Token: gAAAAABheRtZG6styyO2uSsJbXKF7b6B5l
```
