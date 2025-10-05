import React, { useState, useEffect } from 'react';
import { SentinelLogoIcon } from './icons';

const ANALYSIS_STEPS = [
    'Initializing Sentinel AI...',
    'Parsing Code Structure...',
    'Analyzing Data Flows...',
    'Checking for Vulnerabilities...',
    'Compiling Security Report...',
];

interface AnalysisLoaderProps {
    progressText?: string;
}

const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ progressText }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (progressText) return; // Don't cycle if there's specific progress text

        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % ANALYSIS_STEPS.length);
        }, 2000); // Change step every 2 seconds
        return () => clearInterval(interval);
    }, [progressText]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-medium-dark-text dark:text-medium-text">
            <div className="relative w-24 h-24">
                <SentinelLogoIcon className="w-full h-full animate-pulse-slow" />
                <div className="absolute inset-0 border-2 border-brand-purple rounded-full animate-scanner-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-dark-text dark:text-light-text font-heading mt-6">
                 {progressText ? 'Scanning Repository' : 'Analyzing Code'}
            </h3>
            {progressText ? (
                <p className="mt-2 text-sm text-dark-text dark:text-light-text font-mono w-full max-w-sm px-2 truncate" title={progressText}>
                    {progressText}
                </p>
            ) : (
                <div className="w-full max-w-xs h-6 mt-2 overflow-hidden">
                    <div className="transition-transform duration-500" style={{ transform: `translateY(-${currentStep * 1.5}rem)` }}>
                        {ANALYSIS_STEPS.map((step, index) => (
                            <p key={index} className="h-6 leading-6 text-center">{step}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisLoader;