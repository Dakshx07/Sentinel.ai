import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from './ToastContext';
import { BrainCircuitIcon, ErrorIcon, SettingsIcon, SpinnerIcon } from './icons';
import { isApiKeySet, refactorCode, isDemoMode } from '../services/geminiService';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Declare globals
declare global {
    interface Window {
        hljs: any;
        ReactApexCharts: any;
    }
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
    const highlightedCode = useMemo(() => {
        if (window.hljs && code) {
            try {
                return window.hljs.highlight(code, { language, ignoreIllegals: true }).value;
            } catch (e) { return code; }
        }
        return code;
    }, [code, language]);

    return (
        <pre className="bg-light-primary dark:bg-dark-primary p-4 rounded-md text-sm font-mono border border-gray-200 dark:border-white/10 h-full overflow-auto">
            <code dangerouslySetInnerHTML={{ __html: highlightedCode || ' ' }} />
        </pre>
    );
};

const createTextSprite = (message: string) => {
    const fontface = 'Inter';
    const fontsize = 24;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = `Bold ${fontsize}px ${fontface}`;
    
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    canvas.width = textWidth + 10;
    canvas.height = fontsize + 10;
    context.font = `Bold ${fontsize}px ${fontface}`;
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillText(message, 5, fontsize);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 50, canvas.height / 50, 1.0);
    return sprite;
};

const CodeGraphVisualizer: React.FC<{ graphData: { nodes: Array<{ id: string, size: number }> } }> = ({ graphData }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mountRef.current || typeof THREE === 'undefined' || graphData.nodes.length === 0) return;

        const currentMount = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.innerHTML = '';
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        const nodes = [];
        const group = new THREE.Group();
        
        const baseSize = 0.2;
        const maxSize = 1.0;
        const allSizes = graphData.nodes.map(n => n.size);
        const minSize = Math.min(...allSizes);
        const maxSizeVal = Math.max(...allSizes);

        graphData.nodes.forEach(nodeData => {
            const size = baseSize + ((nodeData.size - minSize) / (maxSizeVal - minSize + 1)) * (maxSize - baseSize);
            const nodeGeometry = new THREE.SphereGeometry(size, 32, 32);
            const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x9F54FF, emissive: 0x00D4FF, shininess: 80 });
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            
            const label = createTextSprite(nodeData.id);
            label.position.set(node.position.x, node.position.y + size + 0.3, node.position.z);
            
            group.add(node);
            group.add(label);
            nodes.push(node);
        });
        
        scene.add(group);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x00D4FF, 1, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        camera.position.z = 10;

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();
        
        const handleResize = () => {
             if (!currentMount) return;
             camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
             camera.updateProjectionMatrix();
             renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        }

    }, [graphData]);
    
    if (graphData.nodes.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-medium-dark-text dark:text-medium-text">Enter code to visualize its structure.</div>
    }

    return <div ref={mountRef} className="w-full h-full min-h-[200px] rounded-lg cursor-grab" />;
};


const generateCodeGraph = (code: string): { nodes: Array<{ id: string, size: number }> } => {
    if (!code) return { nodes: [] };
    const functionRegex = /(?:def|function|class)\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*=\s*(?:async)?\s*\([^)]*\)\s*=>/g;
    const nodes: { [key: string]: { id: string, size: number } } = {};
    const lines = code.split('\n');
    let currentFunction: string | null = null;
    let functionBody = '';

    lines.forEach(line => {
        const match = functionRegex.exec(line);
        if (match) {
            if (currentFunction && functionBody) {
                nodes[currentFunction] = { id: currentFunction, size: functionBody.length };
            }
            currentFunction = match[1] || match[2];
            functionBody = '';
        } else if (currentFunction) {
            functionBody += line;
        }
    });

    if (currentFunction && functionBody) {
        nodes[currentFunction] = { id: currentFunction, size: functionBody.length };
    }
    
    if (Object.keys(nodes).length === 0 && code.trim().length > 0) {
        return { nodes: [{ id: 'main', size: code.length }] };
    }

    return { nodes: Object.values(nodes) };
};

