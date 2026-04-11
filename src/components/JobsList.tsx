import React, { useState, useEffect } from 'react';
import { JobAPI } from '../utils/api';

interface Job {
  id: number;
  title: string;
  company: { name: string; logo?: string };
  location?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type_display: string;
  is_remote: boolean;
  is_featured: boolean;
  posted_at: string;
}

export const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async (query: string = '') => {
    setLoading(true);
    try {
      const data = await JobAPI.getJobs(query);
      setJobs(data.results || data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="jobs-container">
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />
      
      {loading && <div className="loading">Loading jobs...</div>}
      
      <div className="jobs-grid">
        {jobs.map(job => (
          <div key={job.id} className="job-card" data-job-id={job.id}>
            {job.is_featured && (
              <span style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'var(--accent)',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                ⭐ Featured
              </span>
            )}
            
            <h3>
              <a href={`/jobs/${job.id}/`}>{job.title}</a>
            </h3>
            
            <p className="meta">
              <span>🏢 {job.company.name}</span>
              {job.location && <span>📍 {job.location}</span>}
            </p>
            
            <span className="employment-type">{job.employment_type_display}</span>
            {job.is_remote && (
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                background: 'var(--secondary)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                marginLeft: '0.5rem'
              }}>
                🏠 Remote
              </span>
            )}
            
            <p className="salary">{JobAPI.formatSalary(job.salary_min, job.salary_max)}</p>
            <p className="posted">{JobAPI.formatDate(job.posted_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
