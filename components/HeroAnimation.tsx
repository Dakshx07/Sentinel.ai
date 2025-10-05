import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HeroAnimation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || typeof THREE === 'undefined') return;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 8;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);
        
        const group = new THREE.Group();
        scene.add(group);

        // Core
        const coreGeometry = new THREE.IcosahedronGeometry(1.5, 5);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: 0x9F54FF,
            emissive: 0x00D4FF,
            shininess: 100,
            specular: 0xffffff,
            flatShading: true
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        
        // Shield
        const shieldGeometry = new THREE.IcosahedronGeometry(3.5, 3);
        const wireframe = new THREE.WireframeGeometry(shieldGeometry);
        const shieldMaterial = new THREE.LineBasicMaterial({
            color: 0x00D4FF,
            linewidth: 1,
            transparent: true,
            opacity: 0.3
        });
        const shield = new THREE.LineSegments(wireframe, shieldMaterial);
        group.add(shield);

        // Handle Mouse Move
        const onMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePos.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        // Animation loop
        let animationFrameId: number;
        const clock = new THREE.Clock();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            group.rotation.y += (mousePos.current.x * 0.1 - group.rotation.y) * 0.02 + 0.001;
            group.rotation.x += (mousePos.current.y * 0.1 - group.rotation.x) * 0.02;

            // Pulsating core
            const pulse = Math.sin(elapsedTime * 2) * 0.1 + 0.9;
            core.scale.set(pulse, pulse, pulse);
            (core.material as THREE.MeshPhongMaterial).emissiveIntensity = Math.sin(elapsedTime * 2) * 0.5 + 0.5;

            // Evolving shield
            shield.rotation.y += 0.002;
            shield.rotation.x -= 0.001;
            
            renderer.render(scene, camera);
        };
        animate();

        // Handle Resize
        const handleResize = () => {
             if (!currentMount) return;
             camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
             camera.updateProjectionMatrix();
             renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
        window.addEventListener('resize', handleResize);


        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };

    }, []);

    return (
        <div 
            ref={mountRef} 
            className="absolute top-0 left-0 w-full h-full z-0" 
        />
    );
};

export default HeroAnimation;
