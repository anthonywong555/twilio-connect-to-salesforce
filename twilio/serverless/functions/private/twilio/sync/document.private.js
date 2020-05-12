const createDocument = async (context, twilioClient, {SYNC_SERVICE_SID, uniqueName, data, ttl = 0}) => {
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

  }
}

const updateDocument = async (context, twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID, data, ttl = 0}) => {
  try {
    return await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .documents(DOCUMENT_SID)
      .update({
        data,
        ttl
      });
  } catch(e) {

  }
}

const upsertDocument = async (context, twilioClient, {SYNC_SERVICE_SID, DOCUMENT_SID, data, ttl = 0}) => {
  try {
    return await twilioClient.sync
      .services(SYNC_SERVICE_SID)
      .documents(DOCUMENT_SID)
      .update({
        data,
        ttl
      });
  } catch(e) {

  }
}