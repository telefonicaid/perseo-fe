__author__ = 'Jon'

from dict2xml import dict2xml


class ContextElement(object):
    def __init__(self, ce_id, ce_type, is_pattern=False):
        self.context_element = {
            'attributes': [],
            'type': ce_type,
            'isPattern': is_pattern,
            'id': ce_id
        }

    def add_attribute(self, name, attr_type, value):
        self.context_element['attributes'].append({
            'name': name,
            'type': attr_type,
            'value': value
        })

    def get_context_element(self):
        return self.context_element


class NotificationsUtils(object):
    """
    {
      "subscriptionId" : "51c0ac9ed714fb3b37d7d5a8",
      "originator" : "localhost",
      "contextResponses" : [
        {
          "contextElement" : {
            "attributes" : [
              {
                "name" : "temperature",
                "type" : "float",
                "value" : "26.5"
              }
            ],
            "type" : "Room",
            "isPattern" : "false",
            "id" : "Room1"
          },
          "statusCode" : {
            "code" : "200",
            "reasonPhrase" : "OK"
          }
        }
      ]
    }
    """

    def __init__(self, subscription_id, originator):
        self.notification = {
            'subscriptionId': subscription_id,
            'originator': originator,
            'contextResponses': []
        }

    def add_context_response(self, context_element, code=200, reason_phrase="OK"):
        self.notification['contextResponses'].append({'contextElement': context_element,
                                                      'statusCode': {
                                                          'code': code,
                                                          'reasonPhrase': reason_phrase
                                                      }
                                                      })

    def get_notification_payload(self):
        return self.notification

    def get_notification_xml_payload(self):
        return dict2xml(self.notification)