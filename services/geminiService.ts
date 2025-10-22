import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisIssue, CommitAnalysisIssue, GitHubCommit, RefactorResult } from '../types';
import { setCache, getCache } from '../utils/cacheUtils';

const API_KEY_LOCAL_STORAGE_KEY = 'sentinel-api-key';
const SYSTEM_INSTRUCTION_LOCAL_STORAGE_KEY = 'sentinel-system-instruction';
export const MAX_OUTPUT_TOKENS_LOCAL_STORAGE_KEY = 'sentinel-max-output-tokens';
const DEMO_MODE_LOCAL_STORAGE_KEY = 'sentinel-demo-mode';


// Exported for use in the settings page and as a fallback
export const DEFAULT_SYSTEM_INSTRUCTION = "You are Sentinel, a world-class AI code security agent. Your purpose is to conduct deep, context-aware code reviews. Analyze the provided code for security vulnerabilities (like OWASP Top 10), logical bugs, and code quality issues ('code smells').";

export const isApiKeySet = (): boolean => {
    return !!localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY);
};

export const isDemoMode = (): boolean => {
    return localStorage.getItem(DEMO_MODE_LOCAL_STORAGE_KEY) === 'true';
}

const getAiClient = () => {
    const apiKey = localStorage.getItem(API_KEY_LOCAL_STORAGE_KEY);
    if (!apiKey) {
        throw new Error("Gemini API Key not found. Please set it on the AI Agent Settings page.");
    }
    return new GoogleGenAI({ apiKey });
};

// --- START: Retry & Rate Limiting Logic ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let lastApiCallTimestamp = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between calls

