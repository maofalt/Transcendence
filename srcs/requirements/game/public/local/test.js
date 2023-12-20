// Importing Three.js
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js';
// import { TextSprite } from '@seregpie/three.text-sprite';

let ball, paddle1, paddle2, scene, camera, renderer, controls, victoryMessageMesh;
let victoryMessageShown = false;

const gameSettings = {
    paddleSpeed: 0.05,
    distWall1: 1.5,
    distWall2: -1.5,
    wallWidth: 5,
    wallHeight: 0.05,
    maxPoints: 5
};

const paddleSettings = {
    width: 1,
    height: 0.3,
    thickness: 0.05
};

const score = {
    player1: 0,
    player2: 0
};

const ballSettings = {
    speed: { x: 0.2, y: 0, z: 0.2 },
    initialPosition: { x: 0, y: 0.1, z: 0 }
};

// State of the keys for paddle control
const keysPressed = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
};

// Limits for paddle movement along the z-axis
const paddleBounds = {
    minZ: gameSettings.distWall2 + (paddleSettings.width / 2), // Minimum z position
    maxZ: gameSettings.distWall1 - (paddleSettings.width / 2)   // Maximum z position
};

// let sprite = new THREE.TextSprite( {
//     text: 'Text must be rendered here...',
//     alignment: 'center',
//     fontFamily: 'Arial, Helvetica, sans-serif',
//     fontSize: 28,
//     color: '#ffffff' } );

function initGameElements() {
    // Create and add paddles
    const paddleGeometry = new THREE.BoxGeometry(paddleSettings.width, paddleSettings.height, paddleSettings.thickness);
    // const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
    const paddleMaterial1 = new THREE.MeshBasicMaterial({ color: 0xfff, transparent: false, opacity: 1 });
    const paddleMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffff0f, transparent: false, opacity: 1 });
    paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);
    scene.add(paddle1);
    scene.add(paddle2);
    
    // Position paddles
    let xPos = gameSettings.wallWidth / 2;
    paddle1.position.set(- xPos, 0, 0); 
    paddle2.position.set(xPos, 0, 0); 
    paddle1.rotation.y = Math.PI / 2; // Rotate paddle to face the opponent
    paddle2.rotation.y = -Math.PI / 2; // Rotate paddle to face the opponent

    // Create and add ball
    const ballGeometry = new THREE.SphereGeometry(0.1, 25, 25);
    const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    // Create walls for the court
    const wallGeometry = new THREE.BoxGeometry(gameSettings.wallWidth, gameSettings.wallHeight, gameSettings.wallHeight); // Modify according to court dimensions
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: false, opacity: 1 });

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);

    wall1.position.set(0, 0, gameSettings.distWall1); // Back wall fond
    wall2.position.set(0, 0, gameSettings.distWall2);  // Front Wall

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
    document.getElementById('startButton').addEventListener('click', resetGame);
    
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
        paddle2.position.z += gameSettings.paddleSpeed; // Move paddle1 up
    }
    if (keysPressed['ArrowUp'] && paddle2.position.z > paddleBounds.minZ) {
        paddle2.position.z -= gameSettings.paddleSpeed; // Move paddle1 down
    }
    if (keysPressed['s'] && paddle1.position.z < paddleBounds.maxZ) {
        paddle1.position.z += gameSettings.paddleSpeed; // Move paddle2 up
    }
    if (keysPressed['w'] && paddle1.position.z > paddleBounds.minZ) {
        paddle1.position.z -= gameSettings.paddleSpeed; // Move paddle2 down
    }
}

function adjustBallSpeedOnCollision(paddle, isPaddle1) {
    const difference = ball.position.z - paddle.position.z;
    const normalizedDifference = difference / (paddleSettings.width / 2);
    let angle = normalizedDifference * Math.PI / 4; // Angle varie entre -45° et +45°

    if (!isPaddle1) {
        angle = -angle;
    }

    ballSettings.speed.x = -ballSettings.speed.x;
    ballSettings.speed.z = ballSettings.speed.x * Math.tan(angle);
}

function resetBall(lastPointLostByPlayer1) {
    // Constant speed for the ball
    const speed = ballSettings.speed.x;

    // Launch the ball in the direction of the player who lost the last point
    ballSettings.speed.x = lastPointLostByPlayer1 ? -speed : speed;

    // Constant speed on the Z axis
    ballSettings.speed.z = speed;

    // Reset the ball position
    ball.position.set(ballSettings.initialPosition.x, ballSettings.initialPosition.y, ballSettings.initialPosition.z);
}

// Function to reset the ball to the initial position
function resetGame() {

    // Reset the scores
    score.player1 = 0;
    score.player2 = 0;
    victoryMessageShown = false;
    
    // Reset the ball
    resetBall(true);
    updateScoreDisplay();
}

// Function to handle ball movement and collisions
function handleBallMovement() {
    ball.position.x += ballSettings.speed.x;
    ball.position.z += ballSettings.speed.z;
    let deltaWall = 0.1;
    const paddleDepthHalf = paddleSettings.width / 2;

    // Collision with walls
    if (ball.position.z > gameSettings.distWall1 - deltaWall || ball.position.z < gameSettings.distWall2 + deltaWall) {
        ballSettings.speed.z = -ballSettings.speed.z;
    }

    const ballRadius = 0.05;

    // Check for collision with the right paddle (paddle2-yellow)
    if (ballSettings.speed.x > 0 && 
        ball.position.x + ballRadius >= paddle2.position.x - 0.025 && // Demi-épaisseur de la raquette
        ball.position.x - ballRadius <= paddle2.position.x + 0.025 && 
        ball.position.z >= paddle2.position.z - paddleDepthHalf && 
        ball.position.z <= paddle2.position.z + paddleDepthHalf) {
        //ballSettings.speed.x = -ballSettings.speed.x;
        adjustBallSpeedOnCollision(paddle2, false);
    }

    // Check for collision with the left paddle (paddle1-blue)
    if (ballSettings.speed.x < 0 && 
        ball.position.x - ballRadius <= paddle1.position.x + 0.025 && // Demi-épaisseur de la raquette
        ball.position.x + ballRadius >= paddle1.position.x - 0.025 && 
        ball.position.z >= paddle1.position.z - paddleDepthHalf && 
        ball.position.z <= paddle1.position.z + paddleDepthHalf) {
        //ballSettings.speed.x = -ballSettings.speed.x;
        adjustBallSpeedOnCollision(paddle1, true);
    }
}

function handleScore(){
    let boundary = gameSettings.wallWidth + paddleSettings.thickness;
     // Check if the ball has left the scene on the left or right side
    if (ball.position.x > boundary) { // Assuming 3 is the right boundary
        score.player1++;
        resetBall(true); // Player 1 lost the point
    } else if (ball.position.x < -boundary) { // Assuming -3 is the left boundary
        score.player2++;
        resetBall(false); // Player 2 lost the point
    }
}

function updateScoreDisplay() {
    // Update the score display here
    const player1ScoreElement = document.getElementById('player1Score');
    const player2ScoreElement = document.getElementById('player2Score');

    player1ScoreElement.textContent = 'Bleu Score: ' + score.player1;
    player2ScoreElement.textContent = 'Yellow Score: ' + score.player2;    
    if (score.player1 === gameSettings.maxPoints || score.player2 === gameSettings.maxPoints) {
    // scene.add( sprite );
    }
}

function updateGame() {
    handlePaddleMovement();
    handleBallMovement();
    controls.update();
    handleScore();
    updateScoreDisplay();
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