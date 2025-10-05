import React from 'react';
import { AppView, DashboardView } from '../types';
import { GithubIcon, SentinelLogoIcon, PythonIcon, ReactIcon, NodeJSIcon, AWSIcon, DockerIcon, TerraformIcon, GoogleGeminiIcon } from './icons';
import HeroAnimation from './HeroAnimation';
import AnimatedFeatureShowcase from './AnimatedFeatureShowcase';
import InteractiveThreatMap from './InteractiveThreatMap';

const useAnimateOnScroll = (options?: IntersectionObserverInit) => {
    const ref = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, ...options });

        const currentRef = ref.current;
        if (currentRef) {
            const elements = currentRef.querySelectorAll('.scroll-animate');
            elements.forEach(el => observer.observe(el));
        }

        return () => {
            if (currentRef) {
                const elements = currentRef.querySelectorAll('.scroll-animate');
                elements.forEach(el => observer.unobserve(el));
            }
        };
    }, [options]);

    return ref;
};


const HeroSection: React.FC<{ onNavigate: (view: DashboardView) => void }> = ({ onNavigate }) => (
    <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden bg-dark-primary">
        <HeroAnimation />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-primary via-dark-primary/50 to-transparent"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white font-heading uppercase tracking-wider animate-fade-in-up">
               Your Digital <span className="gradient-text">Fortress</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-medium-text animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                Sentinel transforms your codebase with AI-driven security, identifying complex vulnerabilities before they ever reach production.
            </p>
            <div className="mt-10 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                 <button 
                    onClick={() => onNavigate('repositories')} 
                    className="btn-primary py-3 px-8 text-lg"
                >
                    Explore The Dashboard
                </button>
            </div>
        </div>
    </section>
);

const TechShowcase: React.FC = () => {
    const sectionRef = useAnimateOnScroll();
    const techLogos = [
        { Icon: PythonIcon, name: "Python" },
        { Icon: ReactIcon, name: "React" },
        { Icon: NodeJSIcon, name: "Node.js" },
        { Icon: AWSIcon, name: "AWS" },
        { Icon: DockerIcon, name: "Docker" },
        { Icon: TerraformIcon, name: "Terraform" },
        { Icon: GithubIcon, name: "GitHub" },
        { Icon: GoogleGeminiIcon, name: "Gemini" }
    ];
    return(
        <section ref={sectionRef} className="py-24 bg-light-secondary dark:bg-dark-secondary">
             <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-dark-text dark:text-white font-heading mb-4 scroll-animate">
                    Powered by Cutting-Edge Technology
                </h2>
                <p className="max-w-2xl mx-auto text-medium-dark-text dark:text-medium-text mb-16 scroll-animate" style={{ transitionDelay: '150ms' }}>
                    Leveraging the power of Google's Gemini and supporting the tools you already use.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
                    {techLogos.map(({ Icon, name }, i) => (
                        <div key={name} className="scroll-animate group" style={{ transitionDelay: `${100 + i * 50}ms` }}>
                            <div className="relative aspect-square flex items-center justify-center rounded-2xl bg-light-primary dark:bg-dark-primary p-4 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-brand-purple/20">
                                <Icon className="h-12 w-12 text-medium-dark-text dark:text-medium-text transition-all duration-300 group-hover:text-brand-cyan" />
                                <div className="absolute -inset-px rounded-2xl border-2 border-transparent transition-all duration-300 opacity-0 group-hover:opacity-100" style={{
                                    background: 'radial-gradient(400px circle at 50% 50%, rgba(0, 212, 255, 0.2), transparent 80%)',
                                    borderColor: 'rgba(0, 212, 255, 0.3)'
                                }}></div>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-medium-dark-text dark:text-medium-text transition-colors duration-300 group-hover:text-dark-text dark:group-hover:text-white">{name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LandingPage: React.FC<{ onNavigate: (view: AppView | DashboardView) => void }> = ({ onNavigate }) => {
  return (
    <>
      <main className="overflow-x-hidden font-sans bg-dark-primary">
        <HeroSection onNavigate={onNavigate} />
        <div className="relative bg-light-secondary dark:bg-dark-primary pt-24">
            <AnimatedFeatureShowcase />
        </div>
        <InteractiveThreatMap />
        <TechShowcase />
      </main>
       <footer className="bg-dark-primary text-light-text relative overflow-hidden">
         <div className="absolute inset-0 w-full h-full opacity-30 animate-aurora" style={{
             backgroundImage: 'radial-gradient(50% 100% at 0% 100%, #9F54FF, transparent), radial-gradient(50% 100% at 50% 0%, #00D4FF, transparent), radial-gradient(50% 100% at 100% 100%, #9F54FF, transparent)',
             backgroundSize: '300% 100%'
         }}></div>
        <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-3">
                    <SentinelLogoIcon className="w-6 h-auto"/>
                    <span className="font-bold text-lg font-heading">Sentinel AI</span>
                </div>
                <div className="flex space-x-6 text-sm mt-6 md:mt-0">
                     <a href="#features" className="relative group">
                         <span>Features</span>
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all duration-300 group-hover:w-full"></span>
                     </a>
                     <a href="#" onClick={(e)=>{ e.preventDefault(); onNavigate('pricing'); }} className="relative group">
                         <span>Pricing</span>
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all duration-300 group-hover:w-full"></span>
                     </a>
                     <a href="#" onClick={(e)=>{ e.preventDefault(); onNavigate('studio'); }} className="relative group">
                         <span>Launch Studio</span>
                         <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-cyan transition-all duration-300 group-hover:w-full"></span>
                     </a>
                </div>
                 <div className="flex space-x-4 mt-6 md:mt-0">
                    <a href="#" className="text-medium-text hover:text-white transition-transform hover:scale-110"><GithubIcon className="w-5 h-5"/></a>
                 </div>
            </div>
             <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-medium-text">
                <p>&copy; 2024 Sentinel AI. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
