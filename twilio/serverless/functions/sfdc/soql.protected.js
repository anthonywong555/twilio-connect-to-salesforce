const jsforce = require('jsforce');

/**
 * This Function is only meant to do SOQL
 */
exports.handler = async (context, event, callback) => {
  try {
    // Twilio Serverless Boilerplate
    const twilioClient = require('twilio')(context.ACCOUNT_SID, context.AUTH_TOKEN);
    const functions = Runtime.getFunctions();
    const errorPath = functions['private/twilio/serverless/variables'].path;
    const error = require(errorPath);
    
    // Salesforce Boilerplate
    const accessToken = await getSFDCAccessToken(context, twilioClient);
    
    // Main Code
    const result = await soql(context, twilioClient, query);

    callback(null, result);
  } catch(e) {
    callback(e);
  }
};

const soql = async (context, twilioClient, query) => {
  try {
    return await conn.query(query);
  } catch (e) {

  }
}