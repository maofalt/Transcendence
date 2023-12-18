// Importing Three.js
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';

let ball, paddle1, paddle2, scene, camera, renderer, controls;
let paddleSpeed = 0.05;
let distWall1 = 1.5;
let distWall2 = -1.5;
let paddleWidth = 1;
let paddleHeight = 0.3;
let paddleThickness = 0.05;
let ballSpeed = { x: 0.01, y: 0.01, z: 0.01 };
let ballInitialPosition = { x: 0, y: 0.1, z: 0 };

// State of the keys for paddle control
const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
};

// Limits for paddle movement along the z-axis
const paddleBounds = {
    minZ: -1.2, // Minimum z position
    maxZ: 1.2   // Maximum z position
};


function initGameElements() {
    // Create and add paddles
    const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleThickness);
    // const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
    const paddleMaterial1 = new THREE.MeshBasicMaterial({ color: 0xfffff, transparent: false, opacity: 1 });
    const paddleMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffff0f, transparent: false, opacity: 1 });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);
    scene.add(paddle1);
    scene.add(paddle2);
    
    // Position paddles
    paddle1.position.set(-2.5, 0.1, 0); 
    paddle2.position.set(2.5, 0.1, 0); 
    paddle1.rotation.y = Math.PI / 2; // Rotate paddle to face the opponent
    paddle2.rotation.y = -Math.PI / 2; // Rotate paddle to face the opponent

    // Create and add ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 25, 25);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Create walls for the court
    const wallGeometry = new THREE.BoxGeometry(5, 0.2, 0.05); // Modify according to court dimensions
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: false, opacity: 1 });

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);

    wall1.position.set(0, 0, distWall1); // Back wall fond
    wall2.position.set(0, 0, distWall2);  // Front Wall

    scene.add(wall1);
    scene.add(wall2);
}

function addLights() {
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(0, 1, 1);
    scene.add(mainLight);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
}


function addCenterLine() {
    // Create the points of the line
    const points = [];
    points.push(new THREE.Vector3(0, 0, -1.5)); // Start point at the back wall
    points.push(new THREE.Vector3(0, 0, 1.5));  // End point at the front wall

    // Create the geometry of the line from the points
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create the material of the line as dashed
    const lineMaterial = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 0.1, // The size of the dash
        gapSize: 0.1   // The size of the gap between dashes
    });

    // Create the line with the geometry and material
    const line = new THREE.Line(lineGeometry, lineMaterial);

    // Compute the line distances to enable dashed line
    line.computeLineDistances();

    // Add the line to the scene
    scene.add(line);
}


function initPong3D() {
    const canvas = document.querySelector('#c');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 4, 0); // Position camera slightly above the center of the court
    camera.lookAt(new THREE.Vector3(0, 0, 0)); // Camera should look towards the center of the court

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    initGameElements();
    addLights();
    addCenterLine();
    drawAxes()

    // Event listeners for keyboard keys
    document.addEventListener('keydown', (event) => {
        keysPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        keysPressed[event.key] = false;
    });

    // Event listener for the "Start" button
    document.getElementById('startButton').addEventListener('click', resetBall);
    
    // Ensure the code is executed once the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initPong3D);


    // Start the rendering loop
    renderer.setAnimationLoop(() => {
        updateGame(); // Update game logic
        renderer.render(scene, camera);
    });
}

// Function to handle paddle movement
function handlePaddleMovement() {
    if (keysPressed['ArrowDown'] && paddle2.position.z < paddleBounds.maxZ) {
        paddle2.position.z += paddleSpeed; // Move paddle1 up
    }
    if (keysPressed['ArrowUp'] && paddle2.position.z > paddleBounds.minZ) {
        paddle2.position.z -= paddleSpeed; // Move paddle1 down
    }
    if (keysPressed['s'] && paddle1.position.z < paddleBounds.maxZ) {
        paddle1.position.z += paddleSpeed; // Move paddle2 up
    }
    if (keysPressed['w'] && paddle1.position.z > paddleBounds.minZ) {
        paddle1.position.z -= paddleSpeed; // Move paddle2 down
    }
}

// Function to reset the ball to the initial position
function resetBall() {
    // Vitesse constante pour la balle
    const speed = 0.01;

    // Choisir aléatoirement la direction sur l'axe X (gauche ou droite)
    ballSpeed.x = Math.random() > 0.5 ? speed : -speed;

    // Vitesse constante sur l'axe Z
    ballSpeed.z = speed; // Ou -speed si vous voulez aussi inverser la direction sur l'axe Z

    // Réinitialiser la position de la balle
    ball.position.set(0, 0.1, 0);
}

// Function to handle ball movement and collisions
function handleBallMovement() {
    ball.position.x += ballSpeed.x;
    ball.position.z += ballSpeed.z;
    let deltaWall = 0.1;
    const paddleDepthHalf = paddleWidth / 2; // La largeur de la raquette devient la profondeur après rotation
    const paddleHeightHalf = paddleHeight / 2;

    // Collision with walls
    if (ball.position.z > distWall1 - deltaWall || ball.position.z < distWall2 + deltaWall) {
        ballSpeed.z = -ballSpeed.z;
    }

    const ballRadius = 0.05;

	// Check for collision with the right paddle (paddle2-yellow)
	if (ballSpeed.x > 0 && 
		ball.position.x + ballRadius >= paddle2.position.x - 0.025 && // Demi-épaisseur de la raquette
		ball.position.x - ballRadius <= paddle2.position.x + 0.025 && 
		ball.position.z >= paddle2.position.z - paddleDepthHalf && 
		ball.position.z <= paddle2.position.z + paddleDepthHalf) {
		ballSpeed.x = -ballSpeed.x;
	}

	// Check for collision with the left paddle (paddle1-blue)
	if (ballSpeed.x < 0 && 
		ball.position.x - ballRadius <= paddle1.position.x + 0.025 && // Demi-épaisseur de la raquette
		ball.position.x + ballRadius >= paddle1.position.x - 0.025 && 
		ball.position.z >= paddle1.position.z - paddleDepthHalf && 
		ball.position.z <= paddle1.position.z + paddleDepthHalf) {
		ballSpeed.x = -ballSpeed.x;
	}
}

