import { Job, Application, SavedJob, UserProfile, Notification, Interview, MatchScore, RecommendedJob } from '../types';
import { mockJobs, mockNotifications, mockInterviews } from './mockData';
import { StorageManager } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = false; // Set to false when backend is ready

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
}

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
    if (USE_MOCK_DATA) {
      return mockJobs.slice(0, 6);
    }
    const response = await fetch(`${API_BASE_URL}/api/jobs/latest/`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch latest jobs');
    const data = await response.json();
    return data.results || data;
  }

  static async getJobs(searchQuery: string = ''): Promise<Job[]> {
    if (USE_MOCK_DATA) {
      if (!searchQuery) return mockJobs;
      const query = searchQuery.toLowerCase();
      return mockJobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.name.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query))
      );
    }
    const url = searchQuery 
      ? `${API_BASE_URL}/api/jobs/?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/api/jobs/`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch jobs');
    const data = await response.json();
    return data.results || data;
  }

  static async getJobDetail(jobId: number): Promise<Job> {
    if (USE_MOCK_DATA) {
      const job = mockJobs.find(j => j.id === jobId);
      if (!job) throw new Error('Job not found');
      return job;
    }
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/`, {
      headers: getAuthHeaders(),
    });
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
    if (USE_MOCK_DATA) {
      return StorageManager.getApplications();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/applications/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch applications');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      return StorageManager.getApplications();
    }
  }

  static async getSavedJobs(): Promise<SavedJob[]> {
    if (USE_MOCK_DATA) {
      return StorageManager.getSavedJobs();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/saved-jobs/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch saved jobs');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      return StorageManager.getSavedJobs();
    }
  }

  static async saveJob(jobId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      const job = mockJobs.find(j => j.id === jobId);
      if (job) {
        StorageManager.addSavedJob(job.id, job.title, job.company.name, job.location || 'Remote', job.salary_min || undefined, job.salary_max || undefined);
      }
      console.log('Mock: Job saved', jobId);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/save-job/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_id: jobId }),
      });
      if (!response.ok) throw new Error('Failed to save job');
    } catch (error) {
      console.error('Error saving job:', error);
      StorageManager.addSavedJob(jobId, '', '', 'Remote');
    }
  }

  static async unsaveJob(jobId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      StorageManager.removeSavedJob(jobId);
      console.log('Mock: Job unsaved', jobId);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/unsave-job/${jobId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to unsave job');
    } catch (error) {
      console.error('Error unsaving job:', error);
      StorageManager.removeSavedJob(jobId);
    }
  }

  static async applyJob(jobId: number, resume: File, coverLetter: string = ''): Promise<void> {
    if (USE_MOCK_DATA) {
      // Simulate file upload validation
      if (!resume) {
        throw new Error('Resume is required');
      }
      if (resume.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resume.type)) {
        throw new Error('Please upload a PDF, DOC, or DOCX file');
      }
      
      // Add application to storage
      const job = mockJobs.find(j => j.id === jobId);
      if (job) {
        StorageManager.addApplication(job.id, job.title, job.company.name, job.location || 'Remote');
      }
      
      console.log('Mock: Application submitted', { jobId, resume: resume.name, coverLetter });
      return;
    }
    try {
      const formData = new FormData();
      formData.append('job', jobId.toString());
      formData.append('cover_letter', coverLetter);
      formData.append('resume', resume);

      const response = await fetch(`${API_BASE_URL}/applications/api/apply/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken') || ''}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to submit application');
    } catch (error) {
      console.error('Error submitting application:', error);
      StorageManager.addApplication(jobId, '', '', 'Remote');
    }
  }
}

export class ProfileAPI {
  static async getProfile(): Promise<UserProfile> {
    if (USE_MOCK_DATA) {
      return {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        full_name: 'John Doe',
        phone: '+1-555-0123',
        designation: 'Full Stack Developer',
        company: 'Tech Corp',
        location: 'San Francisco, CA',
        experience_years: 5,
        profile_summary: 'Experienced full stack developer with expertise in React, Node.js, and cloud technologies.',
        skills: 'JavaScript, React, Node.js, TypeScript, Python, AWS, Docker',
        skills_list: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe',
        portfolio_url: 'https://johndoe.dev',
        resume_url: 'https://example.com/resume.pdf',
      };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/me/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  static async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Profile updated', data);
      return { ...data } as UserProfile;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/update_profile/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return await response.json();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  static async getEducation(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return [
        {
          id: 1,
          degree: 'Bachelor of Science',
          field_of_study: 'Computer Science',
          institution: 'State University',
          start_date: '2015-09-01',
          end_date: '2019-05-31',
          is_current: false,
          grade: '3.8',
        },
      ];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/education/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch education');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching education:', error);
      return [];
    }
  }

