# Automated Deployment to Google Cloud Platform

This project includes an automated deployment script that provisions and deploys all necessary resources to GCP.

## Prerequisites

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Login to your GCP account:
   ```
   gcloud auth login
   ```
3. Enable required APIs:
   ```
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable storage-api.googleapis.com
   ```
4. Create a service account with appropriate permissions:
   - Go to IAM & Admin > Service Accounts
   - Create a service account with these roles:
     - Cloud Functions Admin
     - Cloud Run Admin
     - Storage Admin
     - Cloud Build Editor
   - Create and download a JSON key file
   - Save it as `service-account-key.json` in your project root

## Configuration

You can configure the deployment by setting environment variables:

- `GCP_PROJECT_ID`: Your GCP project ID (default: 'cloudrbl')
- `GCP_STORAGE_BUCKET`: Storage bucket name (default: 'cloudrbl-storage')
- `GCP_FUNCTION_NAME`: Cloud Function name (default: 'rblpractice')
- `GCP_FUNCTION_REGION`: GCP region (default: 'asia-south1')
- `GCP_SERVICE_ACCOUNT`: Path to service account key (default: './service-account-key.json')

## Running the Deployment

Simply run:

```
npm run deploy
```

This script will:

1. Set up your GCP project
2. Create a Cloud Storage bucket (or use existing)
3. Configure CORS for the bucket
4. Create and deploy a Cloud Function
5. Build a Docker container for your application
6. Deploy the application to Cloud Run

## Troubleshooting

If you encounter any issues:

1. Check that your service account has the correct permissions
2. Verify that you've enabled all required APIs
3. Confirm you're authenticated with GCP: `gcloud auth list`
4. Check for any error messages in the deployment output

## Manual Deployment

If you prefer to deploy manually, you can follow these steps:

1. Create a Storage Bucket:

   ```
   gsutil mb -l asia-south1 gs://YOUR_BUCKET_NAME
   ```

2. Deploy the Cloud Function:

   ```
   cd temp-function
   gcloud functions deploy YOUR_FUNCTION_NAME \
     --runtime nodejs22 \
     --trigger-http \
     --allow-unauthenticated \
     --region asia-south1
   ```

3. Deploy to Cloud Run:
   ```
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/cloudwebsite
   gcloud run deploy YOUR_SERVICE_NAME \
     --image gcr.io/YOUR_PROJECT/cloudwebsite \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated
   ```
