const getVariable = async (context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key}) => {
  try {
    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables(key)
      .fetch();
  } catch(e) {
    throw e;
  }
}

const insertVariable = async (context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
  try {
    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables
      .create({key, value});
  } catch (e) {
    throw e;
  }
}

const updateVariable = async (context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
  try {
    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables
      .create({key, value});
  } catch (e) {
    throw e;
  }
}

const upsertVariable = async (context, twilioClient, data) => {
  const {SERVERLESS_SID, ENVIRONMENT_SID, key, value} = data;
  try {
    try {
      // Check to see if it exist
      await getVariable(context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key});

      // update
      return await updateVariable(context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value});
    } catch (e) {
      if(e.message === `The requested resource /Services/${SERVERLESS_SID}/Environments/${ENVIRONMENT_SID}/Variables/${key} was not found`) {
        // insert
        return await insertVariable(context, twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) 
      } else {
        throw e;
      }
    }
  } catch(e) {
    throw e;
  }
}


export {insertVariable, updateVariable, upsertVariable};