async function withRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 1000): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTimestamp;

    if (timeSinceLastCall < MIN_REQUEST_INTERVAL) {
        const delay = MIN_REQUEST_INTERVAL - timeSinceLastCall;
        console.log(`Rate limiting: delaying next API call by ${delay}ms.`);
        await sleep(delay);
    }
    
    lastApiCallTimestamp = Date.now();

    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fn();
        } catch (error: any) {
            let isRateLimitError = false;
            const rawMessage = error.message || error.toString();
            
            if (error.status === 429) {
                 isRateLimitError = true;
            } else {
                try {
                    const errorObj = JSON.parse(rawMessage);
                    if (errorObj.error && (errorObj.error.status === 'RESOURCE_EXHAUSTED' || errorObj.error.code === 429)) {
                        isRateLimitError = true;
                    }
                } catch (e) {
                    const lowerCaseMessage = rawMessage.toLowerCase();
                    if (lowerCaseMessage.includes('quota') || lowerCaseMessage.includes('rate limit')) {
                        isRateLimitError = true;
                    }
                }
            }
            
            if (isRateLimitError && attempt < retries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.warn(`Gemini API rate limit exceeded. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                await sleep(delay);
                attempt++;
            } else {
                throw error;
            }
        }
    }
    throw new Error('Exceeded max retries.');
}
// --- END: Retry & Rate Limiting Logic ---

// --- START: Hashing for Cache Keys ---
const createCacheKey = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `gemini-${Math.abs(hash)}`;
};
// --- END: Hashing for Cache Keys ---


const codeAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            line: { type: Type.INTEGER, description: "The line number where the issue is found. Must be a number." },
            severity: { type: Type.STRING, description: "Severity: Critical, High, Medium, or Low." },
            title: { type: Type.STRING, description: "A short, descriptive title for the issue." },
            description: { type: Type.STRING, description: "A detailed explanation of the issue." },
            impact: { type: Type.STRING, description: "The potential impact if this issue is not fixed." },
            suggestedFix: { type: Type.STRING, description: "A valid, concrete code snippet that fixes the issue." },
        },
        required: ["line", "severity", "title", "description", "impact", "suggestedFix"],
    },
};

const commitAnalysisSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            sha: { type: Type.STRING, description: "The full SHA of the commit containing the issue." },
            severity: { type: Type.STRING, description: "Severity: Critical, High, Medium, or Low." },
            title: { type: Type.STRING, description: "A short, descriptive title for the issue." },
            description: { type: Type.STRING, description: "A detailed explanation of why this commit is flagged as a potential risk." },
            reasoning: { type: Type.STRING, description: "A step-by-step explanation of the thought process that led to identifying this risk."},
            remediation: { type: Type.STRING, description: "Concrete, actionable advice on how to mitigate or fix the identified risk."},
            plainLanguageSummary: { type: Type.STRING, description: "A simple, one-to-two sentence summary in plain language of what this commit does and why it was flagged. This should be easy for a non-technical person to understand." }
        },
        required: ["sha", "severity", "title", "description", "reasoning", "remediation", "plainLanguageSummary"],
    },
};

const refactorCodeSchema = {
    type: Type.OBJECT,
    properties: {
        refactoredCode: { type: Type.STRING, description: "A string containing the complete, refactored code." },
        improvements: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A brief explanation of a change that was made."
            }
        },
    },
    required: ["refactoredCode", "improvements"],
};

const getLanguageInstruction = (language: string): string => {
    const lang = language.toLowerCase();
    if (lang.includes('python')) {
        return 'Pay special attention to web security vulnerabilities like SQL Injection, Cross-Site Scripting (XSS), and insecure object deserialization.';
    }
    if (lang.includes('typescript') || lang.includes('javascript') || lang.includes('tsx')) {
        return 'Focus on XSS vulnerabilities, especially with frameworks like React, and check for prototype pollution and insecure API usage.';
    }
    if (lang.includes('hcl') || lang.includes('terraform')) {
        return 'The primary focus for this Terraform file is to find hardcoded secrets, insecure configurations in cloud resources (e.g., public S3 buckets), and overly permissive IAM policies.';
    }
    return 'Analyze the code for general security vulnerabilities and best practice violations.';
}

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API Error (${context}):`, error);
    let rawMessage = error.message || error.toString();
    try {
        const errorObj = JSON.parse(rawMessage);
        if (errorObj.error && errorObj.error.message) {
            rawMessage = errorObj.error.message;
        }
    } catch (e) {}
    const errorString = rawMessage.toLowerCase();
    if (errorString.includes("api key not valid")) {
        throw new Error("Your Gemini API Key is not valid. Please set it on the AI Agent Settings page.");
    }
    if (errorString.includes('fetch failed') || errorString.includes('networkerror')) {
         throw new Error('Network error. Please check your connection and try again.');
    }
    if (errorString.includes('quota') || errorString.includes('rate limit')) {
        throw new Error("Gemini API Quota Exceeded. You have made too many requests. Please check your Google AI Platform console for details and try again later.");
    }
    if (error instanceof SyntaxError) {
        throw new Error(`The AI model returned an invalid response format during ${context}.`);
    }
    throw new Error(rawMessage);
};

export const analyzeCode = async (code: string, language: string = 'plaintext'): Promise<AnalysisIssue[]> => {
    if (isDemoMode()) {
        await sleep(1500); // Simulate network delay
        return Promise.resolve([
            { line: 17, severity: 'Critical', title: 'SQL Injection', description: 'User-provided input is directly used in an SQL query without proper sanitization, allowing for potential data exfiltration.', impact: 'An attacker could execute arbitrary SQL commands to read, modify, or delete sensitive data from the database.', suggestedFix: '    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()' }
        ]);
    }
    
    const cacheKey = createCacheKey(`analyze-${language}:${code}`);
    const cachedResult = getCache<AnalysisIssue[]>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
        const result = await withRetry(async () => {
            const ai = getAiClient();
            const languageSpecificInstruction = getLanguageInstruction(language);
            const systemInstruction = localStorage.getItem(SYSTEM_INSTRUCTION_LOCAL_STORAGE_KEY) || DEFAULT_SYSTEM_INSTRUCTION;
            
            const codeWithLines = code.split('\n').map((line, index) => `${index + 1}: ${line}`).join('\n');
            const contents = `Review the following code, which has line numbers prepended to each line. For each issue you find, you MUST use the prepended line number in your response. \n\nCODE:\n${codeWithLines}`;

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction: `${systemInstruction} ${languageSpecificInstruction}`,
                    responseMimeType: "application/json",
                    responseSchema: codeAnalysisSchema,
                },
            });

            const jsonString = response.text.trim();
            const apiResult = JSON.parse(jsonString);
            if (!Array.isArray(apiResult)) throw new Error("The AI model returned data in an unexpected format (not an array).");
            return apiResult as AnalysisIssue[];
        });
        setCache(cacheKey, result);
        return result;
    } catch (error: any) {
        handleGeminiError(error, 'code analysis');
    }
};

export const analyzeCommitHistory = async (commits: GitHubCommit[]): Promise<CommitAnalysisIssue[]> => {
    const commitDataForAnalysis = commits.map(c => ({ sha: c.sha, message: c.commit.message, author: c.commit.author.name }));

    if (isDemoMode()) {
        await sleep(1500);
        const targetCommit = commits.find(c => c.commit.message.toLowerCase().includes('secret'));
        if (targetCommit) {
            return Promise.resolve([{ sha: targetCommit.sha, severity: 'Critical', title: 'Hardcoded Secret Detected', description: 'The commit message appears to reference adding or modifying a hardcoded secret.', reasoning: 'Keywords like "secret" in commit messages are a strong indicator of potential secret exposure.', remediation: 'Immediately rotate the exposed credential and rewrite the Git history to remove the sensitive commit.', plainLanguageSummary: 'This commit might contain a password or API key and should be investigated immediately.' }]);
        }
        return Promise.resolve([]);
    }

    const cacheKey = createCacheKey(`commits:${JSON.stringify(commitDataForAnalysis)}`);
    const cachedResult = getCache<CommitAnalysisIssue[]>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
        const result = await withRetry(async () => {
            const ai = getAiClient();
            const systemInstruction = "You are a security analyst specializing in Git history. Analyze the following commit data for potential security risks. Look for exposed secrets (API keys, passwords), suspicious keywords ('hack', 'workaround', 'disable security'), and other red flags. For each flagged commit, you MUST provide a title, a detailed description, your reasoning, a suggested remediation, and a simple 'plainLanguageSummary' of the change. Only return issues for commits that have a clear, high-confidence security risk. Do not flag common messages like 'fix bug' or 'update feature'.";
            
            const contents = `Analyze these commits:\n${JSON.stringify(commitDataForAnalysis, null, 2)}`;

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: commitAnalysisSchema,
                },
            });
            const jsonString = response.text.trim();
            const apiResult = JSON.parse(jsonString);
            if (!Array.isArray(apiResult)) throw new Error("The AI model returned data in an unexpected format (not an array).");
            return apiResult as CommitAnalysisIssue[];
        });
        setCache(cacheKey, result);
        return result;
    } catch (error: any) {
        handleGeminiError(error, 'commit history analysis');
    }
};

