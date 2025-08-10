/**
 * VIB34D Holographic Background System
 * 
 * This class creates and manages a Three.js WebGL scene to render an interactive,
 * audio-reactive particle background.
 */
class HolographicBackground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Holographic container not found!');
            return;
        }

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.mouse = new THREE.Vector2();

        // Audio state
        this.audioInitialized = false;
        this.lastAudioUpdate = 0;

        this.init();
    }

    /**
     * Initializes the scene, camera, renderer, and event listeners.
     */
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 5;

        this.createParticles();
        this.addLights();

        // Event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        document.addEventListener('mousemove', this.onMouseMove.bind(this), false);

        this.animate();
    }

    /**
     * Creates the particle system that forms the holographic effect.
     */
    createParticles() {
        const particles = 5000;
        this.geometry = new THREE.BufferGeometry();
        const positions = [];

        for (let i = 0; i < particles; i++) {
            positions.push((Math.random() - 0.5) * 10);
            positions.push((Math.random() - 0.5) * 10);
            positions.push((Math.random() - 0.5) * 10);
        }

        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.originalPositions = this.geometry.attributes.position.clone(); // Store original positions for audio reactivity

        const material = new THREE.PointsMaterial({
            color: 0x00f6ff,
            size: 0.02,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particleSystem = new THREE.Points(this.geometry, material);
        this.scene.add(this.particleSystem);
    }

    /**
     * Adds point lights to the scene to illuminate the particles.
     */
    addLights() {
        const light1 = new THREE.PointLight(0x00f6ff, 1, 100);
        light1.position.set(0, 0, 2);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff00ff, 1, 100);
        light2.position.set(0, 0, -2);
        this.scene.add(light2);
    }

    /**
     * Initializes the Web Audio API to get microphone input.
     */
    initAudio() {
        if (this.audioInitialized) return;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.audioContext.createAnalyser();
                const source = this.audioContext.createMediaStreamSource(stream);
                source.connect(this.analyser);
                this.analyser.fftSize = 256;
                this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
                this.audioInitialized = true;
                console.log('Audio initialized successfully.');
            })
            .catch(err => {
                console.error('Error initializing audio:', err);
                alert('Microphone access denied. Audio features will be disabled.');
            });
    }

    /**
     * Updates particle positions and size based on audio frequency data.
     * This function is called within the animation loop.
     */
    updateAudio() {
        if (!this.audioInitialized) return;

        this.analyser.getByteFrequencyData(this.frequencyData);
        const positions = this.geometry.attributes.position.array;
        const originalPos = this.originalPositions.array;

        let bass = this.frequencyData[0] / 255;
        let mid = this.frequencyData[Math.floor(this.frequencyData.length / 2)] / 255;

        // Update particle positions based on audio
        for (let i = 0; i < positions.length; i += 3) {
            const audioValue = this.frequencyData[i % this.frequencyData.length] / 255;
            const displacement = audioValue * (bass * 0.5 + mid * 0.2);
            positions[i] = originalPos[i] + (originalPos[i] * displacement);
            positions[i+1] = originalPos[i+1] + (originalPos[i+1] * displacement);
            positions[i+2] = originalPos[i+2] + (originalPos[i+2] * displacement);
        }
        this.geometry.attributes.position.needsUpdate = true;

        // Update particle size based on bass
        this.particleSystem.material.size = 0.02 + (bass * 0.03);
    }

    /**
     * The main animation loop.
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.0001;
        this.particleSystem.rotation.y = time;

        if (this.audioInitialized) {
            this.updateAudio();
        }

        // Mouse interaction
        this.camera.position.x += (this.mouse.x - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouse.y - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Sets the color of the particle system.
     * @param {number} color - The color in hexadecimal format (e.g., 0xff0000).
     */
    setColor(color) {
        this.particleSystem.material.color.set(color);
    }

    /**
     * Handles window resize events.
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Handles mouse move events.
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}

// Make the holographic background instance globally available
window.holographicBg = new HolographicBackground('holographic-background');

