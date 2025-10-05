import React from 'react';

export const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

export const RepoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7L12 11L20 7" />
  </svg>
);

export const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297z"/></svg>
);

export const ShieldIcon: React.FC<{ severity: string, className?: string }> = ({ severity, className }) => {
  const colorClasses: { [key: string]: string } = {
    Critical: 'text-red-600 dark:text-red-500',
    High: 'text-orange-600 dark:text-orange-500',
    Medium: 'text-yellow-600 dark:text-yellow-400',
    Low: 'text-blue-600 dark:text-blue-400',
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className} ${colorClasses[severity]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.917l9 2.083 9-2.083a12.02 12.02 0 00-2.382-9.971z" />
    </svg>
  );
};

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export const StudioIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export const SentinelLogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L3.6 5.2V11c0 5.25 3.6 9.88 8.4 11.25 4.8-1.37 8.4-6 8.4-11.25V5.2L12 2zm0 17.5c-3.15-1.2-5.4-4.83-5.4-8.75V7.45l5.4-2.34v13.6z"/>
    </svg>
);

export const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CodeBracketSquareIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V5.75A2.25 2.25 0 0 0 18 3.5H6A2.25 2.25 0 0 0 3.75 5.75v12.5A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
);

export const CommandLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5-3h6" />
    </svg>
);

export const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const PythonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>Python</title><path d="M12 24a12 12 0 1 1 0-24 12 12 0 0 1 0 24zM8.41 4.5H12v3.89H8.41V4.5zm0 15v-3.89H12V19.5H8.41zM4.5 8.41V12h3.9V8.41H4.5zm15 0V12h-3.9V8.41H19.5zM8.41 12v3.89h7.18c2.14 0 3.89-1.75 3.89-3.89V8.41h-3.89v3.59H8.41zm11.09-7.18V12h-3.89V8.41c0-2.14-1.75-3.89-3.89-3.89H8.41V4.5h3.59c2.14 0 3.89 1.75 3.89 3.89z"/></svg>
);

export const ReactIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>React</title><g><circle cx="12" cy="12" r="2.05" fill="currentColor"/><g stroke="currentColor" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2"/><ellipse rx="11" ry="4.2" transform="rotate(60)"/><ellipse rx="11" ry="4.2" transform="rotate(120)"/></g></g></svg>
);

export const AWSIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>Amazon Web Services</title><path d="M12.353 17.522c-.282 0-.55-.02-.803-.058l-.06-.013c-2.348-.52-4.22-2.126-5.12-4.184-.9-2.06-1.02-4.48-.32-6.683C6.75 4.38 8.87 2.98 11.453 2.98c2.14 0 4.012.988 5.118 2.537.47.66.68 1.482.62 2.293l-.12 1.625c-.06.77-.33 1.503-.78 2.106-.44.603-1.06 1.05-1.78 1.303-.72.253-1.5.29-2.26.11l-1.51-.357c-.5-.116-.85-.568-.78-1.085.07-.518.52-.876 1.03-.76l1.51.358c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.624c.03-.43-.07-.86-.28-1.24-.62-1.12-1.89-1.81-3.32-1.81-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01zm-3.23 2.54c-.26 0-.52-.02-.77-.06l-.06-.01c-2.35-.49-4.24-2.04-5.15-4.09-.92-2.05-1.04-4.47-.34-6.66C3.5 7.04 5.62 5.64 8.2 5.64c2.15 0 4.02.99 5.12 2.54.47.66.68 1.48.62 2.29l-.12 1.62c-.06.78-.33 1.51-.78 2.11-.44.6-1.06 1.05-1.78 1.3-.72.25-1.5.29-2.26.11l-1.51-.35c-.5-.12-.85-.57-.78-1.09.07-.51.52-.87 1.03-.76l1.51.35c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.62c.03-.43-.07-.86-.28-1.24-.62-1.11-1.89-1.8-3.32-1.8-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01zM20.894 8.942c-.28 0-.55-.02-.8-.06l-.06-.01c-2.35-.49-4.24-2.04-5.15-4.09-.92-2.05-1.04-4.47-.34-6.66.7-2.2 2.82-3.6 5.4-3.6 2.15 0 4.02.99 5.12 2.54.47.66.68 1.48.62 2.29l-.12 1.62c-.06.78-.33 1.51-.78 2.11-.44.6-1.06 1.05-1.78 1.3-.72.25-1.5.29-2.26.11l-1.51-.35c-.5-.12-.85-.57-.78-1.09.07-.51.52-.87 1.03-.76l1.51.35c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.62c.03-.43-.07-.86-.28-1.24-.62-1.11-1.89-1.8-3.32-1.8-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01z"/></svg>
);

