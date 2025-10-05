
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User, DashboardView } from '../types';
import { useTheme } from './ThemeContext';
import { MoonIcon, SunIcon, ChevronDownIcon, SentinelLogoIcon, SettingsIcon, GithubIcon } from './icons';

interface HeaderProps {
  currentView: AppView;
  user: User;
  onNavigate: (view: AppView | DashboardView) => void;
  repoCount: number;
  autoReviewCount: number;
}

const UserMenu: React.FC<{ user: User; onNavigate: (view: DashboardView) => void; repoCount: number; autoReviewCount: number; }> = ({ user, onNavigate, repoCount, autoReviewCount }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <img src={user.avatarUrl} alt="User Avatar" className="w-8 h-8 rounded-full bg-dark-secondary" />
                <span className="hidden sm:inline font-semibold text-dark-text dark:text-light-text">{user.username}</span>
                <ChevronDownIcon className={`w-4 h-4 text-medium-dark-text dark:text-medium-text transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div 
                className={`absolute right-0 mt-3 w-64 origin-top-right transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
                <div className="glass-effect rounded-md shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex items-center space-x-3">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full bg-dark-secondary flex-shrink-0" />
                        <div className="overflow-hidden">
                             <p className="text-sm text-dark-text dark:text-light-text font-semibold truncate">{user.username}</p>
                             <p className="text-xs text-medium-dark-text dark:text-medium-text truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                        <p className="text-xs uppercase font-bold text-medium-dark-text dark:text-medium-text mb-2">Demo Stats</p>
                        <div className="flex justify-between text-sm">
                           <div className="text-center">
                                <p className="font-bold text-lg text-dark-text dark:text-white">{repoCount}</p>
                                <p className="text-xs text-medium-dark-text dark:text-medium-text">Repos Tracked</p>
                           </div>
                           <div className="text-center">
                                <p className="font-bold text-lg text-dark-text dark:text-white">{autoReviewCount}</p>
                                <p className="text-xs text-medium-dark-text dark:text-medium-text">Auto-Reviews</p>
                           </div>
                           <div className="text-center">
                                <p className="font-bold text-lg text-dark-text dark:text-white">{user.github?.public_repos || 0}</p>
                                <p className="text-xs text-medium-dark-text dark:text-medium-text">Public Repos</p>
                           </div>
                        </div>
                    </div>
                    <div className="py-1">
                        <button onClick={() => { onNavigate('settings'); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-gray-100 dark:hover:bg-white/5">
                           <SettingsIcon className="w-4 h-4 mr-3" /> Settings
                        </button>
                        {user.github && (
                             <a href={user.github.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-gray-100 dark:hover:bg-white/5">
                                <GithubIcon className="w-4 h-4 mr-3" /> View GitHub Profile
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavLink: React.FC<{ href?: string; onClick?: () => void; children: React.ReactNode }> = ({ href, onClick, children }) => (
    <a 
      href={href} 
      onClick={e => { e.preventDefault(); onClick?.(); }} 
      className="relative text-medium-dark-text dark:text-medium-text hover:text-dark-text dark:hover:text-light-text transition-colors group px-2 py-1"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-purple to-brand-cyan transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </a>
);


const Header: React.FC<HeaderProps> = ({ currentView, user, onNavigate, repoCount, autoReviewCount }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-light-primary/80 dark:bg-dark-primary/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="w-full mx-auto px-6 lg:px-12 flex justify-between items-center h-16">
        <button onClick={() => onNavigate('landing')} className="flex items-center space-x-3">
          <SentinelLogoIcon className="w-6 h-auto" />
          <h1 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Sentinel</h1>
        </button>
        
        {currentView === 'landing' && (
          <nav className="hidden md:flex items-center space-x-6 font-sans">
            <NavLink href="#features">Features</NavLink>
            <NavLink onClick={() => onNavigate('pricing')}>Pricing</NavLink>
            <NavLink href="#why-sentinel">Why Sentinel?</NavLink>
          </nav>
        )}

        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-medium-dark-text dark:text-medium-text hover:text-dark-text dark:hover:text-white transition-colors">
            {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => onNavigate('studio')}
            className="hidden md:inline-block btn-outline"
          >
            <span>Launch Studio</span>
          </button>
          
          <button 
              onClick={() => onNavigate('dashboard')}
              className="btn-primary py-2 px-5"
          >
              Dashboard
          </button>

          <UserMenu user={user} onNavigate={onNavigate} repoCount={repoCount} autoReviewCount={autoReviewCount} />
        </div>
      </div>
    </header>
  );
};

export default Header;