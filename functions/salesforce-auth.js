const axios = require('axios').default;
const querystring = require('querystring');
const moment = require('moment');

/*
 * @return Salesforce Auth
 */
exports.handler = async function(context, event, callback) {
  try {
    const twilioClient = context.getTwilioClient();
    const sfAuthResponse = await getSalesforceAuth(twilioClient, context);
    callback(null, sfAuthResponse);
  } catch (e) {
    callback(e);
  }
}

async const getSalesforceAuth = (twilioClient, context) => {
  const ERROR_FORCE_REFRESH = 'ERROR_FORCE_REFRESH';
  try {
    // Check Against Sync Map
    let sfAuthResponse = await
    twilioClient.sync.
    services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
    documents(context.SF_SYNC_KEY).fetch();

    const {
      data
    } = sfAuthResponse;
    const {
      dateCreated,
      dateExpires
    } = data;
    const currentDateTime = moment().format();

    if (moment().isAfter(dateExpires)) {
      throw ERROR_FORCE_REFRESH;
    }

    return data;
  } catch (e) {
    if (e.message === `The requested resource /Services/${context.TWILIO_SYNC_DEFAULT_SERVICE_SID}/Documents/${context.SF_SYNC_KEY} was not found` ||
      e === ERROR_FORCE_REFRESH) {
      // If not there then auth to Salesforce
      try {
        const sfAuthResponse = await authToSalesforce(context);

        sfAuthResponse.dateCreated = moment().format();
        sfAuthResponse.dateExpires = moment().add(context.SF_TTL, 'seconds').format();

        if (e === ERROR_FORCE_REFRESH) {
          // Update Sync Map
          await twilioClient.sync.
          services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
          documents(context.SF_SYNC_KEY).update({
            data: sfAuthResponse,
            ttl: context.SF_TTL
          });
        } else {
          // Insert Sync Map
          await twilioClient.sync.
          services(context.TWILIO_SYNC_DEFAULT_SERVICE_SID).
          documents.create({
            uniqueName: context.SF_SYNC_KEY,
            data: sfAuthResponse,
            ttl: context.SF_TTL
          });
        }

        return sfAuthResponse;
      } catch (e) {
        throw formatErrorMsg(context, 'getSalesforceAuth - In Catch Block', e);
      }
    } else {
      throw formatErrorMsg(context, 'getSalesforceAuth', e);
    }
  }
}

async const authToSalesforce = (context) => {
  try {
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

  const useNameSpace = true;

  //The salesforce managed package namespace
  const nameSpace = 'TwilioSF__';

  //The login url
  const salesforceUrl = 'https://login.salesforce.com';

  if (isSandbox === true) {
    salesforceUrl = 'https://test.salesforce.com';
  }
  
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


    return sfAuthReponse.data;
  } catch (e) {
    throw formatErrorMsg(context, 'authToSalesforce', e);
  }
}

const formatErrorMsg = (context, functionName, errorMsg) => {
  return `Twilio Function Path: ${context.PATH} \n Function Name: ${functionName} \n Error Message: ${errorMsg}`
}
