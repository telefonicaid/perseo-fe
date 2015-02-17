# PERSEO Acceptance Tests

Folder for acceptance tests of Perseo.

## How to Run the Acceptance Tests

### Prerequisites:

- Python 2.6 or newer
- pip installed (http://docs.python-guide.org/en/latest/starting/install/linux/)
- virtualenv installed (pip install virtualenv) (optional).
Note: We recommend the use of virtualenv, because is an isolated working copy of Python which allows you to work on a specific project without worry of affecting other projects.

##### Environment preparation:

- If you are going to use a virtual environment (optional):
  * Create a virtual environment somewhere, e.g. in ~/venv (virtualenv ~/venv) (optional)
  * Activate the virtual environment (source ~/venv/bin/activate) (optional)
- Both if you are using a virtual environment or not:
  * Change to the test/acceptance folder of the project.
  * Install the requirements for the acceptance tests in the virtual environment
     ```
     pip install -r requirements.txt --allow-all-external
     ```
  * Verify if  xmltodict, httplib2 and requests libraries are installed, if not are installed:
     ```
     pip install xmltodict httplib2 requests
     ```

##### Requeriments for mongoDB

-  pip install pymongo

### Use of mock
we recommend the use of mock for this acceptance test plan
```
  copy in local the mock folder (test/mock)
  execution:
     ./perseo_mock.py -u       --> show the usage or see README.md in test/mock
```

### Tests execution:

- Change to the test/acceptance folder of the project if not already on it.
- Rename properties.json.base to properties.json and replace values.
- Run lettuce_tools (see available params with the -h option).

```
Some examples:
   lettuce_tools                                   -- run all features
   lettuce_tools -ft ckan_row.feature              -- run only one feature
   lettuce_tools -tg test -ft ckan_row.feature     -- run scenarios tagged with "test" in a feature
   lettuce_tools -tg=-skip -ft ckan_row.feature    -- run all scenarios except tagged with "skip" in a feature
```

### Tests Coverage (features):

- epl_create_rules.
- epl_read_rules.
- epl_delete_rules.
- card_create_rules.
- card_read_rules.
- card_delete_rules.
- card_update_rules.
- notification_epl.
- notification_cards.

### properties.json
- environment
    * name: name of product tested.
    * logs_path: folder name to logs.

- cep
    * cep_url: protocol, host and port used to connect to perseo (endpoint).
    * cep_send_sms_url: protocol, host and port used to receive sms actions (endpoint).
    * cep_send_email_url: protocol, host and port used to receive email actions (endpoint).
    * cep_send_update_url: protocol, host and port used to receive update actions (endpoint).
    * cep_rule_post_url: protocol, host and port used to receive post actions (endpoint).
    * cep_version: perseo version installed
    * cep_rule_name_default: rule name by "default" value
    * cep_service_path_default: service path by "default" value
    * cep_tenant_default: tenant by "default" value
    * cep_identity_type: identity type by "default" value
    * cep_identity_id: identity id by "default" value
    * cep_attribute_number_default: number of attributes in rule
    * cep_rules_number_default: number of rule
    * cep_epl_attribute_data_type: data type in epl
    * cep_epl_operation: operator in epl
    * cep_epl_value: value in epl
    * cep_retries_received_in_mock: number of retries to get counter values
    * cep_delay_to_retry: time to delay in each retry


### tags

You can to use multiples tags in each scenario, possibles tags used:

    - happy_path, skip, errors_40x, etc

and to filter scenarios by these tags: see Tests execution section.

