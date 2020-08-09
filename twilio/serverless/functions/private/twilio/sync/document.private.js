const fetch = async (twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID}) => {
  try {
    return await twilioClient.sync.services(SYNC_SERVICE_SID)
      .documents(DOCUMENT_SID)
      .fetch();
  } catch (e) {
    throw e;
  }
}

const create = async (twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl = 0}) => {
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
    throw e;
  }
}

const update = async (twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID, data, ttl = 0}) => {
  try {
    return await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .documents(DOCUMENT_SID)
      .update({
        data,
        ttl
      });
  } catch(e) {
    throw e;
  }
}

const upsert = async (twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl = 0}) => {
  try {
    try {
      const DOCUMENT_SID = uniqueName;
      await fetch(twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID});
      
      return await update(twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID, data, ttl});
    } catch (e) {
      console.log('upsert - document');
      console.log(e);
      console.log(e.message);
      if(e.message === `The requested resource /Services/${SYNC_SERVICE_SID}/Documents/${uniqueName} was not found`) {
        return await create(twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl});
      }
    }
  } catch(e) {
    throw e;
  }
}

module.exports = {create, update, upsert};