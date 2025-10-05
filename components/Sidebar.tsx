


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
    AnalyticsIcon
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
        { id: 'repositories' as DashboardView, label: 'Manage Repos', icon: <RepoIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'studio' as DashboardView, label: 'Studio', icon: <StudioIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'refactor' as DashboardView, label: 'AI Refactor', icon: <BrainCircuitIcon className="w-5 h-5 flex-shrink-0"/> },
        { id: 'gitops' as DashboardView, label: 'GitOps Integration', icon: <GitBranchIcon className="w-5 h-5 flex-shrink-0" /> },
        { id: 'commits' as DashboardView, label: 'Commit History', icon: <HistoryIcon className="w-5 h-5 flex-shrink-0" /> },
        { id: 'pushpull' as DashboardView, label: 'PR Review', icon: <PullRequestIcon className="w-5 h-5 flex-shrink-0" /> },
    ];
    
    const secondaryNavItems = [
        { id: 'team' as DashboardView, label: 'Team Collab', icon: <UsersIcon className="w-5 h-5 flex-shrink-0" /> },
        { id: 'notifications' as DashboardView, label: 'Notifications', icon: <NotificationsIcon className="w-5 h-5 flex-shrink-0" /> },
        { id: 'docs' as DashboardView, label: 'Docs', icon: <DocsIcon className="w-5 h-5 flex-shrink-0" /> },
        { id: 'settings' as DashboardView, label: 'Settings', icon: <SettingsIcon className="w-5 h-5 flex-shrink-0" /> }
    ]

    return (
        <aside className="w-64 flex flex-col bg-light-secondary dark:bg-dark-secondary border-r border-gray-200 dark:border-white/10">
            <div className="p-4 flex-grow flex flex-col">
                <nav className="space-y-1">
                    {mainNavItems.map(item => (
                         <NavLink
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            icon={item.icon}
                            isActive={activeView === item.id}
                            onClick={setActiveView}
                        />
                    ))}
                </nav>
                <div className="mt-6">
                     <h3 className="px-4 text-xs font-semibold text-medium-dark-text dark:text-medium-text uppercase tracking-wider">Tools</h3>
                     <nav className="space-y-1 mt-2">
                        {toolsNavItems.map(item => (
                            <NavLink
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                icon={item.icon}
                                isActive={activeView === item.id}
                                onClick={setActiveView}
                            />
                        ))}
                    </nav>
                </div>
                <div className="mt-auto">
                    <nav className="space-y-1 pt-6 border-t border-gray-200 dark:border-white/10">
                        {secondaryNavItems.map(item => (
                            <NavLink
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                icon={item.icon}
                                isActive={activeView === item.id}
                                onClick={setActiveView}
                            />
                        ))}
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;