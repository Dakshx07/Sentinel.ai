import React, { useState, useMemo } from 'react';
import { ShieldIcon, ChevronDownIcon, ChevronUpIcon, SpinnerIcon } from './icons';
import { getRepoIssues } from '../services/githubService';

// Declare globals loaded from script tags
declare global {
    interface Window {
        SWR: any;
        ReactApexCharts: any;
    }
}

const SecurityDashboard: React.FC = () => {
    // A sample repo for the demo. In a real app, this would come from user's added repos.
    const MOCK_REPO_OWNER = 'OWASP';
    const MOCK_REPO_NAME = 'wrongsecrets';
    
    const [sort, setSort] = useState<{ column: string; direction: 'asc' | 'desc' }>({ column: 'severity', direction: 'asc' });

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
    
    const fetcher = () => getRepoIssues(MOCK_REPO_OWNER, MOCK_REPO_NAME, ['security', 'vulnerability', 'good first issue']);
    const { data: issues, error, isLoading } = useSWR(
        `/repos/${MOCK_REPO_OWNER}/${MOCK_REPO_NAME}/issues`, 
        fetcher, 
        { 
            revalidateOnFocus: false,
            // Use an empty array as fallbackData to prevent errors on initial render
            // while data is loading for the first time.
            fallbackData: [],
            errorRetryCount: 3,
            errorRetryInterval: 5000,
        }
    );

    const vulnerabilities = useMemo(() => {
        if (!issues) return [];
        
        const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        const getSeverity = (issue: any): keyof typeof severityOrder => {
            for (const label of issue.labels) {
                const labelName = label.name.toLowerCase();
                if (labelName.includes('critical')) return 'Critical';
                if (labelName.includes('high')) return 'High';
                if (labelName.includes('medium')) return 'Medium';
                if (labelName.includes('low')) return 'Low';
            }
            return 'Medium'; // Default
        };

        return issues.map((issue: any) => ({
            id: issue.id,
            title: issue.title,
            url: issue.html_url,
            severity: getSeverity(issue),
        })).sort((a: any, b: any) => {
            if (sort.column === 'severity') {
                const res = severityOrder[a.severity] - severityOrder[b.severity];
                return sort.direction === 'asc' ? res : -res;
            }
            return 0;
        });
    }, [issues, sort]);

    const severityCounts = useMemo(() => {
        const counts: { [key: string]: number } = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        vulnerabilities.forEach(v => {
            counts[v.severity]++;
        });
        return counts;
    }, [vulnerabilities]);

    const handleSort = (column: string) => {
        setSort(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };
    
    const SortIcon: React.FC<{column: string}> = ({column}) => {
        if (sort.column !== column) return <div className="w-4 h-4 ml-1"></div>;
        return sort.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4 ml-1" /> : <ChevronDownIcon className="w-4 h-4 ml-1" />;
    };
    
    const pieChartOptions = {
        series: Object.values(severityCounts),
        chart: { type: 'donut', height: 220, background: 'transparent' },
        labels: Object.keys(severityCounts),
        colors: ['#DC2626', '#F97316', '#F59E0B', '#3B82F6'], // Red, Orange, Yellow, Blue
        theme: {
            mode: (document.documentElement.classList.contains('dark') ? 'dark' : 'light') as 'dark' | 'light'
        },
        legend: { show: true, position: 'bottom', horizontalAlign: 'center', floating: false, fontSize: '12px', fontFamily: 'Inter', fontWeight: 400, labels: { colors: document.documentElement.classList.contains('dark') ? '#A4A4C8' : '#4B5563'}, itemMargin: { horizontal: 5, vertical: 2 } },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (val: number) => `${val} issues` } },
        states: { hover: { filter: { type: 'none' } } },
        stroke: { width: 0 }
    };
    
    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                    <SpinnerIcon className="w-8 h-8 text-brand-purple animate-spin mx-auto" />
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text">Loading Security Data...</p>
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
    
    return (
        <div className="h-full w-full space-y-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Security Dashboard</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 glass-effect p-6 rounded-lg">
                    <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">Vulnerability Breakdown</h3>
                    <ReactApexChart options={pieChartOptions} series={pieChartOptions.series} type="donut" height={220} />
                </div>
                <div className="lg:col-span-2 glass-effect p-6 rounded-lg">
                     <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">Key Metrics</h3>
                     <div className="grid grid-cols-2 gap-6 h-full items-center">
                        <div className="flex flex-col justify-center items-center bg-light-primary dark:bg-dark-primary p-4 rounded-md h-full">
                            <span className="text-5xl font-bold text-red-500">{severityCounts.Critical}</span>
                            <span className="text-sm text-medium-dark-text dark:text-medium-text mt-1">Critical Issues</span>
                        </div>
                         <div className="flex flex-col justify-center items-center bg-light-primary dark:bg-dark-primary p-4 rounded-md h-full">
                            <span className="text-5xl font-bold text-dark-text dark:text-white">{vulnerabilities.length}</span>
                            <span className="text-sm text-medium-dark-text dark:text-medium-text mt-1">Total Open Issues</span>
                        </div>
                     </div>
                </div>
            </div>

            <div className="glass-effect p-6 rounded-lg">
                <h3 className="font-bold text-dark-text dark:text-white font-heading mb-4">Open Vulnerabilities in {MOCK_REPO_OWNER}/{MOCK_REPO_NAME}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 dark:border-white/10">
                            <tr>
                                <th className="p-3 text-left font-semibold text-medium-dark-text dark:text-medium-text">
                                    <button onClick={() => handleSort('severity')} className="flex items-center hover:text-dark-text dark:hover:text-white">Severity <SortIcon column="severity" /></button>
                                </th>
                                <th className="p-3 text-left font-semibold text-medium-dark-text dark:text-medium-text">Title</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vulnerabilities.map(vuln => (
                                <tr key={vuln.id} className="border-b border-gray-200 dark:border-white/10 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="p-3 w-40">
                                        <div className="flex items-center space-x-2">
                                            <ShieldIcon severity={vuln.severity} className="w-5 h-5"/>
                                            <span className="font-semibold">{vuln.severity}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-dark-text dark:text-light-text font-medium">
                                        <a href={vuln.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cyan">{vuln.title}</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
