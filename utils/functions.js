const config = require('../config');
const axios = require('axios');

// We'll use axios for HTTP requests to the Cloud Functions

// Call a Cloud Function
const callFunction = async (data = {}) => {
  try {
    const url = `https://${config.gcp.functionRegion}-${config.gcp.projectId}.cloudfunctions.net/${config.gcp.functionName}`;
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    console.error('Error calling Cloud Function:', error);
    throw error;
  }
};

module.exports = {
  callFunction
}; 