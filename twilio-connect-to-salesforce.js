//================================================================================
// Modules
//================================================================================
const axios = require('axios').default;
const querystring = require('querystring');

exports.handler = async function(context, event, callback) {
  //================================================================================
  // Context Variables
  //================================================================================

  // Are we using a sandbox or not
  const isSandbox = (context.SF_IS_SANDBOX == 'true');

  //Consumer Key from Salesforce Connected app
  const clientId = context.SF_CONSUMER_KEY;

  //Consumer Secrect from Salesforce Connected app
  const clientSecret = context.SF_CONSUMER_SECRET;

  //The salesforce username;
  const sfUserName = context.SF_USERNAME;

  //The salesforce password
  const sfPassword = context.SF_PASSWORD;

  //The salesforce user token
  const sfToken = context.SF_TOKEN;

  const sfTokenTTL = context.SF_TTL;

  //================================================================================
  // End Context Variables
  //================================================================================

  // Use namespace is to tell the code to apply the package namespace or not.
  // The default should be true.  If you are getting the requested resource
  // does not exist then try setting value to false.
  const useNameSpace = true;

  //The salesforce managed package namespace
  const nameSpace = 'TwilioSF__';

  //The login url
  const salesforceUrl = 'https://login.salesforce.com';

  if(isSandbox === true) {
      salesforceUrl = 'https://test.salesforce.com';
  }

  const twilioClient = context.getTwilioClient();

  try {
    // get salesforce auth

    // insert record

  } catch (e) {

  }
}

async function getSalesforceAuth(twilioClient, clientId, clientSecret, sfUserName, sfPassword, sfToken) {
  // Check Against Sync Map

  // 

}

async function checkAgainstSync(twilioClient) {

}

/**
 * Auth to Salesforce
 * @param {*} clientId 
 * @param {*} clientSecret 
 * @param {*} sfUserName 
 * @param {*} sfPassword 
 * @param {*} sfToken 
 */
async function authToSalesforce(clientId, clientSecret, sfUserName, sfPassword, sfToken) {
  const form = {
    grant_type: 'password',
    client_id: clientId,
    client_secret: clientSecret,
    username: sfUserName,
    password:sfPassword+sfToken
  };

  const formData = querystring.stringify(form);

  axios.post('http://something.com/', querystring.stringify({ foo: 'bar' }));
}

async function insertPlatformEvent(event, sfAuthResponse) {
  const platformEvent = buildPlatformEvent(event);
  const url = sfAuthReponse.instance_url + getPlatformEventUrl();
  const options = {
    headers: { 'Authorization': `Bearer ${sfAuthResponse.access_token}` },
    data: platformEvent,
    url,
  };
  await axios.post(options);
}

/**
 * Gets the Salesforce services url for the platform event
 * @returns {string}
 */
function getPlatformEventUrl(useNameSpace, nameSpace){
  if(useNameSpace){
      return '/services/data/v43.0/sobjects/' + nameSpace + 'Twilio_Message_Status__e';
  } else{
      return '/services/data/v43.0/sobjects/Twilio_Message_Status__e';
  }
}

/**
 * Builds the platform event request
 * @param event
 */
function buildPlatformEvent(event){
  //Object map that maps Twilio Field to Salesforce Field
  const eventToPEMap = {
    "Body":"Body__c",
    "To":"To__c",
    "From":"From__c",
    "AccountSid":"AccountSid__c",
    "SmsSid":"MessageSid__c",
    "MessagingServiceSid":"MessagingServiceSid__c",
    "SmsStatus":"SmsStatus__c",
    "ErrorCode":"ErrorCode__c"
  };

  const platformEvent = {};

  //Loop through event and build platform event
  for (const property in event) {
      if (eventToPEMap.hasOwnProperty(property)) {
          const eventProp;
          if(useNameSpace){
              eventProp =  nameSpace + eventToPEMap[property];
          } else{
              eventProp = eventToPEMap[property];
          }
          platformEvent[eventProp] = event[property];
      }
  }
  return platformEvent;
}