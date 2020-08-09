const formatErrorMsg = (context, functionName, errorMsg) => {
  return `
    Twilio Function Path: ${context.PATH} \n 
    Function Name: ${functionName} \n 
    Error Message: ${errorMsg}
  `;
}

module.exports = {formatErrorMsg};