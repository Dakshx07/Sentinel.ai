import React, { useMemo } from 'react';
import { getRepoPulls } from '../services/githubService';
import { SpinnerIcon, PullRequestIcon, CheckCircleIcon, XCircleIcon, HistoryIcon } from './icons';

// Declare globals loaded from script tags
declare global {
    interface Window {
        SWR: any;
        ReactApexCharts: any;
    }
}

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="glass-effect p-4 rounded-lg flex items-center space-x-4">
        <div className="bg-brand-purple/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-medium-dark-text dark:text-medium-text">{title}</p>
            <p className="text-2xl font-bold text-dark-text dark:text-white">{value}</p>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC = () => {
    // A sample repo for the demo. In a real app, this would come from user's added repos.
    const MOCK_REPO_OWNER = 'facebook';
    const MOCK_REPO_NAME = 'react';

    // Safely get hooks/components inside the render function to avoid race conditions
    const useSWR = window.SWR?.useSWR;
    const ReactApexChart = window.ReactApexCharts;
    
    // Guard clause to wait for scripts to load
    if (!useSWR || !ReactApexChart) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <SpinnerIcon className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text">Loading components...</p>
                </div>
            </div>
        );
    }
    
    const fetcher = () => getRepoPulls(MOCK_REPO_OWNER, MOCK_REPO_NAME, 'all');
    // Fetch last 100 PRs for performance
    const { data: prs, error, isLoading } = useSWR(
        `/repos/${MOCK_REPO_OWNER}/${MOCK_REPO_NAME}/pulls?per_page=100`, 
        fetcher, 
        { 
            revalidateOnFocus: false,
            fallbackData: [],
            errorRetryCount: 3,
            errorRetryInterval: 5000,
        }
    );

    const analyticsData = useMemo(() => {
        if (!prs || prs.length === 0) return null;
        
        const reviewTimeData = prs
            .filter((pr: any) => pr.merged_at)
            .map((pr: any) => ({
                x: new Date(pr.created_at).getTime(),
                y: (new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60 * 24), // in days
            }))
            .sort((a: any, b: any) => a.x - b.x);

        const issuesByType = prs.reduce((acc: any, pr: any) => {
            if (pr.labels.length === 0) {
                 acc['Unlabeled'] = (acc['Unlabeled'] || 0) + 1;
            } else {
                pr.labels.forEach((label: any) => {
                    const type = label.name.toLowerCase().includes('bug') ? 'Bugs' :
                                 label.name.toLowerCase().includes('feature') || label.name.toLowerCase().includes('enhancement') ? 'Features' :
                                 'Other';
                    acc[type] = (acc[type] || 0) + 1;
                });
            }
            return acc;
        }, { Bugs: 0, Features: 0, Other: 0, Unlabeled: 0});
        
        const avgReviewTime = reviewTimeData.length > 0
            ? (reviewTimeData.reduce((sum: number, item: any) => sum + item.y, 0) / reviewTimeData.length).toFixed(1)
            : 0;

        const openPrs = prs.filter((pr:any) => pr.state === 'open').length;
        const mergedPrs = prs.filter((pr:any) => pr.merged_at).length;
            
        return { reviewTimeData, issuesByType, avgReviewTime, totalPrs: prs.length, openPrs, mergedPrs };
    }, [prs]);

    if (isLoading && (!prs || prs.length === 0)) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <SpinnerIcon className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text">Loading Analytics Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="h-full w-full flex items-center justify-center p-4">
                <div className="glass-effect rounded-lg p-6 text-center">
                    <h2 className="text-xl font-bold text-red-500">Error: {error.message}.</h2>
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text">
                       Please check your Personal Access Token in Settings and ensure it has the correct permissions.
                    </p>
                </div>
            </div>
        );
    }
    
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#A4A4C8' : '#4B5563';

    const reviewTimeChartOptions = {
        series: [{ name: 'Review Time (days)', data: analyticsData?.reviewTimeData || [] }],
        chart: { type: 'area', height: 250, background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2, colors: ['#9F54FF'] },
        fill: { type: 'gradient', gradient: { shade: 'dark', type: "vertical", shadeIntensity: 0.5, gradientToColors: [isDarkMode ? '#0A0A1F' : '#F3F4F6'], inverseColors: true, opacityFrom: isDarkMode ? 0.5 : 0.2, opacityTo: 0, stops: [0, 100] } },
        xaxis: { type: 'datetime', labels: { style: { colors: textColor } }, axisBorder: { show: false }, axisTicks: { show: false } },
        yaxis: { labels: { style: { colors: textColor } }, title: { text: 'Days to Merge', style: { color: textColor, fontSize: '12px' } } },
        tooltip: { theme: isDarkMode ? 'dark' : 'light', x: { format: 'dd MMM yyyy' } },
        grid: { show: true, borderColor: isDarkMode ? '#A4A4C820' : '#1F293720', strokeDashArray: 4 },
    };
    
    const issueTypeChartOptions = {
        series: [{ name: 'Count', data: Object.values(analyticsData?.issuesByType || {}) }],
        chart: { type: 'bar', height: 250, background: 'transparent', toolbar: { show: false } },
        plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '50%' } },
        dataLabels: { enabled: false },
        xaxis: { categories: Object.keys(analyticsData?.issuesByType || {}), labels: { style: { colors: textColor } } },
        yaxis: { labels: { style: { colors: textColor } } },
        colors: ['#00D4FF'],
        tooltip: { theme: isDarkMode ? 'dark' : 'light' },
        grid: { show: false },
    };
    
    return (
         <div className="h-full w-full space-y-8 animate-fade-in-up">
            <div>
                 <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Analytics Dashboard</h1>
                 <p className="text-medium-dark-text dark:text-medium-text mt-1">Showing data for last 100 PRs in <span className="font-semibold text-dark-text dark:text-white">{MOCK_REPO_OWNER}/{MOCK_REPO_NAME}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard title="Total PRs" value={analyticsData?.totalPrs || 0} icon={<PullRequestIcon className="w-6 h-6 text-brand-purple" />} />
                 <MetricCard title="Open PRs" value={analyticsData?.openPrs || 0} icon={<XCircleIcon className="w-6 h-6 text-brand-purple" />} />
                 <MetricCard title="Merged PRs" value={analyticsData?.mergedPrs || 0} icon={<CheckCircleIcon className="w-6 h-6 text-brand-purple" />} />
                 <MetricCard title="Avg. Review Time" value={`${analyticsData?.avgReviewTime || 0} days`} icon={<HistoryIcon className="w-6 h-6 text-brand-purple" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-effect p-6 rounded-lg">
                    <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">PR Review Time Over Time</h3>
                    <ReactApexChart options={reviewTimeChartOptions} series={reviewTimeChartOptions.series} type="area" height={250} />
                </div>
                <div className="lg:col-span-1 glass-effect p-6 rounded-lg">
                    <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">Issues by Type</h3>
                    <ReactApexChart options={issueTypeChartOptions} series={issueTypeChartOptions.series} type="bar" height={250} />
                </div>
            </div>

         </div>
    );
};

export default AnalyticsDashboard;