export const refactorCode = async (code: string, language: string): Promise<RefactorResult> => {
    if (isDemoMode()) {
        await sleep(1500);
        const mockRefactor = {
            refactoredCode: `def get_product(product_id):\n    # FIX: Use parameterized query to prevent SQL injection\n    conn = get_db_connection()\n    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()\n    conn.close()\n    return product`,
            improvements: [
                "Replaced direct string formatting with a parameterized query to prevent SQL Injection vulnerabilities.",
                "Maintained original function signature and return value for compatibility."
            ]
        };
        return Promise.resolve(mockRefactor);
    }
    
    const cacheKey = createCacheKey(`refactor-v2-${language}:${code}`);
    const cachedResult = getCache<RefactorResult>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
        const result = await withRetry(async () => {
            const ai = getAiClient();
            const systemInstruction = `You are an expert code refactoring agent. Your task is to rewrite the given code to improve its security, performance, and readability, without changing its core functionality. Respond ONLY with a single JSON object matching the provided schema.`;
            const contents = `LANGUAGE: ${language}\n\nCODE:\n\`\`\`${language}\n${code}\n\`\`\``;
            
            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: refactorCodeSchema,
                }
            });
            const jsonString = response.text.trim();
            const apiResult = JSON.parse(jsonString);
            if (typeof apiResult.refactoredCode !== 'string' || !Array.isArray(apiResult.improvements)) {
                 throw new Error("The AI model returned data in an unexpected format.");
            }
            return apiResult as RefactorResult;
        });
        setCache(cacheKey, result);
        return result;
    } catch (error: any) {
        handleGeminiError(error, 'code refactoring');
    }
}

export const summarizeRepoActivity = async (commits: { message: string }[], pullRequests: { title: string }[]): Promise<string> => {
    if (isDemoMode()) {
        await sleep(1000);
        return "This week saw a major refactor of the authentication system and the introduction of a new user dashboard feature. Several critical security bugs related to XSS were also patched.";
    }

    const cacheKey = createCacheKey(`summary:${JSON.stringify(commits)}:${JSON.stringify(pullRequests)}`);
    const cachedResult = getCache<string>(cacheKey);
    if (cachedResult) return cachedResult;

    try {
        const result = await withRetry(async () => {
            const ai = getAiClient();
            
            const commitMessages = commits.map(c => c.message.split('\n')[0]).slice(0, 20); // First line of last 20 commits
            const prTitles = pullRequests.map(p => p.title).slice(0, 10); // Last 10 PRs

            const contents = `You are a tech lead providing a weekly digest for a manager. Summarize the key activities from the following git commit messages and pull request titles. Focus on new features, major bug fixes, and overall project momentum. Keep it concise (2-3 sentences max) and in a professional, high-level tone.\n\nRecent Commits:\n- ${commitMessages.join('\n- ')}\n\nRecent Pull Requests:\n- ${prTitles.join('\n- ')}`;

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
            });
            return response.text;
        });
        setCache(cacheKey, result);
        return result;
    } catch (error: any) {
        handleGeminiError(error, 'repository activity summary');
    }
};

export const queryRepoInsights = async (question: string, fileContents: { name: string, content: string }[]): Promise<string> => {
    if (isDemoMode()) {
        await sleep(1000);
        return `Based on the provided files, the primary goal seems to be creating a secure web application. For your question "${question}", the most relevant file is likely \`app.py\`, which contains a critical SQL injection vulnerability that needs to be addressed using parameterized queries.`;
    }

    try {
        const result = await withRetry(async () => {
            const ai = getAiClient();
            
            const contextString = fileContents.map(f => `--- FILE: ${f.name} ---\n${f.content.substring(0, 2000)}`).join('\n\n');
            const contents = `You are a helpful AI assistant for a software developer. Based on the provided file snippets from a repository, answer the user's question. Provide a concise, helpful response, and mention which file is most relevant to the answer if applicable.\n\nCONTEXT:\n${contextString}\n\nQUESTION: ${question}`;

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents,
            });
            return response.text;
        });
        return result;
    } catch (error: any) {
        handleGeminiError(error, 'repository insight query');
    }
};