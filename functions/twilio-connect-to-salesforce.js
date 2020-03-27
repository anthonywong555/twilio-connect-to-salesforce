const axios = require('axios').default;

exports.handler = async function(context, event, callback) {
  try {
    const sfAuthResponse = await getSalesforceAuth(twilioClient, context);
    const result = await insertPlatformEvent(context, event, sfAuthResponse);
    callback(null, result);
  } catch (e) {
    callback(e);
  }
}

async const insertPlatformEvent = (context, event, sfAuthResponse) => {
  try {
    const platformEvent = buildPlatformEvent(context, event);
    const url = sfAuthResponse.instance_url + getPlatformEventUrl(context);

    const result = await axios({
      url,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sfAuthResponse.access_token}`
      },
      data: platformEvent,
    });

    return result.data;
  } catch (e) {
    throw formatErrorMsg(context, 'insertPlatformEvent', e);
  }
}

const getPlatformEventUrl = (context) => {
  if (context.SF_USE_NAME_SPACE) {
    return `/services/data/v43.0/sobjects/${context.SF_NAME_SPACE}Twilio_Message_Status__e`;
  } else {
    return '/services/data/v43.0/sobjects/Twilio_Message_Status__e';
  }
}

const buildPlatformEvent = (context, event) => {
  const eventToPEMap = {
    "Body": "Body__c",
    "To": "To__c",
    "From": "From__c",
    "AccountSid": "AccountSid__c",
    "SmsSid": "MessageSid__c",
    "MessagingServiceSid": "MessagingServiceSid__c",
    "SmsStatus": "SmsStatus__c",
    "ErrorCode": "ErrorCode__c"
  };

  const platformEvent = {};

  for (const property in event) {
    if (eventToPEMap.hasOwnProperty(property)) {
      let eventProp;
      if (context.SF_USE_NAME_SPACE) {
        eventProp = context.SF_NAME_SPACE + eventToPEMap[property];
      } else {
        eventProp = eventToPEMap[property];
      }
      platformEvent[eventProp] = event[property];
    }
  }

  return platformEvent;
}

const formatErrorMsg = (context, functionName, errorMsg) => {
  return `Twilio Function Path: ${context.PATH} \n Function Name: ${functionName} \n Error Message: ${errorMsg}`
}