  static async addEducation(data: any): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Education added', data);
      return { id: Math.random(), ...data };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/education/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add education');
      return await response.json();
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  }

  static async deleteEducation(eduId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Education deleted', eduId);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/education/${eduId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete education');
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  }

  static async getExperience(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return [
        {
          id: 1,
          job_title: 'Senior Developer',
          company: 'Tech Corp',
          location: 'San Francisco, CA',
          start_date: '2020-01-15',
          end_date: null,
          is_current: true,
          description: 'Leading full stack development projects',
        },
      ];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/experience/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch experience');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching experience:', error);
      return [];
    }
  }

  static async addExperience(data: any): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Experience added', data);
      return { id: Math.random(), ...data };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/experience/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add experience');
      return await response.json();
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  }

  static async deleteExperience(expId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Experience deleted', expId);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/experience/${expId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete experience');
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }

  static async getCertifications(): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return [
        {
          id: 1,
          name: 'AWS Certified Solutions Architect',
          issuing_organization: 'Amazon Web Services',
          issue_date: '2021-06-15',
          expiry_date: '2024-06-15',
          credential_id: 'AWS-123456',
          credential_url: 'https://aws.amazon.com/verify',
        },
      ];
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/certifications/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch certifications');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  static async addCertification(data: any): Promise<any> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Certification added', data);
      return { id: Math.random(), ...data };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/certifications/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to add certification');
      return await response.json();
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  }

  static async deleteCertification(certId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Certification deleted', certId);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/accounts/api/profile/certifications/${certId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete certification');
    } catch (error) {
      console.error('Error deleting certification:', error);
      throw error;
    }
  }
}

export class MatchingAPI {
  static async getJobMatch(jobId: number): Promise<MatchScore> {
    if (USE_MOCK_DATA) {
      const scores = [85, 92, 78, 88, 75, 90, 82, 87, 70, 88, 76, 84, 79, 86, 81];
      const score = scores[jobId % scores.length];
      return {
        overall_score: score,
        match_level: score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Fair' : 'Poor',
        skills_score: Math.min(100, score + Math.random() * 10),
        experience_score: Math.min(100, score - Math.random() * 5),
        education_score: Math.min(100, score + Math.random() * 8),
        location_score: Math.random() > 0.5 ? 100 : 60,
        matched_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs'].slice(0, Math.floor(Math.random() * 5) + 1),
        missing_skills: ['Docker', 'Kubernetes', 'GraphQL', 'AWS'].slice(0, Math.floor(Math.random() * 3) + 1),
        matched_keywords: ['Full Stack', 'Web Development', 'Frontend', 'Backend'],
      };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/jobs/${jobId}/match/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch match score');
      return await response.json();
    } catch (error) {
      console.warn('Error fetching match score, using mock data:', error);
      const scores = [85, 92, 78, 88, 75, 90, 82, 87, 70, 88, 76, 84, 79, 86, 81];
      const score = scores[jobId % scores.length];
      return {
        overall_score: score,
        match_level: score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Fair' : 'Poor',
        skills_score: Math.min(100, score + Math.random() * 10),
        experience_score: Math.min(100, score - Math.random() * 5),
        education_score: Math.min(100, score + Math.random() * 8),
        location_score: Math.random() > 0.5 ? 100 : 60,
        matched_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs'].slice(0, Math.floor(Math.random() * 5) + 1),
        missing_skills: ['Docker', 'Kubernetes', 'GraphQL', 'AWS'].slice(0, Math.floor(Math.random() * 3) + 1),
        matched_keywords: ['Full Stack', 'Web Development', 'Frontend', 'Backend'],
      };
    }
  }

