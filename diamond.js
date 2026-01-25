// Diamond Animation using Three.js (loaded globally)
(function() {
    'use strict';

let scene, camera, renderer, diamond;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;

let starParticles = [];
let rainbowLights = [];

function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createStars() {
    const nearStarGeometry = new THREE.BufferGeometry();
    const nearCount = 200;
    const nearPositions = new Float32Array(nearCount * 3);

    for (let i = 0; i < nearCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 3 + Math.random() * 4;
        const height = (Math.random() - 0.5) * 6;

        nearPositions[i * 3] = Math.cos(angle) * radius;
        nearPositions[i * 3 + 1] = height;
        nearPositions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    nearStarGeometry.setAttribute('position', new THREE.BufferAttribute(nearPositions, 3));

    const nearStarMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: createStarTexture()
    });

    const nearStars = new THREE.Points(nearStarGeometry, nearStarMaterial);
    scene.add(nearStars);
    starParticles.push(nearStars);

    const farStarGeometry = new THREE.BufferGeometry();
    const farCount = 1000;
    const farPositions = new Float32Array(farCount * 3);

    for (let i = 0; i < farCount; i++) {
        farPositions[i * 3] = (Math.random() - 0.5) * 100;
        farPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        farPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    farStarGeometry.setAttribute('position', new THREE.BufferAttribute(farPositions, 3));

    const farStarMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        map: createStarTexture()
    });

    const farStars = new THREE.Points(farStarGeometry, farStarMaterial);
    scene.add(farStars);
    starParticles.push(farStars);
}

