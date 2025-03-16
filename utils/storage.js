const { Storage } = require('@google-cloud/storage');
const config = require('../config');

// Initialize storage client
const storage = new Storage({
  projectId: config.gcp.projectId,
  keyFilename: config.gcp.credentials
});

const bucket = storage.bucket(config.gcp.storageBucket);

// List files in the bucket
const listFiles = async () => {
  try {
    const [files] = await bucket.getFiles();
    return files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      updated: file.metadata.updated
    }));
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Upload a file to the bucket
const uploadFile = async (file, destination) => {
  try {
    await bucket.upload(file, {
      destination: destination || file.name,
      metadata: {
        cacheControl: 'public, max-age=31536000'
      }
    });
    return `https://storage.googleapis.com/${config.gcp.storageBucket}/${destination || file.name}`;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Download a file from the bucket
const downloadFile = async (fileName, destinationPath) => {
  try {
    await bucket.file(fileName).download({
      destination: destinationPath
    });
    return destinationPath;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Delete a file from the bucket
const deleteFile = async (fileName) => {
  try {
    await bucket.file(fileName).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

module.exports = {
  listFiles,
  uploadFile,
  downloadFile,
  deleteFile
}; 