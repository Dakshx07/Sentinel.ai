import React, { useState, useEffect } from 'react';
import SentinelStudio from './SentinelStudio';
import GitHubScanner from './GitHubScanner';
import SettingsPage from './SettingsPage';
import CommitScanner from './CommitScanner';
import Sidebar from './Sidebar';
import RepositoriesDashboard from './RepositoriesDashboard';
import NotificationsDashboard from './NotificationsDashboard';
import DocumentationDashboard from './DocumentationDashboard';
import PushPullPanel from './PushPullPanel';
import RefactorSimulator from './RefactorSimulator';
import TeamCollab from './TeamCollab';
import ErrorBoundary from './ErrorBoundary';
import PersonalDashboard from './PersonalDashboard';
import { User, DashboardView, Repository } from '../types';
import { isDemoMode } from '../services/geminiService';
import DemoModeBanner from './DemoModeBanner';

interface DashboardProps {
    user: User | null;
    activeView: DashboardView;
    setActiveView: (view: DashboardView) => void;
    onProfileUpdate: (updatedUser: Partial<User>) => void;
    repos: Repository[];
    setRepos: React.Dispatch<React.SetStateAction<Repository[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeView, setActiveView, onProfileUpdate, repos, setRepos }) => {
    const [demoModeActive, setDemoModeActive] = useState(false);

    useEffect(() => {
        // Check demo mode on mount and when the view changes,
        // ensuring the banner appears/disappears if toggled in settings.
        setDemoModeActive(isDemoMode());
    }, [activeView]);


    const renderActiveView = () => {
        const navigateToSettings = () => setActiveView('settings');

        // Authentication checks are now handled in App.tsx, so we just render the requested view.
        switch (activeView) {
            case 'dashboard':
                return <PersonalDashboard user={user} repos={repos} setActiveView={setActiveView} />;
            case 'repositories':
                return <RepositoriesDashboard user={user} setActiveView={setActiveView} repos={repos} setRepos={setRepos} />;
            case 'studio':
                return <SentinelStudio onNavigateToSettings={navigateToSettings} />;
            case 'gitops':
                return <GitHubScanner user={user!} onNavigateToSettings={navigateToSettings} />;
            case 'commits':
                return <CommitScanner user={user!} onNavigateToSettings={navigateToSettings} />;
            case 'settings':
                return <SettingsPage user={user} onProfileUpdate={onProfileUpdate} />;
            case 'docs':
                return <DocumentationDashboard />;
            case 'notifications':
                 return <NotificationsDashboard />;
            case 'pushpull':
                return <PushPullPanel setActiveView={setActiveView} />;
            case 'refactor':
                return <RefactorSimulator onNavigateToSettings={navigateToSettings} />;
            case 'team':
                return <TeamCollab />;
            default:
                return <PersonalDashboard user={user} repos={repos} setActiveView={setActiveView} />;
        }
    };

    return (
        <div className="pt-16 h-screen grid grid-cols-[auto_1fr] bg-light-primary dark:bg-dark-primary">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <main className="overflow-y-auto p-6 md:p-8">
                {demoModeActive && <DemoModeBanner onNavigate={setActiveView} />}
                <ErrorBoundary>
                    {renderActiveView()}
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default Dashboard;