function createDiamondGeometry() {
    const geometry = new THREE.BufferGeometry();

    const vertices = [
        0.000000, 0.184831, -0.671749, -0.000000, 0.324953, -0.406888, 0.287713, 0.324953, -0.287713,
        0.474998, 0.184831, -0.474998, 0.474998, 0.184831, -0.474998, 0.287713, 0.324953, -0.287713,
        0.406888, 0.324953, 0.000000, 0.671749, 0.184831, -0.000000, 0.671749, 0.184831, -0.000000,
        0.406888, 0.324953, 0.000000, 0.287713, 0.324953, 0.287713, 0.474998, 0.184831, 0.474998,
        0.474998, 0.184831, 0.474998, 0.287713, 0.324953, 0.287713, -0.000000, 0.324953, 0.406888,
        0.000000, 0.184831, 0.671749, 0.000000, 0.184831, 0.671749, -0.000000, 0.324953, 0.406888,
        -0.287713, 0.324953, 0.287713, -0.474998, 0.184831, 0.474998, -0.474998, 0.184831, 0.474998,
        -0.287713, 0.324953, 0.287713, -0.406888, 0.324953, 0.000000, -0.671749, 0.184831, -0.000000,
        0.406888, 0.324953, 0.000000, 0.287713, 0.324953, -0.287713, -0.000000, 0.324953, -0.406888,
        -0.287713, 0.324953, -0.287713, -0.406888, 0.324953, 0.000000, -0.287713, 0.324953, 0.287713,
        -0.000000, 0.324953, 0.406888, 0.287713, 0.324953, 0.287713, -0.671749, 0.184831, -0.000000,
        -0.406888, 0.324953, 0.000000, -0.287713, 0.324953, -0.287713, -0.474998, 0.184831, -0.474998,
        -0.474998, 0.184831, -0.474998, -0.287713, 0.324953, -0.287713, -0.000000, 0.324953, -0.406888,
        0.000000, 0.184831, -0.671749, 0, -0.897451, 0.168572, -0.119198, -0.897451, 0.119198,
        -0.006220, -1.091505, 0.006220, 0.000000, -1.091505, 0.008797, -0.168572, -0.897451, 0,
        -0.119198, -0.897451, -0.119198, -0.006220, -1.091505, -0.006220, -0.008797, -1.091505, 0.000000,
        0.119198, -0.897451, -0.119198, 0.168572, -0.897451, 0, 0.008797, -1.091505, 0.000000,
        0.006220, -1.091505, -0.006220, 0.119198, -0.897451, 0.119198, 0, -0.897451, 0.168572,
        0.000000, -1.091505, 0.008797, 0.006220, -1.091505, 0.006220, -0.119198, -0.897451, 0.119198,
        -0.168572, -0.897451, 0, -0.008797, -1.091505, 0.000000, -0.006220, -1.091505, 0.006220,
        -0.119198, -0.897451, -0.119198, 0, -0.897451, -0.168572, 0.000000, -1.091505, -0.008797,
        -0.006220, -1.091505, -0.006220, 0, -0.897451, -0.168572, 0.119198, -0.897451, -0.119198,
        0.006220, -1.091505, -0.006220, 0.000000, -1.091505, -0.008797, 0.168572, -0.897451, 0,
        0.119198, -0.897451, 0.119198, 0.006220, -1.091505, 0.006220, 0.008797, -1.091505, 0.000000,
        -0.328708, -0.041833, -0.793571, -0.000000, -0.041833, -0.788509, 0, -0.897451, -0.168572,
        -0.328708, -0.041833, -0.793571, -0.328708, -0.001523, -0.793571, -0.000000, -0.001523, -0.788509,
        -0.000000, -0.041833, -0.788509, 0.000000, 0.184831, -0.671749, -0.000000, -0.001523, -0.788509,
        -0.328708, -0.001523, -0.793571, -0.793571, -0.041833, -0.328708, -0.557560, -0.041833, -0.557560,
        -0.119198, -0.897451, -0.119198, -0.793571, -0.041833, -0.328708, -0.793571, -0.001523, -0.328708,
        -0.557560, -0.001523, -0.557560, -0.557560, -0.041833, -0.557560, -0.474998, 0.184831, -0.474998,
        -0.557560, -0.001523, -0.557560, -0.793571, -0.001523, -0.328708, -0.793571, -0.041833, 0.328708,
        -0.788509, -0.041833, 0, -0.168572, -0.897451, 0, -0.793571, -0.041833, 0.328708,
        -0.793571, -0.001523, 0.328708, -0.788509, -0.001523, 0, -0.788509, -0.041833, 0,
        -0.671749, 0.184831, -0.000000, -0.788509, -0.001523, 0, -0.793571, -0.001523, 0.328708,
        -0.328708, -0.041833, 0.793571, -0.557560, -0.041833, 0.557560, -0.119198, -0.897451, 0.119198,
        -0.328708, -0.041833, 0.793571, -0.328708, -0.001523, 0.793571, -0.557560, -0.001523, 0.557560,
        -0.557560, -0.041833, 0.557560, -0.474998, 0.184831, 0.474998, -0.557560, -0.001523, 0.557560,
        -0.328708, -0.001523, 0.793571, 0.328708, -0.041833, 0.793571, -0.000000, -0.041833, 0.788509,
        0, -0.897451, 0.168572, 0.328708, -0.041833, 0.793571, 0.328708, -0.001523, 0.793571,
        -0.000000, -0.001523, 0.788509, -0.000000, -0.041833, 0.788509, 0.000000, 0.184831, 0.671749,
        -0.000000, -0.001523, 0.788509, 0.328708, -0.001523, 0.793571, 0.793571, -0.041833, 0.328708,
        0.557560, -0.041833, 0.557560, 0.119198, -0.897451, 0.119198, 0.793571, -0.041833, 0.328708,
        0.793571, -0.001523, 0.328708, 0.557560, -0.001523, 0.557560, 0.557560, -0.041833, 0.557560,
        0.474998, 0.184831, 0.474998, 0.557560, -0.001523, 0.557560, 0.793571, -0.001523, 0.328708,
        0.793571, -0.041833, -0.328708, 0.788509, -0.041833, 0, 0.168572, -0.897451, 0,
        0.793571, -0.041833, -0.328708, 0.793571, -0.001523, -0.328708, 0.788509, -0.001523, 0,
        0.788509, -0.041833, 0, 0.671749, 0.184831, -0.000000, 0.788509, -0.001523, 0,
        0.793571, -0.001523, -0.328708, 0.328708, -0.041833, -0.793571, 0.557560, -0.041833, -0.557560,
        0.119198, -0.897451, -0.119198, 0.328708, -0.041833, -0.793571, 0.328708, -0.001523, -0.793571,
        0.557560, -0.001523, -0.557560, 0.557560, -0.041833, -0.557560, 0.474998, 0.184831, -0.474998,
        0.557560, -0.001523, -0.557560, 0.328708, -0.001523, -0.793571, -0.000000, -0.041833, -0.788509,
        -0.000000, -0.001523, -0.788509, 0.328708, -0.001523, -0.793571, 0.328708, -0.041833, -0.793571,
        0.557560, -0.041833, -0.557560, 0.557560, -0.001523, -0.557560, 0.793571, -0.001523, -0.328708,
        0.793571, -0.041833, -0.328708, 0.788509, -0.041833, 0, 0.788509, -0.001523, 0,
        0.793571, -0.001523, 0.328708, 0.793571, -0.041833, 0.328708, 0.557560, -0.041833, 0.557560,
        0.557560, -0.001523, 0.557560, 0.328708, -0.001523, 0.793571, 0.328708, -0.041833, 0.793571,
        -0.000000, -0.041833, 0.788509, -0.000000, -0.001523, 0.788509, -0.328708, -0.001523, 0.793571,
        -0.328708, -0.041833, 0.793571, -0.557560, -0.041833, 0.557560, -0.557560, -0.001523, 0.557560,
        -0.793571, -0.001523, 0.328708, -0.793571, -0.041833, 0.328708, -0.788509, -0.041833, 0,
        -0.788509, -0.001523, 0, -0.793571, -0.001523, -0.328708, -0.793571, -0.041833, -0.328708,
        -0.557560, -0.041833, -0.557560, -0.557560, -0.001523, -0.557560, -0.328708, -0.001523, -0.793571,
        -0.328708, -0.041833, -0.793571, 0, -0.897451, -0.168572, -0.119198, -0.897451, -0.119198,
        -0.328708, -0.041833, -0.793571, -0.119198, -0.897451, -0.119198, -0.557560, -0.041833, -0.557560,
        -0.328708, -0.041833, -0.793571, -0.328708, -0.001523, -0.793571, -0.557560, -0.001523, -0.557560,
        -0.474998, 0.184831, -0.474998, -0.474998, 0.184831, -0.474998, 0.000000, 0.184831, -0.671749,
        -0.328708, -0.001523, -0.793571, -0.119198, -0.897451, -0.119198, -0.168572, -0.897451, 0,
        -0.793571, -0.041833, -0.328708, -0.168572, -0.897451, 0, -0.788509, -0.041833, 0,
        -0.793571, -0.041833, -0.328708, -0.793571, -0.001523, -0.328708, -0.788509, -0.001523, 0,
        -0.671749, 0.184831, -0.000000, -0.671749, 0.184831, -0.000000, -0.474998, 0.184831, -0.474998,
        -0.793571, -0.001523, -0.328708, -0.168572, -0.897451, 0, -0.119198, -0.897451, 0.119198,
        -0.793571, -0.041833, 0.328708, -0.119198, -0.897451, 0.119198, -0.557560, -0.041833, 0.557560,
        -0.793571, -0.041833, 0.328708, -0.793571, -0.001523, 0.328708, -0.557560, -0.001523, 0.557560,
        -0.474998, 0.184831, 0.474998, -0.474998, 0.184831, 0.474998, -0.671749, 0.184831, -0.000000,
        -0.793571, -0.001523, 0.328708, -0.119198, -0.897451, 0.119198, 0, -0.897451, 0.168572,
        -0.328708, -0.041833, 0.793571, 0, -0.897451, 0.168572, -0.000000, -0.041833, 0.788509,
        -0.328708, -0.041833, 0.793571, -0.328708, -0.001523, 0.793571, -0.000000, -0.001523, 0.788509,
        0.000000, 0.184831, 0.671749, 0.000000, 0.184831, 0.671749, -0.474998, 0.184831, 0.474998,
        -0.328708, -0.001523, 0.793571, 0, -0.897451, 0.168572, 0.119198, -0.897451, 0.119198,
        0.328708, -0.041833, 0.793571, 0.119198, -0.897451, 0.119198, 0.557560, -0.041833, 0.557560,
        0.328708, -0.041833, 0.793571, 0.328708, -0.001523, 0.793571, 0.557560, -0.001523, 0.557560,
        0.474998, 0.184831, 0.474998, 0.474998, 0.184831, 0.474998, 0.000000, 0.184831, 0.671749,
        0.328708, -0.001523, 0.793571, 0.119198, -0.897451, 0.119198, 0.168572, -0.897451, 0,
        0.793571, -0.041833, 0.328708, 0.168572, -0.897451, 0, 0.788509, -0.041833, 0,
        0.793571, -0.041833, 0.328708, 0.793571, -0.001523, 0.328708, 0.788509, -0.001523, 0,
        0.671749, 0.184831, -0.000000, 0.671749, 0.184831, -0.000000, 0.474998, 0.184831, 0.474998,
        0.793571, -0.001523, 0.328708, 0.168572, -0.897451, 0, 0.119198, -0.897451, -0.119198,
        0.793571, -0.041833, -0.328708, 0.119198, -0.897451, -0.119198, 0.557560, -0.041833, -0.557560,
        0.793571, -0.041833, -0.328708, 0.793571, -0.001523, -0.328708, 0.557560, -0.001523, -0.557560,
        0.474998, 0.184831, -0.474998, 0.474998, 0.184831, -0.474998, 0.671749, 0.184831, -0.000000,
        0.793571, -0.001523, -0.328708, 0.119198, -0.897451, -0.119198, 0, -0.897451, -0.168572,
        0.328708, -0.041833, -0.793571, 0, -0.897451, -0.168572, -0.000000, -0.041833, -0.788509,
        0.328708, -0.041833, -0.793571, 0.328708, -0.001523, -0.793571, -0.000000, -0.001523, -0.788509,
        0.000000, 0.184831, -0.671749, 0.000000, 0.184831, -0.671749, 0.474998, 0.184831, -0.474998,
        0.328708, -0.001523, -0.793571, -0.006220, -1.091505, -0.006220, 0.000000, -1.091505, -0.008797,
        0.006220, -1.091505, -0.006220, 0.008797, -1.091505, 0.000000, 0.006220, -1.091505, 0.006220,
        0.000000, -1.091505, 0.008797, -0.006220, -1.091505, 0.006220, -0.008797, -1.091505, 0.000000
    ];

    const indices = [
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
        12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
        24, 25, 26, 26, 27, 28, 28, 29, 30, 30, 31, 24, 24, 26, 28, 28, 30, 24,
        32, 33, 34, 32, 34, 35, 36, 37, 38, 36, 38, 39, 40, 41, 42, 40, 42, 43,
        44, 45, 46, 44, 46, 47, 48, 49, 50, 48, 50, 51, 52, 53, 54, 52, 54, 55,
        56, 57, 58, 56, 58, 59, 60, 61, 62, 60, 62, 63, 64, 65, 66, 64, 66, 67,
        68, 69, 70, 68, 70, 71, 72, 73, 74, 75, 76, 77, 75, 77, 78, 79, 80, 81,
        82, 83, 84, 85, 86, 87, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
        95, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 105, 107, 108, 109, 110, 111,
        112, 113, 114, 115, 116, 117, 115, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127,
        125, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 135, 137, 138, 139, 140, 141,
        142, 143, 144, 145, 146, 147, 145, 147, 148, 149, 150, 151, 152, 153, 154, 152, 154, 155,
        156, 157, 158, 156, 158, 159, 160, 161, 162, 160, 162, 163, 164, 165, 166, 164, 166, 167,
        168, 169, 170, 168, 170, 171, 172, 173, 174, 172, 174, 175, 176, 177, 178, 176, 178, 179,
        180, 181, 182, 180, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195,
        196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213,
        214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231,
        232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249,
        250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267,
        268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 282, 283, 284,
        284, 285, 286, 286, 287, 280, 280, 282, 284, 284, 286, 280
    ];

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

function init() {
    const container = document.getElementById('container');

    if (!container) {
        console.error('Container element not found! Make sure there is an element with id="container"');
        return;
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    console.log('Three.js Diamond initialized successfully!');

    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
    scene.add(cubeCamera);

    scene.background = new THREE.Color(0x0a0a15);

    const ambientLight = new THREE.AmbientLight(0xffffff, 3.0);
    scene.add(ambientLight);

    // Hauptlicht von oben - stärker für mehr Brillanz
    const mainLight = new THREE.SpotLight(0xffffff, 50);
    mainLight.position.set(0, 10, 0);
    mainLight.angle = Math.PI / 5;
    mainLight.penumbra = 0.2;
    mainLight.decay = 1.5;
    mainLight.distance = 100;
    scene.add(mainLight);

    // Orange Akzentlicht - verstärkt
    const orangeLight = new THREE.SpotLight(0xffaa00, 20);
    orangeLight.position.set(-6, 4, 2);
    orangeLight.angle = Math.PI / 8;
    orangeLight.penumbra = 0.4;
    orangeLight.decay = 2;
    orangeLight.distance = 100;
    scene.add(orangeLight);

    // Grünes Akzentlicht - verstärkt
    const greenLight = new THREE.SpotLight(0x00ff88, 18);
    greenLight.position.set(6, 6, 1);
    greenLight.angle = Math.PI / 8;
    greenLight.penumbra = 0.4;
    greenLight.decay = 2;
    greenLight.distance = 100;
    scene.add(greenLight);

    // Cyan Akzentlicht - verstärkt
    const cyanLight = new THREE.SpotLight(0x00ffff, 20);
    cyanLight.position.set(2, 3, 6);
    cyanLight.angle = Math.PI / 7;
    cyanLight.penumbra = 0.3;
    cyanLight.decay = 2;
    cyanLight.distance = 100;
    scene.add(cyanLight);

    // Magenta Akzentlicht - verstärkt
    const magentaLight = new THREE.SpotLight(0xff00ff, 18);
    magentaLight.position.set(-3, 2, -4);
    magentaLight.angle = Math.PI / 8;
    magentaLight.penumbra = 0.5;
    magentaLight.decay = 2;
    magentaLight.distance = 100;
    scene.add(magentaLight);

    // Bodenlicht - verstärkt
    const bottomLight = new THREE.SpotLight(0xffffff, 50);
    bottomLight.position.set(0, -6, 0);
    bottomLight.angle = Math.PI / 4;
    bottomLight.penumbra = 0.1;
    bottomLight.decay = 1.5;
    bottomLight.distance = 100;
    scene.add(bottomLight);

    // Zusätzliche PointLights für Regenbogen-Reflexionen
    const rainbowLight1 = new THREE.PointLight(0xff0080, 15, 20);
    rainbowLight1.position.set(4, 2, 4);
    scene.add(rainbowLight1);
    rainbowLights.push(rainbowLight1);

    const rainbowLight2 = new THREE.PointLight(0x0080ff, 15, 20);
    rainbowLight2.position.set(-4, 2, -4);
    scene.add(rainbowLight2);
    rainbowLights.push(rainbowLight2);

    const rainbowLight3 = new THREE.PointLight(0x00ff80, 12, 20);
    rainbowLight3.position.set(0, 4, -4);
    scene.add(rainbowLight3);
    rainbowLights.push(rainbowLight3);

    mainLight.target.position.set(0, 0, 0);
    orangeLight.target.position.set(0, 0, 0);
    greenLight.target.position.set(0, 0, 0);
    cyanLight.target.position.set(0, 0, 0);
    magentaLight.target.position.set(0, 0, 0);
    bottomLight.target.position.set(0, 0, 0);

    scene.add(mainLight.target);
    scene.add(orangeLight.target);
    scene.add(greenLight.target);
    scene.add(cyanLight.target);
    scene.add(magentaLight.target);
    scene.add(bottomLight.target);

    const geometry = createDiamondGeometry();

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.4,
        transmission: 0.85,
        thickness: 4.0,
        ior: 2.417,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        side: THREE.DoubleSide,
        envMap: cubeRenderTarget.texture,
        envMapIntensity: 80.0,
        sheen: 12.0,
        sheenColor: 0xffffff,
        sheenRoughness: 0.2,
        specularIntensity: 15.0,
        specularColor: 0xffffff,
        attenuationColor: 0xffffff,
        attenuationDistance: 0.3,
        iridescence: 1.0,
        iridescenceIOR: 2.2,
        iridescenceThicknessRange: [400, 1400]
    });

    diamond = new THREE.Mesh(geometry, material);
    diamond.rotation.x = 0.2;
    diamond.position.y = 0.3;
    scene.add(diamond);

    diamond.visible = false;
    cubeCamera.position.copy(diamond.position);
    cubeCamera.update(renderer, scene);
    diamond.visible = true;

    createStars();

    document.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    targetRotationY = mouseX * Math.PI;
    targetRotationX = mouseY * Math.PI * 0.3;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    if (diamond) {
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;

        diamond.rotation.y = currentRotationY + time * 0.2;
        diamond.rotation.x = 0.2 + currentRotationX;

        diamond.position.y = 0.3 + Math.sin(time) * 0.1;
    }

    starParticles.forEach((stars, index) => {
        stars.rotation.y = time * 0.03 * (index + 1);

        const pulseSpeed = 1.5 + index * 0.5;
        const pulseOffset = index * Math.PI;
        const baseSize = index === 0 ? 0.1 : 0.15;
        stars.material.size = baseSize + Math.sin(time * pulseSpeed + pulseOffset) * baseSize * 0.4;

        stars.material.opacity = 0.7 + Math.sin(time * pulseSpeed * 1.2 + pulseOffset) * 0.3;
    });

    // Animiere die Regenbogen-Lichter für dynamische Reflexionen
    rainbowLights.forEach((light, index) => {
        const angle = time * 0.5 + (index * Math.PI * 2 / 3);
        const radius = 5;
        light.position.x = Math.cos(angle) * radius;
        light.position.z = Math.sin(angle) * radius;
        light.position.y = 2 + Math.sin(time + index) * 1;
    });

    renderer.render(scene, camera);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        animate();
    });
} else {
    init();
    animate();
}

})(); // End of IIFE