const RefactorSimulator: React.FC<{ onNavigateToSettings: () => void }> = ({ onNavigateToSettings }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [apiKeyMissing, setApiKeyMissing] = useState(false);
    const [inputCode, setInputCode] = useState(`def get_product(product_id):\n    # VULNERABILITY: Direct string formatting for SQL query\n    product = conn.execute(f"SELECT * FROM products WHERE id = '{product_id}'").fetchone()\n    return product`);
    const [refactoredCode, setRefactoredCode] = useState<string | null>(null);
    const [language, setLanguage] = useState('python');

    const ReactApexChart = window.ReactApexCharts;

    useEffect(() => {
        setApiKeyMissing(!isApiKeySet() && !isDemoMode());
    }, []);

    const handleRefactor = async () => {
        if (apiKeyMissing) {
            addToast('Please set your Gemini API Key in Settings to use this feature, or enable Demo Mode.', 'error');
            return;
        }
        const trimmedInput = inputCode.trim();
        if (!trimmedInput) {
            addToast('Please enter some code to refactor.', 'warning');
            return;
        }

        setIsLoading(true);
        setRefactoredCode(null);
        try {
            const result = await refactorCode(inputCode, language);
            setRefactoredCode(result);
            addToast('Code refactored successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'An error occurred during refactoring.', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const originalGraph = useMemo(() => generateCodeGraph(inputCode), [inputCode]);
    const refactoredGraph = useMemo(() => refactoredCode ? generateCodeGraph(refactoredCode) : { nodes: [] }, [refactoredCode]);
    const complexityReduction = useMemo(() => {
        if (!refactoredCode) return 0;
        const originalComplexity = originalGraph.nodes.reduce((sum, n) => sum + n.size, 0);
        const newComplexity = refactoredGraph.nodes.reduce((sum, n) => sum + n.size, 0);
        if (originalComplexity === 0) return 0;
        return Math.round(((originalComplexity - newComplexity) / originalComplexity) * 100);
    }, [originalGraph, refactoredGraph, refactoredCode]);


    const chartOptions = {
        series: [Math.max(0, complexityReduction)],
        chart: { type: 'radialBar', height: 250, background: 'transparent' },
        plotOptions: {
          radialBar: {
            hollow: { margin: 15, size: '70%' },
            dataLabels: {
              name: { show: true, fontSize: '16px', color: '#A4A4C8', offsetY: -10, fontFamily: 'Syne, sans-serif' },
              value: { show: true, fontSize: '32px', color: document.documentElement.classList.contains('dark') ? '#FFFFFF' : '#1F2937', offsetY: 10, fontFamily: 'Syne, sans-serif', fontWeight: 'bold', formatter: (val: number) => `${val}%` },
            },
          },
        },
        labels: ['Complexity Reduction'],
        colors: ['#00D4FF'],
        stroke: { lineCap: 'round' as const },
        fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', shadeIntensity: 0.5, gradientToColors: ['#9F54FF'], inverseColors: true, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } },
    };

    if (apiKeyMissing) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 glass-effect rounded-lg">
                <div className="text-center">
                     <ErrorIcon className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
                     <h3 className="text-lg font-bold text-dark-text dark:text-white font-heading">Gemini API Key Required</h3>
                     <p className="mt-2 text-medium-dark-text dark:text-medium-text max-w-sm">Please set your API key in the AI Agent Settings to enable the refactor simulator.</p>
                     <button onClick={onNavigateToSettings} className="mt-6 flex items-center justify-center btn-primary mx-auto">
                        <SettingsIcon className="w-5 h-5 mr-2" />
                        Go to Settings
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full flex flex-col space-y-4 animate-fade-in-up">
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold text-dark-text dark:text-white font-heading">AI Refactor Simulator</h1>
                <p className="mt-1 text-medium-dark-text dark:text-medium-text">Paste code to see how Sentinel's AI improves its security and visualize its structure.</p>
            </div>
            
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
                 <div className="lg:col-span-5 glass-effect rounded-lg p-4 flex flex-col">
                    <h2 className="text-xl font-bold font-heading mb-3 text-dark-text dark:text-white flex-shrink-0">Input Code</h2>
                    <textarea
                        className="w-full flex-grow bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 font-mono text-sm text-dark-text dark:text-light-text focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Paste your code here..."
                    />
                </div>
                <div className="lg:col-span-2 glass-effect rounded-lg p-4 flex flex-col justify-between items-center text-center">
                     <h2 className="text-xl font-bold font-heading text-dark-text dark:text-white">Control Deck</h2>
                     <div className="my-4">
                        <label htmlFor="language-select" className="block text-sm font-medium text-medium-dark-text dark:text-medium-text mb-1">Language</label>
                        <select id="language-select" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-light-primary dark:bg-dark-primary border border-gray-300 dark:border-white/10 rounded-md p-2 text-sm">
                            <option value="python">Python</option>
                            <option value="typescript">TypeScript</option>
                            <option value="hcl">Terraform (HCL)</option>
                            <option value="javascript">JavaScript</option>
                        </select>
                     </div>
                     <button onClick={handleRefactor} disabled={isLoading} className="btn-primary py-3 px-6 w-full text-lg flex items-center justify-center disabled:opacity-50">
                        {isLoading ? <SpinnerIcon className="w-6 h-6" /> : <><BrainCircuitIcon className="w-6 h-6 mr-3" />Refactor</>}
                    </button>
                    <div className="w-full max-w-xs mx-auto mt-4">
                        {ReactApexChart && <ReactApexChart options={chartOptions} series={chartOptions.series} type="radialBar" height={220} />}
                    </div>
                </div>
                 <div className="lg:col-span-5 glass-effect rounded-lg p-4 flex flex-col">
                     <h2 className="text-xl font-bold font-heading mb-3 text-dark-text dark:text-white flex-shrink-0">AI Refactored Code</h2>
                     <div className="flex-grow h-full min-h-[200px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-brand-purple" /></div>
                        ) : (
                           <CodeBlock code={refactoredCode || "// Refactored code will appear here..."} language={language} />
                        )}
                     </div>
                </div>
            </div>

             <div className="flex-shrink-0 glass-effect rounded-lg p-4 flex flex-col h-64">
                <h3 className="text-lg font-bold font-heading mb-2 text-dark-text dark:text-white text-center flex-shrink-0">Code Structure Graph</h3>
                <div className="flex-grow w-full h-full">
                    <CodeGraphVisualizer graphData={refactoredCode ? refactoredGraph : originalGraph} />
                </div>
            </div>
        </div>
    );
};

export default RefactorSimulator;