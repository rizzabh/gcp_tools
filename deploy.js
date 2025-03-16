const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  projectId: process.env.GCP_PROJECT_ID || 'cloudrbl',
  storageBucket: process.env.GCP_STORAGE_BUCKET || 'cloudrbl-storage',
  functionName: process.env.GCP_FUNCTION_NAME || 'rblpractice',
  functionRegion: process.env.GCP_FUNCTION_REGION || 'asia-south1',
  serviceAccount: process.env.GCP_SERVICE_ACCOUNT || './service-account-key.json',
  cloudRunName: 'rblpractice',
  cloudRunRegion: 'asia-south1'
};

// Helper function to run commands
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    return null;
  }
}

// Set the GCP project
function setProject() {
  console.log(`\n=== Setting GCP Project to ${config.projectId} ===`);
  runCommand(`gcloud config set project ${config.projectId}`);
}

// Create a storage bucket if it doesn't exist
function createStorageBucket() {
  console.log(`\n=== Creating Storage Bucket ${config.storageBucket} ===`);
  try {
    runCommand(`gsutil ls gs://${config.storageBucket}`);
    console.log(`Bucket ${config.storageBucket} already exists.`);
  } catch (error) {
    // Bucket doesn't exist, create it
    runCommand(`gsutil mb -l ${config.functionRegion} gs://${config.storageBucket}`);
  }
  
  // Set up CORS for the bucket
  console.log(`Setting CORS for bucket ${config.storageBucket}`);
  const corsConfig = [
    {
      "origin": ["*"],
      "method": ["GET", "POST", "PUT", "DELETE"],
      "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent"],
      "maxAgeSeconds": 3600
    }
  ];
  
  fs.writeFileSync('cors.json', JSON.stringify(corsConfig, null, 2));
  runCommand(`gsutil cors set cors.json gs://${config.storageBucket}`);
  fs.unlinkSync('cors.json');
}

// Create Cloud Function
function createCloudFunction() {
  console.log(`\n=== Creating Cloud Function ${config.functionName} ===`);
  
  // Create a temporary directory for the function
  const functionDir = path.join(__dirname, 'temp-function');
  if (!fs.existsSync(functionDir)) {
    fs.mkdirSync(functionDir);
  }
  
  // Create index.js for the function
  const functionCode = `exports.${config.functionName} = (req, res) => {
  const data = req.body || {};
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  res.status(200).send({
    message: "Cloud Function executed successfully!",
    receivedData: data,
    timestamp: new Date().toISOString()
  });
};`;
  
  fs.writeFileSync(path.join(functionDir, 'index.js'), functionCode);
  
  // Create package.json for the function
  const packageJson = {
    name: config.functionName,
    version: "1.0.0",
    main: "index.js",
    engines: {
      node: "22"
    }
  };
  
  fs.writeFileSync(path.join(functionDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  
  // Deploy the function
  const currentDir = process.cwd();
  process.chdir(functionDir);
  
  runCommand(`gcloud functions deploy ${config.functionName} \\
    --runtime nodejs22 \\
    --trigger-http \\
    --allow-unauthenticated \\
    --region ${config.functionRegion} \\
    --project ${config.projectId}`);
  
  // Clean up
  process.chdir(currentDir);
  fs.rmdirSync(functionDir, { recursive: true });
}

// Deploy the main application to Cloud Run
function deployToCloudRun() {
  console.log(`\n=== Deploying Website to Cloud Run ===`);
  
  // Update .env file with the correct configuration
  const envConfig = `# GCP project configuration
GCP_PROJECT_ID=${config.projectId}
GCP_STORAGE_BUCKET=${config.storageBucket}
GCP_FUNCTION_NAME=${config.functionName}
GCP_FUNCTION_REGION=${config.functionRegion}

# Service account key file path
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json

# Web server configuration
PORT=8080`;
  
  fs.writeFileSync('.env', envConfig);
  
  // Create Dockerfile if it doesn't exist
  if (!fs.existsSync('Dockerfile')) {
    const dockerfile = `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]`;
    
    fs.writeFileSync('Dockerfile', dockerfile);
  }
  
  // Build and deploy to Cloud Run
  runCommand(`gcloud builds submit --tag gcr.io/${config.projectId}/cloudwebsite`);
  
  runCommand(`gcloud run deploy ${config.cloudRunName} \\
    --image gcr.io/${config.projectId}/cloudwebsite \\
    --platform managed \\
    --region ${config.cloudRunRegion} \\
    --allow-unauthenticated`);
}

// Main deployment function
async function deploy() {
  console.log('=== Starting automated deployment ===');
  
  setProject();
  createStorageBucket();
  createCloudFunction();
  deployToCloudRun();
  
  console.log('\n=== Deployment completed successfully! ===');
}

// Run the deployment
deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
}); 