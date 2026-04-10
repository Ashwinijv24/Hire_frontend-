// Candidate Dashboard

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
  loadRecentApplications();
  loadRecentlySaved();
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

  // Load tab-specific content
  if (tabName === 'applications') {
    loadApplications();
  } else if (tabName === 'saved') {
    loadSavedJobs();
  }
}

async function loadStats() {
  try {
    const appsRes = await fetch('/applications/api/applications/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const appsData = await appsRes.json();
    const apps = appsData.results || appsData;
    document.getElementById('totalApps').textContent = apps.length;

    const savedRes = await fetch('/applications/api/saved-jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const savedData = await savedRes.json();
    const saved = savedData.results || savedData;
    document.getElementById('totalSaved').textContent = saved.length;

    // Calculate profile completion
    const profileRes = await fetch('/accounts/api/profile/me/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const profile = await profileRes.json();
    let completion = 0;
    if (profile.full_name) completion += 20;
    if (profile.designation) completion += 20;
    if (profile.profile_summary) completion += 20;
    if (profile.skills) completion += 20;
    if (profile.experience_years) completion += 20;
    document.getElementById('profileCompletion').textContent = completion + '%';
  } catch (e) {
    console.error('Error loading stats:', e);
  }
}

async function loadRecentApplications() {
  const container = document.getElementById('recentApplications');
  container.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-600);">Loading...</p>';

  try {
    const res = await fetch('/applications/api/applications/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const apps = (data.results || data).slice(0, 5);

    if (!apps.length) {
      container.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-600);">No applications yet</p>';
      return;
    }

    container.innerHTML = apps.map(app => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1rem;margin-bottom:1rem;border-left:4px solid var(--primary);">
        <h4 style="margin:0 0 0.5rem 0;font-size:0.95rem;font-weight:700;color:var(--gray-900);">${app.job.title}</h4>
        <p style="margin:0.25rem 0;color:var(--gray-600);font-size:0.85rem;">${app.job.company.name}</p>
        <span style="display:inline-block;margin-top:0.5rem;background:var(--primary);color:white;padding:0.25rem 0.75rem;border-radius:12px;font-size:0.8rem;font-weight:600;">${app.status}</span>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:red;padding:1rem;">Error loading applications</p>';
  }
}

async function loadRecentlySaved() {
  const container = document.getElementById('recentlySaved');
  container.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-600);">Loading...</p>';

  try {
    const res = await fetch('/applications/api/saved-jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const saved = (data.results || data).slice(0, 5);

    if (!saved.length) {
      container.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-600);">No saved jobs yet</p>';
      return;
    }

    container.innerHTML = saved.map(item => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1rem;margin-bottom:1rem;">
        <h4 style="margin:0 0 0.5rem 0;font-size:0.95rem;font-weight:700;color:var(--gray-900);">${item.job.title}</h4>
        <p style="margin:0.25rem 0;color:var(--gray-600);font-size:0.85rem;">${item.job.company.name}</p>
        <p style="margin:0.25rem 0;color:var(--gray-600);font-size:0.85rem;">📍 ${item.job.location}</p>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p style="color:red;padding:1rem;">Error loading saved jobs</p>';
  }
}

async function loadApplications() {
  const container = document.getElementById('myApplications');
  container.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch('/applications/api/applications/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const apps = data.results || data;

    if (!apps.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-600);">No applications yet. <a href="/jobs/" style="color:var(--primary);text-decoration:none;font-weight:600;">Browse jobs</a></p></div>';
      return;
    }

    container.innerHTML = apps.map(app => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1.5rem;margin-bottom:1rem;border-left:4px solid var(--primary);">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem;">
          <div>
            <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:var(--gray-900);">${app.job.title}</h3>
            <p style="margin:0.5rem 0 0 0;color:var(--gray-600);">${app.job.company.name}</p>
          </div>
          <span style="background:var(--primary);color:white;padding:0.5rem 1rem;border-radius:20px;font-size:0.85rem;font-weight:600;">${app.status}</span>
        </div>
        <p style="margin:0.5rem 0;color:var(--gray-600);font-size:0.9rem;">Applied: ${new Date(app.applied_at).toLocaleDateString()}</p>
        <a href="/applications/${app.id}/" style="display:inline-block;margin-top:1rem;padding:0.5rem 1rem;background:var(--primary);color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;">View Details</a>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:red;padding:1rem;">Error loading applications: ' + e.message + '</div>';
  }
}

async function loadSavedJobs() {
  const container = document.getElementById('savedJobs');
  container.innerHTML = '<p style="text-align:center;padding:2rem">Loading...</p>';

  try {
    const res = await fetch('/applications/api/saved-jobs/', {
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    const data = await res.json();
    const saved = data.results || data;

    if (!saved.length) {
      container.innerHTML = '<div style="text-align:center;padding:2rem;background:var(--gray-50);border-radius:8px;"><p style="color:var(--gray-600);">No saved jobs yet. <a href="/jobs/" style="color:var(--primary);text-decoration:none;font-weight:600;">Browse jobs</a></p></div>';
      return;
    }

    container.innerHTML = saved.map(item => `
      <div style="background:white;border:1px solid var(--gray-200);border-radius:8px;padding:1.5rem;">
        <h3 style="margin:0 0 0.5rem 0;font-size:1.1rem;font-weight:700;color:var(--gray-900);">${item.job.title}</h3>
        <p style="margin:0.25rem 0;color:var(--gray-600);">${item.job.company.name}</p>
        <p style="margin:0.25rem 0;color:var(--gray-600);font-size:0.9rem;">📍 ${item.job.location}</p>
        <div style="display:flex;gap:0.5rem;margin-top:1rem;">
          <a href="/jobs/${item.job.id}/" style="flex:1;padding:0.5rem 1rem;background:var(--primary);color:white;border-radius:6px;text-decoration:none;font-weight:600;font-size:0.9rem;text-align:center;">View Job</a>
          <button onclick="unsaveJob(${item.job.id})" style="flex:1;padding:0.5rem 1rem;background:var(--gray-200);color:var(--gray-700);border:none;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.9rem;">Unsave</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:red;padding:1rem;">Error loading saved jobs: ' + e.message + '</div>';
  }
}

function filterApplications(status) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  // Filter logic would go here
  loadApplications();
}

async function unsaveJob(jobId) {
  try {
    const res = await fetch(`/applications/api/unsave-job/${jobId}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': getCookie('csrftoken') }
    });
    if (res.ok) {
      loadSavedJobs();
      alert('Job removed from saved');
    }
  } catch (e) {
    console.error('Error unsaving job:', e);
  }
}
