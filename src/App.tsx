import React from 'react';
import { JobsList } from './components/JobsList';
import { CandidateDashboard } from './components/CandidateDashboard';
import { MockInterview } from './components/MockInterview';
import { NotificationWidget } from './components/NotificationWidget';
import { JobMatching } from './components/JobMatching';
import './App.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>HireConnect</h1>
          <NotificationWidget />
        </div>
      </header>

      <main className="app-main">
        <section id="jobs-section">
          <JobsList />
        </section>

        <section id="dashboard-section">
          <CandidateDashboard />
        </section>

        <section id="interview-section">
          <MockInterview />
        </section>

        <section id="matching-section">
          <JobMatching />
        </section>
      </main>
    </div>
  );
};

export default App;
