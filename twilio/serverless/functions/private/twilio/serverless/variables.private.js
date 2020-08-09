const fetch = async (twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key}) => {
  try {
    const variables = await twilioClient.serverless
    .services(SERVERLESS_SID)
    .environments(ENVIRONMENT_SID)
    .variables
    .list();
    
    let result = null;

    for(const aVariable of variables) {
      if(aVariable.key === key) {
        result = aVariable;
        break;
      }
    }

    if(result) {
      return result;
    } else {
      throw `The requested resource /Services/${SERVERLESS_SID}/Environments/${ENVIRONMENT_SID}/Variables/${key} was not found`
    }
  } catch(e) {
    throw e;
  }
}

const create = async (twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
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

const update = async (twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) => {
  try {
    const aVariable = await fetch(twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key});

    return await twilioClient.serverless
      .services(SERVERLESS_SID)
      .environments(ENVIRONMENT_SID)
      .variables(aVariable.sid)
      .update({key, value});
  } catch (e) {
    throw e;
  }
}

const upsert = async (twilioClient, data) => {
  const {SERVERLESS_SID, ENVIRONMENT_SID, key, value} = data;

  try {
    try {
      // Check to see if it exist
      await fetch(twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key});

      // update
      return await update(twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value});
    } catch (e) {
      console.log(e);
      if(e === `The requested resource /Services/${SERVERLESS_SID}/Environments/${ENVIRONMENT_SID}/Variables/${key} was not found`) {
        // insert
        return await create(twilioClient, {SERVERLESS_SID, ENVIRONMENT_SID, key, value}) 
      } else {
        throw e;
      }
    }
  } catch(e) {
    throw e;
  }
}


module.exports = {fetch, create, update, upsert};