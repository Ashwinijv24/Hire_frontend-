import { Application, SavedJob } from '../types';

const APPLICATIONS_KEY = 'hireconnect_applications';
const SAVED_JOBS_KEY = 'hireconnect_saved_jobs';

export const StorageManager = {
  // Applications
  getApplications(): Application[] {
    try {
      const data = localStorage.getItem(APPLICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading applications from storage:', error);
      return [];
    }
  },

  addApplication(jobId: number, jobTitle: string, companyName: string, location: string): void {
    try {
      const applications = this.getApplications();
      const newApp: Application = {
        id: Date.now(),
        job: {
          id: jobId,
          title: jobTitle,
          company: { id: 1, name: companyName },
          location,
          salary_min: null,
          salary_max: null,
          employment_type_display: 'Full-time',
          is_remote: false,
          is_featured: false,
          posted_at: new Date().toISOString(),
        },
        status: 'pending',
        status_display: 'Pending',
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      applications.push(newApp);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    } catch (error) {
      console.error('Error saving application to storage:', error);
    }
  },

  removeApplication(appId: number): void {
    try {
      const applications = this.getApplications();
      const filtered = applications.filter(app => app.id !== appId);
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing application from storage:', error);
    }
  },

  // Saved Jobs
  getSavedJobs(): SavedJob[] {
    try {
      const data = localStorage.getItem(SAVED_JOBS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading saved jobs from storage:', error);
      return [];
    }
  },

  addSavedJob(jobId: number, jobTitle: string, companyName: string, location: string, salary_min?: number, salary_max?: number): void {
    try {
      const savedJobs = this.getSavedJobs();
      
      // Check if already saved
      if (savedJobs.some(job => job.job.id === jobId)) {
        return;
      }

      const newSavedJob: SavedJob = {
        id: Date.now(),
        job: {
          id: jobId,
          title: jobTitle,
          company: { id: 1, name: companyName },
          location,
          salary_min,
          salary_max,
          employment_type_display: 'Full-time',
          is_remote: false,
          is_featured: false,
          posted_at: new Date().toISOString(),
        },
        saved_at: new Date().toISOString(),
      };
      savedJobs.push(newSavedJob);
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(savedJobs));
    } catch (error) {
      console.error('Error saving job to storage:', error);
    }
  },

  removeSavedJob(jobId: number): void {
    try {
      const savedJobs = this.getSavedJobs();
      const filtered = savedJobs.filter(job => job.job.id !== jobId);
      localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing saved job from storage:', error);
    }
  },

  isJobSaved(jobId: number): boolean {
    const savedJobs = this.getSavedJobs();
    return savedJobs.some(job => job.job.id === jobId);
  },

  hasApplied(jobId: number): boolean {
    const applications = this.getApplications();
    return applications.some(app => app.job.id === jobId);
  },
};
