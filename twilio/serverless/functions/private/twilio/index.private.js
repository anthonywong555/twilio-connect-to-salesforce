const functions = Runtime.getFunctions();
const serverlessVariablesPath = functions['private/twilio/serverless/variables'].path;
const syncDocumentPath = functions['private/twilio/sync/document'].path;
const serverlessVariables = require(serverlessVariablesPath);
const syncDocument = require(syncDocumentPath);

module.exports = {serverlessVariables, syncDocument};