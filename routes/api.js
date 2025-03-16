const express = require('express');
const router = express.Router();
const storage = require('../utils/storage');
const functions = require('../utils/functions');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// GCP Storage routes
router.get('/storage/files', async (req, res) => {
  try {
    const files = await storage.listFiles();
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/storage/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileUrl = await storage.uploadFile(req.file.path, req.file.originalname);
    res.json({ success: true, fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/storage/download/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const downloadPath = `./downloads/${fileName}`;
    
    await storage.downloadFile(fileName, downloadPath);
    res.download(downloadPath, fileName);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/storage/delete/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    await storage.deleteFile(fileName);
    res.json({ success: true, message: `File ${fileName} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cloud Functions routes
router.post('/function/call', async (req, res) => {
  try {
    const data = req.body;
    const result = await functions.callFunction(data);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 