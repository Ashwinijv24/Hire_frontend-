import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/api';

interface Application {
  id: number;
  job: { id: number; title: string; company: { name: string } };
  status: string;
  applied_at: string;
  updated_at: string;
}

interface SavedJob {
  id: number;
  job: { id: number; title: string; company: { name: string }; location: string };
  saved_at: string;
}

export const CandidateDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalApps: 0, totalSaved: 0, profileCompletion: 0 });
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
    loadRecentApplications();
    loadRecentlySaved();
  }, []);

  const loadStats = async () => {
    try {
      const [appsRes, savedRes, profileRes] = await Promise.all([
        fetch('/applications/api/applications/', {
          headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
        }),
        fetch('/applications/api/saved-jobs/', {
          headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
        }),
        fetch('/accounts/api/profile/me/', {
          headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
        })
      ]);

      const appsData = await appsRes.json();
      const savedData = await savedRes.json();
      const profile = await profileRes.json();

      const apps = appsData.results || appsData;
      const saved = savedData.results || savedData;

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
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentApplications = async () => {
    try {
      const res = await fetch('/applications/api/applications/', {
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      const data = await res.json();
      setApplications((data.results || data).slice(0, 5));
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadRecentlySaved = async () => {
    try {
      const res = await fetch('/applications/api/saved-jobs/', {
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      const data = await res.json();
      setSavedJobs((data.results || data).slice(0, 5));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

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
          <div id="recentApplications">
            {applications.map(app => (
              <div key={app.id} className="application-card">
                <h4>{app.job.title}</h4>
                <p>{app.job.company.name}</p>
                <span className="status-badge">{app.status}</span>
              </div>
            ))}
          </div>

          <h3>Recently Saved</h3>
          <div id="recentlySaved">
            {savedJobs.map(item => (
              <div key={item.id} className="job-card">
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
            <div key={app.id} className="application-card">
              <h3>{app.job.title}</h3>
              <p>{app.job.company.name}</p>
              <p>Applied: {new Date(app.applied_at).toLocaleDateString()}</p>
              <span className="status-badge">{app.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="tab-content">
          {savedJobs.map(item => (
            <div key={item.id} className="job-card">
              <h3>{item.job.title}</h3>
              <p>{item.job.company.name}</p>
              <p>📍 {item.job.location}</p>
              <a href={`/jobs/${item.job.id}/`} className="btn-primary">View Job</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
