import React, { useState } from 'react';
import { BrainCircuitIcon, BoltIcon, CpuChipIcon } from './icons';

type Feature = 'analysis' | 'fixes' | 'cicd';

const AnimatedFeatureShowcase: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState<Feature>('analysis');
    
    const features = [
        { id: 'analysis' as Feature, title: 'Deep Code Analysis', icon: <BrainCircuitIcon className="w-6 h-6"/>, description: "Sentinel's AI goes beyond static checks, understanding your code's context and logic to find vulnerabilities others miss." },
        { id: 'fixes' as Feature, title: 'Instant, Actionable Fixes', icon: <BoltIcon className="w-6 h-6"/>, description: "Don't just find problems—fix them. Get immediate, production-ready code suggestions to resolve issues in seconds." },
        { id: 'cicd' as Feature, title: 'Seamless CI/CD Integration', icon: <CpuChipIcon className="w-6 h-6"/>, description: "Integrate Sentinel directly into your pipeline to automate security reviews and block vulnerabilities before they are merged." }
    ];
    
    const renderVisualization = () => {
        const baseLineClasses = "absolute h-1 bg-brand-cyan/50 rounded-full transition-all duration-500";
        const lineHighlightClasses = "absolute h-1 bg-brand-cyan rounded-full";
        
        switch (activeFeature) {
            case 'analysis':
                return (
                    <div className="relative w-full h-48 bg-dark-secondary p-4 rounded-lg font-mono text-sm text-gray-400 overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-2 bg-brand-purple/50 animate-pulse-slow"></div>
                        <p>&gt; Analyzing <span className="text-brand-cyan">app.py</span>...</p>
                        <p className="opacity-80">&gt; Parsing abstract syntax tree...</p>
                        <p className="opacity-60">&gt; Checking data flow for SQL injection...</p>
                        <p className="mt-4 text-red-400 font-bold">&gt; VULNERABILITY FOUND: SQL Injection on line 15.</p>
                    </div>
                );
            case 'fixes':
                 return (
                    <div className="relative w-full h-48 bg-dark-secondary p-4 rounded-lg font-mono text-sm text-gray-400 overflow-hidden flex space-x-4">
                        <div className="w-1/2 border-r-2 border-dashed border-red-500/50 pr-2">
                             <p className="text-red-400">// Before</p>
                             <p>query = f"SELECT * FROM products</p>
                             <p>{`WHERE id = '{product_id}'`}</p>
                        </div>
                         <div className="w-1/2">
                            <p className="text-green-400">// After (Secure)</p>
                             <p>query = "SELECT * FROM products</p>
                             <p>WHERE id = ?"</p>
                             <p>{`conn.execute(query, (product_id,))`}</p>
                        </div>
                    </div>
                );
            case 'cicd':
                 return (
                    <div className="relative w-full h-48 bg-dark-secondary p-4 rounded-lg font-mono text-sm text-gray-400 overflow-hidden flex items-center justify-around">
                        <span className="text-green-400">✅ Commit</span>
                        <div className={`${baseLineClasses} w-1/4 left-1/4 top-1/2`}>
                            <div className={`${lineHighlightClasses} w-full origin-left animate-[scaleX_1s_ease-out_forwards]`} style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-brand-cyan">🤖 Sentinel Scan</span>
                        <div className={`${baseLineClasses} w-1/4 left-2/4 top-1/2`}>
                             <div className={`${lineHighlightClasses} w-full origin-left animate-[scaleX_1s_ease-out_forwards]`} style={{animationDelay: '1.2s'}}></div>
                        </div>
                        <span className="text-green-400">🚀 Deploy</span>
                        <style>{`@keyframes scaleX { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
                    </div>
                );
            default: return null;
        }
    };
    
    return(
        <section className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-1 space-y-4">
                    {features.map(feature => (
                        <button key={feature.id} onClick={() => setActiveFeature(feature.id)}
                            className={`w-full text-left p-6 rounded-lg transition-all duration-300 border-2 ${activeFeature === feature.id ? 'bg-dark-secondary border-brand-purple' : 'bg-transparent border-dark-secondary hover:bg-dark-secondary/50'}`}>
                           <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-md transition-colors duration-300 ${activeFeature === feature.id ? 'bg-brand-purple' : 'bg-dark-primary'}`}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{feature.title}</h3>
                                    <p className="text-sm text-medium-text mt-1">{feature.description}</p>
                                </div>
                           </div>
                        </button>
                    ))}
                </div>
                <div className="lg:col-span-2 min-h-[300px] flex items-center justify-center">
                    {renderVisualization()}
                </div>
            </div>
        </section>
    );
};

export default AnimatedFeatureShowcase;