  static async getRecommendedJobs(): Promise<RecommendedJob[]> {
    if (USE_MOCK_DATA) {
      return mockJobs.slice(0, 5).map((job, idx) => ({
        job,
        overall_score: [92, 88, 85, 82, 79][idx],
        match_level: ['Excellent', 'Good', 'Good', 'Fair', 'Fair'][idx],
        matched_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs'].slice(0, idx + 2),
      }));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/recommended-jobs/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch recommended jobs');
      const data = await response.json();
      return data.recommended_jobs || [];
    } catch (error) {
      console.warn('Error fetching recommended jobs:', error);
      return [];
    }
  }

  static async calculateMatches(jobIds: number[]): Promise<any[]> {
    if (USE_MOCK_DATA) {
      return jobIds.map((id, idx) => ({
        job_id: id,
        overall_score: [85, 92, 78, 88, 75, 90, 82, 87, 70, 88, 76, 84, 79, 86, 81][idx % 15],
        is_recommended: idx % 3 === 0,
      }));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/applications/api/calculate-matches/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_ids: jobIds })
      });
      if (!response.ok) throw new Error('Failed to calculate matches');
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.warn('Error calculating matches:', error);
      return [];
    }
  }
}

export class InterviewAPI {
  static async startInterview(jobCategory: string, difficulty: string): Promise<any> {
    if (USE_MOCK_DATA) {
      return {
        id: Math.floor(Math.random() * 1000),
        job_category: jobCategory,
        difficulty,
        questions: [
          { id: 1, text: 'What is React?', category: 'Frontend', options: { A: 'A library', B: 'A framework', C: 'A tool', D: 'A language' } },
          { id: 2, text: 'What is Node.js?', category: 'Backend', options: { A: 'A runtime', B: 'A framework', C: 'A database', D: 'A library' } },
        ],
      };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/api/mock-interviews/start_interview/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ job_category: jobCategory, difficulty })
      });
      if (!response.ok) throw new Error('Failed to start interview');
      return await response.json();
    } catch (error) {
      console.error('Error starting interview:', error);
      throw error;
    }
  }

  static async submitAnswer(interviewId: number, questionId: number, answer: string): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log('Mock: Answer submitted', { interviewId, questionId, answer });
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/api/mock-interviews/${interviewId}/submit_answer/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question_id: questionId, answer })
      });
      if (!response.ok) throw new Error('Failed to submit answer');
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  static async completeInterview(interviewId: number): Promise<any> {
    if (USE_MOCK_DATA) {
      return { id: interviewId, score: Math.floor(Math.random() * 40 + 60), completed: true };
    }
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/api/mock-interviews/${interviewId}/complete_interview/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to complete interview');
      return await response.json();
    } catch (error) {
      console.error('Error completing interview:', error);
      throw error;
    }
  }

  static async getInterviews(): Promise<Interview[]> {
    if (USE_MOCK_DATA) {
      return mockInterviews;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/api/mock-interviews/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch interviews');
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return mockInterviews;
    }
  }
}

export class NotificationAPI {
  static async getNotifications(): Promise<Notification[]> {
    if (USE_MOCK_DATA) {
      return mockNotifications;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/api/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.warn('Failed to fetch notifications, using mock data');
        return mockNotifications;
      }
      const data = await response.json();
      return data.results || data || mockNotifications;
    } catch (error) {
      console.warn('Error fetching notifications, using mock data:', error);
      return mockNotifications;
    }
  }

  static async getUnreadCount(): Promise<number> {
    if (USE_MOCK_DATA) {
      return mockNotifications.filter(n => !n.is_read).length;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/api/unread-count/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.warn('Failed to fetch unread count');
        return 0;
      }
      const data = await response.json();
      return data.unread_count || 0;
    } catch (error) {
      console.warn('Error fetching unread count:', error);
      return 0;
    }
  }

  static async markAsRead(notificationId: number): Promise<void> {
    if (USE_MOCK_DATA) {
      const notif = mockNotifications.find(n => n.id === notificationId);
      if (notif) notif.is_read = true;
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/api/${notificationId}/mark-as-read/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.warn('Failed to mark notification as read');
      }
    } catch (error) {
      console.warn('Error marking notification as read:', error);
    }
  }

  static async markAllAsRead(): Promise<void> {
    if (USE_MOCK_DATA) {
      mockNotifications.forEach(n => n.is_read = true);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/api/mark-all-as-read/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.warn('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.warn('Error marking all notifications as read:', error);
    }
  }
}
