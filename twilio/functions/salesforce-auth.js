const axios = require('axios').default;
const querystring = require('querystring');

async function sfdc() {
  try {
    
  } catch(e) {

  }
}

exports.handler = async function(context, event, callback) {
  try {
    const twilioClient = context.getTwilioClient();
  } catch (e) {
    callback(e);
  }
}

function formatErrorMsg(context, functionName, errorMsg) {
  return `Twilio Function Path: ${context.PATH} \n Function Name: ${functionName} \n Error Message: ${errorMsg}`
}