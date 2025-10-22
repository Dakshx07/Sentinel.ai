

import React, { useState, useEffect, useCallback } from 'react';
import LeftPanel from './LeftPanel';
import CenterPanel from './CenterPanel';
import RightPanel from './RightPanel';
import { AnalysisIssue, CodeFile, InputMode, SampleRepo } from '../types';
import { SQL_INJECTION_EXAMPLE } from '../constants';
import { analyzeCode, isApiKeySet, isDemoMode } from '../services/geminiService';
import { useToast } from './ToastContext';

interface SentinelStudioProps {
  onNavigateToSettings: () => void;
}

const SentinelStudio: React.FC<SentinelStudioProps> = ({ onNavigateToSettings }) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.SampleRepo);
  const [selectedRepo, setSelectedRepo] = useState<SampleRepo | null>(SQL_INJECTION_EXAMPLE);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(SQL_INJECTION_EXAMPLE.files[0]);
  const [snippet, setSnippet] = useState<string>('');
  const [issues, setIssues] = useState<AnalysisIssue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<AnalysisIssue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fixDiff, setFixDiff] = useState<string | null>(null);
  const { addToast } = useToast();
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const runAnalysis = useCallback(async (codeToAnalyze: string, language: string) => {
    if (!isApiKeySet() && !isDemoMode()) {
        setApiKeyMissing(true);
        setIsLoading(false);
        setIssues([]);
        return;
    }
    setApiKeyMissing(false);

    if (!codeToAnalyze) {
        setIssues([]);
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    setIssues([]);
    setSelectedIssue(null);
    setFixDiff(null);

    try {
      const results = await analyzeCode(codeToAnalyze, language);

      const codeLines = codeToAnalyze.split('\n').length;
      const validatedResults = results.map(issue => {
        if (issue.line > codeLines || issue.line <= 0) {
            console.warn(`AI returned an invalid line number (${issue.line}) for a file with ${codeLines} lines. Adjusting.`);
            return { ...issue, line: -1, description: `[Warning: Invalid Line Number Reported by AI] ${issue.description}` };
        }
        return issue;
      });

      setIssues(validatedResults);

      if (validatedResults.length > 0) {
        const validIssues = validatedResults.filter(r => r.line !== -1);
        const sortedResults = [...(validIssues.length > 0 ? validIssues : validatedResults)].sort((a, b) => 
            ['Critical', 'High', 'Medium', 'Low'].indexOf(a.severity) - 
            ['Critical', 'High', 'Medium', 'Low'].indexOf(b.severity)
        );
        setSelectedIssue(sortedResults[0]);
      }
    } catch (e: any) {
      addToast(e.message || 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const handleApplyFix = useCallback(async (issueToFix: AnalysisIssue) => {
    const codeProvider = activeFile || (snippet ? { content: snippet, language: 'plaintext' } : null);
    if (!codeProvider) return;

    const originalCodeLines = codeProvider.content.split('\n');
    const lineIndex = issueToFix.line - 1;

    if (lineIndex < 0 || lineIndex >= originalCodeLines.length) {
        addToast("Error: Could not apply fix due to an invalid line number.");
        console.error("Invalid line number for fix:", issueToFix.line);
        return;
    }
    
    const fixLines = issueToFix.suggestedFix.trim().split('\n');
    originalCodeLines.splice(lineIndex, 1, ...fixLines);
    const newContent = originalCodeLines.join('\n');

    if (activeFile) {
        setActiveFile({ ...activeFile, content: newContent });
    } else if (snippet) {
        setSnippet(newContent);
    }

    addToast('Fix applied. Re-analyzing code...');
    setSelectedIssue(null);
    setFixDiff(null);

    await runAnalysis(newContent, codeProvider.language);
  }, [activeFile, snippet, runAnalysis, addToast]);

  useEffect(() => {
    if (inputMode === InputMode.SampleRepo && activeFile?.content) {
      runAnalysis(activeFile.content, activeFile.language);
    }
  }, [activeFile, inputMode, runAnalysis]);

  useEffect(() => {
      const keyIsSet = isApiKeySet();
      setApiKeyMissing(!keyIsSet && !isDemoMode());
      if (keyIsSet || isDemoMode()) {
          if (inputMode === InputMode.SampleRepo && activeFile) {
              runAnalysis(activeFile.content, activeFile.language);
          }
      } else {
           setIssues([]);
           setSelectedIssue(null);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyzeSnippet = () => {
    setActiveFile(null);
    setSelectedRepo(null);
    setInputMode(InputMode.Snippet);
    runAnalysis(snippet, 'plaintext');
  }
  
  useEffect(() => {
    if (selectedIssue) {
      const codeProvider = activeFile || (snippet ? { content: snippet } : null);
      if (!codeProvider) return;

      if (selectedIssue.line === -1) {
          setFixDiff(null); return;
      }
      const originalCodeLines = codeProvider.content.split('\n');
      const lineIndex = selectedIssue.line - 1;
      
      if (lineIndex < 0 || lineIndex >= originalCodeLines.length) {
        console.error(`Invalid line number from analysis: ${selectedIssue.line}`);
        setFixDiff(null); return;
      }
      const oldLine = originalCodeLines[lineIndex];
      const newLines = selectedIssue.suggestedFix.trim().split('\n');
      const diffText = `-${oldLine.trim()}\n` + newLines.map(l => `+${l}`).join('\n');
      setFixDiff(diffText);
    } else {
        setFixDiff(null);
    }
  }, [selectedIssue, activeFile, snippet]);

  return (
    <div className="h-full w-full glass-effect rounded-lg overflow-hidden grid grid-cols-12">
      <div className="col-span-3">
        <LeftPanel
          inputMode={inputMode} setInputMode={setInputMode} selectedRepo={selectedRepo}
          setSelectedRepo={setSelectedRepo} activeFile={activeFile} setActiveFile={setActiveFile}
          snippet={snippet} setSnippet={setSnippet} onAnalyze={handleAnalyzeSnippet}
          isLoading={isLoading && inputMode === InputMode.Snippet}
        />
      </div>
      <div className="col-span-5">
        <CenterPanel
          activeFile={activeFile || (snippet ? {name: 'Snippet', language: 'plaintext', content: snippet} : null)}
          issues={issues} selectedIssue={selectedIssue} fixDiff={fixDiff}
        />
      </div>
      <div className="col-span-4">
        <RightPanel
          issues={issues} isLoading={isLoading} selectedIssue={selectedIssue}
          setSelectedIssue={setSelectedIssue} onApplyFix={handleApplyFix}
          isApiKeyMissing={apiKeyMissing} onNavigateToSettings={onNavigateToSettings}
          // FIX: Add missing props for commit/revert functionality, which is not used in the Studio.
          appliedIssue={null}
          onCommitFix={() => {}}
          onRevertFix={() => {}}
          isCommitting={false}
        />
      </div>
    </div>
  );
};

export default SentinelStudio;