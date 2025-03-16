document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionTitle = document.getElementById('section-title');
  const storageSection = document.getElementById('storage-section');
  const functionsSection = document.getElementById('functions-section');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Update active link
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Show appropriate section
      const section = link.getAttribute('data-section');
      if (section === 'storage') {
        sectionTitle.textContent = 'GCP Storage';
        storageSection.style.display = 'block';
        functionsSection.style.display = 'none';
      } else if (section === 'functions') {
        sectionTitle.textContent = 'GCP Cloud Functions';
        storageSection.style.display = 'none';
        functionsSection.style.display = 'block';
      }
    });
  });

  // Storage functionality
  const refreshFilesBtn = document.getElementById('refresh-files');
  const filesList = document.getElementById('files-list');
  const uploadForm = document.getElementById('upload-form');
  const uploadResult = document.getElementById('upload-result');

  // Refresh files list
  refreshFilesBtn.addEventListener('click', async () => {
    try {
      refreshFilesBtn.disabled = true;
      refreshFilesBtn.textContent = 'Loading...';
      
      const response = await fetch('/api/storage/files');
      const data = await response.json();
      
      if (data.success) {
        if (data.files.length === 0) {
          filesList.innerHTML = '<p>No files found in the bucket.</p>';
        } else {
          let html = '';
          data.files.forEach(file => {
            html += `
              <div class="file-item">
                <div>
                  <strong>${file.name}</strong>
                  <div class="text-muted small">Size: ${formatFileSize(file.size)}</div>
                </div>
                <div class="file-actions">
                  <a href="/api/storage/download/${file.name}" class="btn btn-sm btn-primary">Download</a>
                  <button class="btn btn-sm btn-danger delete-file" data-filename="${file.name}">Delete</button>
                </div>
              </div>
            `;
          });
          filesList.innerHTML = html;
          
          // Add event listeners to delete buttons
          document.querySelectorAll('.delete-file').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const fileName = e.target.getAttribute('data-filename');
              if (confirm(`Are you sure you want to delete ${fileName}?`)) {
                try {
                  const response = await fetch(`/api/storage/delete/${fileName}`, {
                    method: 'DELETE'
                  });
                  const data = await response.json();
                  
                  if (data.success) {
                    // Refresh the files list
                    refreshFilesBtn.click();
                  } else {
                    alert(`Error: ${data.error}`);
                  }
                } catch (error) {
                  alert(`Error: ${error.message}`);
                }
              }
            });
          });
        }
      } else {
        filesList.innerHTML = `<p class="text-danger">Error: ${data.error}</p>`;
      }
    } catch (error) {
      filesList.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    } finally {
      refreshFilesBtn.disabled = false;
      refreshFilesBtn.textContent = 'Refresh Files';
    }
  });

  // Upload file
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    
    if (!file) {
      showUploadResult('Please select a file to upload.', false);
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';
      
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showUploadResult(`File uploaded successfully. URL: ${data.fileUrl}`, true);
        fileInput.value = '';
        // Refresh the files list
        refreshFilesBtn.click();
      } else {
        showUploadResult(`Error: ${data.error}`, false);
      }
    } catch (error) {
      showUploadResult(`Error: ${error.message}`, false);
    } finally {
      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Upload';
    }
  });

  // Cloud Functions functionality
  const functionForm = document.getElementById('function-form');
  const functionResult = document.getElementById('function-result');

  functionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const functionData = document.getElementById('function-data').value;
    let data;
    
    try {
      data = functionData ? JSON.parse(functionData) : {};
    } catch (error) {
      showFunctionResult('Invalid JSON data. Please check your input.', false);
      return;
    }
    
    try {
      const submitBtn = functionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Calling...';
      
      const response = await fetch('/api/function/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showFunctionResult(`Function called successfully. Result: ${JSON.stringify(result.result, null, 2)}`, true);
      } else {
        showFunctionResult(`Error: ${result.error}`, false);
      }
    } catch (error) {
      showFunctionResult(`Error: ${error.message}`, false);
    } finally {
      const submitBtn = functionForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Call Function';
    }
  });

  // Helper functions
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function showUploadResult(message, isSuccess) {
    uploadResult.textContent = message;
    uploadResult.className = isSuccess ? 'result-success' : 'result-error';
  }

  function showFunctionResult(message, isSuccess) {
    functionResult.textContent = message;
    functionResult.className = isSuccess ? 'result-success' : 'result-error';
  }
}); 