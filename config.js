const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  gcp: {
    projectId: process.env.GCP_PROJECT_ID,
    storageBucket: process.env.GCP_STORAGE_BUCKET,
    functionName: process.env.GCP_FUNCTION_NAME,
    functionRegion: process.env.GCP_FUNCTION_REGION,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },
  server: {
    port: process.env.PORT || 3000
  }
}; 