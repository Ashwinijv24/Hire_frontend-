// AI Resume Matching System

// Load match score for a job
async function loadJobMatch(jobId) {
    try {
        const response = await fetch(`/applications/api/jobs/${jobId}/match/`, {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            const match = await response.json();
            displayMatchScore(match);
        }
    } catch (error) {
        console.error('Error loading match score:', error);
    }
}

// Display match score on job detail page
function displayMatchScore(match) {
    const container = document.getElementById('match-score-container');
    if (!container) return;
    
    const scoreColor = getScoreColor(match.overall_score);
    const matchLevel = match.match_level;
    
    container.innerHTML = `
        <div style="background:linear-gradient(135deg,${scoreColor.start},${scoreColor.end});padding:2rem;border-radius:20px;color:#fff;margin-bottom:2rem;box-shadow:0 10px 30px rgba(0,0,0,0.15);animation:fadeInUp 0.6s ease-out;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1.5rem;">
                <div style="flex:1;min-width:200px;">
                    <div style="font-size:0.9rem;opacity:0.9;margin-bottom:0.5rem;">AI Match Score</div>
                    <div style="font-size:3.5rem;font-weight:800;line-height:1;">${match.overall_score}%</div>
                    <div style="font-size:1.1rem;margin-top:0.5rem;opacity:0.95;">${matchLevel} Match</div>
                </div>
                <div style="flex:2;min-width:300px;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1rem;">
                        ${createScoreCard('Skills', match.skills_score)}
                        ${createScoreCard('Experience', match.experience_score)}
                        ${createScoreCard('Education', match.education_score)}
                        ${createScoreCard('Location', match.location_score)}
                    </div>
                </div>
            </div>
        </div>
        
        ${match.matched_skills.length > 0 ? `
        <div style="background:#fff;padding:1.5rem;border-radius:16px;margin-bottom:1.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:1rem;display:flex;align-items:center;">
                <span style="margin-right:0.5rem;">✅</span> Your Matching Skills
            </h3>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
                ${match.matched_skills.map(skill => `
                    <span style="background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff;padding:0.5rem 1rem;border-radius:10px;font-weight:600;font-size:0.9rem;box-shadow:0 2px 8px rgba(79,172,254,0.3);">
                        ${skill}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${match.missing_skills.length > 0 ? `
        <div style="background:#fff;padding:1.5rem;border-radius:16px;margin-bottom:1.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            <h3 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:1rem;display:flex;align-items:center;">
                <span style="margin-right:0.5rem;">💡</span> Skills to Improve
            </h3>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
                ${match.missing_skills.map(skill => `
                    <span style="background:linear-gradient(135deg,#f093fb,#f5576c);color:#fff;padding:0.5rem 1rem;border-radius:10px;font-weight:600;font-size:0.9rem;box-shadow:0 2px 8px rgba(240,147,251,0.3);">
                        ${skill}
                    </span>
                `).join('')}
            </div>
            <p style="margin-top:1rem;color:var(--gray-600);font-size:0.95rem;">
                💡 Tip: Consider learning these skills to improve your match score for similar positions.
            </p>
        </div>
        ` : ''}
        
        ${match.matched_keywords.length > 0 ? `
        <div style="background:linear-gradient(135deg,#f8fafc,#fff);padding:1.5rem;border-radius:16px;border-left:4px solid #667eea;">
            <h4 style="font-size:1rem;font-weight:700;color:var(--gray-900);margin-bottom:0.75rem;">
                🎯 Matching Keywords
            </h4>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
                ${match.matched_keywords.map(keyword => `
                    <span style="background:var(--gray-200);color:var(--gray-700);padding:0.4rem 0.8rem;border-radius:8px;font-size:0.85rem;">
                        ${keyword}
                    </span>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    container.style.display = 'block';
}

function createScoreCard(label, score) {
    const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : '#f87171';
    return `
        <div style="background:rgba(255,255,255,0.2);padding:1rem;border-radius:12px;backdrop-filter:blur(10px);">
            <div style="font-size:0.85rem;opacity:0.9;margin-bottom:0.25rem;">${label}</div>
            <div style="font-size:1.75rem;font-weight:800;">${score}%</div>
            <div style="width:100%;height:4px;background:rgba(255,255,255,0.3);border-radius:2px;margin-top:0.5rem;overflow:hidden;">
                <div style="width:${score}%;height:100%;background:${color};border-radius:2px;transition:width 0.6s ease-out;"></div>
            </div>
        </div>
    `;
}

function getScoreColor(score) {
    if (score >= 90) {
        return { start: '#10b981', end: '#059669' }; // Green
    } else if (score >= 80) {
        return { start: '#4facfe', end: '#00f2fe' }; // Blue
    } else if (score >= 70) {
        return { start: '#667eea', end: '#764ba2' }; // Purple
    } else if (score >= 60) {
        return { start: '#fbbf24', end: '#f59e0b' }; // Yellow
    } else {
        return { start: '#f093fb', end: '#f5576c' }; // Pink
    }
}

// Load recommended jobs
async function loadRecommendedJobs() {
    try {
        const response = await fetch('/applications/api/recommended-jobs/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecommendedJobs(data.recommended_jobs);
        }
    } catch (error) {
        console.error('Error loading recommended jobs:', error);
    }
}

// Display recommended jobs
function displayRecommendedJobs(jobs) {
    const container = document.getElementById('recommended-jobs-container');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:3rem;color:var(--gray-500);">
                <div style="font-size:3rem;margin-bottom:1rem;">🔍</div>
                <p>Complete your profile to get personalized job recommendations!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h2 style="font-size:2rem;font-weight:800;margin-bottom:2rem;color:var(--gray-900);">
            🎯 Recommended Jobs for You
        </h2>
        <div style="display:grid;gap:1.5rem;">
            ${jobs.map(match => createRecommendedJobCard(match)).join('')}
        </div>
    `;
}

function createRecommendedJobCard(match) {
    const job = match.job;
    const scoreColor = getScoreColor(match.overall_score);
    
    return `
        <div style="background:#fff;border-radius:20px;padding:2rem;box-shadow:0 4px 12px rgba(0,0,0,0.08);transition:all 0.3s;cursor:pointer;border-left:4px solid ${scoreColor.start};" onclick="window.location.href='/jobs/${job.id}/'">
            <div style="display:flex;justify-content:space-between;align-items:start;gap:1.5rem;flex-wrap:wrap;">
                <div style="flex:1;min-width:250px;">
                    <h3 style="font-size:1.5rem;font-weight:700;color:var(--gray-900);margin-bottom:0.5rem;">${job.title}</h3>
                    <p style="color:var(--gray-600);margin-bottom:0.5rem;">${job.company.name}</p>
                    <p style="color:var(--gray-500);font-size:0.9rem;">📍 ${job.location || 'Remote'}</p>
                    
                    ${match.matched_skills.length > 0 ? `
                    <div style="margin-top:1rem;display:flex;flex-wrap:wrap;gap:0.5rem;">
                        ${match.matched_skills.slice(0, 5).map(skill => `
                            <span style="background:var(--gray-100);color:var(--gray-700);padding:0.25rem 0.75rem;border-radius:6px;font-size:0.85rem;">
                                ${skill}
                            </span>
                        `).join('')}
                        ${match.matched_skills.length > 5 ? `<span style="color:var(--gray-500);font-size:0.85rem;">+${match.matched_skills.length - 5} more</span>` : ''}
                    </div>
                    ` : ''}
                </div>
                
                <div style="text-align:center;min-width:120px;">
                    <div style="background:linear-gradient(135deg,${scoreColor.start},${scoreColor.end});color:#fff;padding:1.5rem;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                        <div style="font-size:2.5rem;font-weight:800;line-height:1;">${match.overall_score}%</div>
                        <div style="font-size:0.85rem;margin-top:0.25rem;opacity:0.95;">Match</div>
                    </div>
                    <div style="margin-top:0.75rem;font-size:0.9rem;color:var(--gray-600);">${match.match_level}</div>
                </div>
            </div>
        </div>
    `;
}

// Calculate matches for job list
async function calculateMatchesForJobList(jobIds) {
    try {
        const response = await fetch('/applications/api/calculate-matches/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ job_ids: jobIds })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayMatchBadges(data.matches);
        }
    } catch (error) {
        console.error('Error calculating matches:', error);
    }
}

// Display match badges on job cards
function displayMatchBadges(matches) {
    matches.forEach(match => {
        const jobCard = document.querySelector(`[data-job-id="${match.job_id}"]`);
        if (jobCard) {
            const badge = document.createElement('div');
            badge.className = 'match-badge';
            badge.style.cssText = `
                position:absolute;
                top:1rem;
                right:1rem;
                background:linear-gradient(135deg,#667eea,#764ba2);
                color:#fff;
                padding:0.5rem 1rem;
                border-radius:10px;
                font-weight:700;
                font-size:0.9rem;
                box-shadow:0 4px 12px rgba(102,126,234,0.3);
                z-index:10;
            `;
            badge.textContent = `${match.overall_score}% Match`;
            
            if (match.is_recommended) {
                badge.style.background = 'linear-gradient(135deg,#10b981,#059669)';
            }
            
            jobCard.style.position = 'relative';
            jobCard.appendChild(badge);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load match score on job detail page
    const jobDetailMatch = document.getElementById('match-score-container');
    if (jobDetailMatch) {
        const jobId = jobDetailMatch.dataset.jobId;
        if (jobId) {
            loadJobMatch(jobId);
        }
    }
    
    // Load recommended jobs on dashboard/home
    const recommendedContainer = document.getElementById('recommended-jobs-container');
    if (recommendedContainer) {
        loadRecommendedJobs();
    }
    
    // Calculate matches for job list
    const jobCards = document.querySelectorAll('[data-job-id]');
    if (jobCards.length > 0) {
        const jobIds = Array.from(jobCards).map(card => card.dataset.jobId);
        if (jobIds.length > 0 && jobIds.length <= 20) {  // Limit to 20 for performance
            calculateMatchesForJobList(jobIds);
        }
    }
});
