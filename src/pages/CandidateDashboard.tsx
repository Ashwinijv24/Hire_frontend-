import React, { useState, useEffect } from 'react';
import { Application, SavedJob, UserProfile } from '../types';
import { ApplicationAPI, ProfileAPI } from '../utils/api';
import '../styles/dashboard.css';

export const CandidateDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalApps: 0, totalSaved: 0, profileCompletion: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [apps, saved, profile] = await Promise.all([
        ApplicationAPI.getApplications(),
        ApplicationAPI.getSavedJobs(),
        ProfileAPI.getProfile()
      ]);

      setApplications(apps);
      setSavedJobs(saved);

      let completion = 0;
      if (profile.full_name) completion += 20;
      if (profile.designation) completion += 20;
      if (profile.profile_summary) completion += 20;
      if (profile.skills) completion += 20;
      if (profile.experience_years) completion += 20;

      setStats({
        totalApps: apps.length,
        totalSaved: saved.length,
        profileCompletion: completion
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalApps}</div>
          <div className="stat-label">Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalSaved}</div>
          <div className="stat-label">Saved Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.profileCompletion}%</div>
          <div className="stat-label">Profile Complete</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </button>
        <button
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <h3>Recent Applications</h3>
          <div className="applications-list">
            {applications.slice(0, 5).map(app => (
              <div key={app.id} className="application-card">
                <h4>{app.job.title}</h4>
                <p>{app.job.company.name}</p>
                <span className="status-badge">{app.status}</span>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '2rem' }}>Recently Saved</h3>
          <div className="jobs-list">
            {savedJobs.slice(0, 5).map(item => (
              <div key={item.id} className="job-card-compact">
                <h4>{item.job.title}</h4>
                <p>{item.job.company.name}</p>
                <p>📍 {item.job.location}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="tab-content">
          {applications.map(app => (
            <div key={app.id} className="application-card-full">
              <div className="card-header">
                <div>
                  <h3>{app.job.title}</h3>
                  <p>{app.job.company.name}</p>
                </div>
                <span className="status-badge">{app.status}</span>
              </div>
              <p className="applied-date">Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
              <a href={`/applications/${app.id}/`} className="btn-primary">View Details</a>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="tab-content">
          {savedJobs.map(item => (
            <div key={item.id} className="saved-job-card">
              <h3>{item.job.title}</h3>
              <p>{item.job.company.name}</p>
              <p>📍 {item.job.location}</p>
              <div className="card-actions">
                <a href={`/jobs/${item.job.id}/`} className="btn-primary">View Job</a>
                <button onClick={() => ApplicationAPI.unsaveJob(item.job.id).then(() => loadDashboard())} className="btn-secondary">
                  Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
