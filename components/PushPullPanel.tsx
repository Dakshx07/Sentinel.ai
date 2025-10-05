import React, { useState, useEffect, useMemo } from 'react';
import { Octokit } from 'octokit';
import { useToast } from './ToastContext';
import { SpinnerIcon, GithubIcon, PullRequestIcon, SettingsIcon, ShieldIcon } from './icons';
import { DashboardView, AnalysisIssue } from '../types';
import { analyzeCode, isApiKeySet, isDemoMode } from '../services/geminiService';

declare global {
    interface Window {
        hljs: any;
    }
}

interface ChangedFile {
  sha: string;
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  patch?: string;
}

interface PushPullPanelProps {
    setActiveView: (view: DashboardView) => void;
}

const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
        js: 'javascript', ts: 'typescript', py: 'python',
        tsx: 'typescript', jsx: 'javascript', hcl: 'hcl', tf: 'hcl'
    };
    return langMap[ext || ''] || 'plaintext';
};

const IssueComment: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => (
    <div className="border border-gray-200 dark:border-white/10 bg-light-primary dark:bg-dark-primary my-2 rounded-lg text-sm">
        <div className={`flex items-center space-x-2 p-2 border-b border-gray-200 dark:border-white/10 ${
            {'Critical': 'bg-red-500/10', 'High': 'bg-orange-500/10', 'Medium': 'bg-yellow-500/10', 'Low': 'bg-blue-500/10'}[issue.severity] || ''
        }`}>
            <ShieldIcon severity={issue.severity} className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold text-dark-text dark:text-white">{issue.title}</span>
        </div>
        <div className="p-3 space-y-2">
            <p className="text-medium-dark-text dark:text-medium-text">{issue.description}</p>
            <div>
                <h4 className="font-semibold text-dark-text dark:text-white">Suggested Fix:</h4>
                <pre className="mt-1 bg-light-secondary dark:bg-dark-secondary p-2 rounded-md font-mono text-xs overflow-x-auto">
                    <code>{issue.suggestedFix}</code>
                </pre>
            </div>
        </div>
    </div>
);

