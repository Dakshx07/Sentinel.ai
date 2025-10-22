import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Repository, User, GitHubCommit } from '../types';
import { getRepoCommits, getRepoPulls, parseGitHubUrl } from '../services/githubService';
import { summarizeRepoActivity } from '../services/geminiService';
import { SpinnerIcon, ErrorIcon, AnalyticsIcon } from './icons';
import { useToast } from './ToastContext';

declare global {
    interface Window {
        ReactApexCharts: any;
    }
}

interface RepoPulseDashboardProps {
    repos: Repository[];
    user: User | null;
}

const RepoPulseDashboard: React.FC<RepoPulseDashboardProps> = ({ repos, user }) => {
    const [chartReady, setChartReady] = useState(false);
    const { addToast } = useToast();
    const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [commitData, setCommitData] = useState<GitHubCommit[]>([]);
    const [prData, setPrData] = useState<any[]>([]);
    const [aiSummary, setAiSummary] = useState<string>('');

    useEffect(() => {
        // Check if the charting library is loaded
        if (window.ReactApexCharts) {
            setChartReady(true);
        } else {
            // Poll for the library if it's not immediately available
            const interval = setInterval(() => {
                if (window.ReactApexCharts) {
                    setChartReady(true);
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);
    
    useEffect(() => {
        if (repos.length > 0 && !selectedRepoFullName) {
            setSelectedRepoFullName(repos[0].full_name);
        }
    }, [repos, selectedRepoFullName]);

    const fetchData = useCallback(async (repoFullName: string) => {
        setIsLoading(true);
        setIsAiLoading(true);
        setError(null);
        setAiSummary('');
        setCommitData([]);
        setPrData([]);

        try {
            const parsed = parseGitHubUrl(`https://github.com/${repoFullName}`);
            if (!parsed) throw new Error('Could not parse repository name.');
            const { owner, repo } = parsed;

            const sinceDate = new Date();
            sinceDate.setDate(sinceDate.getDate() - 90);

            addToast('Fetching repository activity...', 'info');
            const [commits, pullRequests] = await Promise.all([
                getRepoCommits(owner, repo, sinceDate.toISOString()),
                getRepoPulls(owner, repo, 'all'),
            ]);
            
            setCommitData(commits);
            const recentPrs = pullRequests.filter(pr => new Date(pr.created_at) > sinceDate);
            setPrData(recentPrs);
            addToast('Activity loaded. Generating AI summary...', 'info');
            setIsLoading(false); // Stop main loading indicator

            // AI summary runs separately
            const summary = await summarizeRepoActivity(
                commits.slice(0, 20).map(c => ({ message: c.commit.message })),
                recentPrs.slice(0, 10).map(p => ({ title: p.title }))
            );
            setAiSummary(summary);
            addToast('AI summary complete.', 'success');

        } catch (e: any) {
            const errorMessage = e.message || 'Failed to fetch repository data.';
            setError(errorMessage);
            addToast(errorMessage, 'error');
            setIsLoading(false);
        } finally {
            setIsAiLoading(false); // AI loading is finished, success or fail
        }
    }, [addToast]);

    useEffect(() => {
        if (selectedRepoFullName) {
            fetchData(selectedRepoFullName);
        }
    }, [selectedRepoFullName, fetchData]);


    const heatmapData = useMemo(() => {
        const activityMap = new Map<string, number>();
        
        [...commitData, ...prData].forEach(item => {
            const dateStr = new Date('commit' in item ? item.commit.author.date : item.created_at).toISOString().split('T')[0];
            activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
        });

        const seriesData = Array.from(activityMap.entries()).map(([date, count]) => ({
            x: date,
            y: count,
        }));

        return [{ name: 'Activity', data: seriesData }];
    }, [commitData, prData]);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartOptions = {
        series: heatmapData,
        chart: { type: 'heatmap', height: 250, background: 'transparent', toolbar: { show: false } },
        plotOptions: { heatmap: { radius: 2, enableShades: true, shadeIntensity: 0.7, colorScale: { ranges: [{ from: 1, to: 5, color: '#00D4FF', name: 'low' }, { from: 6, to: 10, color: '#9F54FF', name: 'medium' }, { from: 11, to: 99, color: '#FF7B72', name: 'high'}] } } },
        dataLabels: { enabled: false },
        stroke: { width: 1, colors: [isDarkMode ? '#10102A' : '#FFFFFF'] },
        xaxis: { type: 'datetime', labels: { style: { colors: isDarkMode ? '#A4A4C8' : '#4B5563' } } },
        yaxis: { labels: { style: { colors: isDarkMode ? '#A4A4C8' : '#4B5563' } } },
        tooltip: { theme: isDarkMode ? 'dark' : 'light', y: { formatter: (val: number) => `${val} events` } },
        title: { text: 'Repository Activity (Last 90 Days)', align: 'left', style: { color: isDarkMode ? '#FFFFFF' : '#1F2937', fontFamily: 'Syne, sans-serif' } },
    };

    const renderContent = () => {
        if (!chartReady) {
             return <div className="flex items-center justify-center h-full text-medium-dark-text dark:text-medium-text"><SpinnerIcon className="w-6 h-6 mr-2"/>Loading chart components...</div>;
        }
        if (isLoading) {
            return <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-brand-purple" /> <span className="ml-3">Fetching activity...</span></div>;
        }
        if (error) {
            return <div className="flex flex-col items-center justify-center h-full text-red-500"><ErrorIcon className="w-8 h-8 mb-2" /><p>{error}</p></div>;
        }
        if (heatmapData[0].data.length === 0) {
            return <div className="flex items-center justify-center h-full text-medium-dark-text dark:text-medium-text">No activity found for this repository in the last 90 days.</div>;
        }
        return (
            <div className="space-y-6">
                <div className="glass-effect p-6 rounded-lg">
                    <window.ReactApexCharts options={chartOptions} series={chartOptions.series} type="heatmap" height={250} />
                </div>
                <div className="glass-effect p-6 rounded-lg min-h-[100px]">
                    <h3 className="font-bold text-dark-text dark:text-white font-heading mb-2">AI Weekly Digest</h3>
                    {isAiLoading ? (
                        <div className="flex items-center text-sm text-medium-dark-text dark:text-medium-text"><SpinnerIcon className="w-4 h-4 mr-2"/>Generating summary...</div>
                    ) : (
                         <p className="text-medium-dark-text dark:text-medium-text italic">"{aiSummary}"</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-3">
                    <AnalyticsIcon className="w-8 h-8 text-brand-purple" />
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Repo Pulse</h1>
                        <p className="mt-1 text-medium-dark-text dark:text-medium-text">AI-driven activity summary and heatmap for your repositories.</p>
                    </div>
                </div>
                {repos.length > 0 && (
                    <select
                        value={selectedRepoFullName}
                        onChange={e => setSelectedRepoFullName(e.target.value)}
                        className="mt-4 md:mt-0 w-full md:w-72 bg-light-secondary dark:bg-dark-secondary border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    >
                        {repos.map(repo => (
                            <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>
                        ))}
                    </select>
                )}
            </div>

            {repos.length > 0 ? renderContent() : (
                 <div className="flex items-center justify-center h-full text-center glass-effect rounded-lg p-8">
                     <div>
                        <p className="text-medium-dark-text dark:text-medium-text">Add a repository to view its pulse.</p>
                     </div>
                </div>
            )}
        </div>
    );
};

export default RepoPulseDashboard;