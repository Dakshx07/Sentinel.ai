import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// SVG path data for logos. In a real app, you might load these from files.
const SVG_DATA = {
    python: 'M12 24a12 12 0 1 1 0-24 12 12 0 0 1 0 24zM8.41 4.5H12v3.89H8.41V4.5zm0 15v-3.89H12V19.5H8.41zM4.5 8.41V12h3.9V8.41H4.5zm15 0V12h-3.9V8.41H19.5zM8.41 12v3.89h7.18c2.14 0 3.89-1.75 3.89-3.89V8.41h-3.89v3.59H8.41zm11.09-7.18V12h-3.89V8.41c0-2.14-1.75-3.89-3.89-3.89H8.41V4.5h3.59c2.14 0 3.89 1.75 3.89 3.89z',
    react: 'M12 2.05c-6.1 0-11 4.95-11 11s4.9 11 11 11 11-4.95 11-11-4.9-11-11-11zm0 20c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm-1-11h2v2h-2v-2zm-4 0h2v2h-2v-2zm8 0h2v2h-2v-2z M12 4.05c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z',
    node: 'M11.75 23.11l-5.63-3.26-.04-6.52 5.67 3.28v6.5zm.5-22.22l-5.63 3.26v6.52l5.63-3.26V.89zm.5 15.72l-5.63-3.26v-6.5l5.63 3.26v6.5zm6.13-2.5V8.52l-5.06-2.93v2.5l3.56 2.06v3.28l-3.56-2.06v2.54l5.06 2.93z',
    aws: 'M12.353 17.522c-.282 0-.55-.02-.803-.058l-.06-.013c-2.348-.52-4.22-2.126-5.12-4.184-.9-2.06-1.02-4.48-.32-6.683C6.75 4.38 8.87 2.98 11.453 2.98c2.14 0 4.012.988 5.118 2.537.47.66.68 1.482.62 2.293l-.12 1.625c-.06.77-.33 1.503-.78 2.106-.44.603-1.06 1.05-1.78 1.303-.72.253-1.5.29-2.26.11l-1.51-.357c-.5-.116-.85-.568-.78-1.085.07-.518.52-.876 1.03-.76l1.51.358c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.624c.03-.43-.07-.86-.28-1.24-.62-1.12-1.89-1.81-3.32-1.81-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01zm-3.23 2.54c-.26 0-.52-.02-.77-.06l-.06-.01c-2.35-.49-4.24-2.04-5.15-4.09-.92-2.05-1.04-4.47-.34-6.66C3.5 7.04 5.62 5.64 8.2 5.64c2.15 0 4.02.99 5.12 2.54.47.66.68 1.48.62 2.29l-.12 1.62c-.06.78-.33 1.51-.78 2.11-.44.6-1.06 1.05-1.78 1.3-.72.25-1.5.29-2.26.11l-1.51-.35c-.5-.12-.85-.57-.78-1.09.07-.51.52-.87 1.03-.76l1.51.35c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.62c.03-.43-.07-.86-.28-1.24-.62-1.11-1.89-1.8-3.32-1.8-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01zM20.894 8.942c-.28 0-.55-.02-.8-.06l-.06-.01c-2.35-.49-4.24-2.04-5.15-4.09-.92-2.05-1.04-4.47-.34-6.66.7-2.2 2.82-3.6 5.4-3.6 2.15 0 4.02.99 5.12 2.54.47.66.68 1.48.62 2.29l-.12 1.62c-.06.78-.33 1.51-.78 2.11-.44.6-1.06 1.05-1.78 1.3-.72.25-1.5.29-2.26.11l-1.51-.35c-.5-.12-.85-.57-.78-1.09.07-.51.52-.87 1.03-.76l1.51.35c.39.09.77.07 1.13-.06.37-.13.68-.36.9-.66.23-.3.37-.65.4-.99l.12-1.62c.03-.43-.07-.86-.28-1.24-.62-1.11-1.89-1.8-3.32-1.8-1.85 0-3.41.97-4.04 2.52-.46 1.5-2.04-3.57 2.1-4.72 1.12.63 1.93 1.7 2.3 2.98.37 1.28.3 2.65-.2 3.92-.5 1.27-1.42 2.33-2.62 3.01-.19.1-.38.19-.57.27l-.02.01z',
    docker: 'M22.128 9.142c-.24-.216-.576-.324-.936-.324h-2.1V6.91c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324h-1.908V3.54c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324h-1.908V1.75c0-.36-.108-.684-.324-.936a1.116 1.116 0 0 0-.936-.324H3.252c-.36 0-.684.108-.936.324a1.116 1.116 0 0 0-.324.936v11.724c.216.612.684 1.08 1.3 1.3.612.216 1.284.108 1.8-.288l.216-.156c.3-.216.66-.36 1.056-.408.384-.048.768 0 1.128.156.36.156.66.408.876.744.216.336.324.708.324 1.104v.276c0 .276.084.528.228.744.144.216.36.36.6.444.252.084.504.108.744.108.216 0 .444-.024.66-.084.3-.084.552-.228.744-.444.192-.216.288-.468.288-.744v-.276c0-.384.108-.744.324-1.056.216-.312.528-.528.876-.66.36-.132.72-.156 1.092-.108.36.048.7.192 1.008.408l.252.192c.516.396 1.176.504 1.8.288.612-.216 1.08-.684 1.3-1.3V10.68c0-.468-.156-.9-.444-1.284a2.1 2.1 0 0 1-.252.252zM12.292 7.026h-1.908c-.36 0-.684.108-.936.324-.252.216-.324.552-.324.936v1.908c0 .384.108.684.324.936.252.252.576.324.936.324h1.908c.36 0 .684-.108.936-.324.252-.252.324-.552.324-.936V8.286c0-.384-.072-.72-.324-.936a1.116 1.116 0 0 0-.936-.324zm2.1 0h-1.908V5.118h1.908c.36 0 .684.108.936.324.252.252.324.576.324.936v.636h-1.284zm-2.1 4.128h-1.908V9.246h1.908v1.908zm4.2 0h-1.908V9.246h1.908c.36 0 .684.108.936.324.252.252.324.576.324.936v.636h-1.284zm-4.2 2.1h-1.908v-1.908h1.908v1.908z',
    terraform: 'M13.42 22.035h-3.11L5.97 19.32V4.95L11.82 1.95v12.015l-5.85-2.73V8.805l5.85 3.015v10.215zm-.29-20.07L18.03 4.95v14.37l-4.9-2.715V1.965z',
    github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297 24 5.67 18.627.297 12 .297z'
};

