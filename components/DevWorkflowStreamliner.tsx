import React, { useState, useEffect, useRef } from 'react';
import { Repository, User } from '../types';
import { useToast } from './ToastContext';
import { CpuChipIcon, SpinnerIcon, ErrorIcon, SettingsIcon } from './icons';
import { getRepoFileTree, getFileContent, parseGitHubUrl } from '../services/githubService';
import { queryRepoInsights, isApiKeySet, isDemoMode } from '../services/geminiService';

// FIX: Declare jsPDF and html2canvas on the global window object to resolve TypeScript errors.
// These libraries are loaded via <script> tags and are not available as modules.
declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}

interface DevWorkflowStreamlinerProps {
    repos: Repository[];
    user: User | null;
    onNavigateToSettings: () => void;
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const DevWorkflowStreamliner: React.FC<DevWorkflowStreamlinerProps> = ({ repos, user, onNavigateToSettings }) => {
    const { addToast } = useToast();
    const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
    const [query, setQuery] = useState('');
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (repos.length > 0 && !selectedRepoFullName) {
            setSelectedRepoFullName(repos[0].full_name);
        }
    }, [repos, selectedRepoFullName]);
    
    useEffect(() => {
        setApiKeyMissing(!isApiKeySet() && !isDemoMode());
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);


    const handleSendQuery = async () => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery || isLoading) return;
        if (apiKeyMissing) {
            addToast('Please set your Gemini API Key in Settings to use this feature, or enable Demo Mode.', 'error');
            return;
        }

        const newConversation = [...conversation, { sender: 'user' as 'user', text: trimmedQuery }];
        setConversation(newConversation);
        setQuery('');
        setIsLoading(true);

        try {
            if (!selectedRepoFullName) {
                throw new Error("Please select a repository first.");
            }
            addToast('Fetching repository context...', 'info');
            const parsed = parseGitHubUrl(`https://github.com/${selectedRepoFullName}`);
            if (!parsed) throw new Error("Could not parse repository name.");

            const fileTree = await getRepoFileTree(parsed.owner, parsed.repo);
            // Analyze the top 5 smallest files for context to manage token count
            const filesToFetch = fileTree
                .sort((a,b) => (a.size || 0) - (b.size || 0))
                .slice(0, 5);

            const fileContents = await Promise.all(
                filesToFetch.map(async file => ({
                    name: file.path,
                    content: await getFileContent(parsed.owner, parsed.repo, file.sha)
                }))
            );

            addToast('Querying Sentinel AI...', 'info');
            const aiResponse = await queryRepoInsights(trimmedQuery, fileContents);
            setConversation([...newConversation, { sender: 'ai' as 'ai', text: aiResponse }]);

        } catch (error: any) {
            addToast(error.message || 'An error occurred.', 'error');
            setConversation(newConversation); // Revert conversation on error
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExportPdf = async () => {
        if (typeof window.jspdf === 'undefined' || typeof window.html2canvas === 'undefined') {
            addToast('PDF generation library not loaded.', 'error');
            return;
        }
        // FIX: Import jsPDF from the global scope within the function to ensure it's loaded before use.
        const { jsPDF } = window.jspdf;
        const chatElement = chatContainerRef.current;
        if (!chatElement || conversation.length === 0) {
            addToast('Nothing to export.', 'warning');
            return;
        }
        
        addToast('Generating PDF...', 'info');
        
        try {
            const canvas = await window.html2canvas(chatElement, {
                backgroundColor: document.documentElement.classList.contains('dark') ? '#0A0A1F' : '#F3F4F6',
                scale: 2,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / imgHeight;
            const width = pdfWidth - 20; // with margin
            const height = width / ratio;

            pdf.addImage(imgData, 'PNG', 10, 10, width, height);
            pdf.save(`sentinel-streamliner-${new Date().toISOString().split('T')[0]}.pdf`);
            addToast('PDF exported successfully!', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to generate PDF.', 'error');
        }
    };
    

    if (apiKeyMissing) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 glass-effect rounded-lg">
                <div className="text-center">
                     <ErrorIcon className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
                     <h3 className="text-lg font-bold text-dark-text dark:text-white font-heading">Gemini API Key Required</h3>
                     <p className="mt-2 text-medium-dark-text dark:text-medium-text max-w-sm">Please set your API key in Settings to use this feature.</p>
                     <button onClick={onNavigateToSettings} className="mt-6 flex items-center justify-center btn-primary mx-auto">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        Go to Settings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                 <div className="flex items-center space-x-3">
                    <CpuChipIcon className="w-8 h-8 text-brand-purple" />
                    <div>
                        <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">Dev Workflow Streamliner</h1>
                        <p className="mt-1 text-medium-dark-text dark:text-medium-text">AI-powered assistant for your repositories.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                     {repos.length > 0 && (
                        <select
                            value={selectedRepoFullName}
                            onChange={e => setSelectedRepoFullName(e.target.value)}
                            className="w-full md:w-60 bg-light-secondary dark:bg-dark-secondary border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm"
                        >
                            {repos.map(repo => <option key={repo.id} value={repo.full_name}>{repo.full_name}</option>)}
                        </select>
                    )}
                    <button onClick={handleExportPdf} className="btn-secondary py-2 px-4" disabled={conversation.length === 0}>Export PDF</button>
                </div>
            </div>
            
            <div ref={chatContainerRef} className="flex-grow glass-effect rounded-lg p-4 space-y-4 overflow-y-auto">
                {conversation.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center flex-shrink-0">🤖</div>}
                        <div className={`max-w-xl p-3 rounded-lg ${msg.sender === 'user' ? 'bg-brand-cyan/20' : 'bg-light-primary dark:bg-dark-primary'}`}>
                           <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <img src={user?.avatarUrl} alt="user" className="w-8 h-8 rounded-full flex-shrink-0"/>}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center flex-shrink-0"><SpinnerIcon className="w-5 h-5"/></div>
                         <div className="max-w-xl p-3 rounded-lg bg-light-primary dark:bg-dark-primary"><p className="text-sm">Thinking...</p></div>
                     </div>
                 )}
            </div>

            <div className="flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendQuery()}
                        placeholder={repos.length > 0 ? "Ask a question about the selected repository..." : "Add a repository to begin."}
                        disabled={isLoading || repos.length === 0}
                        className="w-full p-4 pr-32 bg-light-secondary dark:bg-dark-secondary border border-gray-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple"
                    />
                    <button onClick={handleSendQuery} disabled={isLoading || !query} className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-5 disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DevWorkflowStreamliner;