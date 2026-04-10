// API client for HireConnect backend
const API_BASE_URL = window.location.origin;

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

class JobAPI {
  static async getLatestJobs() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/latest/`);
      if (!response.ok) throw new Error('Failed to fetch latest jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching latest jobs:', error);
      throw error;
    }
  }

  static async getJobs(searchQuery = '') {
    try {
      const url = searchQuery 
        ? `${API_BASE_URL}/api/jobs/?q=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/api/jobs/`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  static async getJobDetail(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/`);
      if (!response.ok) throw new Error('Failed to fetch job details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  }

  static formatSalary(min, max) {
    if (!min && !max) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max)}`;
  }

  static formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
}
