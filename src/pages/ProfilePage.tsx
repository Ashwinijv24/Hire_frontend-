import React, { useState, useEffect } from 'react';
import { UserProfile, Education, Experience, Certification } from '../types';
import { ProfileAPI } from '../utils/api';
import { showToast } from '../utils/helpers';
import '../styles/profile.css';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'education' | 'experience' | 'certifications' | 'resume'>('profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadEducation();
    loadExperience();
    loadCertifications();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await ProfileAPI.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEducation = async () => {
    try {
      const data = await ProfileAPI.getEducation();
      setEducation(data);
    } catch (error) {
      console.error('Error loading education:', error);
    }
  };

  const loadExperience = async () => {
    try {
      const data = await ProfileAPI.getExperience();
      setExperience(data);
    } catch (error) {
      console.error('Error loading experience:', error);
    }
  };

  const loadCertifications = async () => {
    try {
      const data = await ProfileAPI.getCertifications();
      setCertifications(data);
    } catch (error) {
      console.error('Error loading certifications:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const updated = await ProfileAPI.updateProfile(profile);
      setProfile(updated);
      setEditMode(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddEducation = async (edu: Omit<Education, 'id'>) => {
    try {
      const newEdu = await ProfileAPI.addEducation(edu);
      setEducation([...education, newEdu]);
      showToast('Education added successfully!', 'success');
    } catch (error) {
      console.error('Error adding education:', error);
      showToast('Failed to add education', 'error');
    }
  };

  const handleDeleteEducation = async (eduId: number) => {
    try {
      await ProfileAPI.deleteEducation(eduId);
      setEducation(education.filter(e => e.id !== eduId));
      showToast('Education deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting education:', error);
      showToast('Failed to delete education', 'error');
    }
  };

  const handleAddExperience = async (exp: Omit<Experience, 'id'>) => {
    try {
      const newExp = await ProfileAPI.addExperience(exp);
      setExperience([...experience, newExp]);
      showToast('Experience added successfully!', 'success');
    } catch (error) {
      console.error('Error adding experience:', error);
      showToast('Failed to add experience', 'error');
    }
  };

  const handleDeleteExperience = async (expId: number) => {
    try {
      await ProfileAPI.deleteExperience(expId);
      setExperience(experience.filter(e => e.id !== expId));
      showToast('Experience deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting experience:', error);
      showToast('Failed to delete experience', 'error');
    }
  };

  const handleAddCertification = async (cert: Omit<Certification, 'id'>) => {
    try {
      const newCert = await ProfileAPI.addCertification(cert);
      setCertifications([...certifications, newCert]);
      showToast('Certification added successfully!', 'success');
    } catch (error) {
      console.error('Error adding certification:', error);
      showToast('Failed to add certification', 'error');
    }
  };

  const handleDeleteCertification = async (certId: number) => {
    try {
      await ProfileAPI.deleteCertification(certId);
      setCertifications(certifications.filter(c => c.id !== certId));
      showToast('Certification deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting certification:', error);
      showToast('Failed to delete certification', 'error');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div>Failed to load profile</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{profile.full_name || profile.username}</h2>
        <p>{profile.designation || 'No designation set'}</p>
        <button onClick={() => setEditMode(!editMode)} className="btn-primary">
          {editMode ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          Education
        </button>
        <button 
          className={`tab-btn ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          Experience
        </button>
        <button 
          className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          Resume
        </button>
      </div>

      {activeTab === 'profile' && (
        editMode ? (
          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                value={profile.designation || ''}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Profile Summary</label>
              <textarea
                value={profile.profile_summary || ''}
                onChange={(e) => setProfile({ ...profile, profile_summary: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={profile.skills || ''}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Portfolio URL</label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={profile.portfolio_url || ''}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={profile.linkedin_url || ''}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/yourprofile"
                value={profile.github_url || ''}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary">Save Changes</button>
          </form>
        ) : (
          <div className="profile-display">
            <div className="profile-section">
              <h3>About</h3>
              <p>{profile.profile_summary || 'No summary added'}</p>
            </div>

            <div className="profile-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {profile.skills_list?.map((skill, i) => (
                  <span key={i} className="skill-badge">{skill}</span>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Contact & Links</h3>
              <p>Email: {profile.email}</p>
              {profile.phone && <p>Phone: {profile.phone}</p>}
              {profile.portfolio_url && (
                <p>
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                    🌐 Portfolio
                  </a>
                </p>
              )}
              {profile.linkedin_url && (
                <p>
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    💼 LinkedIn
                  </a>
                </p>
              )}
              {profile.github_url && (
                <p>
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    🐙 GitHub
                  </a>
                </p>
              )}
              {profile.resume_url && (
                <p>
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                    📄 Download Resume
                  </a>
                </p>
              )}
            </div>
          </div>
        )
      )}

      {activeTab === 'education' && (
        <div className="profile-section">
          <h3>Education</h3>
          <div className="items-list">
            {education.map(edu => (
              <div key={edu.id} className="item-card">
                <div>
                  <h4>{edu.degree} in {edu.field_of_study}</h4>
                  <p>{edu.institution}</p>
                  <p className="date">{edu.start_date} - {edu.end_date || 'Present'}</p>
                </div>
                <button onClick={() => handleDeleteEducation(edu.id)} className="btn-delete">Delete</button>
              </div>
            ))}
          </div>
          <EducationForm onAdd={handleAddEducation} />
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="profile-section">
          <h3>Experience</h3>
          <div className="items-list">
            {experience.map(exp => (
              <div key={exp.id} className="item-card">
                <div>
                  <h4>{exp.job_title}</h4>
                  <p>{exp.company}</p>
                  <p className="date">{exp.start_date} - {exp.end_date || 'Present'}</p>
                </div>
                <button onClick={() => handleDeleteExperience(exp.id)} className="btn-delete">Delete</button>
              </div>
            ))}
          </div>
          <ExperienceForm onAdd={handleAddExperience} />
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="profile-section">
          <h3>Certifications</h3>
          <div className="items-list">
            {certifications.map(cert => (
              <div key={cert.id} className="item-card">
                <div>
                  <h4>{cert.name}</h4>
                  <p>{cert.issuing_organization}</p>
                  <p className="date">Issued: {cert.issue_date}</p>
                </div>
                <button onClick={() => handleDeleteCertification(cert.id)} className="btn-delete">Delete</button>
              </div>
            ))}
          </div>
          <CertificationForm onAdd={handleAddCertification} />
        </div>
      )}

      {activeTab === 'resume' && (
        <div className="profile-section">
          <h3>Resume & Documents</h3>
          <div className="resume-section">
            {profile.resume_url ? (
              <div className="resume-card">
                <p>📄 Resume uploaded</p>
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  Download Resume
                </a>
              </div>
            ) : (
              <p className="no-resume">No resume uploaded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EducationForm: React.FC<{ onAdd: (edu: Omit<Education, 'id'>) => void }> = ({ onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    field_of_study: '',
    institution: '',
    start_date: '',
    end_date: '',
    is_current: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ degree: '', field_of_study: '', institution: '', start_date: '', end_date: '', is_current: false });
    setShowForm(false);
  };

  return (
    <div className="add-form">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary">+ Add Education</button>
      ) : (
        <form onSubmit={handleSubmit}>
          <input placeholder="Degree" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} required />
          <input placeholder="Field of Study" value={formData.field_of_study} onChange={(e) => setFormData({...formData, field_of_study: e.target.value})} required />
          <input placeholder="Institution" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} required />
          <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
          <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
          <label>
            <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({...formData, is_current: e.target.checked})} />
            Currently studying
          </label>
          <button type="submit" className="btn-primary">Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
        </form>
      )}
    </div>
  );
};

const ExperienceForm: React.FC<{ onAdd: (exp: Omit<Experience, 'id'>) => void }> = ({ onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    job_title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ job_title: '', company: '', location: '', start_date: '', end_date: '', is_current: false, description: '' });
    setShowForm(false);
  };

  return (
    <div className="add-form">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary">+ Add Experience</button>
      ) : (
        <form onSubmit={handleSubmit}>
          <input placeholder="Job Title" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} required />
          <input placeholder="Company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
          <input placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
          <input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} required />
          <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
          <label>
            <input type="checkbox" checked={formData.is_current} onChange={(e) => setFormData({...formData, is_current: e.target.checked})} />
            Currently working
          </label>
          <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
          <button type="submit" className="btn-primary">Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
        </form>
      )}
    </div>
  );
};

const CertificationForm: React.FC<{ onAdd: (cert: Omit<Certification, 'id'>) => void }> = ({ onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({ name: '', issuing_organization: '', issue_date: '', expiry_date: '', credential_id: '', credential_url: '' });
    setShowForm(false);
  };

  return (
    <div className="add-form">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-secondary">+ Add Certification</button>
      ) : (
        <form onSubmit={handleSubmit}>
          <input placeholder="Certification Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input placeholder="Issuing Organization" value={formData.issuing_organization} onChange={(e) => setFormData({...formData, issuing_organization: e.target.value})} required />
          <input type="date" value={formData.issue_date} onChange={(e) => setFormData({...formData, issue_date: e.target.value})} required />
          <input type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} />
          <input placeholder="Credential ID" value={formData.credential_id} onChange={(e) => setFormData({...formData, credential_id: e.target.value})} />
          <input placeholder="Credential URL" value={formData.credential_url} onChange={(e) => setFormData({...formData, credential_url: e.target.value})} />
          <button type="submit" className="btn-primary">Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
        </form>
      )}
    </div>
  );
};