function updateGame() {
    handlePaddleMovement();
    handleBallMovement();
    controls.update();
}

function drawAxes() {
    // Longueur des axes
    const axisLength = 2;

    // Axe X en rouge
    const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
    scene.add(arrowX);

    // Axe Y en vert
    const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
    scene.add(arrowY);

    // Axe Z en bleu
    const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);
    scene.add(arrowZ);
}


initPong3D();


// let ball, renderer, scene, camera;
// let ballSpeed = { x: 0, y: 0, z: 0 };
// const ballMaxSpeed = 0.05; // Max speed of the ball

// // Initializes and returns the renderer with antialiasing and shadow map enabled.
// function initRenderer(canvas) {
//     const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
//     renderer.shadowMap.enabled = true;
//     return renderer;
// }

// // Sets up and returns a perspective camera.
// function initCamera(canvas) {
//     const fov = 60; // Field of View
//     const aspect = canvas.clientWidth / canvas.clientHeight; // Aspect Ratio
//     const near = 0.1; // Near clipping plane
//     const far = 5; // Far clipping plane
//     const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//     camera.position.z = 2; // Positioning the camera
//     return camera;
// }

// // Adds a directional light to the scene.
// function addLight(scene) {
//     const light = new THREE.DirectionalLight(0xffffff, 1); // White light, intensity: 1
//     light.position.set(-1, 2, 4); // Light position
//     light.castShadow = true; // Enabling shadow casting
//     scene.add(light);
// }

// // Creates and returns a ball (sphere) mesh.
// function createBall() {
//     const radius = 0.06; // Radius of the sphere
//     const widthSegments = 32; // Number of horizontal segments
//     const heightSegments = 32; // Number of vertical segments
//     const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
//     const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 }); // Material color
//     const ball = new THREE.Mesh(geometry, material);
//     ball.castShadow = true; // Ball casts shadows
//     return ball;
// }

// // Creates and returns a ground plane mesh.
// function createGroundPlane() {
//     const planeGeometry = new THREE.PlaneGeometry(5, 5); // Size of the plane
//     const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Material color
//     const plane = new THREE.Mesh(planeGeometry, planeMaterial);
//     plane.rotation.x = -Math.PI / 2; // Rotating to lay flat
//     plane.receiveShadow = true; // Plane receives shadows
//     return plane;
// }

// // Fonction pour démarrer le mouvement de la balle
// function startBall() {
//     // Générer des vitesses aléatoires pour chaque axe
//     ballSpeed.x = (Math.random() - 0.5) * ballMaxSpeed * 2;
//     ballSpeed.y = (Math.random() - 0.5) * ballMaxSpeed * 2;
//     ballSpeed.z = (Math.random() - 0.5) * ballMaxSpeed * 2;
// }

// // Ajouter un écouteur d'événement sur le bouton "Start"
// document.getElementById('startButton').addEventListener('click', startBall);

// // Animation loop: updates the ball's rotation and renders the scene.
// function render(time) {
//     time *= 0.001; // Convert time to seconds

//     ball.position.x += ballSpeed.x;
//     ball.position.y += ballSpeed.y;
//     ball.position.z += ballSpeed.z;

//     // Gérer les rebonds sur les bords de la scène
//     if (ball.position.x > 2 || ball.position.x < -2) {
//         ballSpeed.x = -ballSpeed.x;
//     }
//     if (ball.position.y > 2 || ball.position.y < -2) {
//         ballSpeed.y = -ballSpeed.y;
//     }
//     if (ball.position.z > 2 || ball.position.z < -2) {
//         ballSpeed.z = -ballSpeed.z;
//     }

//     renderer.render(scene, camera); // Render the scene
//     requestAnimationFrame(render); // Request the next frame
// }

// // Adjusts the camera and renderer size when the window is resized.
// window.addEventListener('resize', onWindowResize, false);

// function onWindowResize() {
//     camera.aspect = window.innerWidth / window.innerHeight; // Update the aspect ratio
//     camera.updateProjectionMatrix(); // Update the projection matrix
//     renderer.setSize(window.innerWidth, window.innerHeight); // Adjust the size
// }

// // Main function to set up the scene.
// function main() {
//     const canvas = document.querySelector('#c'); // Select the canvas element
//     renderer = initRenderer(canvas); // Initialize the renderer
//     camera = initCamera(canvas); // Initialize the camera
//     scene = new THREE.Scene(); // Create a new scene

//     addLight(scene); // Add light to the scene
//     ball = createBall(); // Create the ball
//     scene.add(ball); // Add the ball to the scene

//     const plane = createGroundPlane(); // Create the ground plane
//     scene.add(plane); // Add the ground plane to the scene

//     requestAnimationFrame(render); // Start the animation loop
// }

// main();