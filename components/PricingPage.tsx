import React from 'react';
import { AppView, DashboardView } from '../types';
import { CheckIcon, XIcon } from './icons';

interface PricingPageProps {
  onNavigate: (view: AppView | DashboardView) => void;
}

const FeatureRow = ({ feature, free, team, enterprise }: { feature: string, free: boolean | string, team: boolean | string, enterprise: boolean | string }) => (
    <tr className="border-b border-gray-200 dark:border-white/10 last:border-b-0">
        <td className="py-4 px-6 text-left text-medium-dark-text dark:text-medium-text">{feature}</td>
        <td className="py-4 px-6 text-center">
            {typeof free === 'string' ? <span className="text-dark-text dark:text-light-text">{free}</span> : free ? <CheckIcon className="w-6 h-6 text-brand-cyan mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 dark:text-medium-text/50 mx-auto" />}
        </td>
        <td className="py-4 px-6 text-center">
            {typeof team === 'string' ? <span className="text-dark-text dark:text-light-text">{team}</span> : team ? <CheckIcon className="w-6 h-6 text-brand-cyan mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 dark:text-medium-text/50 mx-auto" />}
        </td>
        <td className="py-4 px-6 text-center">
            {typeof enterprise === 'string' ? <span className="text-dark-text dark:text-light-text">{enterprise}</span> : enterprise ? <CheckIcon className="w-6 h-6 text-brand-cyan mx-auto" /> : <XIcon className="w-6 h-6 text-gray-400 dark:text-medium-text/50 mx-auto" />}
        </td>
    </tr>
);

const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
    return (
        <main className="pt-24 pb-12 font-sans">
            <section className="max-w-7xl mx-auto px-6">
                <h1 className="text-4xl md:text-6xl font-extrabold text-dark-text dark:text-white text-center font-heading">Transparent Pricing</h1>
                <p className="text-lg text-medium-dark-text dark:text-medium-text text-center max-w-2xl mx-auto mt-4 mb-16">Choose a plan that scales with your team's needs.</p>
                
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Free Plan */}
                    <div className="glass-effect p-8 rounded-lg border-transparent dark:border-white/10 flex flex-col transition-all duration-300 hover:border-brand-cyan/50 hover:-translate-y-2">
                        <h3 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Free</h3>
                        <p className="text-medium-dark-text dark:text-medium-text mt-2 flex-grow">For individuals and open-source projects.</p>
                        <p className="text-5xl font-bold text-dark-text dark:text-white my-6">$0 <span className="text-lg font-normal text-medium-dark-text dark:text-medium-text">/ month</span></p>
                        <button onClick={() => onNavigate('repositories')} className="w-full bg-light-secondary dark:bg-dark-primary hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-dark-text dark:text-white font-semibold py-3 px-4 rounded-md transition-colors">Get Started</button>
                    </div>
                    {/* Team Plan */}
                    <div className="glass-effect p-8 rounded-lg border-2 border-brand-purple flex flex-col relative transition-all duration-300 hover:-translate-y-2 shadow-2xl shadow-brand-purple/20">
                        <span className="absolute top-0 -translate-y-1/2 bg-brand-purple text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
                        <h3 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Team</h3>
                        <p className="text-medium-dark-text dark:text-medium-text mt-2 flex-grow">For professional teams building commercial software.</p>
                        <p className="text-5xl font-bold text-dark-text dark:text-white my-6">$10 <span className="text-lg font-normal text-medium-dark-text dark:text-medium-text">/ user / mo</span></p>
                        <button onClick={() => onNavigate('repositories')} className="w-full btn-primary py-3">Start Free Trial</button>
                    </div>
                    {/* Enterprise Plan */}
                    <div className="glass-effect p-8 rounded-lg border-transparent dark:border-white/10 flex flex-col transition-all duration-300 hover:border-brand-cyan/50 hover:-translate-y-2">
                        <h3 className="text-2xl font-bold text-dark-text dark:text-white font-heading">Enterprise</h3>
                        <p className="text-medium-dark-text dark:text-medium-text mt-2 flex-grow">For large organizations with advanced security and compliance needs.</p>
                        <p className="text-5xl font-bold text-dark-text dark:text-white my-6">Custom</p>
                        <a href="mailto:sales@sentinel-ai.example" className="block text-center w-full bg-light-secondary dark:bg-dark-primary hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-dark-text dark:text-white font-semibold py-3 px-4 rounded-md transition-colors">Contact Sales</a>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 mt-24">
                <h2 className="text-4xl font-bold text-dark-text dark:text-white text-center font-heading mb-12">Feature Comparison</h2>
                <div className="max-w-6xl mx-auto glass-effect rounded-lg border-transparent dark:border-white/10 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-white/5">
                            <tr>
                                <th className="py-4 px-6 text-left font-semibold text-dark-text dark:text-white font-heading uppercase tracking-wider">Features</th>
                                <th className="py-4 px-6 font-semibold text-dark-text dark:text-white font-heading uppercase tracking-wider">Free</th>
                                <th className="py-4 px-6 font-semibold text-dark-text dark:text-white font-heading uppercase tracking-wider">Team</th>
                                <th className="py-4 px-6 font-semibold text-dark-text dark:text-white font-heading uppercase tracking-wider">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            <FeatureRow feature="Public Repositories" free="Unlimited" team="Unlimited" enterprise="Unlimited" />
                            <FeatureRow feature="Private Repositories" free={false} team={true} enterprise={true} />
                            <FeatureRow feature="Users" free="1" team="Up to 50" enterprise="Custom" />
                            <FeatureRow feature="Core AI Analysis" free={true} team={true} enterprise={true} />
                            <FeatureRow feature="Contextual Code Analysis" free={false} team={true} enterprise={true} />
                            <FeatureRow feature="CI/CD Integration" free={false} team={true} enterprise={true} />
                            <FeatureRow feature="SAML/SSO Integration" free={false} team={false} enterprise={true} />
                            <FeatureRow feature="On-Premise Deployment" free={false} team={false} enterprise={true} />
                            <FeatureRow feature="Priority Support" free={false} team={false} enterprise={true} />
                            <FeatureRow feature="Compliance Reporting" free={false} team={false} enterprise={true} />
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
};

export default PricingPage;