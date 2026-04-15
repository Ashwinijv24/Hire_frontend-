import React, { useState, useEffect } from 'react';
import { Job, MatchScore, Application } from '../types';
import { JobAPI, ApplicationAPI, MatchingAPI } from '../utils/api';
import { getScoreColor, validateResumeFile, showToast } from '../utils/helpers';
import { StorageManager } from '../utils/storage';
import '../styles/jobs.css';

interface JobDetailProps {
  jobId: number;
  onBack: () => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ jobId, onBack }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJobDetail();
    checkApplicationStatus();
  }, [jobId]);

  const loadJobDetail = async () => {
    try {
      const jobData = await JobAPI.getJobDetail(jobId);
      setJob(jobData);
      
      // Load match score
      try {
        const match = await MatchingAPI.getJobMatch(jobId);
        setMatchScore(match);
      } catch (error) {
        console.error('Error loading match score:', error);
      }
    } catch (error) {
      console.error('Error loading job detail:', error);
      showToast('Failed to load job details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    const applied = StorageManager.hasApplied(jobId);
    setHasApplied(applied);
    
    const saved = StorageManager.isJobSaved(jobId);
    setIsSaved(saved);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateResumeFile(file);
      if (validation.valid) {
        setResume(file);
      } else {
        showToast(validation.error || 'Invalid file', 'error');
      }
    }
  };

  const handleApplySubmit = async () => {
    if (!resume) {
      showToast('Please upload your resume', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await ApplicationAPI.applyJob(jobId, resume, coverLetter);
      showToast('Application submitted successfully!', 'success');
      setShowApplyModal(false);
      setHasApplied(true);
      setResume(null);
      setCoverLetter('');
    } catch (error) {
      console.error('Error submitting application:', error);
      showToast('Failed to submit application', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      await ApplicationAPI.saveJob(jobId);
      setIsSaved(true);
      showToast('Job saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving job:', error);
      showToast('Failed to save job', 'error');
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="empty-state"><h3>Job not found</h3></div>;

  return (
    <div className="job-detail-container">
      <button onClick={onBack} className="btn-back">← Back to Jobs</button>

      <div className="job-detail-header">
        <div>
          <h1>{job.title}</h1>
          <p className="company-name">{job.company.name}</p>
          <p className="location">📍 {job.location || 'Remote'}</p>
        </div>
        <div className="job-detail-actions">
          <button 
            onClick={handleSaveJob}
            disabled={isSaved}
            className={`btn-secondary ${isSaved ? 'saved' : ''}`}
          >
            {isSaved ? '✓ Saved' : 'Save Job'}
          </button>
          <button 
            onClick={() => setShowApplyModal(true)}
            disabled={hasApplied}
            className={`btn-primary ${hasApplied ? 'applied' : ''}`}
          >
            {hasApplied ? '✓ Applied' : 'Apply Now'}
          </button>
        </div>
      </div>

      {matchScore && (
        <div className="match-score-section">
          <div className="match-score-card" style={{ background: `linear-gradient(135deg, ${getScoreColor(matchScore.overall_score).start}, ${getScoreColor(matchScore.overall_score).end})` }}>
            <div className="score-main">
              <div className="score-value">{matchScore.overall_score}%</div>
              <div className="score-label">AI Match</div>
              <div className="match-level">{matchScore.match_level}</div>
            </div>
            <div className="score-breakdown">
              <div className="score-item">
                <span>Skills</span>
                <strong>{Math.round(matchScore.skills_score)}%</strong>
              </div>
              <div className="score-item">
                <span>Experience</span>
                <strong>{Math.round(matchScore.experience_score)}%</strong>
              </div>
              <div className="score-item">
                <span>Education</span>
                <strong>{Math.round(matchScore.education_score)}%</strong>
              </div>
              <div className="score-item">
                <span>Location</span>
                <strong>{Math.round(matchScore.location_score)}%</strong>
              </div>
            </div>
          </div>

          {matchScore.matched_skills.length > 0 && (
            <div className="skills-section">
              <h3>✅ Your Matching Skills</h3>
              <div className="skills-list">
                {matchScore.matched_skills.map(skill => (
                  <span key={skill} className="skill-badge matched">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {matchScore.missing_skills.length > 0 && (
            <div className="skills-section">
              <h3>💡 Skills to Improve</h3>
              <div className="skills-list">
                {matchScore.missing_skills.map(skill => (
                  <span key={skill} className="skill-badge missing">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="job-detail-content">
        <div className="job-info">
          <h2>Job Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Employment Type</span>
              <span className="value">{job.employment_type_display}</span>
            </div>
            <div className="info-item">
              <span className="label">Salary</span>
              <span className="value">{JobAPI.formatSalary(job.salary_min, job.salary_max)}</span>
            </div>
            <div className="info-item">
              <span className="label">Posted</span>
              <span className="value">{JobAPI.formatDate(job.posted_at)}</span>
            </div>
            <div className="info-item">
              <span className="label">Remote</span>
              <span className="value">{job.is_remote ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Apply for {job.title}</h2>
            
            <div className="form-group">
              <label>Resume *</label>
              <div className="file-upload">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  id="resume-input"
                />
                <label htmlFor="resume-input" className="file-label">
                  {resume ? `✓ ${resume.name}` : 'Click to upload or drag and drop'}
                </label>
              </div>
              <p className="file-hint">PDF, DOC, or DOCX (max 5MB)</p>
            </div>

            <div className="form-group">
              <label>Cover Letter</label>
              <textarea 
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this position..."
                rows={5}
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplySubmit}
                disabled={submitting || !resume}
                className="btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
