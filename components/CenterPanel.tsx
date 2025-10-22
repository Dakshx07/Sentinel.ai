import React, { useMemo } from 'react';
import { AnalysisIssue, CodeFile } from '../types';
import { SpinnerIcon } from './icons';

// Declare hljs for TypeScript since it's loaded from a script tag
declare global {
    interface Window {
        hljs: any;
    }
}

interface CenterPanelProps {
  activeFile: CodeFile | null;
  issues: AnalysisIssue[];
  selectedIssue: AnalysisIssue | null;
  fixDiff: string | null;
  isLoading?: boolean;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ activeFile, issues, selectedIssue, fixDiff, isLoading }) => {
    
  const getLineClassName = (lineNumber: number): string => {
    const issueOnLine = issues.find(i => i.line === lineNumber);
    const baseClass = 'px-4 bg-light-secondary dark:bg-dark-primary';
    if (selectedIssue?.line === lineNumber) {
      return `${baseClass} bg-brand-purple/20 border-l-2 border-brand-purple`;
    }
    if (issueOnLine) {
        const severityClasses: { [key: string]: string } = {
            Critical: 'bg-red-100 dark:bg-red-900/40',
            High: 'bg-orange-100 dark:bg-orange-900/40',
            Medium: 'bg-yellow-100 dark:bg-yellow-900/40',
            Low: 'bg-blue-100 dark:bg-blue-900/40',
        };
      return `${baseClass} ${severityClasses[issueOnLine.severity]}`;
    }
    return baseClass;
  };

  const renderCode = () => {
    if (!activeFile) {
        return (
            <div className="flex items-center justify-center h-full text-medium-dark-text dark:text-medium-text">
            <p>Select a file or paste a code snippet to begin analysis.</p>
            </div>
        );
    }
    // FIX: A malformed `suggestedFix` (e.g., empty string) can lead to a broken diff view.
    // This check ensures we only try to render a diff if the fix is valid.
    const isValidFix = selectedIssue?.suggestedFix && selectedIssue.suggestedFix.trim().length > 0;

    if (fixDiff && selectedIssue && isValidFix) {
        const highlightedDiffHTML = useMemo(() => {
            if (!fixDiff || typeof window.hljs === 'undefined') return '';
             try {
                // Highlight the entire diff string at once.
                // This is more robust than splitting the HTML.
                return window.hljs.highlight(fixDiff, { language: 'diff', ignoreIllegals: true }).value;
            } catch (e) {
                console.error("Highlight.js error on diff:", e);
                return fixDiff; // Fallback to non-highlighted text on error
            }
        }, [fixDiff]);
        
        return (
             <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                {/* Render the whole highlighted block directly */}
                <code dangerouslySetInnerHTML={{ __html: highlightedDiffHTML }} />
            </pre>
        );
    }

    const highlightedCodeHTML = useMemo(() => {
        if (!activeFile || typeof window.hljs === 'undefined') return activeFile.content;
        try {
            return window.hljs.highlight(activeFile.content, { language: activeFile.language, ignoreIllegals: true }).value;
        } catch (e) {
            console.error("Highlight.js error:", e);
            return activeFile.content; // Fallback to plain text on error
        }
    }, [activeFile]);

    const codeLines = highlightedCodeHTML.split('\n');
    return (
      <pre className="text-sm font-mono whitespace-pre-wrap break-words">
        <code>
          {codeLines.map((line, index) => (
            <div key={index} className={`flex ${getLineClassName(index + 1)}`}>
              <span className="w-12 text-right pr-4 text-medium-dark-text dark:text-medium-text select-none">{index + 1}</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: line || ' ' }} />
            </div>
          ))}
        </code>
      </pre>
    );
  }

  return (
    <div className="bg-light-secondary dark:bg-dark-primary text-dark-text dark:text-light-text flex flex-col h-full relative">
      <div className="p-3 border-b border-gray-200 dark:border-white/10 text-sm font-medium">
        {activeFile?.name || 'Code View'}
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderCode()}
      </div>
      {isLoading && (
        <div className="absolute inset-0 bg-light-secondary/50 dark:bg-dark-primary/70 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
                <SpinnerIcon className="w-8 h-8 text-brand-purple mx-auto" />
                <p className="mt-2 font-semibold">Analyzing...</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default CenterPanel;