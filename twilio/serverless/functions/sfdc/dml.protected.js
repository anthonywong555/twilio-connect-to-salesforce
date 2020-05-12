const jsforce = require('jsforce');

/**
 * This Function is only meant for making DML Execution
 */
exports.handler = async (context, event, callback) => {
  try {
    // Twilio Serverless Boilerplate
    const twilioClient = require('twilio')(context.ACCOUNT_SID, context.AUTH_TOKEN);
    const functions = Runtime.getFunctions();
    const errorPath = functions['private/twilio/serverless/variables'].path;
    const error = require(errorPath);
    
    // Main Code
    const result = await getSFDCAccessToken(context, twilioClient);
    callback(null, result);
  } catch(e) {
    callback(e);
  }
};