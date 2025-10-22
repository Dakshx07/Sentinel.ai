import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { BrainCircuitIcon, ErrorIcon, SettingsIcon, SpinnerIcon, CheckCircleIcon } from './icons';
import { isApiKeySet, refactorCode, isDemoMode } from '../services/geminiService';
import { RefactorResult } from '../types';

// Declare globals
declare global {
    interface Window {
        hljs: any;
    }
}

const CodeEditor: React.FC<{ 
    value: string; 
    onChange?: (value: string) => void; 
    language: string; 
    isInput?: boolean;
    isLoading?: boolean;
}> = ({ value, onChange, language, isInput = false, isLoading = false }) => {
    
    const highlightedCode = useMemo(() => {
        if (window.hljs && value) {
            try {
                return window.hljs.highlight(value, { language, ignoreIllegals: true }).value;
            } catch (e) { return value; }
        }
        return value;
    }, [value, language]);

    if (isInput) {
        return (
            <textarea
                className="w-full h-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-3 font-mono text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder="Paste your code here..."
            />
        );
    }

    if (isLoading) {
         return (
             <div className="w-full h-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md flex items-center justify-center">
                 <SpinnerIcon className="w-8 h-8 text-brand-purple" />
             </div>
         );
    }

    return (
        <pre className="w-full h-full bg-light-primary dark:bg-dark-primary p-3 rounded-md text-sm font-mono border border-gray-300 dark:border-white/10 overflow-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode || '// Refactored code will appear here...' }} />
        </pre>
    );
};


const RefactorSimulator: React.FC<{ onNavigateToSettings: () => void }> = ({ onNavigateToSettings }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);
    const [inputCode, setInputCode] = useState(`def get_product(product_id):\n    # VULNERABILITY: Direct string formatting for SQL query\n    product = conn.execute(f"SELECT * FROM products WHERE id = '{product_id}'").fetchone()\n    return product`);
    const [refactorResult, setRefactorResult] = useState<RefactorResult | null>(null);
    const [language, setLanguage] = useState('python');

    useEffect(() => {
        setApiKeyMissing(!isApiKeySet() && !isDemoMode());
    }, []);

    const handleRefactor = async () => {
        if (apiKeyMissing) {
            addToast('Please set your Gemini API Key in Settings to use this feature, or enable Demo Mode.', 'error');
            return;
        }
        const trimmedInput = inputCode.trim();
        if (!trimmedInput) {
            addToast('Please enter some code to refactor.', 'warning');
            return;
        }

        setIsLoading(true);
        setRefactorResult(null);
        try {
            const result = await refactorCode(inputCode, language);
            setRefactorResult(result);
            addToast('Code refactored successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'An error occurred during refactoring.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (apiKeyMissing) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 glass-effect rounded-lg">
                <div className="text-center">
                     <ErrorIcon className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
                     <h3 className="text-lg font-bold text-dark-text dark:text-white font-heading">Gemini API Key Required</h3>
                     <p className="mt-2 text-medium-dark-text dark:text-medium-text max-w-sm">Please set your API key in the AI Agent Settings to enable the refactor simulator.</p>
                     <button onClick={onNavigateToSettings} className="mt-6 flex items-center justify-center btn-primary mx-auto">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        Go to Settings
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full flex flex-col space-y-4 animate-fade-in-up">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">AI Refactor Simulator</h1>
                <p className="mt-1 text-medium-dark-text dark:text-medium-text">Paste code to see how Sentinel's AI improves its security and provides actionable insights.</p>
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-[2fr_1fr_2fr] gap-4 min-h-0">
                {/* Input Code */}
                <div className="glass-effect rounded-lg p-4 flex flex-col">
                    <h2 className="text-xl font-bold font-heading mb-3 text-dark-text dark:text-white flex-shrink-0">Input Code</h2>
                    <div className="flex-grow min-h-0">
                        <CodeEditor value={inputCode} onChange={setInputCode} language={language} isInput={true}/>
                    </div>
                </div>

                {/* Control Deck */}
                <div className="glass-effect rounded-lg p-4 flex flex-col items-center justify-center space-y-6">
                    <h2 className="text-xl font-bold font-heading text-dark-text dark:text-white">Control Deck</h2>
                    <div className="w-full">
                        <label htmlFor="language-select" className="block text-sm font-medium text-medium-dark-text dark:text-medium-text mb-1">Language</label>
                        <select id="language-select" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 text-sm text-dark-text dark:text-light-text">
                            <option value="python">Python</option>
                            <option value="typescript">TypeScript</option>
                            <option value="hcl">Terraform (HCL)</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                    </div>
                    <button onClick={handleRefactor} disabled={isLoading} className="btn-primary py-3 px-6 text-lg w-full flex items-center justify-center disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-6 h-6" /> : <><BrainCircuitIcon className="w-6 h-6 mr-3" />Refactor</>}
                    </button>
                </div>

                {/* Refactored Code */}
                <div className="glass-effect rounded-lg p-4 flex flex-col">
                     <h2 className="text-xl font-bold font-heading mb-3 text-dark-text dark:text-white flex-shrink-0">AI Refactored Code</h2>
                     <div className="flex-grow min-h-0">
                        <CodeEditor value={refactorResult?.refactoredCode || ''} language={language} isLoading={isLoading} />
                     </div>
                </div>
            </div>

            {/* Key Improvements */}
             <div className="flex-shrink-0 glass-effect rounded-lg p-6 flex flex-col min-h-[150px]">
                <h3 className="text-xl font-bold font-heading mb-4 text-dark-text dark:text-white text-center flex-shrink-0">Key Improvements</h3>
                <div className="flex-grow w-full h-full p-2 overflow-y-auto">
                    {(refactorResult && refactorResult.improvements.length > 0) ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-medium-dark-text dark:text-medium-text">
                           {refactorResult.improvements.map((item, index) => (
                               <li key={index} className="flex items-start space-x-3">
                                   <CheckCircleIcon className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                                   <span>{item}</span>
                               </li>
                           ))}
                        </ul>
                    ) : (
                         <div className="flex items-center justify-center h-full text-medium-dark-text dark:text-medium-text">
                            {isLoading ? 'Analyzing improvements...' : 'Refactor code to see AI-generated improvements.'}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RefactorSimulator;