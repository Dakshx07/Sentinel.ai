import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import Header from './components/Header';
import { AppView, User, DashboardView, Repository, GitHubProfile } from './types';
import { ThemeProvider } from './components/ThemeContext';
import { ToastProvider } from './components/ToastContext';

// Create a static mock user for the demo mode
const DEMO_USER: User = {
    email: 'demo@sentinel.ai',
    username: 'Demo User',
    avatarUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=sentinel`,
    github: {
        login: 'demo-user',
        avatar_url: `https://api.dicebear.com/8.x/bottts/svg?seed=sentinel`,
        html_url: 'https://github.com',
        name: 'Demo User',
        public_repos: 42,
    }
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [dashboardView, setDashboardView] = useState<DashboardView>('dashboard');
  const [user, setUser] = useState<User>(DEMO_USER);
  const [repos, setRepos] = useState<Repository[]>([]);

  // Load and save repos to localStorage for persistence during the demo session
  useEffect(() => {
    const savedReposJson = localStorage.getItem('sentinel-repos-demo');
    if (savedReposJson) {
        const savedRepos: Repository[] = JSON.parse(savedReposJson);
        const normalizedRepos = savedRepos.map(repo => ({
            ...repo,
            autoReview: repo.autoReview === true,
        }));
        setRepos(normalizedRepos);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentinel-repos-demo', JSON.stringify(repos));
  }, [repos]);

  const handleNavigate = (targetView: AppView | DashboardView) => {
    const dashboardViews: DashboardView[] = ['dashboard', 'repositories', 'studio', 'gitops', 'commits', 'settings', 'docs', 'notifications', 'pushpull', 'refactor', 'team'];
    
    if (dashboardViews.includes(targetView as DashboardView)) {
        setView('dashboard');
        setDashboardView(targetView as DashboardView);
    } else {
        setView(targetView as AppView);
    }
  }

  const handleProfileUpdate = (updatedProfile: Partial<User>) => {
      setUser(currentUser => {
          const newUser = { ...currentUser, ...updatedProfile };
          // If a new GitHub profile is being linked, update avatarUrl
          if (updatedProfile.github && updatedProfile.github.avatar_url) {
              newUser.avatarUrl = updatedProfile.github.avatar_url;
          }
          return newUser;
      });
  }

  const renderView = () => {
    switch(view) {
        case 'landing':
            return <LandingPage onNavigate={handleNavigate} />;
        case 'pricing':
            return <PricingPage onNavigate={handleNavigate} />;
        case 'dashboard':
            return <Dashboard user={user} activeView={dashboardView} setActiveView={setDashboardView} onProfileUpdate={handleProfileUpdate} repos={repos} setRepos={setRepos} />;
        default:
            return <LandingPage onNavigate={handleNavigate} />;
    }
  }
  
  const repoCount = repos.length;
  const autoReviewCount = repos.filter(r => r.autoReview).length;

  return (
    <div className="min-h-screen text-dark-text dark:text-light-text font-sans bg-light-primary dark:bg-dark-primary">
      <Header 
          currentView={view} 
          user={user}
          onNavigate={handleNavigate}
          repoCount={repoCount}
          autoReviewCount={autoReviewCount}
      />
      {renderView()}
    </div>
  );
};


const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ThemeProvider>
);

export default App;
