export interface AnalysisIssue {
  line: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: string;
  suggestedFix: string;
  filePath?: string;
}

export interface CodeFile {
  name: string;
  language: string;
  content: string;
}

export interface SampleRepo {
  id: string;
  name:string;
  description: string;
  files: CodeFile[];
}

export enum InputMode {
  Snippet,
  SampleRepo,
}

// For GitHub API response for file tree
export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export type AppView = 'landing' | 'pricing' | 'dashboard';
export type DashboardView = 'repositories' | 'studio' | 'gitops' | 'commits' | 'settings' | 'docs' | 'notifications' | 'pushpull' | 'refactor' | 'team' | 'dashboard' | 'repoPulse' | 'workflowStreamliner';

export interface GitHubProfile {
    login: string;
    avatar_url: string;
    html_url: string;
    name: string | null;
    public_repos: number;
    email?: string | null;
}

export interface User {
    email: string;
    username: string;
    avatarUrl: string;
    github?: GitHubProfile;
    password?: string; // For sign-up process
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface CommitAnalysisIssue {
  sha: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reasoning: string;
  remediation: string;
  plainLanguageSummary: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  private: boolean;
  // Sentinel-specific properties
  lastReview?: string;
  autoReview: boolean;
}

export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface RefactorResult {
    refactoredCode: string;
    improvements: string[];
}