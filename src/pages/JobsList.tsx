import React, { useState, useEffect } from 'react';
import { Job } from '../types';
import { JobAPI, MatchingAPI } from '../utils/api';
import { getScoreColor } from '../utils/helpers';
import '../styles/jobs.css';

interface JobsListProps {
  onJobSelect?: (jobId: number) => void;
}

export const JobsList: React.FC<JobsListProps> = ({ onJobSelect }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Record<number, number>>({});

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (jobs.length > 0 && jobs.length <= 20) {
      calculateMatches();
    }
  }, [jobs]);

  const loadJobs = async (query: string = '') => {
    setLoading(true);
    try {
      const data = await JobAPI.getJobs(query);
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMatches = async () => {
    try {
      const jobIds = jobs.map(job => job.id);
      const matchData = await MatchingAPI.calculateMatches(jobIds);
      const matchMap: Record<number, number> = {};
      matchData.forEach((match: any) => {
        matchMap[match.job_id] = match.overall_score;
      });
      setMatches(matchMap);
    } catch (error) {
      console.error('Error calculating matches:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const timeout = setTimeout(() => {
      loadJobs(query);
    }, 300);
    return () => clearTimeout(timeout);
  };

  const handleViewDetails = (jobId: number) => {
    if (onJobSelect) {
      onJobSelect(jobId);
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>Find Your Next Opportunity</h2>
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {loading && <div className="loading">Loading jobs...</div>}

      <div className="jobs-grid">
        {jobs.map(job => (
          <div key={job.id} className="job-card" data-job-id={job.id}>
            {job.is_featured && (
              <span className="featured-badge">⭐ Featured</span>
            )}

            {matches[job.id] !== undefined && (
              <span className="match-badge" style={{ background: `linear-gradient(135deg, ${getScoreColor(matches[job.id]).start}, ${getScoreColor(matches[job.id]).end})` }}>
                {matches[job.id]}% Match
              </span>
            )}

            <h3>
              <a href="#" onClick={(e) => { e.preventDefault(); handleViewDetails(job.id); }}>{job.title}</a>
            </h3>

            <p className="meta">
              <span>🏢 {job.company.name}</span>
              {job.location && <span>📍 {job.location}</span>}
            </p>

            <span className="employment-type">{job.employment_type_display}</span>
            {job.is_remote && (
              <span className="remote-badge">🏠 Remote</span>
            )}

            <p className="salary">{JobAPI.formatSalary(job.salary_min, job.salary_max)}</p>
            <p className="posted">{JobAPI.formatDate(job.posted_at)}</p>

            <div className="job-actions">
              <button onClick={() => handleViewDetails(job.id)} className="btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && jobs.length === 0 && (
        <div className="empty-state">
          <h3>No jobs found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};
