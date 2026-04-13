import React, { useState, useEffect } from 'react';
import { JobsList } from './pages/JobsList';
import { JobDetail } from './pages/JobDetail';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { MockInterview } from './pages/MockInterview';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationCenter } from './pages/NotificationCenter';
import { JobMatching } from './pages/JobMatching';
import { NotificationWidget } from './components/NotificationWidget';
import './App.css';

type Page = 'jobs' | 'job-detail' | 'dashboard' | 'interview' | 'profile' | 'notifications' | 'matching';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('jobs');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const handleJobSelect = (jobId: number) => {
    setSelectedJobId(jobId);
    setCurrentPage('job-detail');
  };

  const handleBackToJobs = () => {
    setCurrentPage('jobs');
    setSelectedJobId(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 onClick={() => setCurrentPage('jobs')} style={{ cursor: 'pointer' }}>
            HireConnect
          </h1>
          <nav className="header-nav">
            <button onClick={() => setCurrentPage('jobs')} className={currentPage === 'jobs' ? 'active' : ''}>
              Jobs
            </button>
            <button onClick={() => setCurrentPage('dashboard')} className={currentPage === 'dashboard' ? 'active' : ''}>
              Dashboard
            </button>
            <button onClick={() => setCurrentPage('interview')} className={currentPage === 'interview' ? 'active' : ''}>
              Interview
            </button>
            <button onClick={() => setCurrentPage('profile')} className={currentPage === 'profile' ? 'active' : ''}>
              Profile
            </button>
            <button onClick={() => setCurrentPage('notifications')} className={currentPage === 'notifications' ? 'active' : ''}>
              Notifications
            </button>
          </nav>
          <NotificationWidget />
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'jobs' && <JobsList onJobSelect={handleJobSelect} />}
        {currentPage === 'job-detail' && selectedJobId && <JobDetail jobId={selectedJobId} onBack={handleBackToJobs} />}
        {currentPage === 'dashboard' && <CandidateDashboard />}
        {currentPage === 'interview' && <MockInterview />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'notifications' && <NotificationCenter />}
        {currentPage === 'matching' && <JobMatching />}
      </main>
    </div>
  );
};

export default App;
