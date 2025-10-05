import React from 'react';
import { UsersIcon, CheckCircleIcon } from './icons';

const FeaturePill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center space-x-2 bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple dark:text-brand-cyan px-3 py-1.5 rounded-full text-sm font-medium">
        <CheckCircleIcon className="w-5 h-5" />
        <span>{children}</span>
    </div>
);

const TeamCollab: React.FC = () => {
    return (
        <div className="h-full w-full flex items-center justify-center animate-fade-in-up">
            <div className="text-center glass-effect rounded-lg p-12 max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UsersIcon className="w-12 h-12 text-brand-cyan" />
                </div>
                <h1 className="text-4xl font-bold text-dark-text dark:text-white font-heading">Team Collaboration Mode</h1>
                <p className="mt-4 text-lg text-medium-dark-text dark:text-medium-text">
                    A shared workspace for your team to review, discuss, and resolve security issues in real-time.
                </p>

                <div className="mt-8 border-t border-gray-200 dark:border-white/10 pt-8">
                    <h2 className="text-xl font-bold text-dark-text dark:text-white font-heading tracking-wider uppercase">Coming Soon</h2>
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text">
                        This feature is currently under development and will be powered by Supabase Realtime for a seamless, instant collaboration experience.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <FeaturePill>Real-time Shared Cursors</FeaturePill>
                        <FeaturePill>Live Chat on Code Diffs</FeaturePill>
                        <FeaturePill>Shared Analysis Results</FeaturePill>
                        <FeaturePill>Automated Notifications</FeaturePill>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamCollab;
