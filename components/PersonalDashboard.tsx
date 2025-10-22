import React, { useState, useEffect } from 'react';
import { User, Repository, DashboardView } from '../types';
import { RepoIcon, ShieldIcon, CheckCircleIcon, HistoryIcon } from './icons';
import { getDashboardData, IVulnerability, IActivityLog } from '../services/reviewService';

// Declare globals loaded from script tags
declare global {
    interface Window {
        ReactApexCharts: any;
    }
}

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glass-effect p-6 rounded-lg flex items-center space-x-4">
        <div className="bg-brand-purple/10 p-4 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-medium-dark-text dark:text-medium-text">{title}</p>
            <p className="text-3xl font-bold text-dark-text dark:text-white">{value}</p>
        </div>
    </div>
);


const ActivityIcon: React.FC<{ type: IActivityLog['type'] }> = ({ type }) => {
    switch(type) {
        case 'NEW_VULNERABILITY': return <ShieldIcon severity="Critical" className="w-5 h-5"/>;
        case 'AUTOREVIEW_ENABLED': return <CheckCircleIcon className="w-5 h-5 text-green-500"/>;
        case 'SCAN_COMPLETED': return <HistoryIcon className="w-5 h-5 text-medium-dark-text dark:text-medium-text"/>;
        default: return <HistoryIcon className="w-5 h-5 text-medium-dark-text dark:text-medium-text"/>;
    }
}

const HighPriorityVulnerabilities: React.FC<{ vulnerabilities: IVulnerability[] }> = ({ vulnerabilities }) => (
    <div className="lg:col-span-1 glass-effect p-6 rounded-lg flex flex-col">
        <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">High-Priority Vulnerabilities</h3>
        <ul className="space-y-3 flex-grow overflow-y-auto pr-2">
            {vulnerabilities.length > 0 ? vulnerabilities.slice(0, 5).map(vuln => (
                <li key={vuln.id} className="flex items-start space-x-3 text-sm p-2 rounded-md bg-light-primary dark:bg-dark-primary">
                    <ShieldIcon severity={vuln.severity} className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="overflow-hidden">
                        <p className="font-semibold text-dark-text dark:text-light-text truncate" title={vuln.title}>{vuln.title}</p>
                        <p className="text-xs text-medium-dark-text dark:text-medium-text truncate" title={vuln.repoName}>{vuln.repoName}</p>
                    </div>
                </li>
            )) : <p className="text-sm text-center text-medium-dark-text dark:text-medium-text pt-8">No critical or high severity vulnerabilities found.</p>}
        </ul>
    </div>
);

interface PersonalDashboardProps {
    user: User | null;
    repos: Repository[];
    setActiveView: (view: DashboardView) => void;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ user, repos, setActiveView }) => {
    const ReactApexChart = window.ReactApexCharts;
    const [dashboardData, setDashboardData] = useState(getDashboardData(repos));

    useEffect(() => {
        const interval = setInterval(() => {
            setDashboardData(getDashboardData(repos));
        }, 2000); // Poll for updates every 2 seconds

        return () => clearInterval(interval);
    }, [repos]);
    
    const { totalRepos, autoReviewCount, criticalCount, highPriorityVulnerabilities, recentActivity } = dashboardData;

    if (totalRepos === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center glass-effect rounded-lg p-12 h-full animate-fade-in-up">
                <RepoIcon className="w-16 h-16 text-medium-dark-text dark:text-medium-text opacity-50 mb-4" />
                <h2 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Welcome, {user?.username || 'User'}!</h2>
                <p className="mt-2 max-w-sm text-medium-dark-text dark:text-medium-text">
                    You're not tracking any repositories yet. Add one to get started.
                </p>
                <button
                    onClick={() => setActiveView('repositories')}
                    className="btn-primary flex items-center space-x-2 py-2 px-4 mt-6"
                >
                    <span>Add Repository</span>
                </button>
            </div>
        )
    }

    return (
        <div className="h-full w-full space-y-8 animate-fade-in-up">
             <div>
                <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Welcome back, {user?.username || 'User'}!</h1>
                <p className="mt-1 text-medium-dark-text dark:text-medium-text">Here's a summary of your security posture.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title="Tracked Repositories" value={totalRepos} icon={<RepoIcon className="w-6 h-6 text-brand-purple" />} />
                <MetricCard title="Auto-Review Enabled" value={autoReviewCount} icon={<CheckCircleIcon className="w-6 h-6 text-brand-purple" />} />
                <MetricCard title="Critical Vulnerabilities" value={criticalCount} icon={<ShieldIcon severity="Critical" className="w-6 h-6 text-brand-purple" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <HighPriorityVulnerabilities vulnerabilities={highPriorityVulnerabilities} />

                <div className="lg:col-span-2 glass-effect p-6 rounded-lg flex flex-col">
                    <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">Recent Activity</h3>
                    <ul className="space-y-4 flex-grow overflow-y-auto pr-2">
                        {recentActivity.map(item => (
                            <li key={item.id} className="flex items-center space-x-3 text-sm">
                                <ActivityIcon type={item.type} />
                                <span className="flex-grow text-dark-text dark:text-light-text">{item.text}</span>
                                <span className="text-xs text-medium-dark-text dark:text-medium-text flex-shrink-0">{item.time}</span>
                            </li>
                        ))}
                         {recentActivity.length === 0 && <p className="text-sm text-center text-medium-dark-text dark:text-medium-text pt-8">No recent activity.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PersonalDashboard;