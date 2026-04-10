// Employer Dashboard

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadJobs();
  loadApplications();
  loadCandidates();
});

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.style.display = 'none';
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(`${tabName}-tab`).style.display = 'block';
  
  // Add active class to clicked button
  event.target.classList.add('active');
}

async function loadStats() {
  try {
    const jobsRes = await fetch('/api/employer/jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const jobsData = await jobsRes.json();
    const jobs = jobsData.results || jobsData;
    document.getElementById('totalJobs').textContent = jobs.length;

    let totalApps = 0;
    let shortlisted = 0;
    
    for (const job of jobs) {
      const appsRes = await fetch(`/api/jobs/${job.id}/applications/`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      const appsData = await appsRes.json();
      const apps = appsData.results || appsData;
      totalApps += apps.length;
      shortlisted += apps.filter(a => a.status === 'shortlisted').length;
    }
    
    document.getElementById('totalApplications').textContent = totalApps;
    document.getElementById('shortlistedCount').textContent = shortlisted;
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

async function loadJobs() {
  const container = document.getElementById('jobsList');
  container.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch('/api/employer/jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const jobs = data.results || data;

    if (!jobs.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-600);">No jobs posted yet. <a href="/jobs/post/" style="color:var(--primary);text-decoration:none;font-weight:600;">Post your first job</a></p></div>';
      return;
    }

    container.innerHTML = jobs.map(job => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
          <div>
            <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:var(--gray-900);">${job.title}</h3>
            <p style="margin:0.5rem 0 0 0;color:var(--gray-600);">${job.company.name} • ${job.location}</p>
          </div>
          <span style="background:var(--primary);color:white;padding:0.5rem 1rem;border-radius:20px;font-size:0.85rem;font-weight:600;">${job.applications_count || 0} applications</span>
        </div>
        <div style="display:flex;gap:0.5rem;">
          <a href="/jobs/${job.id}/" style="padding:0.5rem 1rem;background:var(--primary);color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;">View</a>
          <button onclick="viewApplications(${job.id}, '${job.title}')" style="padding:0.5rem 1rem;background:var(--gray-200);color:var(--gray-700);border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.9rem;">Applications</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:red;padding:1rem;">Error loading jobs: ' + e.message + '</div>';
  }
}

async function loadApplications() {
  const container = document.getElementById('applicationsList');
  container.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch('/api/employer/jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const jobs = data.results || data;

    let allApps = [];
    for (const job of jobs) {
      const appsRes = await fetch(`/api/jobs/${job.id}/applications/`, {
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
      });
      const appsData = await appsRes.json();
      const apps = appsData.results || appsData;
      allApps = allApps.concat(apps.map(app => ({ ...app, jobTitle: job.title })));
    }

    if (!allApps.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-600);">No applications yet</p></div>';
      return;
    }

    container.innerHTML = allApps.slice(0, 10).map(app => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1.5rem;border-left:4px solid var(--primary);">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
          <div>
            <h3 style="margin:0;font-size:1rem;font-weight:700;color:var(--gray-900);">${app.candidate.user.username}</h3>
            <p style="margin:0.25rem 0 0 0;color:var(--gray-600);font-size:0.9rem;">${app.jobTitle}</p>
          </div>
          <span style="background:var(--primary);color:white;padding:0.25rem 0.75rem;border-radius:12px;font-size:0.8rem;font-weight:600;">${app.status}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:red;padding:1rem;">Error loading applications: ' + e.message + '</div>';
  }
}

async function loadCandidates() {
  const container = document.getElementById('candidatesList');
  container.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch('/accounts/api/profile/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const profiles = data.results || data;

    if (!profiles.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-600);">No candidate profiles available</p></div>';
      return;
    }

    container.innerHTML = profiles.map(profile => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1.5rem;">
        <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;">
          <div style="background:linear-gradient(135deg,#667eea,#764ba2);width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:1.2rem;">
            ${profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style="margin:0;font-size:1rem;font-weight:700;color:var(--gray-900);">${profile.full_name || profile.username}</h3>
            <p style="margin:0.25rem 0 0 0;color:var(--gray-600);font-size:0.9rem;">${profile.designation || 'No designation'}</p>
          </div>
        </div>
        <p style="margin:0.5rem 0;color:var(--gray-600);font-size:0.9rem;"><strong>Location:</strong> ${profile.location || 'Not specified'}</p>
        <p style="margin:0.5rem 0;color:var(--gray-600);font-size:0.9rem;"><strong>Experience:</strong> ${profile.experience_years || 0} years</p>
        <a href="/accounts/profile/${profile.id}/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1rem;background:var(--primary);color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;">View Profile</a>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:red;padding:1rem;">Error loading candidates: ' + e.message + '</div>';
  }
}

function viewApplications(jobId, jobTitle) {
  alert(`Applications for "${jobTitle}" - Feature coming soon!`);
}