const DiffView: React.FC<{ patch: string; issues: AnalysisIssue[] }> = ({ patch, issues }) => {
    const memoizedDiff = useMemo(() => {
        if (!patch) return [];

        const highlightedDiff = window.hljs?.highlight(patch, { language: 'diff', ignoreIllegals: true }).value || patch;
        const highlightedLines = highlightedDiff.split('\n');
        const rawLines = patch.split('\n');
        
        let fileLineNumber = 0;

        return rawLines.map((rawLine, index) => {
            const highlightedLine = highlightedLines[index] || '';
            let lineType = 'context';
            let currentLineNumberForIssues = -1;

            if (rawLine.startsWith('@@')) {
                lineType = 'hunk';
                const match = rawLine.match(/\+(\d+)/);
                if (match) fileLineNumber = parseInt(match[1], 10) -1;
            } else if (rawLine.startsWith('+')) {
                lineType = 'addition';
                if(!rawLine.startsWith('+++')) {
                    fileLineNumber++;
                    currentLineNumberForIssues = fileLineNumber;
                }
            } else if (rawLine.startsWith('-')) {
                lineType = 'deletion';
            } else {
                 if(!rawLine.startsWith('\\ No newline')) {
                    fileLineNumber++;
                 }
            }
            
            const issuesForThisLine = currentLineNumberForIssues > 0 
                ? issues.filter(i => i.line === currentLineNumberForIssues) 
                : [];
            
            return {
                key: `${index}-${rawLine}`,
                lineType,
                highlightedContent: highlightedLine,
                issues: issuesForThisLine,
            };
        });
    }, [patch, issues]);

    return (
        <pre className="font-mono text-xs whitespace-pre-wrap break-words">
            <code>
                {memoizedDiff.map(({ key, lineType, highlightedContent, issues }) => (
                    <React.Fragment key={key}>
                        <div className={`flex items-start ${
                            lineType === 'addition' ? 'bg-green-500/10' :
                            lineType === 'deletion' ? 'bg-red-500/10' : ''
                        }`}>
                            <span className={`w-10 text-right pr-2 select-none text-medium-dark-text dark:text-medium-text/50 ${
                                lineType === 'addition' ? 'text-green-500' :
                                lineType === 'deletion' ? 'text-red-500' : ''
                            }`}>
                                {lineType === 'addition' ? '+' : lineType === 'deletion' ? '-' : ' '}
                            </span>
                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: highlightedContent || ' ' }} />
                        </div>
                        {issues.length > 0 && (
                            <div className="flex">
                                <div className="w-10 flex-shrink-0"></div>
                                <div className="flex-1">
                                    {issues.map((issue, issueIdx) => <IssueComment key={issueIdx} issue={issue} />)}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </code>
        </pre>
    );
};


const PushPullPanel: React.FC<PushPullPanelProps> = ({ setActiveView }) => {
    const { addToast } = useToast();
    const [octokit, setOctokit] = useState<Octokit | null>(null);
    const [prUrl, setPrUrl] = useState('https://github.com/OWASP/wrongsecrets/pull/133');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [changedFiles, setChangedFiles] = useState<ChangedFile[]>([]);
    const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisIssue[]>>({});
    const [selectedFile, setSelectedFile] = useState<ChangedFile | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('sentinel-github-pat');
        const keySet = isApiKeySet();

        if (!token || (!keySet && !isDemoMode())) {
            setError('GitHub PAT and Gemini API Key (or Demo Mode) are required. Please configure them in Settings.');
        } else {
            try {
                if (token) {
                    setOctokit(new Octokit({ auth: token }));
                }
            } catch (e) {
                setError('Failed to initialize GitHub client. The library might not have loaded correctly.');
            }
        }
    }, []);

    const handleReview = async () => {
        if (!octokit) return;

        const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!urlMatch) {
            addToast('Invalid GitHub Pull Request URL.', 'error');
            return;
        }

        const [, owner, repo, pull_number] = urlMatch;

        setIsLoading(true);
        setStatusMessage('Fetching changed files from PR...');
        setChangedFiles([]);
        setAnalysisResults({});
        setSelectedFile(null);

        try {
            const { data: { head: { sha: headSha } } } = await octokit.rest.pulls.get({ owner, repo, pull_number: parseInt(pull_number) });
            const { data: files } = await octokit.rest.pulls.listFiles({ owner, repo, pull_number: parseInt(pull_number) });
            const filesToAnalyze = files.filter(f => f.status !== 'removed' && f.patch);
            setChangedFiles(filesToAnalyze);
            
            if (filesToAnalyze.length === 0) {
                setStatusMessage('No code changes to analyze in this PR.');
                setIsLoading(false);
                return;
            }

            const analysisPromises = filesToAnalyze.map(async (file, index) => {
                setStatusMessage(`(${index + 1}/${filesToAnalyze.length}) Analyzing ${file.filename}...`);
                
                let content = '';
                try {
                    const { data: contentData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', { owner, repo, path: file.filename, ref: headSha });
                    if ('content' in contentData) {
                       content = atob(contentData.content);
                    } else {
                       throw new Error('Could not retrieve file content.');
                    }
                } catch(e) {
                    console.error(`Could not fetch content for ${file.filename}. Skipping analysis.`, e);
                    return { filename: file.filename, issues: [] };
                }

                const language = getLanguage(file.filename);
                const issues = await analyzeCode(content, language);

                const addedLinesInPatch = new Set<number>();
                const patchLines = file.patch?.split('\n') || [];
                let currentLine = 0;

                for (const line of patchLines) {
                    if (line.startsWith('@@')) {
                        const match = line.match(/\+(\d+)/);
                        if (match) currentLine = parseInt(match[1], 10) -1;
                    }
                    if (!line.startsWith('-') && !line.startsWith('@@') && !line.startsWith('\\')) {
                        currentLine++;
                    }
                    if (line.startsWith('+')) {
                         addedLinesInPatch.add(currentLine);
                    }
                }
                
                const relevantIssues = issues.filter(issue => addedLinesInPatch.has(issue.line));
                return { filename: file.filename, issues: relevantIssues };
            });

            const results = await Promise.all(analysisPromises);
            
            const finalResults: Record<string, AnalysisIssue[]> = {};
            results.forEach(res => {
                if(res.issues.length > 0) {
                   finalResults[res.filename] = res.issues;
                }
            });
            
            setAnalysisResults(finalResults);
            if (filesToAnalyze.length > 0) {
                setSelectedFile(filesToAnalyze[0]);
            }
            setStatusMessage(`Analysis complete. Found ${Object.values(finalResults).flat().length} new issues.`);

        } catch (err: any) {
            addToast(`Error reviewing PR: ${err.message}`, 'error');
            setStatusMessage('');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 glass-effect rounded-lg">
                <div className="text-center">
                     <p className="text-lg text-medium-dark-text dark:text-medium-text">{error}</p>
                     <button onClick={() => setActiveView('settings')} className="mt-4 btn-primary flex items-center space-x-2 py-2 px-4 mx-auto">
                        <SettingsIcon className="w-5 h-5" />
                        <span>Go to Settings</span>
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full flex flex-col glass-effect rounded-lg overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0 space-y-3">
                <h1 className="text-2xl font-bold font-heading">Interactive PR Review</h1>
                <div className="flex items-center space-x-3">
                    <div className="relative flex-grow">
                        <PullRequestIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-medium-dark-text dark:text-medium-text" />
                        <input type="text" value={prUrl} onChange={(e) => setPrUrl(e.target.value)} placeholder="https://github.com/owner/repo/pull/123"
                            className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 pl-10 font-mono text-sm"
                        />
                    </div>
                    <button onClick={handleReview} disabled={isLoading} className="btn-primary py-2 px-4 w-48 flex items-center justify-center disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Review Pull Request'}
                    </button>
                </div>
                {(isLoading || statusMessage) && <p className="text-sm text-center text-medium-dark-text dark:text-medium-text truncate">{statusMessage}</p>}
            </div>

            {changedFiles.length > 0 ? (
                <div className="flex-grow flex overflow-hidden">
                    <div className="w-1/3 border-r border-gray-200 dark:border-white/10 p-2 overflow-y-auto">
                         <h3 className="p-2 text-sm font-semibold uppercase tracking-wider text-medium-dark-text dark:text-medium-text">{changedFiles.length} Changed Files</h3>
                         {changedFiles.map(file => (
                             <button key={file.sha} onClick={() => setSelectedFile(file)}
                                 className={`w-full text-left p-2 rounded-md my-1 text-sm flex justify-between items-center ${selectedFile?.sha === file.sha ? 'bg-brand-purple/20' : 'hover:bg-gray-200 dark:hover:bg-white/5'}`}
                             >
                                 <span className="truncate">{file.filename}</span>
                                 {analysisResults[file.filename]?.length > 0 && 
                                    <span className="flex-shrink-0 ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-500 font-semibold">{analysisResults[file.filename].length}</span>
                                 }
                             </button>
                         ))}
                    </div>
                    <div className="w-2/3 overflow-y-auto p-4">
                        {selectedFile && <DiffView patch={selectedFile.patch || ''} issues={analysisResults[selectedFile.filename] || []} />}
                    </div>
                </div>
            ) : !isLoading && (
                 <div className="flex-grow flex items-center justify-center text-center">
                    <div>
                        <GithubIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-white/10" />
                        <p className="mt-4 text-medium-dark-text dark:text-medium-text">{statusMessage || 'Enter a PR URL to begin a review.'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PushPullPanel;