const TechStackAnimation: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 12;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.innerHTML = '';
        currentMount.appendChild(renderer.domElement);

        const group = new THREE.Group();
        scene.add(group);

        const centerGeometry = new THREE.IcosahedronGeometry(2, 1);
        const centerMaterial = new THREE.MeshPhongMaterial({ color: 0x9F54FF, emissive: 0x00D4FF, shininess: 50, specular: 0x111111, flatShading: true });
        const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
        group.add(centerMesh);

        const loader = new SVGLoader();
        const iconMeshes: THREE.Group[] = [];
        const techKeys = Object.keys(SVG_DATA);

        techKeys.forEach((key, i) => {
            const svgMarkup = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${(SVG_DATA as any)[key]}"/></svg>`;
            const data = loader.parse(svgMarkup);
            const paths = data.paths;
            const iconGroup = new THREE.Group();
            
            for (let j = 0; j < paths.length; j++) {
                const path = paths[j];
                const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
                const shapes = SVGLoader.createShapes(path);
                for (let k = 0; k < shapes.length; k++) {
                    const shape = shapes[k];
                    const geometry = new THREE.ShapeGeometry(shape);
                    const mesh = new THREE.Mesh(geometry, material);
                    iconGroup.add(mesh);
                }
            }

            const scale = 0.03;
            iconGroup.scale.set(scale, -scale, scale);
            iconGroup.position.set(-0.7, 0.7, 0);

            const pivot = new THREE.Group();
            pivot.add(iconGroup);
            group.add(pivot);

            const angle = (i / techKeys.length) * Math.PI * 2;
            const radius = 6;
            pivot.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 4, Math.sin(angle) * radius);
            iconMeshes.push(pivot);
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const pointLight1 = new THREE.PointLight(0x00D4FF, 1);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);

        const onMouseMove = (event: MouseEvent) => {
            mousePos.current.x = (event.clientX / window.innerWidth) - 0.5;
            mousePos.current.y = (event.clientY / window.innerHeight) - 0.5;
        };
        window.addEventListener('mousemove', onMouseMove);

        let animationFrameId: number;
        const clock = new THREE.Clock();
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            group.rotation.y += (mousePos.current.x * 0.5 - group.rotation.y) * 0.05 + 0.001;
            group.rotation.x += (mousePos.current.y * 0.5 - group.rotation.x) * 0.05;

            centerMesh.rotation.x += 0.005;
            centerMesh.rotation.y += 0.005;

            iconMeshes.forEach((pivot, i) => {
                const angle = (i / techKeys.length) * Math.PI * 2 + elapsedTime * 0.3;
                const radius = 6;
                pivot.position.x = Math.cos(angle) * radius;
                pivot.position.z = Math.sin(angle) * radius;
                pivot.lookAt(camera.position);
            });

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

    return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default TechStackAnimation;
