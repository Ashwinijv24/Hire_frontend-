// Dynamic job loading functionality
document.addEventListener('DOMContentLoaded', () => {
  const jobsGrid = document.querySelector('.jobs-grid');
  const searchInput = document.querySelector('.search-input');
  
  if (jobsGrid) {
    loadJobs();
    
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          loadJobs(e.target.value);
        }, 300);
      });
    }
  }

  async function loadJobs(searchQuery = '') {
    try {
      jobsGrid.innerHTML = '<div class="loading">Loading jobs...</div>';
      const data = await JobAPI.getJobs(searchQuery);
      const jobs = data.results || data;
      
      // Update job count
      const countDiv = document.getElementById('jobsCount');
      if (countDiv) {
        countDiv.textContent = `Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;
      }
      
      if (jobs.length === 0) {
        jobsGrid.innerHTML = '<div class="empty-state"><h3>No jobs found</h3><p>Try adjusting your search criteria</p></div>';
        return;
      }

      jobsGrid.innerHTML = jobs.map(job => createJobCard(job)).join('');
    } catch (error) {
      jobsGrid.innerHTML = '<div class="empty-state"><h3>Error loading jobs</h3><p>Please try again later</p></div>';
    }
  }

  function createJobCard(job) {
    const salary = JobAPI.formatSalary(job.salary_min, job.salary_max);
    const posted = JobAPI.formatDate(job.posted_at);
    const companyLogo = job.company.logo 
      ? `<img src="${job.company.logo}" alt="${job.company.name}" class="company-logo">`
      : '';
    const featured = job.is_featured 
      ? `<span style="position:absolute;top:1rem;right:1rem;background:var(--accent);color:#fff;padding:0.25rem 0.75rem;border-radius:6px;font-size:0.8rem;font-weight:600">⭐ Featured</span>`
      : '';
    const remote = job.is_remote
      ? `<span style="display:inline-block;padding:0.25rem 0.75rem;background:var(--secondary);color:#fff;border-radius:6px;font-size:0.85rem;font-weight:500;margin-left:0.5rem">🏠 Remote</span>`
      : '';
    
    return `
      <article class="job-card" data-job-id="${job.id}">
        ${featured}
        ${companyLogo}
        <h3><a href="/jobs/${job.id}/">${job.title}</a></h3>
        <p class="meta">
          <span>🏢 ${job.company.name}</span>
          ${job.location ? `<span>📍 ${job.location}</span>` : ''}
        </p>
        <span class="employment-type">${job.employment_type_display}</span>
        ${remote}
        <p class="salary">${salary}</p>
        <p class="posted">${posted}</p>
      </article>
    `;
  }
});
