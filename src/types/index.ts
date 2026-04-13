// API Response Types
export interface Job {
  id: number;
  title: string;
  company: { id: number; name: string; logo?: string };
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type_display: string;
  is_remote: boolean;
  is_featured: boolean;
  posted_at: string;
  applications_count?: number;
  views_count?: number;
  is_active?: boolean;
}

export interface Application {
  id: number;
  job: Job;
  status: string;
  status_display: string;
  applied_at: string;
  updated_at: string;
  cover_letter?: string;
  resume_url?: string;
  candidate?: { user: { username: string; email: string } };
}

export interface SavedJob {
  id: number;
  job: Job;
  saved_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  designation?: string;
  company?: string;
  location?: string;
  experience_years?: number;
  profile_summary?: string;
  skills?: string;
  skills_list?: string[];
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  resume_url?: string;
}

export interface Education {
  id: number;
  degree: string;
  field_of_study: string;
  institution: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  grade?: string;
  location?: string;
  description?: string;
}

export interface Experience {
  id: number;
  job_title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

export interface Certification {
  id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type: string;
}

export interface Interview {
  id: number;
  job_category: string;
  difficulty: string;
  score?: number;
  created_at: string;
  completed: boolean;
  duration_minutes?: number;
}

export interface InterviewQuestion {
  id: number;
  text: string;
  category: string;
  options?: { A: string; B: string; C: string; D: string };
}

export interface MatchScore {
  overall_score: number;
  match_level: string;
  skills_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
}

export interface RecommendedJob {
  job: Job;
  overall_score: number;
  match_level: string;
  matched_skills: string[];
}
