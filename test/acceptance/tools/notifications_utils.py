__author__ = 'Jon'

from dict2xml import dict2xml


class ContextElement(object):
    """
    Class that represent a Context Broker context element
    """
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
    Class that represent a Context Broker notification
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
        """
        Initialize the notification from Context Broker
        :param subscription_id:
        :param originator:
        :return:
        """
        self.notification = {
            'subscriptionId': subscription_id,
            'originator': originator,
            'contextResponses': []
        }

    def add_context_response(self, context_element, code=200, reason_phrase="OK"):
        """
        Given a context element created before, built a response and add to the notification
        :param context_element:
        :param code:
        :param reason_phrase:
        :return:
        """
        self.notification['contextResponses'].append({'contextElement': context_element.get_context_element(),
                                                      'statusCode': {
                                                          'code': code,
                                                          'reasonPhrase': reason_phrase
                                                      }
                                                      })

    def get_notification_payload(self):
        """
        Get the notification built
        :return:
        """
        return self.notification

    def get_notification_xml_payload(self):
        """
        Get the notification built in xml format
        """
        return dict2xml(self.notification)