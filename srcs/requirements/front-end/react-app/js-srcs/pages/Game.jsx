import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Game = () => {
    const containerRef = useRef();
	const [keysPressed, setKeysPressed] = useState({ArrowUp: false, ArrowDown: false, KeyW: false, KeyS: false});
	const keysPressedRef = useRef(keysPressed);
	const paddleBounds = { minZ: -1.2, maxZ: 1.2 };

	let camera, renderer;

	// Update the ref whenever keysPressed changes
	useEffect(() => {
		keysPressedRef.current = keysPressed;
	}, [keysPressed]);

	useEffect(() => {

		const handleResize = () => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };

		const handleKeyDown = (event) => {
            setKeysPressed((keys) => ({ ...keys, [event.code]: true }));
			// console.log("CODE: ", event.code);
        };

        const handleKeyUp = (event) => {
            setKeysPressed((keys) => ({ ...keys, [event.code]: false }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
		// Game variables
        let ball, paddle1, paddle2, scene, controls;
		let paddleSpeed = 0.05;
		let distWall1 = 1.5;
		let distWall2 = -1.5;
		let paddleWidth = 1;
		let paddleHeight = 0.3;
		let paddleThickness = 0.05;
		let ballSpeed = { x: 0.01, y: 0.01, z: 0.01 };
		let ballInitialPosition = { x: 0, y: 0.1, z: 0 };

        const initGameElements = () => {
			// Create and add paddles
			const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleThickness);
			// const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
			const paddleMaterial1 = new THREE.MeshBasicMaterial({ color: 0xfff, transparent: false, opacity: 1 });
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
        };

        const addLights = () => {
			// Main directional light
			const mainLight = new THREE.DirectionalLight(0xffffff, 1);
			mainLight.position.set(0, 1, 1);
			scene.add(mainLight);
			
			// Ambient light
			const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
			scene.add(ambientLight);
        };

        const addCenterLine = () => {
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
        };

        const initPong3D = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer();

			camera.position.set(0, 4, 0); // Position camera slightly above the center of the court
			camera.lookAt(new THREE.Vector3(0, 0, 0)); // Camera should look towards the center of the court
		

            renderer.setSize(window.innerWidth, window.innerHeight);
            containerRef.current.appendChild(renderer.domElement);

            controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0, 0);

            initGameElements();
            addLights();
            addCenterLine();
            drawAxes()

            // Start the rendering loop
            renderer.setAnimationLoop(() => {
                updateGame(); // Update game logic
                renderer.render(scene, camera);
            });
        };

        const handlePaddleMovement = () => {
			// console.log("handlePaddleMovement", keysPressedRef.current);
			const currentKeysPressed = keysPressedRef.current;
			if (currentKeysPressed['ArrowDown'] && paddle2.position.z < paddleBounds.maxZ) {
				paddle2.position.z += paddleSpeed; // Move paddle1 up
			}
			if (currentKeysPressed['ArrowUp'] && paddle2.position.z > paddleBounds.minZ) {
				paddle2.position.z -= paddleSpeed; // Move paddle1 down
			}
			if (currentKeysPressed['KeyS'] && paddle1.position.z < paddleBounds.maxZ) {
				paddle1.position.z += paddleSpeed; // Move paddle2 up
			}
			if (currentKeysPressed['KeyW'] && paddle1.position.z > paddleBounds.minZ) {
				paddle1.position.z -= paddleSpeed; // Move paddle2 down
			}
        };

        const resetBall = () => {
			// Vitesse constante pour la balle
			const speed = 0.01;

			// Choisir aléatoirement la direction sur l'axe X (gauche ou droite)
			ballSpeed.x = Math.random() > 0.5 ? speed : -speed;

			// Vitesse constante sur l'axe Z
			ballSpeed.z = speed; // Ou -speed si vous voulez aussi inverser la direction sur l'axe Z

			// Réinitialiser la position de la balle
			ball.position.set(0, 0.1, 0);
        };

        const handleBallMovement = () => {
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
        };

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

        const updateGame = () => {
            handlePaddleMovement();
            handleBallMovement();
            controls.update();
        };

        initPong3D();

        // Cleanup function
        return () => {
            containerRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} />;
};

export default Game;