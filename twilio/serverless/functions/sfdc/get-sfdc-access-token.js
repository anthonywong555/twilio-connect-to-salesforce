const jsforce = require('jsforce');
const moment = require('moment');

let serverlessHelper = null;

/**
 * Get Salesforce Access Token
 * @returns {*} Object contains instanceUrl and accessToken
 */
exports.handler = async (context, event, callback) => {
  try {
    // Twilio Serverless Boilerplate
    const twilioClient = require('twilio')(context.ACCOUNT_SID, context.AUTH_TOKEN);
    const functions = Runtime.getFunctions();

    if(!serverlessHelper) {
      const errorPath = functions['private/twilio/serverless/variables'].path;
      error = require(errorPath);
    }

    
    callback(null, error.formatErrorMsg(context, 'exports.handler', 'hit'));
    // Main Code
    const result = await getSFDCAccessToken(context, twilioClient);
    callback(null, result);
  } catch(e) {
    callback(e);
  }
};

/**
 * 
 * @param {*} context 
 */
const getSFDCAccessToken = async (context, twilioClient) => {
  try {
    //const sfdc = await generateSFDCAccessToken(context);
    const sfdc = {};
    const result = await upsertSFDCAccessTokenEnv(context, twilioClient, sfdc);
    return result;
  } catch (e) {
    throw formatErrorMsg(context, 'getSFDCAccessToken', e);
  }
}

/**
 * Get SFDC Access Token from Serverless Env
 * @param {*} context 
 * @returns {*} Object contains Instance URL and Access Token
 */
const getSFDCAccessTokenFromEnv = async (context, twilioClient) => {
  try {
    const envInstanceUrL = await twilioClient.serverless
      .services(context.MOD_SERVERLESS_SID)
      .environments(context.MOD_ENVIRONMENT_SID)
      .variables(context.SF_INSTANCE_URL)
      .fetch();

    const instanceUrl = envInstanceUrL.value;
    
    const envAccessToken = await twilioClient.serverless
      .services(context.MOD_SERVERLESS_SID)
      .environments(context.MOD_ENVIRONMENT_SID)
      .variables(context.SF_ACCESS_TOKEN)
      .fetch();

    const accessToken = envAccessToken.value;

    return {instanceUrl, accessToken}; 
  } catch(e) {
    throw formatErrorMsg(context, 'getSFDCAccessTokenFromEnv', e);
  }
}

/**
 * 
 * @param {*} context 
 */
const upsertSFDCAccessTokenEnv = async (context, twilioClient, {instanceUrl, accessToken}) => {
  try {
    try {
      // Check to see if env is there
      const test = await twilioClient.serverless
        .services(context.MOD_SERVERLESS_SID)
        .environments(context.MOD_ENVIRONMENT_SID)
        .variables(context.SF_ACCESS_TOKEN)
        .fetch();
    } catch(e) {
      if(e.message === `The requested resource /Services/${context.MOD_SERVERLESS_SID}/Environments/${context.MOD_ENVIRONMENT_SID}/Variables/${context.SF_ACCESS_TOKEN} was not found`) {
        await insertServerlessEnvVariables(context, twilioClient);
        //await insertTwilioSyncVariables();
      }
    } finally {
      // Update the
    }
  } catch (e) {
    throw formatErrorMsg(context, 'upsertSFDCAccessTokenEnv', e);
  }
}

const insertServerlessEnvVariables = async (context, twilioClient) => {
  try {
    // Create Variables
    await twilioClient.serverless
      .services(context.MOD_SERVERLESS_SID)
      .environments(context.MOD_ENVIRONMENT_SID)
      .variables
      .create({key: context.SF_SYNC_KEY, value: ''});

    await twilioClient.serverless
      .services(context.MOD_SERVERLESS_SID)
      .environments(context.MOD_ENVIRONMENT_SID)
      .variables
      .create({key: context.SF_SYNC_KEY_DATE_CREATED, value: ''});

    await twilioClient.serverless
      .services(context.MOD_SERVERLESS_SID)
      .environments(context.MOD_ENVIRONMENT_SID)
      .variables
      .create({key: context.SF_SYNC_KEY_DATE_EXPIRES, value: ''});
  } catch (e) {
    throw formatErrorMsg(context, 'insertServerlessEnvVariables', e);
  }
}

const insertServerlessEnvVariable = async (context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
  try {
    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables
      .create({key, value});
  } catch (e) {
    throw formatErrorMsg(context, 'insertServerlessEnvVariable', e);
  }
}

const updateServerlessEnvVariable = async (context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
  try {
    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables
      .create({key, value});
  } catch (e) {
    throw formatErrorMsg(context, 'insertServerlessEnvVariable', e);
  }
}

const insertTwilioSyncVariables = async (context, twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl}) => {
  try {
    return await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .documents
      .create({
        uniqueName,
        data,
        ttl
      });
  } catch(e) {
    throw formatErrorMsg(context, 'insertTwilioSyncVariables', e);
  }
}

const upsertSFDCAccessTokenSync = async (context, twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID, data}) => {
  try {
    return await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .documents(DOCUMENT_SID)
      .update(data);
  } catch (e) {
    throw formatErrorMsg(context, 'upsertSFDCAccessTokenSync', e);
  }
}

const authSFDCEnv = async (context, {instanceUrl, accessToken}) => {
  try {
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken
    });

    // Test Connection
    await conn.query("SELECT Id, Name FROM User");

    return true;
  } catch (e) {
    throw formatErrorMsg(context, 'authSFDCEnv', e);
  }
}

/**
 * Authenticate to Salesforce
 * @param {*} context export.handler context
 */
const generateSFDCAccessToken = async (context) => {
  try {
    const conn = new jsforce.Connection({
      oauth2 : {
        loginUrl : context.SF_LOGIN_URL,
        clientId : context.SF_CONSUMER_KEY,
        clientSecret : context.SF_CONSUMER_SECRET,
        redirectUri : context.SF_REDIRECT_URI
      }
    });
    const userInfo = await conn.login(context.SF_USERNAME, context.SF_PASSWORD + context.SF_TOKEN);
    return ({...conn, ...userInfo});
  } catch (e) {
    throw formatErrorMsg(context, 'generateSFDCAccessToken', e);
  }
}

const formatErrorMsg = (context, functionName, errorMsg) => {
  return `
    Twilio Function Path: ${context.PATH} \n 
    Function Name: ${functionName} \n 
    Error Message: ${errorMsg}
  `;
}