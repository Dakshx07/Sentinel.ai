import { Repository } from '../types';

const VULNERABILITIES_KEY = 'sentinel-vulnerabilities';
const ACTIVITY_LOG_KEY = 'sentinel-activity-log';

export interface IVulnerability {
    id: string;
    repoId: number;
    repoName: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    title: string;
    timestamp: number;
}

export interface IActivityLog {
    id: string;
    type: 'NEW_VULNERABILITY' | 'AUTOREVIEW_ENABLED' | 'SCAN_COMPLETED';
    text: string;
    time: string; // User-friendly time string e.g., "2h ago"
    timestamp: number;
}

const MOCK_VULNERABILITIES = [
    { severity: 'Critical', title: 'SQL Injection in user API' },
    { severity: 'High', title: 'Cross-Site Scripting (XSS) in comments' },
    { severity: 'Medium', title: 'Insecure Direct Object Reference' },
    { severity: 'Low', title: 'Missing CSRF token in form' },
];

const getStoredData = <T>(key: string): T[] => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return [];
    }
};

const setStoredData = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const addActivityLog = (type: IActivityLog['type'], text: string) => {
    const logs = getStoredData<IActivityLog>(ACTIVITY_LOG_KEY);
    const newLog: IActivityLog = {
        id: `log-${Date.now()}`,
        type,
        text,
        timestamp: Date.now(),
        time: formatTimeAgo(Date.now()),
    };
    const updatedLogs = [newLog, ...logs].slice(0, 50); // Keep last 50 logs
    setStoredData(ACTIVITY_LOG_KEY, updatedLogs);
};

// --- Simulation Logic ---

// Fix: Use 'number' for interval IDs in browser environments, as 'setInterval' returns a number, not a NodeJS.Timeout object.
let reviewInterval: number | null = null;

const runReviewCycle = () => {
    const reposJson = localStorage.getItem('sentinel-repos-demo');
    if (!reposJson) return;

    const repos: Repository[] = JSON.parse(reposJson);
    const reposToReview = repos.filter(r => r.autoReview);

    if (reposToReview.length === 0) {
        if (reviewInterval) {
            clearInterval(reviewInterval);
            reviewInterval = null;
        }
        return;
    }

    reposToReview.forEach(repo => {
        // Randomly decide whether to find a vulnerability in this cycle
        if (Math.random() < 0.2) { // 20% chance each cycle
            const vulnerabilities = getStoredData<IVulnerability>(VULNERABILITIES_KEY);
            const mockVuln = MOCK_VULNERABILITIES[Math.floor(Math.random() * MOCK_VULNERABILITIES.length)];
            const newVuln: IVulnerability = {
                id: `vuln-${Date.now()}`,
                repoId: repo.id,
                repoName: repo.name,
                severity: mockVuln.severity as IVulnerability['severity'],
                title: mockVuln.title,
                timestamp: Date.now(),
            };
            setStoredData(VULNERABILITIES_KEY, [newVuln, ...vulnerabilities]);
            addActivityLog('NEW_VULNERABILITY', `New ${newVuln.severity.toLowerCase()} issue found in ${repo.name}.`);
        }
    });
};

export const startReview = (repoId: number, repoName: string) => {
    addActivityLog('AUTOREVIEW_ENABLED', `Auto-review enabled for ${repoName}.`);
    if (!reviewInterval) {
        runReviewCycle(); // Run immediately
        reviewInterval = setInterval(runReviewCycle, 7000) as any; // Use 'as any' to bypass TS lib check issue
    }
};

export const stopReview = (repoId: number, repoName: string) => {
    // Logic to stop is handled by the cycle checking which repos have autoReview: false
};

// --- Dashboard Data Fetching ---

export const getDashboardData = (allRepos: Repository[]) => {
    const vulnerabilities = getStoredData<IVulnerability>(VULNERABILITIES_KEY);
    const activityLogs = getStoredData<IActivityLog>(ACTIVITY_LOG_KEY);
    
    const totalRepos = allRepos.length;
    const autoReviewCount = allRepos.filter(r => r.autoReview).length;
    const criticalCount = vulnerabilities.filter(v => v.severity === 'Critical').length;

    const now = new Date();
    const fourWeeksAgo = now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000;
    
    const trendData = [0, 0, 0, 0]; // [Week -4, Week -3, Week -2, Week -1]
    vulnerabilities.forEach(vuln => {
        if (vuln.timestamp > fourWeeksAgo) {
            const weekIndex = Math.floor((vuln.timestamp - fourWeeksAgo) / (7 * 24 * 60 * 60 * 1000));
            if (weekIndex >= 0 && weekIndex < 4) {
                trendData[weekIndex]++;
            }
        }
    });

    const recentActivity = activityLogs.slice(0, 5).map(log => ({
        ...log,
        time: formatTimeAgo(log.timestamp),
    }));

    return {
        totalRepos,
        autoReviewCount,
        criticalCount,
        trendData,
        recentActivity,
    };
};
