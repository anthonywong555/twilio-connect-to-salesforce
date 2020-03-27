# twilio-connect-to-salesforce

This code sample is a redux of Twilio Connect to Salesforce.

Go to [Functions - Configure](https://www.twilio.com/console/functions/configure)

Add the following node modules:
- axios
- querystring
- moment

Add the following Environmental Variables:

| KEY                             	| VALUE                                        	|
|---------------------------------	|----------------------------------------------	|
| SF_CONSUMER_KEY                 	|                                              	|
| SF_CONSUMER_SECRET              	|                                              	|
| SF_IS_SANDBOX                   	| true / false                                 	|
| SF_NAME_SPACE                   	| TwilioSF__                                   	|
| SF_PASSWORD                     	|                                              	|
| SF_SYNC_KEY                     	| SFDC_AUTH                                    	|
| SF_TOKEN                        	|                                              	|
| [SF_TTL](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart_oauth.htm)                          	| (In seconds. You can leave '900' as default) 	|
| SF_USERNAME                     	|                                              	|
| SF_USE_NAME_SPACE               	| true / false                                 	|
| [TWILIO_SYNC_DEFAULT_SERVICE_SID](https://www.twilio.com/console/sync/services) 	| ISXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          	|

Go to [Functions - Manage](https://www.twilio.com/console/functions/manage)

Import the **twilio-connect-to-salesforce.js** as Twilio Function.

# Changelog

## [1.0.0] - March 27, 2020

Ability to store the access_token in twilio sync.