// Profile Management JavaScript

// Get CSRF token from cookies
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

let profileData = null;

// Load profile data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
});

async function loadProfile() {
    try {
        const response = await fetch('/accounts/api/profile/me/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        profileData = await response.json();
        displayProfile();
        loadEducation();
        loadExperience();
        loadCertifications();
        displaySkills();
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayProfile() {
    if (!profileData) return;
    
    // Update display fields
    document.getElementById('display-full-name').textContent = profileData.full_name || profileData.username;
    document.getElementById('display-designation').textContent = profileData.designation || 'No designation set';
    document.getElementById('display-location').innerHTML = `<span style="margin-right:0.5rem;">📍</span>${profileData.location || 'No location set'}`;
    document.getElementById('display-summary').innerHTML = `<p>${profileData.profile_summary || 'No profile summary added yet.'}</p>`;
    
    // Update form fields
    document.getElementById('full_name').value = profileData.full_name || '';
    document.getElementById('phone').value = profileData.phone || '';
    document.getElementById('designation').value = profileData.designation || '';
    document.getElementById('company').value = profileData.company || '';
    document.getElementById('location').value = profileData.location || '';
    document.getElementById('experience_years').value = profileData.experience_years || 0;
    document.getElementById('profile_summary').value = profileData.profile_summary || '';
    document.getElementById('skills').value = profileData.skills || '';
    document.getElementById('linkedin_url').value = profileData.linkedin_url || '';
    document.getElementById('github_url').value = profileData.github_url || '';
    document.getElementById('portfolio_url').value = profileData.portfolio_url || '';
}

function toggleEditMode() {
    const editForm = document.getElementById('edit-profile-form');
    const isHidden = editForm.style.display === 'none';
    editForm.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
        editForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Handle profile form submission
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        full_name: document.getElementById('full_name').value,
        phone: document.getElementById('phone').value,
        designation: document.getElementById('designation').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        experience_years: parseInt(document.getElementById('experience_years').value) || 0,
        profile_summary: document.getElementById('profile_summary').value,
        skills: document.getElementById('skills').value,
        linkedin_url: document.getElementById('linkedin_url').value,
        github_url: document.getElementById('github_url').value,
        portfolio_url: document.getElementById('portfolio_url').value,
    };
    
    try {
        const response = await fetch('/accounts/api/profile/update_profile/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            profileData = await response.json();
            displayProfile();
            toggleEditMode();
            showToast('Profile updated successfully!', 'success');
        } else {
            showToast('Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile', 'error');
    }
});

// Tab switching
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

// Education functions
async function loadEducation() {
    try {
        const response = await fetch('/accounts/api/education/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        const education = await response.json();
        displayEducation(education);
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

function displayEducation(education) {
    const container = document.getElementById('education-list');
    
    if (education.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:2rem;">No education added yet.</p>';
        return;
    }
    
    container.innerHTML = education.map(edu => `
        <div style="background:linear-gradient(135deg,#f8fafc,#fff);padding:1.5rem;border-radius:16px;margin-bottom:1rem;border-left:4px solid #4facfe;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                <div>
                    <h4 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:0.25rem;">${edu.degree}</h4>
                    <p style="font-size:1rem;color:var(--gray-700);margin-bottom:0.25rem;">${edu.field_of_study}</p>
                    <p style="color:var(--gray-600);font-size:0.95rem;">${edu.institution}</p>
                </div>
                <button onclick="deleteEducation(${edu.id})" style="padding:0.5rem 1rem;background:var(--gray-200);color:var(--gray-700);border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;">
                    🗑️ Delete
                </button>
            </div>
            <div style="display:flex;gap:1rem;color:var(--gray-600);font-size:0.9rem;margin-bottom:0.5rem;">
                <span>📅 ${edu.start_date} - ${edu.is_current ? 'Present' : edu.end_date || 'N/A'}</span>
                ${edu.location ? `<span>📍 ${edu.location}</span>` : ''}
                ${edu.grade ? `<span>🎯 ${edu.grade}</span>` : ''}
            </div>
            ${edu.description ? `<p style="color:var(--gray-700);margin-top:0.75rem;">${edu.description}</p>` : ''}
        </div>
    `).join('');
}

function showAddEducationModal() {
    const modal = prompt('Add Education\n\nFormat: Degree|Field|Institution|Start Date (YYYY-MM-DD)|End Date (YYYY-MM-DD)|Grade\n\nExample: Bachelor of Science|Computer Science|MIT|2018-09-01|2022-05-30|3.8 GPA');
    
    if (modal) {
        const [degree, field_of_study, institution, start_date, end_date, grade] = modal.split('|');
        addEducation({ degree, field_of_study, institution, start_date, end_date: end_date || null, grade: grade || '' });
    }
}

async function addEducation(data) {
    try {
        const response = await fetch('/accounts/api/education/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            loadEducation();
            showToast('Education added successfully!', 'success');
        } else {
            showToast('Failed to add education', 'error');
        }
    } catch (error) {
        console.error('Error adding education:', error);
        showToast('Error adding education', 'error');
    }
}

async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    
    try {
        const response = await fetch(`/accounts/api/education/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            loadEducation();
            showToast('Education deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error deleting education:', error);
    }
}

// Experience functions
async function loadExperience() {
    try {
        const response = await fetch('/accounts/api/experience/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        const experience = await response.json();
        displayExperience(experience);
    } catch (error) {
        console.error('Error loading experience:', error);
    }
}

function displayExperience(experience) {
    const container = document.getElementById('experience-list');
    
    if (experience.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:2rem;">No experience added yet.</p>';
        return;
    }
    
    container.innerHTML = experience.map(exp => `
        <div style="background:linear-gradient(135deg,#fff5f7,#fff);padding:1.5rem;border-radius:16px;margin-bottom:1rem;border-left:4px solid #f5576c;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                <div>
                    <h4 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:0.25rem;">${exp.job_title}</h4>
                    <p style="font-size:1rem;color:var(--gray-700);margin-bottom:0.25rem;">${exp.company}</p>
                    ${exp.location ? `<p style="color:var(--gray-600);font-size:0.95rem;">📍 ${exp.location}</p>` : ''}
                </div>
                <button onclick="deleteExperience(${exp.id})" style="padding:0.5rem 1rem;background:var(--gray-200);color:var(--gray-700);border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;">
                    🗑️ Delete
                </button>
            </div>
            <div style="color:var(--gray-600);font-size:0.9rem;margin-bottom:0.75rem;">
                📅 ${exp.start_date} - ${exp.is_current ? 'Present' : exp.end_date || 'N/A'}
            </div>
            ${exp.description ? `<p style="color:var(--gray-700);line-height:1.6;">${exp.description}</p>` : ''}
        </div>
    `).join('');
}

function showAddExperienceModal() {
    const modal = prompt('Add Experience\n\nFormat: Job Title|Company|Location|Start Date (YYYY-MM-DD)|End Date (YYYY-MM-DD or leave empty if current)|Description\n\nExample: Senior Developer|Google|Mountain View, CA|2020-01-15||Leading development team');
    
    if (modal) {
        const [job_title, company, location, start_date, end_date, description] = modal.split('|');
        addExperience({ 
            job_title, 
            company, 
            location: location || '', 
            start_date, 
            end_date: end_date || null, 
            is_current: !end_date,
            description: description || ''
        });
    }
}

async function addExperience(data) {
    try {
        const response = await fetch('/accounts/api/experience/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            loadExperience();
            showToast('Experience added successfully!', 'success');
        } else {
            showToast('Failed to add experience', 'error');
        }
    } catch (error) {
        console.error('Error adding experience:', error);
        showToast('Error adding experience', 'error');
    }
}

async function deleteExperience(id) {
    if (!confirm('Are you sure you want to delete this experience entry?')) return;
    
    try {
        const response = await fetch(`/accounts/api/experience/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            loadExperience();
            showToast('Experience deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error deleting experience:', error);
    }
}

// Certification functions
async function loadCertifications() {
    try {
        const response = await fetch('/accounts/api/certifications/', {
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        const certifications = await response.json();
        displayCertifications(certifications);
    } catch (error) {
        console.error('Error loading certifications:', error);
    }
}

function displayCertifications(certifications) {
    const container = document.getElementById('certifications-list');
    
    if (certifications.length === 0) {
        container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:2rem;">No certifications added yet.</p>';
        return;
    }
    
    container.innerHTML = certifications.map(cert => `
        <div style="background:linear-gradient(135deg,#fffbf0,#fff);padding:1.5rem;border-radius:16px;margin-bottom:1rem;border-left:4px solid #fee140;">
            <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
                <div>
                    <h4 style="font-size:1.25rem;font-weight:700;color:var(--gray-900);margin-bottom:0.25rem;">${cert.name}</h4>
                    <p style="font-size:1rem;color:var(--gray-700);">${cert.issuing_organization}</p>
                </div>
                <button onclick="deleteCertification(${cert.id})" style="padding:0.5rem 1rem;background:var(--gray-200);color:var(--gray-700);border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;">
                    🗑️ Delete
                </button>
            </div>
            <div style="color:var(--gray-600);font-size:0.9rem;margin-bottom:0.5rem;">
                📅 Issued: ${cert.issue_date}${cert.expiry_date ? ` | Expires: ${cert.expiry_date}` : ''}
            </div>
            ${cert.credential_id ? `<p style="color:var(--gray-600);font-size:0.9rem;">🔖 ID: ${cert.credential_id}</p>` : ''}
            ${cert.credential_url ? `<a href="${cert.credential_url}" target="_blank" style="color:var(--primary);text-decoration:none;font-size:0.9rem;">🔗 View Credential</a>` : ''}
        </div>
    `).join('');
}

function showAddCertificationModal() {
    const modal = prompt('Add Certification\n\nFormat: Name|Organization|Issue Date (YYYY-MM-DD)|Credential ID\n\nExample: AWS Certified Developer|Amazon Web Services|2023-06-15|AWS-12345');
    
    if (modal) {
        const [name, issuing_organization, issue_date, credential_id] = modal.split('|');
        addCertification({ name, issuing_organization, issue_date, credential_id: credential_id || '' });
    }
}

async function addCertification(data) {
    try {
        const response = await fetch('/accounts/api/certifications/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            loadCertifications();
            showToast('Certification added successfully!', 'success');
        } else {
            showToast('Failed to add certification', 'error');
        }
    } catch (error) {
        console.error('Error adding certification:', error);
        showToast('Error adding certification', 'error');
    }
}

async function deleteCertification(id) {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    
    try {
        const response = await fetch(`/accounts/api/certifications/${id}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        });
        
        if (response.ok) {
            loadCertifications();
            showToast('Certification deleted successfully!', 'success');
        }
    } catch (error) {
        console.error('Error deleting certification:', error);
    }
}

// Skills display
function displaySkills() {
    if (!profileData || !profileData.skills_list || profileData.skills_list.length === 0) {
        document.getElementById('skills-list').innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:2rem;">No skills added yet. Edit your profile to add skills.</p>';
        return;
    }
    
    const colors = [
        'linear-gradient(135deg,#667eea,#764ba2)',
        'linear-gradient(135deg,#f093fb,#f5576c)',
        'linear-gradient(135deg,#4facfe,#00f2fe)',
        'linear-gradient(135deg,#fa709a,#fee140)',
        'linear-gradient(135deg,#30cfd0,#330867)',
        'linear-gradient(135deg,#a8edea,#fed6e3)',
    ];
    
    document.getElementById('skills-list').innerHTML = profileData.skills_list.map((skill, index) => `
        <div style="background:${colors[index % colors.length]};color:#fff;padding:0.75rem 1.5rem;border-radius:12px;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:fadeInUp 0.3s ease-out ${index * 0.05}s backwards;">
            ${skill}
        </div>
    `).join('');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed;
        bottom:2rem;
        right:2rem;
        background:${type === 'success' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'linear-gradient(135deg,#f5576c,#f093fb)'};
        color:#fff;
        padding:1rem 2rem;
        border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,0.2);
        z-index:10000;
        animation:slideInRight 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
