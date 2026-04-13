import React, { useState, useEffect } from 'react';
import { MatchScore, RecommendedJob } from '../types';
import { MatchingAPI } from '../utils/api';
import { getScoreColor } from '../utils/helpers';
import '../styles/matching.css';

export const JobMatching: React.FC = () => {
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    try {
      const data = await MatchingAPI.getRecommendedJobs();
      setRecommendedJobs(data);
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading recommendations...</div>;

  return (
    <div className="matching-container">
      <h2>🎯 Recommended Jobs for You</h2>

      {recommendedJobs.length === 0 ? (
        <div className="empty-state">
          <p>Complete your profile to get personalized job recommendations!</p>
        </div>
      ) : (
        <div className="recommended-jobs-grid">
          {recommendedJobs.map(match => {
            const scoreColor = getScoreColor(match.overall_score);
            return (
              <div 
                key={match.job.id} 
                className="recommended-job-card"
                style={{ borderLeftColor: scoreColor.start }}
              >
                <div className="card-content">
                  <h3>{match.job.title}</h3>
                  <p className="company">{match.job.company.name}</p>
                  <p className="location">📍 {match.job.location || 'Remote'}</p>

                  {match.matched_skills.length > 0 && (
                    <div className="matched-skills">
                      <strong>Your Skills:</strong>
                      <div className="skills-tags">
                        {match.matched_skills.slice(0, 5).map(skill => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                        {match.matched_skills.length > 5 && (
                          <span className="more-skills">+{match.matched_skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="match-score"
                  style={{ background: `linear-gradient(135deg,${scoreColor.start},${scoreColor.end})` }}
                >
                  <div className="score-value">{match.overall_score}%</div>
                  <div className="score-label">Match</div>
                  <div className="match-level">{match.match_level}</div>
                </div>

                <a href={`/jobs/${match.job.id}/`} className="btn-primary">View Job</a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
