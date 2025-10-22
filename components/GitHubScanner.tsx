


import React, { useState, useCallback, useEffect } from 'react';
import { GithubIcon, CodeIcon, ErrorIcon, SettingsIcon, SpinnerIcon } from './icons';
import { parseGitHubUrl, getRepoFileTree, getFileContent, createPullRequestForFix } from '../services/githubService';
import { GitHubTreeItem, AnalysisIssue, CodeFile, User } from '../types';
import { analyzeCode, isApiKeySet, isDemoMode } from '../services/geminiService';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import { useToast } from './ToastContext';

type ScannerState = 'idle' | 'setup_required' | 'loading_repo' | 'analyzing' | 'error' | 'committing';

const getLanguage = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const extensionMap: { [key: string]: string } = {
        'py': 'python', 'ts': 'typescript', 'tsx': 'typescript',
        'js': 'typescript', 'jsx': 'typescript', 'tf': 'hcl', 'hcl': 'hcl',
    };
    return extensionMap[extension || ''] || 'plaintext';
};


interface GitHubScannerProps {
    user: User;
    onNavigateToSettings: () => void;
}

const GitHubScanner: React.FC<GitHubScannerProps> = ({ user, onNavigateToSettings }) => {
    const [repoUrl, setRepoUrl] = useState('https://github.com/OWASP/wrongsecrets');
    const [scannerState, setScannerState] = useState<ScannerState>('idle');
    const [fileTree, setFileTree] = useState<GitHubTreeItem[]>([]);
    const [activeFile, setActiveFile] = useState<(CodeFile & { isModified?: boolean, sha: string }) | null>(null);
    const [issues, setIssues] = useState<AnalysisIssue[]>([]);
    const [selectedIssue, setSelectedIssue] = useState<AnalysisIssue | null>(null);
    const [fixDiff, setFixDiff] = useState<string | null>(null);
    const { addToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
    const [appliedFix, setAppliedFix] = useState<{ issue: AnalysisIssue; originalContent: string } | null>(null);
    
    useEffect(() => {
        const checkPrerequisites = () => {
            const githubPat = localStorage.getItem('sentinel-github-pat');
            const geminiKeySet = isApiKeySet();

            if (!githubPat || (!geminiKeySet && !isDemoMode())) {
                let missing = [];
                if (!githubPat) missing.push("GitHub PAT");
                if (!geminiKeySet && !isDemoMode()) missing.push("Gemini API Key (or enable Demo Mode)");
                setErrorMessage(`Setup Required: Please provide your ${missing.join(' and ')} in Settings.`);
                setScannerState('setup_required');
            } else {
                setErrorMessage(null);
                setScannerState('idle');
            }
        };
        checkPrerequisites();
    }, [user]);


    const handleFetchRepoTree = async () => {
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            addToast("Invalid GitHub repository URL.", 'error');
            return;
        }

        setScannerState('loading_repo');
        setFileTree([]);
        setActiveFile(null);
        setIssues([]);
        setSelectedIssue(null);
        setFixDiff(null);
        setAppliedFix(null);

        try {
            const tree = await getRepoFileTree(parsed.owner, parsed.repo);
            setFileTree(tree);
            if (tree.length === 0) {
                 addToast("No scannable files found in this repository's main branch.", 'warning');
            }
            setScannerState('idle');
        } catch (e: any) {
            setErrorMessage(e.message || "Failed to fetch repository.");
            setScannerState('error');
        }
    };

    const handleFileSelect = useCallback(async (file: GitHubTreeItem) => {
        setScannerState('analyzing');
        setAnalyzingFile(file.path);
        setActiveFile({ name: file.path, content: "Loading file content...", language: 'plaintext', sha: file.sha });
        setIssues([]);
        setSelectedIssue(null);
        setFixDiff(null);
        setAppliedFix(null);
        
        try {
            const { owner, repo } = parseGitHubUrl(repoUrl)!;
            const content = await getFileContent(owner, repo, file.sha);
            const language = getLanguage(file.path);
            setActiveFile({ name: file.path, content, language, isModified: false, sha: file.sha });
            
            addToast(`Analyzing ${file.path}...`, 'info');
            const results = await analyzeCode(content, language);
            const validatedResults = results.map(issue => {
                const finalIssue = { ...issue, filePath: file.path };
                if (issue.line > content.split('\n').length || issue.line <= 0) {
                    return { ...finalIssue, line: -1, description: `[Warning: Invalid Line Reported by AI] ${issue.description}` };
                }
                return finalIssue;
              });
            setIssues(validatedResults);
            if (validatedResults.length > 0) {
                addToast(`Found ${validatedResults.length} issue(s).`, 'success');
                const sortedResults = [...validatedResults].sort((a, b) => 
                    ['Critical', 'High', 'Medium', 'Low'].indexOf(a.severity) - 
                    ['Critical', 'High', 'Medium', 'Low'].indexOf(b.severity)
                );
                setSelectedIssue(sortedResults[0]);
            } else {
                addToast('No issues found.', 'success');
            }

        } catch (e: any) {
             addToast(e.message || "Failed to process file.", 'error');
             setActiveFile(null);
             setErrorMessage(e.message);
             setScannerState('error');
        } finally {
            setScannerState('idle');
            setAnalyzingFile(null);
        }
    }, [repoUrl, addToast]);
    
    const handleApplyFix = (issueToFix: AnalysisIssue) => {
        if (!activeFile || appliedFix) return;

        const originalCodeLines = activeFile.content.split('\n');
        const lineIndex = issueToFix.line - 1;

        if (lineIndex < 0 || lineIndex >= originalCodeLines.length) {
            addToast("Error: Could not apply fix due to an invalid line number.");
            return;
        }

        setAppliedFix({
            issue: issueToFix,
            originalContent: activeFile.content,
        });

        const fixLines = issueToFix.suggestedFix.trim().split('\n');
        originalCodeLines.splice(lineIndex, 1, ...fixLines);
        const newContent = originalCodeLines.join('\n');

        setActiveFile({ ...activeFile, content: newContent, isModified: true });
        
        setFixDiff(null);
        addToast('Fix applied locally. You can now create a pull request or revert.', 'success');
    };
    
    const handleRevertFix = () => {
        if (!activeFile || !appliedFix) return;
        setActiveFile({ ...activeFile, content: appliedFix.originalContent, isModified: false });
        setAppliedFix(null);
        setSelectedIssue(null);
        addToast('Changes have been reverted.', 'info');
    };

    const handleCommitFix = async () => {
        if (!activeFile || !activeFile.isModified || !appliedFix) return;
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) return;
        
        setScannerState('committing');
        addToast(`Creating Pull Request for ${activeFile.name}...`, 'info');

        try {
            const { owner, repo } = parsed;
            const commitMessage = `fix(security): Apply AI fix for ${appliedFix.issue.title}`;
            const prTitle = `Sentinel AI Fix: ${appliedFix.issue.title}`;
            
            const prUrl = await createPullRequestForFix(
                owner,
                repo,
                activeFile.name,
                activeFile.content,
                activeFile.sha,
                commitMessage,
                prTitle
            );

            addToast(
                (
                    <span>
                        PR created successfully!{' '}
                        <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold">
                            View Pull Request
                        </a>
                    </span>
                ),
                'success'
            );
            
            // Reset state after successful PR
            setActiveFile({ ...activeFile, content: appliedFix.originalContent, isModified: false });
            setAppliedFix(null);
            setSelectedIssue(null);

        } catch (e: any) {
            console.error("PR creation failed:", e); // Full error for debugging

            const status = e.status;
            const message = (e.message || '').toLowerCase();
            let userFriendlyMessage = `PR creation failed: ${e.message || 'An unknown error occurred.'}`;

            // A 403 or 404 on this operation, or a message indicating resource access issues,
            // is almost always a permissions issue.
            if (status === 403 || status === 404 || message.includes('resource not accessible')) {
                userFriendlyMessage = "Your GitHub Personal Access Token (PAT) is missing the necessary 'repo' scope. Please update your PAT in the Settings page to include the 'repo' scope. This is required for creating branches and committing code changes.";
            }

            addToast(userFriendlyMessage, 'error');
        } finally {
            setScannerState('idle');
        }
    };
    
    useEffect(() => {
        if (selectedIssue) {
            const file = activeFile;
            if (!file) return;

            if (selectedIssue.line === -1) {
                setFixDiff(null); return;
            }

            const originalCodeLines = appliedFix ? appliedFix.originalContent.split('\n') : file.content.split('\n');
            const lineIndex = selectedIssue.line - 1;
            
            if (lineIndex < 0 || lineIndex >= originalCodeLines.length) return;
            
            const oldLine = originalCodeLines[lineIndex];
            const newLines = selectedIssue.suggestedFix.trim().split('\n');
            const diffText = `-${oldLine.trim()}\n` + newLines.map(l => `+${l}`).join('\n');
            setFixDiff(diffText);
        } else {
            setFixDiff(null);
        }
    }, [selectedIssue, activeFile, appliedFix]);

    const ErrorMessage = ({ message, onNavigateToSettings }: { message: string, onNavigateToSettings: () => void }) => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <ErrorIcon className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-bold text-dark-text dark:text-white font-heading">An Error Occurred</h3>
            <p className="mt-2 text-medium-dark-text dark:text-medium-text max-w-sm">{message}</p>
            <button onClick={onNavigateToSettings} className="mt-6 flex items-center justify-center btn-primary">
                <SettingsIcon className="w-5 h-5 mr-2" /> Go to Settings
            </button>
        </div>
    );

    return (
        <div className="h-full w-full glass-effect rounded-lg overflow-hidden grid grid-cols-12">
            <div className="col-span-3 bg-light-secondary/50 dark:bg-dark-secondary/50 border-r border-gray-200 dark:border-white/10 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                    <div className="relative">
                        <GithubIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-medium-dark-text dark:text-medium-text" />
                        <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo"
                            className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 pl-10 font-mono text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                    <button onClick={handleFetchRepoTree} disabled={scannerState !== 'idle' && scannerState !== 'setup_required' && scannerState !== 'error'} className="mt-3 w-full btn-primary disabled:opacity-50">
                        {scannerState === 'loading_repo' ? 'Loading Repository...' : 'Scan Repository'}
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-2 min-h-0">
                    {scannerState === 'loading_repo' && (
                        <div className="flex items-center justify-center p-4"><SpinnerIcon className="w-6 h-6" /></div>
                    )}
                    {fileTree.length > 0 ? (
                        <ul className="space-y-1">
                            {fileTree.map(file => (
                                <li key={file.path}>
                                    <button onClick={() => handleFileSelect(file)} disabled={!!analyzingFile}
                                        className={`w-full flex items-center space-x-2 p-2 rounded-md text-left transition-colors text-sm disabled:opacity-50 ${activeFile?.name === file.path ? 'bg-brand-purple/20 text-dark-text dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-white/5 text-medium-dark-text dark:text-medium-text'}`}
                                    >
                                        <CodeIcon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate flex-grow">{file.path}</span>
                                        {analyzingFile === file.path && <SpinnerIcon className="w-4 h-4 flex-shrink-0" />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         scannerState !== 'loading_repo' && <p className="text-center text-sm text-medium-dark-text dark:text-medium-text p-4">Scan a repository to see its file tree.</p>
                    )}
                </div>
            </div>
            <div className="col-span-5">
                <CenterPanel
                    activeFile={activeFile}
                    issues={issues}
                    selectedIssue={selectedIssue}
                    fixDiff={fixDiff}
                    isLoading={scannerState === 'analyzing'}
                />
            </div>
            <div className="col-span-4">
                <RightPanel
                    issues={issues}
                    isLoading={scannerState === 'analyzing' || scannerState === 'loading_repo'}
                    selectedIssue={selectedIssue}
                    setSelectedIssue={setSelectedIssue}
                    onApplyFix={handleApplyFix}
                    isApiKeyMissing={scannerState === 'setup_required'}
                    onNavigateToSettings={onNavigateToSettings}
                    appliedIssue={appliedFix ? appliedFix.issue : null}
                    onCommitFix={handleCommitFix}
                    onRevertFix={handleRevertFix}
                    isCommitting={scannerState === 'committing'}
                    progressText={analyzingFile || (scannerState === 'loading_repo' ? 'Fetching repository...' : undefined)}
                />
            </div>
        </div>
    );
};

export default GitHubScanner;