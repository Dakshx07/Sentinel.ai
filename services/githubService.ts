import { GitHubTreeItem, GitHubCommit, Repository, GitHubProfile } from '../types';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_PAT_LOCAL_STORAGE_KEY = 'sentinel-github-pat';

class GitHubApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'GitHubApiError';
    }
}

const getGitHubHeaders = () => {
    const token = localStorage.getItem(GITHUB_PAT_LOCAL_STORAGE_KEY);
    if (!token) {
        throw new GitHubApiError("GitHub Personal Access Token not found. Please set it in Settings.", 401);
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
    };
};

const handleApiError = async (response: Response, url: string, context: string): Promise<never> => {
    const errorBody = await response.text();
    console.error(`GitHub API Error (${context}): Status: ${response.status}. URL: ${url}. Body: ${errorBody}`);
    
    if (response.status === 401) {
        // Dispatch a global event so the app can react.
        window.dispatchEvent(new CustomEvent('auth-error'));
        throw new GitHubApiError("Authentication failed (401). Your token is invalid, expired, or lacks the required 'repo' and 'read:user' scopes.", 401);
    }
    if (response.status === 403) {
        throw new GitHubApiError("Permission denied or API rate limit exceeded (403).", 403);
    }
    if (response.status === 404) {
        throw new GitHubApiError("Resource not found (404). Please check the repository URL.", 404);
    }
    
    try {
      const errorJson = JSON.parse(errorBody);
      if (errorJson.message) {
        throw new GitHubApiError(errorJson.message, response.status);
      }
    } catch (e) {
      // Fallback if parsing fails
    }
    
    // Final fallback
    throw new GitHubApiError(`An unexpected error occurred during ${context}. Status: ${response.status}`, response.status);
};

export const getAuthenticatedUserProfile = async (): Promise<GitHubProfile> => {
    const url = `${GITHUB_API_URL}/user`;
    try {
        const response = await fetch(url, { headers: getGitHubHeaders() });
        if (!response.ok) {
            return await handleApiError(response, url, 'fetching authenticated user profile');
        }
        return response.json();
    } catch (error) {
        // Re-throw custom errors to preserve status code
        if (error instanceof GitHubApiError) throw error;
        // Handle network errors
        throw new Error("Network error while trying to connect to GitHub.");
    }
}

export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) return null;
    return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
};

export const getRepoFileTree = async (owner: string, repo: string): Promise<GitHubTreeItem[]> => {
    const repoInfoUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}`;
    const repoInfoResponse = await fetch(repoInfoUrl, { headers: getGitHubHeaders() });

    if (repoInfoResponse.status === 404) {
        throw new GitHubApiError(`Repository '${owner}/${repo}' not found. Please check the URL for typos and ensure your PAT has access if it's a private repository.`, 404);
    }

    if (!repoInfoResponse.ok) {
        return await handleApiError(repoInfoResponse, repoInfoUrl, 'fetching repo info');
    }
    const repoData = await repoInfoResponse.json();
    const defaultBranch = repoData.default_branch;

    const treeUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeUrl, { headers: getGitHubHeaders() });
     if (!treeResponse.ok) {
        return await handleApiError(treeResponse, treeUrl, 'fetching repo file tree');
    }
    const treeData = await treeResponse.json();

    const ignoredExtensions = /\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|eot|map|md|xml|yml|yaml|css|scss|less|log|tmp|bak)$/i;
    const ignoredFilenames = /^(license|readme|contributing|changelog|dockerfile|gemfile\.lock|package-lock\.json|yarn\.lock|\.gitignore|\.dockerignore|\.env.*)$/i;
    const ignoredDirs = ['node_modules/', 'vendor/', 'dist/', 'build/', 'public/', 'assets/', 'coverage/', 'test/', 'tests/', '.git/', '.github/', '.vscode/'];
    
    const relevantFiles = treeData.tree.filter((item: any) => {
        if (item.type !== 'blob' || !item.size || item.size > 250000) return false;
        if (ignoredDirs.some(dir => item.path.toLowerCase().startsWith(dir))) return false;
        const filename = item.path.split('/').pop() || '';
        if (ignoredExtensions.test(item.path) || ignoredFilenames.test(filename) || filename.includes('.min.')) return false;
        return true;
    });

    return relevantFiles;
};

export const getFileContent = async (owner: string, repo: string, sha: string): Promise<string> => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/git/blobs/${sha}`;
    const response = await fetch(url, { headers: getGitHubHeaders() });
    if (!response.ok) {
      return await handleApiError(response, url, 'fetching file content');
    }
    const data = await response.json();
    return atob(data.content);
};

export const getRepoCommits = async (owner: string, repo: string): Promise<GitHubCommit[]> => {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=30`;
  const response = await fetch(url, { headers: getGitHubHeaders() });
  if (!response.ok) {
    return await handleApiError(response, url, 'fetching repo commits');
  }
  return response.json();
};

export const getUserRepos = async (): Promise<Repository[]> => {
    const url = `${GITHUB_API_URL}/user/repos?type=all&sort=updated&per_page=100`;
    const response = await fetch(url, { headers: getGitHubHeaders() });
    if (!response.ok) {
        return await handleApiError(response, url, 'fetching user repos');
    }
    return response.json();
};

export const getRepoIssues = async (owner: string, repo: string, labels: string[] = []): Promise<any[]> => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/issues?labels=${labels.join(',')}`;
    const response = await fetch(url, { headers: getGitHubHeaders() });
    if (!response.ok) {
        return await handleApiError(response, url, 'fetching repository issues');
    }
    return response.json();
};

export const getRepoPulls = async (owner: string, repo: string, state: 'all' | 'open' | 'closed' = 'all'): Promise<any[]> => {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls?state=${state}`;
    const response = await fetch(url, { headers: getGitHubHeaders() });
    if (!response.ok) {
        return await handleApiError(response, url, 'fetching repository pull requests');
    }
    return response.json();
};