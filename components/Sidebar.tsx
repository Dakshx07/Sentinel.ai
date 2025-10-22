

import React from 'react';
import { 
    StudioIcon, 
    GitBranchIcon, 
    SettingsIcon, 
    HistoryIcon,
    RepoIcon,
    DocsIcon,
    NotificationsIcon,
    PullRequestIcon,
    BrainCircuitIcon,
    UsersIcon,
    AnalyticsIcon,
    CpuChipIcon
} from './icons';
import { DashboardView } from '../types';

interface NavLinkProps {
    id: DashboardView;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: (id: DashboardView) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ id, label, icon, isActive, onClick }) => {
    const activeClasses = "bg-brand-purple/10 text-brand-purple dark:bg-brand-purple/20 dark:text-white";
    const inactiveClasses = "text-medium-dark-text dark:text-medium-text hover:bg-gray-200 dark:hover:bg-dark-primary hover:text-dark-text dark:hover:text-white";

    return (
        <button
            onClick={() => onClick(id)}
            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            title={label}
        >
            {icon}
            <span className="ml-4 truncate">{label}</span>
        </button>
    );
};


interface SidebarProps {
    activeView: DashboardView;
    setActiveView: (view: DashboardView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {

    const mainNavItems = [
        { id: 'dashboard' as DashboardView, label: 'Dashboard', icon: <AnalyticsIcon className="w-5 h-5 flex-shrink-0"/> },
    ];

    const toolsNavItems = [
        { id: 'repositories' as DashboardView, label: 'Repositories', icon: <RepoIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'studio' as DashboardView, label: 'Studio Sandbox', icon: <StudioIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'gitops' as DashboardView, label: 'GitOps Integration', icon: <GitBranchIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'commits' as DashboardView, label: 'Commit History', icon: <HistoryIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'pushpull' as DashboardView, label: 'PR Review', icon: <PullRequestIcon className="w-5 h-5 flex-shrink-0" />},
        { id: 'refactor' as DashboardView, label: 'AI Refactor', icon: <BrainCircuitIcon className="w-5 h-5 flex-shrink-0"/> },
    ];
    
    const analyticsNavItems = [
        { id: 'repoPulse' as DashboardView, label: 'Repo Pulse', icon: <AnalyticsIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'workflowStreamliner' as DashboardView, label: 'Workflow Streamliner', icon: <CpuChipIcon className="w-5 h-5 flex-shrink-0"/> },
    ];

    const accountNavItems = [
        { id: 'docs' as DashboardView, label: 'User Guide & Docs', icon: <DocsIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'notifications' as DashboardView, label: 'Notifications', icon: <NotificationsIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'team' as DashboardView, label: 'Team Collaboration', icon: <UsersIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'settings' as DashboardView, label: 'Settings', icon: <SettingsIcon className="w-5 h-5 flex-shrink-0"/> },
    ];
    
    return (
        <aside className="bg-light-secondary dark:bg-dark-secondary border-r border-gray-200 dark:border-white/10 flex flex-col h-full">
            <nav className="flex-grow px-4 pb-4">
                <ul className="space-y-1 pt-4">
                    {mainNavItems.map(item => <li key={item.id}><NavLink {...item} isActive={activeView === item.id} onClick={setActiveView} /></li>)}
                </ul>

                 <p className="px-4 pt-8 pb-2 text-xs font-semibold text-medium-dark-text dark:text-medium-text uppercase tracking-wider">Tools</p>
                <ul className="space-y-1">
                    {toolsNavItems.map(item => <li key={item.id}><NavLink {...item} isActive={activeView === item.id} onClick={setActiveView} /></li>)}
                </ul>
                
                <p className="px-4 pt-8 pb-2 text-xs font-semibold text-medium-dark-text dark:text-medium-text uppercase tracking-wider">Analytics</p>
                <ul className="space-y-1">
                    {analyticsNavItems.map(item => <li key={item.id}><NavLink {...item} isActive={activeView === item.id} onClick={setActiveView} /></li>)}
                </ul>

                <p className="px-4 pt-8 pb-2 text-xs font-semibold text-medium-dark-text dark:text-medium-text uppercase tracking-wider">Account</p>
                 <ul className="space-y-1">
                    {accountNavItems.map(item => <li key={item.id}><NavLink {...item} isActive={activeView === item.id} onClick={setActiveView} /></li>)}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;