export const DockerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>Docker</title><path d="M22.128 9.142c-.24-.216-.576-.324-.936-.324h-2.1V6.91c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324h-1.908V3.54c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324h-1.908V1.75c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324H3.252c-.36 0-.684.108-.936.324a1.116 1.116 0 0 0-.324.936v11.724c.216.612.684 1.08 1.3 1.3.612.216 1.284.108 1.8-.288l.216-.156c.3-.216.66-.36 1.056-.408.384-.048.768 0 1.128.156.36.156.66.408.876.744.216.336.324.708.324 1.104v.276c0 .276.084.528.228.744.144.216.36.36.6.444.252.084.504.108.744.108.216 0 .444-.024.66-.084.3-.084.552-.228.744-.444.192-.216.288-.468.288-.744v-.276c0-.384.108-.744.324-1.056.216-.312.528-.528.876-.66.36-.132.72-.156 1.092-.108.36.048.7.192 1.008.408l.252.192c.516.396 1.176.504 1.8.288.612-.216 1.08-.684 1.3-1.3V10.68c0-.468-.156-.9-.444-1.284a2.1 2.1 0 0 1-.252.252zM12.292 7.026h-1.908c-.36 0-.684.108-.936.324-.252.216-.324.552-.324.936v1.908c0 .384.108.684.324.936.252.252.576.324.936.324h1.908c.36 0 .684-.108.936-.324.252-.252.324-.552.324-.936V8.286c0-.384-.072-.72-.324-.936a1.116 1.116 0 0 0-.936-.324zm2.1 0h-1.908V5.118h1.908c.36 0 .684.108.936.324.252.252.324.576.324.936v.636h-1.284zm-2.1 4.128h-1.908V9.246h1.908v1.908zm4.2 0h-1.908V9.246h1.908c.36 0 .684.108.936.324.252.252.324.576.324.936v.636h-1.284zm-4.2 2.1h-1.908v-1.908h1.908v1.908z"/></svg>
);

export const TerraformIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>Terraform</title><path d="M13.42 22.035h-3.11L5.97 19.32V4.95L11.82 1.95v12.015l-5.85-2.73V8.805l5.85 3.015v10.215zm-.29-20.07L18.03 4.95v14.37l-4.9-2.715V1.965z"/></svg>
);

export const NodeJSIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor"><title>Node.js</title><path d="M11.75 23.11l-5.63-3.26-.04-6.52 5.67 3.28v6.5zm.5-22.22l-5.63 3.26v6.52l5.63-3.26V.89zm.5 15.72l-5.63-3.26v-6.5l5.63 3.26v6.5zm6.13-2.5V8.52l-5.06-2.93v2.5l3.56 2.06v3.28l-3.56-2.06v2.54l5.06 2.93z"/></svg>
);

export const GitBranchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 4.5a3.5 3.5 0 00-3.5 3.5v7a3.5 3.5 0 003.5 3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 19.5a3.5 3.5 0 003.5-3.5v-7a3.5 3.5 0 00-3.5-3.5" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const DocsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const NotificationsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

export const PullRequestIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="6" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M6 9v6" />
        <path d="M13 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" />
        <path d="m16 14 3-3-3-3" />
    </svg>
);

export const BrainCircuitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H12M15.75 3.75H12M12 3.75V8.25M12 15.75V20.25M15.75 20.25H12M8.25 20.25H12M3.75 8.25H8.25M3.75 15.75H8.25M8.25 8.25V15.75M15.75 8.25V15.75M15.75 8.25H20.25M15.75 15.75H20.25M20.25 8.25V15.75" />
    </svg>
);

export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

export const AnalyticsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const RepoHealthIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7L12 11L20 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 11.5l2.5 2.5 5-5" />
    </svg>
);

export const SlackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.521-2.522c0-1.393 1.129-2.522 2.521-2.522h2.521v2.522a2.528 2.528 0 0 1-2.521 2.522zm1.26-7.566a2.528 2.528 0 0 1 2.521-2.522c1.393 0 2.521 1.129 2.521 2.522v5.044a2.528 2.528 0 0 1-2.521 2.522 2.528 2.528 0 0 1-2.521-2.522V7.599zm7.567 1.26a2.528 2.528 0 0 1 2.521-2.522c1.393 0 2.521 1.129 2.521 2.522s-1.129 2.522-2.521 2.522h-2.521V8.859zm-1.26 7.566a2.528 2.528 0 0 1-2.521 2.522c-1.393 0-2.521-1.129-2.521-2.522V11.37a2.528 2.528 0 0 1 2.521-2.522c1.393 0 2.521 1.129 2.521 2.522v5.044zM8.859 5.042a2.528 2.528 0 0 1 2.522-2.521c1.393 0 2.522 1.129 2.522 2.521v2.521H8.859V5.042zm7.566 1.26a2.528 2.528 0 0 1 2.522-2.521c1.393 0 2.522 1.129 2.522 2.521s-1.129 2.521-2.522 2.521h-5.044a2.528 2.528 0 0 1-2.522-2.521c0-1.393 1.129-2.521 2.522-2.521h5.044zM15.165 18.958a2.528 2.528 0 0 1-2.522 2.521c-1.393 0-2.522-1.129-2.522-2.521v-2.521h2.522a2.528 2.528 0 0 1 2.522 2.521zm-1.26-7.566a2.528 2.528 0 0 1-2.522-2.521c0-1.393 1.129-2.521 2.522-2.521h5.044a2.528 2.528 0 0 1 2.522 2.521c0 1.393-1.129 2.522-2.522 2.522h-5.044z" />
    </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const CpuChipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5v-1.5m0 18v-1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6.375a4.125 4.125 0 0 1 4.125-4.125h3.375c1.72 0 3.323.702 4.536 1.848a4.536 4.536 0 0 1 1.848 4.536v3.375a4.125 4.125 0 0 1-4.125 4.125H9.375A4.125 4.125 0 0 1 5.25 14.625v-3.375a4.125 4.125 0 0 1 0-4.875Z" />
    </svg>
);

export const GoogleGeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.63,2.49L12,2,11.37,2.49,5.34,6,4.71,6.49V12v5.51l.63.49,6.03,3.51.63.49.63-.49,6.03-3.51.63-.49V12V6.49l-.63-.49ZM12,18.49L7.3,15.7V10.3l4.7,2.79,4.7-2.79v5.4Zm0-8.3L7.3,7.4,12,4.6l4.7,2.79-4.7,2.79Z"/>
    </svg>
);
