// Job application functionality
document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('applyBtn');
  const saveBtn = document.getElementById('saveBtn');
  const applyModal = document.getElementById('applyModal');
  const submitBtn = document.getElementById('submitApplication');
  const cancelBtn = document.getElementById('cancelApplication');
  const coverLetterInput = document.getElementById('coverLetter');
  const messageDiv = document.getElementById('applyMessage');
  
  // Resume upload elements
  const resumeInput = document.getElementById('resumeInput');
  const resumeUploadArea = document.getElementById('resumeUploadArea');
  const uploadPrompt = document.getElementById('uploadPrompt');
  const fileInfo = document.getElementById('fileInfo');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');
  const resumeError = document.getElementById('resumeError');

  if (!applyBtn) return;

  const jobId = applyBtn.dataset.jobId;
  let selectedFile = null;
  
  console.log('Apply.js loaded - Resume upload ready');
  
  // Save job functionality
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/api/save-job/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          body: JSON.stringify({ job_id: jobId }),
        });
        
        const data = await response.json();
        if (response.ok) {
          saveBtn.textContent = '✓ Saved';
          saveBtn.disabled = true;
        }
      } catch (error) {
        console.error('Error saving job:', error);
      }
    });
  }

  // Resume file input change handler
  if (resumeInput) {
    resumeInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      console.log('File selected:', file);
      
      if (file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          resumeError.textContent = 'Please upload a PDF, DOC, or DOCX file';
          resumeError.style.display = 'block';
          resumeInput.value = '';
          selectedFile = null;
          return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          resumeError.textContent = 'File size must be less than 5MB';
          resumeError.style.display = 'block';
          resumeInput.value = '';
          selectedFile = null;
          return;
        }

        // File is valid
        selectedFile = file;
        resumeError.style.display = 'none';
        
        // Show file info
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        uploadPrompt.style.display = 'none';
        fileInfo.style.display = 'block';
        resumeUploadArea.style.borderColor = '#28a745';
        resumeUploadArea.style.background = '#f0f9f4';
        
        console.log('Resume uploaded successfully:', file.name);
      }
    });
  }

  // Show apply modal
  applyBtn.addEventListener('click', () => {
    applyModal.style.display = 'block';
    applyBtn.style.display = 'none';
    
    // Reset form
    selectedFile = null;
    if (resumeInput) resumeInput.value = '';
    if (uploadPrompt) uploadPrompt.style.display = 'block';
    if (fileInfo) fileInfo.style.display = 'none';
    if (resumeUploadArea) {
      resumeUploadArea.style.borderColor = '#ddd';
      resumeUploadArea.style.background = '#f9f9f9';
    }
    if (resumeError) resumeError.style.display = 'none';
    if (coverLetterInput) coverLetterInput.value = '';
  });

  // Cancel application
  cancelBtn.addEventListener('click', () => {
    applyModal.style.display = 'none';
    applyBtn.style.display = 'inline-block';
    if (coverLetterInput) coverLetterInput.value = '';
    selectedFile = null;
    if (resumeInput) resumeInput.value = '';
  });

  // Submit application
  submitBtn.addEventListener('click', async () => {
    console.log('Submit clicked, selected file:', selectedFile);
    
    // Validate resume is uploaded
    if (!selectedFile) {
      resumeError.textContent = 'Please upload your resume before submitting';
      resumeError.style.display = 'block';
      if (resumeUploadArea) {
        resumeUploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('job', jobId);
      formData.append('cover_letter', coverLetterInput.value || '');
      formData.append('resume', selectedFile);

      console.log('Submitting application...');

      const response = await fetch('/api/applications/apply/', {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (response.ok) {
        messageDiv.textContent = '✓ Application submitted successfully!';
        messageDiv.style.color = 'green';
        messageDiv.style.display = 'block';
        applyModal.style.display = 'none';
        applyBtn.textContent = 'Applied';
        applyBtn.disabled = true;
      } else {
        messageDiv.textContent = data.error || 'Failed to submit application';
        messageDiv.style.color = 'red';
        messageDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      messageDiv.textContent = 'Error submitting application. Please try again.';
      messageDiv.style.color = 'red';
      messageDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });

  // Helper function to format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
});

// Helper function to get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
