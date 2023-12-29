import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';

const RemoteGame = () => {
	// meta
	const containerRef = useRef();
	let renderer, controls, scene;

	// meshes
	let ball, paddle1, paddle2, wall1, wall2, field;

	// lights & camera
	let camera, ambientLight, directionalLight;

	function drawAxes() {
		// axes length
		const axisLength = 5;
	
		// X, Y & Z in Red, Green & Blue
		const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
		const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
		const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);
		
		//add to scene
		scene.add(arrowX);
		scene.add(arrowY);
		scene.add(arrowZ);
	};

	function generateBall(data) {
		const ballGeometry = new THREE.SphereGeometry(data.ball.r, 24, 12);
		const ballMaterial = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: false, opacity: 1 });
		ball = new THREE.Mesh(ballGeometry, ballMaterial);
		
		// add to scene
		scene.add(ball);
	}

	function generateWalls(data) {
		const wallGeometry = new THREE.BoxGeometry(data.field.width, data.paddle1.width / 2, 5);

		// const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
		const wallMaterial1 = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		const wallMaterial2 = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		wall1 = new THREE.Mesh(wallGeometry, wallMaterial1);
		wall2 = new THREE.Mesh(wallGeometry, wallMaterial2);

		// add to scene
		scene.add(wall1);
		scene.add(wall2);
		wall1.position.set(0, data.field.height / 2 + data.paddle1.width / 2, 0);
		wall2.position.set(0, -data.field.height / 2 - data.paddle1.width / 2, 0);
	}

	function generateField(data) {
		const fieldGeometry = new THREE.BoxGeometry(data.field.width, data.field.height, 2);
		const fieldMaterial = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 0.1, reflectivity: 0.5 });
		field = new THREE.Mesh(fieldGeometry, fieldMaterial);

		scene.add(field);
		field.position.set(0, 0, -4);
	}

	function generatePaddles(data) {
		const paddleGeometry = new THREE.BoxGeometry(data.paddle1.width, data.paddle1.height, 5);

		// const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
		const paddleMaterial1 = new THREE.MeshPhongMaterial({ color: data.paddle1.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		const paddleMaterial2 = new THREE.MeshPhongMaterial({ color: data.paddle2.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
		paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);

		// add to scene
		scene.add(paddle1);
		scene.add(paddle2);
	}

	function generateLights(data){
		directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(0, 1, 1);

		ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

		// add to scene
		scene.add(directionalLight);
		scene.add(ambientLight);
	}

	function generateScene(data) {
		console.log("Generating Scene...");

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		renderer = new THREE.WebGLRenderer();

		camera.position.set(0, 0, 80); // Position camera slightly above the center of the court
		camera.lookAt(new THREE.Vector3(0, 0, 0)); // Camera should look towards the center of the court
		
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);

		// generate objects
		generateBall(data);
		generatePaddles(data);
		generateWalls(data);
		generateField(data);
		generateLights(data);
		drawAxes();

		// render scene
		renderer.render(scene, camera);
	};

	function updateScene(data) {
		// console.log("Updating Scene...");
		// ball.position.x++;
		ball.position.set(data.ball.x, data.ball.y, 0);
		paddle1.position.set(data.paddle1.x, data.paddle1.y, 0);
		paddle2.position.set(data.paddle2.x, data.paddle2.y, 0);
	}

	const [keysPressed, setKeysPressed] = useState({KeyW: false, KeyS: false});
	const keysPressedRef = useRef(keysPressed);

	useEffect(() => {
		keysPressedRef.current = keysPressed;
	}, [keysPressed]);

	useEffect(() => {
		// input events : controlling paddles
		const handleKeyDown = (event) => {
			setKeysPressed((keys) => ({ ...keys, [event.code]: true }));
			// console.log("CODE: ", event.code);
		};

		const handleKeyUp = (event) => {
			setKeysPressed((keys) => ({ ...keys, [event.code]: false }));
		};

		function handlePaddleMovement() {
			const currentKeysPressed = keysPressedRef.current;
			if (currentKeysPressed['KeyS']) {
				console.log("S pressed !");
				socket.emit("moveDown");
			}
			if (currentKeysPressed['KeyW']) {
				console.log("W pressed !");
				socket.emit("moveUp");
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		// connect to socket server
		const socket = io(`wss://game.localhost:9443`, {
			path: '/socket.io',
			secure: true,
			rejectUnauthorized: false,
			transports: ['websocket'],
		});

		socket.on('generate', (data) => {
			// console.log(`Generating Scene...${data.ball.r}`);
			generateScene(data);
			updateScene(data);
			renderer.render(scene,camera);
		});

		socket.on('render', (data) => {
			// printing properties;
// 			console.log(`data :\nball:\n\tx:${data.ball.x}\n\ty:${data.ball.y}\n\t;
// \npaddle1:\n\tx:${data.paddle1.x}\n\ty:${data.paddle1.color}\n\t;
// \npaddle2:\n\tx:${data.paddle2.x}\n\ty:${data.paddle2.x}\n\t;\n`);

			console.log("Rendering Frame...");
			updateScene(data);
			renderer.render(scene, camera);
			handlePaddleMovement();
		});

		socket.on('clientId', (id, num) => {
			console.log("LETS GO");
		});

		// input events : controlling paddles
		function handleKeyPress(event) {
			if (event.key == "w")
				socket.emit('moveUp');
			if (event.key == "s")
				socket.emit('moveDown');
		}

		function handleKeyRelease(event) {
			if (event.key == "w" || event.key == "s")
				socket.emit('stop');
		}

		window.addEventListener("keydown", handleKeyPress);
		window.addEventListener("keyup", handleKeyRelease);

		return () => {
			// containerRef.current.removeChild(renderer.domElement);
			window.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('keyup', handleKeyRelease);
			socket.disconnect();
		}
	}, []);

	return <div ref={containerRef} />;
};

export default RemoteGame;