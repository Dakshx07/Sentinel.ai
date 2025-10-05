import React, { useState, useCallback, useEffect } from 'react';
import { GithubIcon, CodeIcon, ErrorIcon, SettingsIcon, SpinnerIcon } from './icons';
import { parseGitHubUrl, getRepoFileTree, getFileContent } from '../services/githubService';
import { GitHubTreeItem, AnalysisIssue, CodeFile, User } from '../types';
import { analyzeCode, isApiKeySet, isDemoMode } from '../services/geminiService';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import { useToast } from './ToastContext';
import { Octokit } from 'octokit';

type ScannerState = 'idle' | 'setup_required' | 'loading_repo' | 'analyzing' | 'error' | 'committing';

const getSupportedLanguage = (filePath: string): string => {
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
    const [octokit, setOctokit] = useState<Octokit | null>(null);
    const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
    
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
                if (githubPat) {
                    setOctokit(new Octokit({ auth: githubPat }));
                }
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
        
        try {
            const { owner, repo } = parseGitHubUrl(repoUrl)!;
            const content = await getFileContent(owner, repo, file.sha);
            const language = getSupportedLanguage(file.path);
            setActiveFile({ name: file.path, content, language, isModified: false, sha: file.sha });
            
            addToast(`Analyzing ${file.path}...`, 'info');
            const results = await analyzeCode(content, language);
            const validatedResults = results.map(issue => {
                if (issue.line > content.split('\n').length || issue.line <= 0) {
                    return { ...issue, line: -1, description: `[Warning: Invalid Line Reported by AI] ${issue.description}` };
                }
                return issue;
              });
            setIssues(validatedResults);
            if (validatedResults.length > 0) {
                addToast(`Found ${validatedResults.length} issue(s).`, 'success');
                setSelectedIssue(validatedResults[0]);
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
        if (!activeFile) return;

        const originalCodeLines = activeFile.content.split('\n');
        const lineIndex = issueToFix.line - 1;

        if (lineIndex < 0 || lineIndex >= originalCodeLines.length) {
            addToast("Error: Could not apply fix due to an invalid line number.");
            return;
        }

        const fixLines = issueToFix.suggestedFix.trim().split('\n');
        originalCodeLines.splice(lineIndex, 1, ...fixLines);
        const newContent = originalCodeLines.join('\n');

        setActiveFile({ ...activeFile, content: newContent, isModified: true });
        
        setIssues(prev => prev.filter(i => i !== issueToFix));
        setSelectedIssue(null);
        setFixDiff(null);
        addToast('Fix applied locally. You can now commit the change to GitHub.', 'success');
    };

    const handleCommitFix = async () => {
        if (!octokit || !activeFile || !activeFile.isModified) return;
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) return;
        
        setScannerState('committing');
        addToast(`Committing fix for ${activeFile.name}...`, 'info');

        try {
            const { owner, repo } = parsed;
            const branch = (await octokit.rest.repos.get({ owner, repo })).data.default_branch;
            const { data: { object: { sha: latestCommitSha } } } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
            const { data: { sha: blobSha } } = await octokit.rest.git.createBlob({ owner, repo, content: activeFile.content, encoding: 'utf-8' });
            const { data: { sha: treeSha } } = await octokit.rest.git.createTree({ owner, repo, base_tree: latestCommitSha, tree: [{ path: activeFile.name, mode: '100644', type: 'blob', sha: blobSha }] });
            const commitMessage = `fix: Apply AI-suggested fix for ${activeFile.name}\n\nApplied by Sentinel AI.`;
            const { data: { sha: newCommitSha } } = await octokit.rest.git.createCommit({ owner, repo, message: commitMessage, tree: treeSha, parents: [latestCommitSha] });
            await octokit.rest.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: newCommitSha });

            addToast('Fix successfully committed to GitHub!', 'success');
            setActiveFile({ ...activeFile, isModified: false });
        } catch (e: any) {
            console.error("Commit failed:", e);
            addToast(`Commit failed: ${e.message}`, 'error');
        } finally {
            setScannerState('idle');
        }
    };
    
    useEffect(() => {
        if (selectedIssue && activeFile && selectedIssue.suggestedFix && selectedIssue.suggestedFix.trim()) {
             const codeProvider = activeFile;
             if (selectedIssue.line === -1) { setFixDiff(null); return; }
             const originalCodeLines = codeProvider.content.split('\n');
             const lineIndex = selectedIssue.line - 1;
             if (lineIndex < 0 || lineIndex >= originalCodeLines.length) { setFixDiff(null); return; }
             const oldLine = originalCodeLines[lineIndex];
             const newLines = selectedIssue.suggestedFix.trim().split('\n');
             const diffText = `-${oldLine.trim()}\n` + newLines.map(l => `+${l}`).join('\n');
             setFixDiff(diffText);
        } else {
            setFixDiff(null);
        }
    }, [selectedIssue, activeFile]);

    const renderMainContent = () => {
        if (scannerState === 'setup_required' || (scannerState === 'error' && !activeFile)) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 col-span-8">
                    <ErrorIcon className="w-12 h-12 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-bold text-dark-text dark:text-white font-heading">
                        {scannerState === 'setup_required' ? 'Setup Required' : 'An Error Occurred'}
                    </h3>
                    <p className="mt-2 text-medium-dark-text dark:text-medium-text max-w-sm">{errorMessage}</p>
                     <button onClick={onNavigateToSettings} className="mt-6 flex items-center justify-center btn-primary">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        Go to Settings
                    </button>
                </div>
            );
        }
        
        if (!activeFile) {
            return (
                <div className="col-span-8 flex items-center justify-center text-center p-4">
                     <div>
                        <GithubIcon className="w-16 h-16 text-gray-300 dark:text-white/10 mx-auto" />
                        <p className="mt-4 text-medium-dark-text dark:text-medium-text">
                           {fileTree.length > 0 ? 'Select a file to analyze.' : 'Fetch a repository to get started.'}
                        </p>
                    </div>
                </div>
            );
        }

        return (
             <div className="col-span-8 grid grid-cols-7 h-full">
                <div className="col-span-4">
                     {activeFile?.isModified && (
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">This file has been modified.</p>
                            <button onClick={handleCommitFix} disabled={scannerState === 'committing'} className="btn-secondary py-1 px-3 text-xs disabled:opacity-50">
                                {scannerState === 'committing' ? 'Committing...' : 'Commit Fix to GitHub'}
                            </button>
                        </div>
                    )}
                    <CenterPanel activeFile={activeFile} issues={issues} selectedIssue={selectedIssue} fixDiff={fixDiff} isLoading={scannerState === 'analyzing'} />
                </div>
                <div className="col-span-3">
                     <RightPanel issues={issues} isLoading={scannerState === 'analyzing' && !analyzingFile} selectedIssue={selectedIssue} setSelectedIssue={setSelectedIssue} onApplyFix={handleApplyFix} />
                </div>
            </div>
        );
    };
    
    const isActionDisabled = scannerState === 'loading_repo' || scannerState === 'analyzing' || scannerState === 'setup_required' || scannerState === 'committing';

    return (
        <div className="h-full w-full glass-effect rounded-lg overflow-hidden grid grid-cols-12">
            <div className="col-span-4 bg-light-secondary/50 dark:bg-dark-secondary/50 border-r border-gray-200 dark:border-white/10 flex flex-col">
                 <div className="p-4 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
                    <div className="relative">
                        <GithubIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-medium-dark-text dark:text-medium-text" />
                        <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo"
                            className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 pl-10 font-mono text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>
                     <button onClick={handleFetchRepoTree} disabled={isActionDisabled} className="mt-3 w-full btn-secondary text-sm py-2 disabled:opacity-50">
                        {scannerState === 'loading_repo' ? 'Fetching...' : 'Fetch Repo Files'}
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-2 min-h-0">
                    {scannerState === 'loading_repo' && (
                         <div className="flex items-center justify-center p-4 text-medium-dark-text dark:text-medium-text">
                             <SpinnerIcon className="w-5 h-5 mr-2"/> Fetching repository...
                         </div>
                    )}
                    {fileTree.length > 0 && (
                        <>
                            <div className="px-2 py-2 flex justify-between items-center">
                                <p className="text-sm font-semibold text-dark-text dark:text-light-text">{fileTree.length} files found</p>
                            </div>
                            <ul className="space-y-1 p-2">
                                {fileTree.map(file => (
                                    <li key={file.sha}>
                                        <button onClick={() => !isActionDisabled && handleFileSelect(file)} disabled={isActionDisabled}
                                            className={`w-full flex items-center space-x-2 p-2 rounded-md text-left ${isActionDisabled ? 'cursor-not-allowed' : ''} ${activeFile?.sha === file.sha ? 'bg-brand-purple/20 text-dark-text dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                                            
                                            {analyzingFile === file.path ? <SpinnerIcon className="w-4 h-4 text-brand-purple flex-shrink-0" /> : <CodeIcon className="w-4 h-4 text-medium-dark-text dark:text-medium-text flex-shrink-0" />}
                                            <span className="text-sm text-medium-dark-text dark:text-medium-text group-hover:text-dark-text dark:group-hover:text-white truncate" title={file.path}>{file.path}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </div>
            {renderMainContent()}
        </div>
    );
};

export default GitHubScanner;
