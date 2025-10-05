import React, { useState, useMemo } from 'react';
import { DocsIcon } from './icons';

// Declare hljs for TypeScript since it's loaded from a script tag
declare global {
    interface Window {
        hljs: any;
    }
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const highlightedCode = useMemo(() => {
        if(window.hljs && code) {
             try {
                return window.hljs.highlight(code, { language, ignoreIllegals: true }).value;
            } catch (e) {
                console.error("Highlight.js error:", e);
                return code; // Fallback
            }
        }
        return code;
    }, [code, language]);

    return (
        <pre className="bg-light-primary dark:bg-dark-primary p-4 rounded-md text-sm font-mono border border-gray-200 dark:border-white/10 overflow-x-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
    );
};

const Section: React.FC<{id: string, title: string, children: React.ReactNode}> = ({id, title, children}) => (
    <div id={id} className="py-4">
        <h2 className="text-2xl font-bold font-heading mb-4 text-dark-text dark:text-white">{title}</h2>
        <div className="space-y-4 text-medium-dark-text dark:text-medium-text">
            {children}
        </div>
    </div>
);

const DocsContent: React.FC = () => {
    const codeAnalysisSchema = `[
  {
    "line": 17,
    "severity": "Critical",
    "title": "SQL Injection",
    "description": "The application constructs an SQL query by directly embedding user-controlled input (product_id) into the SQL string...",
    "impact": "An attacker can manipulate the SQL query to bypass authentication, retrieve sensitive data from the database, or even execute system commands...",
    "suggestedFix": "product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()"
  }
]`;

    const navItems = [
        { id: 'getting-started', title: 'Getting Started' },
        { id: 'core-features', title: 'Core Features Guide' },
        { id: 'schemas', title: 'AI JSON Schemas' },
    ];
    
    return (
        <div className="grid grid-cols-12 h-full">
            <aside className="col-span-3 border-r border-gray-200 dark:border-white/10 p-6 overflow-y-auto">
                <h3 className="text-lg font-bold font-heading mb-4 text-dark-text dark:text-white">User Guide</h3>
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <a href={`#${item.id}`} className="block text-sm text-medium-dark-text dark:text-medium-text hover:text-dark-text dark:hover:text-white transition-colors">{item.title}</a>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="col-span-9 p-8 overflow-y-auto">
                <Section id="getting-started" title="Getting Started">
                    <p>Welcome to Sentinel! To unlock the full power of AI-driven code analysis and GitHub integration, you need to provide two key credentials. Both are stored securely in your browser's local storage and are never sent to our servers.</p>
                    <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white">1. GitHub Personal Access Token (PAT)</h4>
                    <p>This token is required for all features that interact with the GitHub API, such as fetching repositories, reading file contents, and scanning commits.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Navigate to the <strong className="text-dark-text dark:text-white">Settings</strong> page in the dashboard.</li>
                        <li>Go to <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">GitHub's token generation page</a>.</li>
                        <li>Create a new "fine-grained" token.</li>
                        <li>Grant it <strong className="text-dark-text dark:text-white">'repo'</strong> (for full control of repositories) and <strong className="text-dark-text dark:text-white">'read:user'</strong> (to read user profile data) scopes.</li>
                        <li>Copy the generated token and paste it into the "GitHub Personal Access Token" field in Sentinel's Settings.</li>
                    </ul>
                     <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white mt-4">2. Gemini API Key</h4>
                    <p>This key is required for all AI-powered analysis features. Sentinel uses the Google Gemini family of models.</p>
                    <ul className="list-disc pl-6 space-y-1">
                         <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:underline">Google AI Studio</a> to get your API key.</li>
                        <li>Copy the key and paste it into the "Gemini API Key" field in Sentinel's Settings.</li>
                        <li>Alternatively, enable <strong className="text-dark-text dark:text-white">Demo Mode</strong> in Settings to use the application with mock data, without needing an API key.</li>
                    </ul>
                </Section>
                 <hr className="my-6 border-gray-200 dark:border-white/10" />

                 <Section id="core-features" title="Core Features Guide">
                    <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white mt-4">Studio</h4>
                    <p>The Studio is a sandbox environment for quick analysis. You can either paste a code snippet directly or use one of the provided samples to see Sentinel's analysis in action. The three-panel view shows your input, the code, and the found issues side-by-side.</p>
                    <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white mt-4">GitOps Integration</h4>
                    <p>This powerful tool allows you to scan an entire GitHub repository. Simply enter a repository URL to fetch its file tree. You can then select individual files to analyze. If Sentinel finds a vulnerability, you can apply the AI-suggested fix directly in the UI and then commit that fix back to your GitHub repository with a single click.</p>
                     <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white mt-4">Commit History Scanner</h4>
                    <p>This feature scans the last 30 commits of a repository, using AI to look for red flags in commit messages that might indicate exposed secrets (e.g., "add api key") or other high-risk changes. It provides a quick way to audit recent activity for potential security oversights.</p>
                </Section>
                <hr className="my-6 border-gray-200 dark:border-white/10" />

                 <Section id="schemas" title="AI JSON Schemas">
                    <p>To ensure consistent and parsable results, Sentinel instructs the Gemini model to respond with a specific JSON structure for different analysis tasks. Understanding these schemas can help you interpret the results and customize the AI's system prompt in Settings.</p>
                    <h4 className="text-lg font-bold font-heading text-dark-text dark:text-white mt-4">Code Analysis Schema</h4>
                    <p>Used by the Studio and GitOps Integration tools when scanning a single file. Expect an array of objects matching this schema.</p>
                    <CodeBlock code={codeAnalysisSchema} language="json" />
                </Section>
            </main>
        </div>
    );
};

const DocumentationDashboard: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col glass-effect rounded-lg overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center space-x-3">
                <DocsIcon className="w-6 h-6 text-brand-purple" />
                 <h1 className="text-2xl font-bold text-dark-text dark:text-white font-heading">User Guide & Docs</h1>
            </div>
            <div className="flex-grow overflow-hidden">
                <DocsContent />
            </div>
        </div>
    );
};

export default DocumentationDashboard;
