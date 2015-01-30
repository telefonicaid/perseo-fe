## Mocks for Perseo

Mocks are simulated requests that mimic the behavior of real requests in controlled ways.
This mock is used to simulate a behaviour of email client (smtp), sms client (smpp), an update context to Context Broker and send by API REST the content received (http)

#### Usage:

```
    ****************************************************************************************"
    * This mock is used to simulate a behaviour of email client (smtp), sms client (smpp),  *
    * an update context to Context Broker and send by API REST the content received (http). *
    * Keep a counter for each action (sms, email, update, post and twitter).                *
    *                                                                                       *
    *  usage: python perseo_mock.py <-u> <-sp=port> <-hp=port> <-i>                         *
    *           ex: python perseo_mock.py -sp=9999 -hp=9998 -i                              *
    *  parameters:                                                                          *
    *         -u: show this usage.                                                          *
    *         -h: help to request into the mock.                                            *
    *        -sp: change smtp port (by default is 9999).                                    *
    *        -hp: change http port (by default is 9998).                                    *
    *         -i: show more info in console (by default is False).                          *
    *                                                                                       *
    *  Comments:                                                                            *
    *         In More Info: show Message addressed from and data.                           *
    *                                                                                       *
    *                                ( use <Ctrl-C> to stop )                               *
    *****************************************************************************************
```

#### API Rest requests:

GET

``` 
     1 - GET - http://<mock_host>:<http_port>/get/email
	     response: <200> Last email received

	Received data:

	  smtp_peer: host from where is was sent and id of email
	  smtp_mailfrom: email address from where is was sent
	  smtp_rcpttos: list of email addresses where to send
	  smtp_data: email data content

```
```
     2 - GET - http://<mock_host>:<http_port>/get/sms
	     response: <200> Last sms received

	Received data:

	  to: list of mobile numbers where to send
	  message: sms data content
```

```
     3 - GET - http://<mock_host>:<http_port>/get/update
	     response: <200> Last update in Context Broker received

	Received data:

      contextElements:
         type: indicates the type of content entity
         isPattern: indicates whether the entity Id is a pattern or an Id
         id: identifier of the context entity
         attributes:
            name:  attribute name
            type:  attribute type
            value: attribute value
      updateAction: indicates the type of action that is performed within the update operation
```

``
     4 - GET - http://<mock_host>:<http_port>/get/post
	     response: <200> Last post action received

	Received data:

	  template: post action template content
```


SEND

```
     1 - POST - http://<mock_host>:<http_port>/send/sms
	     response: <200> send a new sms to http server

```

```
     2 - POST - http://<mock_host>:<http_port>/send/update
	     response: <200> send a new update in Context Broker to http server

```

```
     3 - POST - http://<mock_host>:<http_port>/send/post
	     response: <200> send a new post action to http server

```

RESET

```
     1 - PUT - http://<mock_host>:<http_port>/reset/sms
	     response: <200> reset counter to sms received

```

```
     2 - PUT - http://<mock_host>:<http_port>/reset/email
	     response: <200> reset counter to emails received

```

```
     3 - PUT - http://<mock_host>:<http_port>/reset/update
	     response: <200> reset counter to updated sent

```

```
     4 - PUT - http://<mock_host>:<http_port>/reset/post
	     response: <200> reset counter to post action sent

```

COUNTER

```
     1 - GET - http://<mock_host>:<http_port>/counter/sms
	     response: <200> get number of sms received after last reset

```

```
    2 - GET - http://<mock_host>:<http_port>/counter/email
	     response: <200> get number of email received after last res

```

```
    3 - GET - http://<mock_host>:<http_port>/counter/update
	     response: <200> get number of updates sent after last reset

```

```
    4 - GET - http://<mock_host>:<http_port>/counter/post
	     response: <200> get number of post action sent after last reset

```


We recommend to change in `config.js`

```
    config.smtp = {
        port : <smtp port>,
        host : '<mock host>'
    };
```

```
    config.sms = {
        URL : 'http://<mock host>:<http port>/send/sms',
        API_KEY : '',
        API_SECRET: ''
    };
```

```
   config.orion = {
    URL : 'http://<mock host>:<http port>/send/update'
};
```