import React, { useState, useEffect } from 'react';
import { getCookie } from '../utils/api';
import { getScoreColor } from '../utils/helpers';

interface MatchScore {
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  match_level: string;
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
}

interface RecommendedJob {
  job: { id: number; title: string; company: { name: string }; location: string };
  overall_score: number;
  match_level: string;
  matched_skills: string[];
}

export const JobMatching: React.FC<{ jobId?: number }> = ({ jobId }) => {
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    if (jobId) {
      loadJobMatch(jobId);
    } else {
      loadRecommendedJobs();
    }
  }, [jobId]);

  const loadJobMatch = async (id: number) => {
    try {
      const response = await fetch(`/applications/api/jobs/${id}/match/`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setMatchScore(data);
      }
    } catch (error) {
      console.error('Error loading match score:', error);
    }
  };

  const loadRecommendedJobs = async () => {
    try {
      const response = await fetch('/applications/api/recommended-jobs/', {
        headers: { 'X-CSRFToken': getCookie('csrftoken') || '' }
      });
      if (response.ok) {
        const data = await response.json();
        setRecommendedJobs(data.recommended_jobs);
      }
    } catch (error) {
      console.error('Error loading recommended jobs:', error);
    }
  };

  if (matchScore) {
    const scoreColor = getScoreColor(matchScore.overall_score);

    return (
      <div className="match-score-container">
        <div style={{
          background: `linear-gradient(135deg,${scoreColor.start},${scoreColor.end})`,
          padding: '2rem',
          borderRadius: '20px',
          color: '#fff',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>AI Match Score</div>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: 1 }}>
                {matchScore.overall_score}%
              </div>
              <div style={{ fontSize: '1.1rem', marginTop: '0.5rem', opacity: 0.95 }}>
                {matchScore.match_level} Match
              </div>
            </div>

            <div style={{ flex: 2, minWidth: '300px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Skills', score: matchScore.skills_score },
                { label: 'Experience', score: matchScore.experience_score },
                { label: 'Education', score: matchScore.education_score },
                { label: 'Location', score: matchScore.location_score }
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '1rem',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                    {item.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {matchScore.matched_skills.length > 0 && (
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              ✅ Your Matching Skills
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {matchScore.matched_skills.map(skill => (
                <span key={skill} style={{
                  background: 'linear-gradient(135deg,#4facfe,#00f2fe)',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {matchScore.missing_skills.length > 0 && (
          <div style={{
            background: '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
              💡 Skills to Improve
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {matchScore.missing_skills.map(skill => (
                <span key={skill} style={{
                  background: 'linear-gradient(135deg,#f093fb,#f5576c)',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="recommended-jobs-container">
      <h2>🎯 Recommended Jobs for You</h2>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {recommendedJobs.map(match => {
          const scoreColor = getScoreColor(match.overall_score);
          return (
            <div key={match.job.id} style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              borderLeft: `4px solid ${scoreColor.start}`,
              cursor: 'pointer'
            }} onClick={() => window.location.href = `/jobs/${match.job.id}/`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {match.job.title}
                  </h3>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>
                    {match.job.company.name}
                  </p>
                  <p style={{ color: '#999', fontSize: '0.9rem' }}>
                    📍 {match.job.location || 'Remote'}
                  </p>

                  {match.matched_skills.length > 0 && (
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {match.matched_skills.slice(0, 5).map(skill => (
                        <span key={skill} style={{
                          background: '#f0f0f0',
                          color: '#333',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {skill}
                        </span>
                      ))}
                      {match.matched_skills.length > 5 && (
                        <span style={{ color: '#999', fontSize: '0.85rem' }}>
                          +{match.matched_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{
                  textAlign: 'center',
                  minWidth: '120px',
                  background: `linear-gradient(135deg,${scoreColor.start},${scoreColor.end})`,
                  color: '#fff',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>
                    {match.overall_score}%
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.95 }}>
                    Match
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', marginTop: '0.75rem' }}>
                    {match.match_level}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
