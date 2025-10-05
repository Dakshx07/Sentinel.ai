
import React from 'react';
import { SampleRepo, InputMode, CodeFile } from '../types';
import { CodeIcon, RepoIcon } from './icons';
import { SAMPLE_REPOS } from '../constants';

interface LeftPanelProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  selectedRepo: SampleRepo | null;
  setSelectedRepo: (repo: SampleRepo) => void;
  activeFile: CodeFile | null;
  setActiveFile: (file: CodeFile) => void;
  snippet: string;
  setSnippet: (code: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  inputMode,
  setInputMode,
  selectedRepo,
  setSelectedRepo,
  activeFile,
  setActiveFile,
  snippet,
  setSnippet,
  onAnalyze,
  isLoading,
}) => {

  const handleRepoSelect = (repo: SampleRepo) => {
    setSelectedRepo(repo);
    setActiveFile(repo.files[0]);
  };

  const renderContent = () => {
    switch (inputMode) {
      case InputMode.Snippet:
        return (
          <div className="p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-dark-text dark:text-light-text font-heading mb-2">Paste Code Snippet</h3>
            <textarea
              className="w-full flex-grow bg-light-secondary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 font-mono text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Paste your code here..."
            />
            <button
              onClick={onAnalyze}
              disabled={isLoading || !snippet}
              className="mt-4 w-full btn-primary disabled:bg-gray-300 dark:disabled:bg-white/10 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Snippet'}
            </button>
          </div>
        );
      case InputMode.SampleRepo:
        return (
          <div className="p-4 flex flex-col h-full">
            <h3 className="text-lg font-bold text-dark-text dark:text-light-text font-heading mb-2">Select Sample Repo</h3>
            <div className="space-y-2 flex-grow overflow-y-auto pr-1">
              {SAMPLE_REPOS.map(repo => (
                <div key={repo.id} onClick={() => handleRepoSelect(repo)}
                  className={`p-3 border rounded-md cursor-pointer transition-all ${selectedRepo?.id === repo.id ? 'bg-brand-purple/20 border-brand-purple' : 'bg-light-secondary dark:bg-dark-primary border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}`}>
                  <p className="font-bold text-dark-text dark:text-white">{repo.name}</p>
                  <p className="text-sm text-medium-dark-text dark:text-medium-text">{repo.description}</p>
                </div>
              ))}
            </div>
            {selectedRepo && (
                <div className="mt-4 border-t border-gray-200 dark:border-white/10 pt-4">
                    <h4 className="text-md font-bold text-dark-text dark:text-light-text font-heading mb-2">Files</h4>
                    <ul className="space-y-1">
                        {selectedRepo.files.map(file => (
                            <li key={file.name} onClick={() => setActiveFile(file)} className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${activeFile?.name === file.name ? 'bg-brand-purple/20' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                <CodeIcon className="w-4 h-4 text-medium-dark-text dark:text-medium-text" />
                                <span className="text-sm text-dark-text dark:text-white">{file.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        );
    }
  };

  const TabButton = ({ mode, icon, label }: { mode: InputMode, icon: React.ReactNode, label: string }) => (
    <button
      onClick={() => setInputMode(mode)}
      className={`flex-1 flex items-center justify-center p-3 text-sm font-medium border-b-2 transition-colors ${inputMode === mode ? 'text-brand-purple border-brand-purple' : 'text-medium-dark-text dark:text-medium-text border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary border-r border-gray-200 dark:border-white/10 flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-white/10">
        <TabButton mode={InputMode.Snippet} icon={<CodeIcon className="w-5 h-5" />} label="Snippet" />
        <TabButton mode={InputMode.SampleRepo} icon={<RepoIcon className="w-5 h-5" />} label="Samples" />
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default LeftPanel;