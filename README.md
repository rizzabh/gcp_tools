# GCP Cloud Website

A web application that interacts with Google Cloud Platform services, specifically Cloud Storage and Cloud Functions.

## Features

- **Cloud Storage Integration**

  - Upload files to GCP Cloud Storage
  - List files in your storage bucket
  - Download files from your storage bucket
  - Delete files from your storage bucket

- **Cloud Functions Integration**
  - Call your GCP Cloud Functions with custom data
  - View function execution results

## Prerequisites

- Node.js (v14 or higher)
- A Google Cloud Platform account
- A GCP project with Cloud Storage and Cloud Functions enabled
- A service account with appropriate permissions

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure your GCP credentials:
   - Create a service account in your GCP project
   - Download the service account key file and save it as `service-account-key.json` in the project root
   - Update the `.env` file with your GCP project details:
     ```
     GCP_PROJECT_ID=your-project-id
     GCP_STORAGE_BUCKET=your-bucket-name
     GCP_FUNCTION_NAME=your-function-name
     GCP_FUNCTION_REGION=your-function-region
     ```

## Running the Application

Start the development server:

```
npm run dev
```

For production:

```
npm start
```

The application will be available at http://localhost:3000

## Project Structure

- `/public` - Static frontend files
- `/routes` - API routes
- `/utils` - Utility functions for GCP services
- `server.js` - Main application entry point
- `config.js` - Configuration management

## License

MIT
