import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const InteractiveThreatMap: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 15;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.innerHTML = '';
        currentMount.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        // Globe
        const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
        const globeMaterial = new THREE.MeshPhongMaterial({
            color: 0x0A0A1F,
            shininess: 10,
            transparent: true,
            opacity: 0.9,
        });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        group.add(globe);

        // Add wireframe overlay for continents
        const wireframeGeo = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5.05, 3));
        const wireframeMat = new THREE.LineBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.1 });
        const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
        group.add(wireframe);

        // Add shield
        const shieldGeo = new THREE.SphereGeometry(6, 32, 32);
        const shieldMat = new THREE.MeshBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide,
        });
        const shield = new THREE.Mesh(shieldGeo, shieldMat);
        group.add(shield);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);

        // Threats
        const threats: { mesh: THREE.Mesh, curve: THREE.QuadraticBezierCurve3, progress: number }[] = [];
        const createThreat = () => {
            const startPoint = new THREE.Vector3().setFromSphericalCoords(5.1, Math.PI * Math.random(), Math.PI * 2 * Math.random());
            const endPoint = new THREE.Vector3().setFromSphericalCoords(5.1, Math.PI * Math.random(), Math.PI * 2 * Math.random());
            const midPoint = startPoint.clone().lerp(endPoint, 0.5).normalize().multiplyScalar(5.1 + Math.random() * 3);
            const curve = new THREE.QuadraticBezierCurve3(startPoint, midPoint, endPoint);

            const threatGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const threatMat = new THREE.MeshBasicMaterial({ color: 0xff4d4d });
            const threatMesh = new THREE.Mesh(threatGeo, threatMat);
            
            threats.push({ mesh: threatMesh, curve, progress: 0 });
            group.add(threatMesh);
        };
        
        setInterval(createThreat, 1000);

        const onMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / window.innerWidth) - 0.5;
            mousePos.current.y = (event.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', onMouseMove);

        let animationFrameId: number;
        const clock = new THREE.Clock();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();

            group.rotation.y += (mousePos.current.x * 0.2 - group.rotation.y) * 0.05 + 0.0005;
            
            for(let i = threats.length - 1; i >= 0; i--) {
                const threat = threats[i];
                threat.progress += delta * 0.5;
                if (threat.progress >= 1) {
                    group.remove(threat.mesh);
                    threats.splice(i, 1);
                } else {
                    threat.curve.getPoint(threat.progress, threat.mesh.position);
                }
            }

            shield.material.opacity = Math.sin(clock.getElapsedTime() * 2) * 0.05 + 0.1;

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!currentMount) return;
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };

    }, []);
    
    return (
        <section className="relative h-[600px] w-full bg-dark-primary flex flex-col items-center justify-center text-center px-6 overflow-hidden">
             <div ref={mountRef} className="absolute inset-0 z-0" />
             <div className="relative z-10 max-w-3xl mx-auto">
                 <h2 className="text-4xl md:text-5xl font-bold text-white font-heading animate-fade-in-up">Global Threat Intelligence</h2>
                 <p className="mt-4 text-lg text-medium-text max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    Sentinel is constantly updated with the latest vulnerability patterns, ensuring your code is protected against emerging threats from around the world.
                 </p>
             </div>
        </section>
    );
};

export default InteractiveThreatMap;
