const axios = require('axios').default;
const querystring = require('querystring');
const moment = require('moment');

let globalSFAuthResponse;

exports.handler = async function(context, event, callback) {
  try {
    const twilioClient = context.getTwilioClient();
    const sfAuthResponse = await driver(context, twilioClient);
    return (null, sfAuthResponse);
  } catch (e) {
    callback(e);
  }
}

const driver = async (context, twilioClient) => {
  const sfAuthReponse = await getSalesforceAuth(context, twilioClient);
  globalSFAuthResponse = await isSalesforceAuthExpire(context, twilioClient, sfAuthReponse);
  return globalSFAuthResponse;
}

const getSalesforceAuth = async (context, twilioClient) => {
  try {
    let sfAuthResponse;

    if(globalSFAuthResponse) {
      sfAuthResponse = {...globalSFAuthResponse};
    } else {
      // Set the value of sfAuthResponse.
      sfAuthResponse = await getSFAuthFromTwilioSync(context, twilioClient);
    }

    return sfAuthResponse;
  } catch (e) {
    throw formatErrorMsg(context, 'getSalesforceAuth', e);
  }
}

const getSFAuthFromTwilioSync = async(context, twilioClient) => {
  try {
    const sfAuthResponse = await
      twilioClient.sync.
      services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
      documents(context.SF_SYNC_KEY).fetch();
    
    return sfAuthResponse;
  } catch (e) {
    if(e.message === `The requested resource /Services/${context.TWILIO_SYNC_DEFAULT_SERVICE_SID}/Documents/${context.SF_SYNC_KEY} was not found`) {
      try {
        // Insert SFDCAuth to Twilio Sync
        const sfAuthResponse = await authToSalesforce(context);

        const result = await twilioClient.sync.
          services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
          documents.create({
            uniqueName: context.SF_SYNC_KEY,
            data: sfAuthResponse,
            ttl: context.SF_TTL
          });
        
        return result;
      } catch (e) {
        throw formatErrorMsg(context, 'getSFAuthFromTwilioSync.inner', e);
      }
    }
    throw formatErrorMsg(context, 'getSFAuthFromTwilioSync', e);
  }
}

const isSalesforceAuthExpire = async(context, twilioClient, sfAuthResponse) => {
  try {
    const { data } = sfAuthResponse;
    const { dateExpires } = data;
    const currentDateTime = moment();

    let result;

    if(currentDateTime.isAfter(dateExpires)) {
      // Refresh Token
      result = await authToSalesforce(context);
      await twilioClient.sync.
        services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
        documents(context.SF_SYNC_KEY).update({
          data: sfAuthResponse,
          ttl: context.SF_TTL
      });
    } else {
      result = sfAuthResponse;
    }

    return result;

  } catch (e) {
    throw formatErrorMsg(context, 'isSalesforceAuthExpire', e);
  }
}

async function authToSalesforce(context) {
  // Are we using a sandbox or not
  const isSandbox = (context.SF_IS_SANDBOX === 'true');

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

  //The login url
  let salesforceUrl = 'https://login.salesforce.com';

  if (isSandbox) {
    salesforceUrl = 'https://test.salesforce.com';
  }
  try {
    const form = {
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username: sfUserName,
      password: sfPassword + sfToken
    };

    const formData = querystring.stringify(form);
    const contentLength = formData.length;
    const sfAuthReponse = await axios({
      method: 'POST',
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      url: `${salesforceUrl}/services/oauth2/token`,
      data: querystring.stringify(form)
    });

    const { data } = sfAuthReponse;

    data.dateCreated = moment().format();
    data.dateExpires = moment().add(context.SF_TTL, 'seconds').format();

    return data;
  } catch (e) {
    throw formatErrorMsg(context, 'authToSalesforce', e);
  }
}

function formatErrorMsg(context, functionName, errorMsg) {
  return `
    Twilio Function Path: ${context.PATH} \n 
    Function Name: ${functionName} \n 
    Error Message: ${errorMsg}
  `;
}