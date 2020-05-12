const formatErrorMsg = (context, functionName, errorMsg) => {
  const timeStamp = Date.now();
  return `
    Twilio Function Path: ${context.PATH} \n 
    Function Name: ${functionName} \n 
    Error Message: ${errorMsg}
    TimeStamp: ${timeStamp}
  `;
}

module.export = {formatErrorMsg};