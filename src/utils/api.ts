import { Job, Application, SavedJob, UserProfile, Notification, Interview, MatchScore, RecommendedJob } from '../types';

const API_BASE_URL = window.location.origin;

export function getCookie(name: string): string | null {
  let cookieValue: string | null = null;
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

export class JobAPI {
  static async getLatestJobs(): Promise<Job[]> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/latest/`);
    if (!response.ok) throw new Error('Failed to fetch latest jobs');
    const data = await response.json();
    return data.results || data;
  }

  static async getJobs(searchQuery: string = ''): Promise<Job[]> {
    const url = searchQuery 
      ? `${API_BASE_URL}/api/jobs/?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/api/jobs/`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    const data = await response.json();
    return data.results || data;
  }

  static async getJobDetail(jobId: number): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/`);
    if (!response.ok) throw new Error('Failed to fetch job details');
    return await response.json();
  }

  static formatSalary(min: number | null, max: number | null): string {
    if (!min && !max) return 'Salary not specified';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `From ${formatter.format(min)}`;
    return `Up to ${formatter.format(max!)}`;
  }

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }
}

export class ApplicationAPI {
  static async getApplications(): Promise<Application[]> {
    const response = await fetch('/applications/api/applications/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    const data = await response.json();
    return data.results || data;
  }

  static async getSavedJobs(): Promise<SavedJob[]> {
    const response = await fetch('/applications/api/saved-jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    const data = await response.json();
    return data.results || data;
  }

  static async saveJob(jobId: number): Promise<void> {
    const response = await fetch('/api/save-job/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || '',
      },
      body: JSON.stringify({ job_id: jobId }),
    });
    if (!response.ok) throw new Error('Failed to save job');
  }

  static async unsaveJob(jobId: number): Promise<void> {
    const response = await fetch(`/applications/api/unsave-job/${jobId}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to unsave job');
  }

  static async applyJob(jobId: number, resume: File, coverLetter: string = ''): Promise<void> {
    const formData = new FormData();
    formData.append('job', jobId.toString());
    formData.append('cover_letter', coverLetter);
    formData.append('resume', resume);

    const response = await fetch('/api/applications/apply/', {
      method: 'POST',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to submit application');
  }
}

export class ProfileAPI {
  static async getProfile(): Promise<UserProfile> {
    const response = await fetch('/accounts/api/profile/me/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  }

  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await fetch('/accounts/api/profile/update_profile/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  }

  static async getEducation(): Promise<any[]> {
    const response = await fetch('/accounts/api/profile/education/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch education');
    const data = await response.json();
    return data.results || data;
  }

  static async addEducation(data: any): Promise<any> {
    const response = await fetch('/accounts/api/profile/education/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add education');
    return await response.json();
  }

  static async deleteEducation(eduId: number): Promise<void> {
    const response = await fetch(`/accounts/api/profile/education/${eduId}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to delete education');
  }

  static async getExperience(): Promise<any[]> {
    const response = await fetch('/accounts/api/profile/experience/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch experience');
    const data = await response.json();
    return data.results || data;
  }

  static async addExperience(data: any): Promise<any> {
    const response = await fetch('/accounts/api/profile/experience/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add experience');
    return await response.json();
  }

  static async deleteExperience(expId: number): Promise<void> {
    const response = await fetch(`/accounts/api/profile/experience/${expId}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to delete experience');
  }

  static async getCertifications(): Promise<any[]> {
    const response = await fetch('/accounts/api/profile/certifications/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch certifications');
    const data = await response.json();
    return data.results || data;
  }

  static async addCertification(data: any): Promise<any> {
    const response = await fetch('/accounts/api/profile/certifications/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add certification');
    return await response.json();
  }

  static async deleteCertification(certId: number): Promise<void> {
    const response = await fetch(`/accounts/api/profile/certifications/${certId}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to delete certification');
  }
}

export class MatchingAPI {
  static async getJobMatch(jobId: number): Promise<MatchScore> {
    const response = await fetch(`/applications/api/jobs/${jobId}/match/`, {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch match score');
    return await response.json();
  }

  static async getRecommendedJobs(): Promise<RecommendedJob[]> {
    const response = await fetch('/applications/api/recommended-jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch recommended jobs');
    const data = await response.json();
    return data.recommended_jobs || [];
  }

  static async calculateMatches(jobIds: number[]): Promise<any[]> {
    const response = await fetch('/applications/api/calculate-matches/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify({ job_ids: jobIds })
    });
    if (!response.ok) throw new Error('Failed to calculate matches');
    const data = await response.json();
    return data.matches || [];
  }
}

export class InterviewAPI {
  static async startInterview(jobCategory: string, difficulty: string): Promise<any> {
    const response = await fetch('/api/interviews/mock-interviews/start_interview/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify({ job_category: jobCategory, difficulty })
    });
    if (!response.ok) throw new Error('Failed to start interview');
    return await response.json();
  }

  static async submitAnswer(interviewId: number, questionId: number, answer: string): Promise<void> {
    const response = await fetch(`/api/interviews/mock-interviews/${interviewId}/submit_answer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || ''
      },
      body: JSON.stringify({ question_id: questionId, answer })
    });
    if (!response.ok) throw new Error('Failed to submit answer');
  }

  static async completeInterview(interviewId: number): Promise<any> {
    const response = await fetch(`/api/interviews/mock-interviews/${interviewId}/complete_interview/`, {
      method: 'POST',
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to complete interview');
    return await response.json();
  }

  static async getInterviews(): Promise<Interview[]> {
    const response = await fetch('/api/interviews/mock-interviews/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
    });
    if (!response.ok) throw new Error('Failed to fetch interviews');
    const data = await response.json();
    return data.results || data;
  }
}

export class NotificationAPI {
  static async getNotifications(): Promise<Notification[]> {
    const response = await fetch('/notifications/api/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  }

  static async getUnreadCount(): Promise<number> {
    const response = await fetch('/notifications/api/unread-count/', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error('Failed to fetch unread count');
    const data = await response.json();
    return data.unread_count || 0;
  }

  static async markAsRead(notificationId: number): Promise<void> {
    const response = await fetch(`/notifications/api/${notificationId}/mark-as-read/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error('Failed to mark as read');
  }

  static async markAllAsRead(): Promise<void> {
    const response = await fetch('/notifications/api/mark-all-as-read/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    if (!response.ok) throw new Error('Failed to mark all as read');
  }
}
