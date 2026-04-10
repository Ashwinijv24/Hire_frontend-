// Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadAdminDashboard();
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
      
      btn.classList.add('active');
      document.getElementById(`${tab}Tab`).style.display = 'block';
    });
  });
});

async function loadAdminDashboard() {
  try {
    const response = await fetch('/accounts/api/admin/dashboard/');
    if (!response.ok) {
      alert('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
    
    const data = await response.json();
    
    // Update summary cards
    document.getElementById('totalUsers').textContent = data.summary.users.total;
    document.getElementById('totalCandidates').textContent = data.summary.users.candidates;
    document.getElementById('totalEmployers').textContent = data.summary.users.employers;
    document.getElementById('totalAdmins').textContent = data.summary.users.admins;
    
    document.getElementById('totalJobs').textContent = data.summary.jobs.total;
    document.getElementById('activeJobs').textContent = data.summary.jobs.active;
    document.getElementById('featuredJobs').textContent = data.summary.jobs.featured;
    document.getElementById('remoteJobs').textContent = data.summary.jobs.remote;
    
    document.getElementById('totalApplications').textContent = data.summary.applications.total;
    document.getElementById('pendingApps').textContent = data.summary.applications.pending;
    document.getElementById('shortlistedApps').textContent = data.summary.applications.shortlisted;
    document.getElementById('hiredApps').textContent = data.summary.applications.hired;
    
    document.getElementById('totalCompanies').textContent = data.summary.companies;
    
    // Load tables
    loadUsersTable(data.all_users);
    loadJobsTable(data.all_jobs);
    loadApplicationsTable(data.all_applications);
    loadAnalytics(data);
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    alert('Error loading dashboard data');
  }
}

function loadUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.map(user => {
    const role = user.is_superuser ? 'Admin' : user.is_employer ? 'Employer' : 'Candidate';
    const status = user.is_active ? '<span class="badge-active">Active</span>' : '<span class="badge-inactive">Inactive</span>';
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
    const joined = new Date(user.date_joined).toLocaleDateString();
    
    return `
      <tr>
        <td>${user.id}</td>
        <td><strong>${user.username}</strong></td>
        <td>${user.email}</td>
        <td>${name}</td>
        <td><span class="badge-role">${role}</span></td>
        <td>${user.applications_count}</td>
        <td>${user.jobs_posted_count}</td>
        <td>${user.saved_jobs_count}</td>
        <td>${joined}</td>
        <td>${status}</td>
      </tr>
    `;
  }).join('');
}

function loadJobsTable(jobs) {
  const tbody = document.getElementById('jobsTableBody');
  tbody.innerHTML = jobs.map(job => {
    const salary = job.salary_min && job.salary_max 
      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
      : '-';
    const status = job.is_active ? '<span class="badge-active">Active</span>' : '<span class="badge-inactive">Inactive</span>';
    const featured = job.is_featured ? '⭐' : '';
    const remote = job.is_remote ? '🏠' : '';
    const posted = new Date(job.posted_at).toLocaleDateString();
    const postedBy = job.posted_by__username || '-';
    
    return `
      <tr>
        <td>${job.id}</td>
        <td><strong>${job.title}</strong> ${featured} ${remote}</td>
        <td>${job.company__name}</td>
        <td>${job.location || '-'}</td>
        <td>${job.employment_type}</td>
        <td>${salary}</td>
        <td>${postedBy}</td>
        <td>${job.applications_count}</td>
        <td>${job.views_count}</td>
        <td>${status}</td>
        <td>${posted}</td>
      </tr>
    `;
  }).join('');
}

function loadApplicationsTable(applications) {
  const tbody = document.getElementById('applicationsTableBody');
  tbody.innerHTML = applications.map(app => {
    const statusClass = `status-${app.status}`;
    const applied = new Date(app.applied_at).toLocaleDateString();
    const updated = new Date(app.updated_at).toLocaleDateString();
    const name = `${app.candidate__user__first_name || ''} ${app.candidate__user__last_name || ''}`.trim() || app.candidate__user__username;
    
    return `
      <tr>
        <td>${app.id}</td>
        <td><strong>${app.job__title}</strong></td>
        <td>${app.job__company__name}</td>
        <td>${name}</td>
        <td>${app.candidate__user__email}</td>
        <td><span class="badge ${statusClass}">${app.status}</span></td>
        <td>${applied}</td>
        <td>${updated}</td>
        <td>${app.notes || '-'}</td>
      </tr>
    `;
  }).join('');
}

function loadAnalytics(data) {
  // Top Applicants
  const topApplicantsBody = document.getElementById('topApplicantsBody');
  topApplicantsBody.innerHTML = data.top_applicants.map(user => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
    return `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${name}</td>
        <td><strong>${user.app_count}</strong></td>
      </tr>
    `;
  }).join('');
  
  // Top Employers
  const topEmployersBody = document.getElementById('topEmployersBody');
  topEmployersBody.innerHTML = data.top_employers.map(user => {
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || '-';
    return `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${name}</td>
        <td><strong>${user.job_count}</strong></td>
      </tr>
    `;
  }).join('');
  
  // Most Applied Jobs
  const mostAppliedJobsBody = document.getElementById('mostAppliedJobsBody');
  mostAppliedJobsBody.innerHTML = data.most_applied_jobs.map(job => `
    <tr>
      <td><strong>${job.title}</strong></td>
      <td>${job.company__name}</td>
      <td>${job.location}</td>
      <td><strong>${job.app_count}</strong></td>
      <td>${job.views_count}</td>
    </tr>
  `).join('');
  
  // Most Viewed Jobs
  const mostViewedJobsBody = document.getElementById('mostViewedJobsBody');
  mostViewedJobsBody.innerHTML = data.most_viewed_jobs.map(job => `
    <tr>
      <td><strong>${job.title}</strong></td>
      <td>${job.company__name}</td>
      <td>${job.location}</td>
      <td><strong>${job.views_count}</strong></td>
    </tr>
  `).join('');
}
