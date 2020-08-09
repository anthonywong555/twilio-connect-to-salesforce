// Load Modules
const jsforce = require('jsforce');
const moment = require('moment');

let serverlessHelper = null;
let twilioHelper = null;

// Global Variables
SF_ACCESS_TOKEN = 'SF_ACCESS_TOKEN';
SF_INSTANCE_URL = 'SF_INSTANCE_URL';
SF_SYNC_KEY = 'SF_SYNC_KEY';
SF_SYNC_KEY_DATE_CREATED = 'SF_SYNC_KEY_DATE_CREATED';
SF_SYNC_KEY_DATE_EXPIRES = 'SF_SYNC_KEY_DATE_EXPIRES';

/**
 * Get Salesforce Access Token
 * @returns {*} Object contains instanceUrl and accessToken
 */
exports.handler = async (context, event, callback) => {
  try {
    // Twilio Serverless Boilerplate
    const twilioClient = require('twilio')(context.ACCOUNT_SID, context.AUTH_TOKEN);
    await loadModules(context);

    // Main Code
    const result = await getSFDCAccessToken(context, twilioClient);
    return callback(null, {});
  } catch(e) {
    callback(e);
  }
};

const loadModules = async (context) => {
  try {
    const functions = Runtime.getFunctions();

    const serverlessHelperPath = functions['private/boilerplate/helper'].path;
    serverlessHelper = require(serverlessHelperPath);

    const twilioHelperPath = functions['private/twilio/index'].path;
    twilioHelper = require(twilioHelperPath);
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'getSFDCAccessToken', e);
  }
}

/**
 * 
 * @param {*} context 
 */
const getSFDCAccessToken = async (context, twilioClient) => {
  try {
    const sfdcAuth = await generateSFDCAuth(context);
    await upsertSFDCAuthTwilio(context, twilioClient, sfdcAuth);
    const {accessToken, instanceUrl} = sfdcAuth;
    const result = {
      accessToken,
      instanceUrl
    }
    return result;
    //await upsertSFDCAccessTokenSync(context, twilioClient, sfdc);
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'getSFDCAccessToken', e);
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
    throw serverlessHelper.formatErrorMsg(context, 'getSFDCAccessTokenFromEnv', e);
  }
}

const upsertSFDCAuthTwilio = async(context, twilioClient, sfdcAuth) => {
  try {
    await upsertSFDCAuthEnv(context, twilioClient, sfdcAuth);
    await upsertSFDCAuthSync(context, twilioClient, sfdcAuth);
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'upsertSFDCAuthTwilio', e);
  }
}

/**
 * 
 * @param {*} context 
 */
const upsertSFDCAuthEnv = async (context, twilioClient, sfdcAuth) => {
  try {
    const {accessToken, instanceUrl} = sfdcAuth;
    const SERVERLESS_SID = context.MOD_SERVERLESS_SID;
    const ENVIRONMENT_SID = context.MOD_ENVIRONMENT_SID;

    const dateCreated = moment().format();
    const dateExpires = moment().add(context.SF_TTL, 'seconds').format();

    // Build Modals

    const sfdcAccessTokenEnv = {
      SERVERLESS_SID,
      ENVIRONMENT_SID,
      key: SF_ACCESS_TOKEN,
      value: accessToken
    };

    const sfdcInstanceURLEnv = {
      SERVERLESS_SID,
      ENVIRONMENT_SID,
      key: SF_INSTANCE_URL,
      value: instanceUrl
    }

    const dateCreatedEnv = {
      SERVERLESS_SID,
      ENVIRONMENT_SID,
      key: SF_SYNC_KEY_DATE_CREATED,
      value: dateCreated
    };

    const dateExpiresEnv = {
      SERVERLESS_SID,
      ENVIRONMENT_SID,
      key: SF_SYNC_KEY_DATE_EXPIRES,
      value: dateExpires
    };

    // Upsert Modals
    await twilioHelper.serverlessVariables.upsert(twilioClient, sfdcAccessTokenEnv);
    await twilioHelper.serverlessVariables.upsert(twilioClient, sfdcInstanceURLEnv);
    await twilioHelper.serverlessVariables.upsert(twilioClient, dateCreatedEnv);
    await twilioHelper.serverlessVariables.upsert(twilioClient, dateExpiresEnv);

    return;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'upsertSFDCAccessTokenEnv', e);
  }
}

const upsertSFDCAuthSync = async (context, twilioClient, sfdcAuth) => {
  try {
    const {accessToken, instanceUrl} = sfdcAuth;
    const SYNC_SERVICE_SID = context.TWILIO_SYNC_SERVICE_SID;
    const ttl = context.SF_TTL;
    const dateCreated = moment().format();
    const dateExpires = moment().add(ttl, 'seconds').format();
    const uniqueName = SF_SYNC_KEY;

    // Build Modals
    const data = {
      SF_ACCESS_TOKEN: accessToken,
      SF_INSTANCE_URL: instanceUrl,
      SF_SYNC_KEY_DATE_CREATED: dateCreated,
      SF_SYNC_KEY_DATE_EXPIRES: dateExpires
    };

    // Upsert Modals
    return await twilioHelper.syncDocument.upsert(twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl});
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'upsertSFDCAuthSync', e);
  }
}



const testSFDCAuth = async (context, {instanceUrl, accessToken}) => {
  try {
    const conn = new jsforce.Connection({
      instanceUrl,
      accessToken
    });

    // Test Connection
    await conn.query("SELECT Id, Name FROM User");

    return true;
  } catch (e) {
    throw serverlessHelper.formatErrorMsg(context, 'authSFDCEnv', e);
  }
}

/**
 * Authenticate to Salesforce
 * @param {*} context export.handler context
 */
const generateSFDCAuth = async (context) => {
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
    throw serverlessHelper.formatErrorMsg(context, 'generateSFDCAuth', e);
  }
}