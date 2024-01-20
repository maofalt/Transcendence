import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './GameOptions.css'

const GameOptions = () => {
	// meta
	const containerRef = useRef();
	let	viewPort = {
		width: window.innerWidth * 0.7,
		height: window.innerHeight * 1.0,
	}

	let renderer, scene, camDist = 70, camFov = 75;

	// lights & camera
	let camera, ambientLight, directionalLight;

	// sizes
	let wallMin, wallMax, goalMin, goalCurrentMin, goalMax, ballMin, ballMax;

	const paddleMin = 1;
	const paddleMax = 15;
	const playersMin = 2;
	const playersMax = 8;
	
	// const [players, setPlayers] = useState([]);
	let	players = [];
	let	goals = [];
	let	walls = [];

	const [paddleSize, setPaddleSize] = useState(10);
	const [goalSize, setGoalSize] = useState(paddleSize * 3);
	const [wallSize, setWallSize] = useState(2);
	const [ballSize, setBallSize] = useState(paddleMin);
	const [nbrOfPlayers, setNbrOfPlayers] = useState(2);
	
	// goalMin = 3;
	goalMin = paddleMin * 3;
	goalMax = paddleMax * 10;
	wallMin = 0;
	wallMax = 3;
	ballMin = paddleMin;
	ballMax = paddleMax;

	const stateRef = useRef({
		paddleSize,
		goalSize,
		wallSize,
		ballSize,
		nbrOfPlayers,
	});

	const handleSliderChange = (setter) => (event) => {
		const value = parseFloat(event.target.value);
		setter(value);
	};

	const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
	const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
	const ballMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff }));

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

	function generateLights(data){
		directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(0, 100, 100);

		ambientLight = new THREE.AmbientLight(0xffffff, 0.6);

		// add to scene
		scene.add(directionalLight);
		scene.add(ambientLight);
	}

	function generateScene(data) {
		// console.log("Generating Scene...");

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(camFov, window.innerWidth / window.innerHeight, 0.1, 1000);
		renderer = new THREE.WebGLRenderer();

		camera.position.set(0, 0, camDist);
		
		renderer.setSize(viewPort.width, viewPort.height);
		containerRef.current.appendChild(renderer.domElement);
		var pixelRatio = window.devicePixelRatio || 1;
		renderer.setPixelRatio(pixelRatio);

		let controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);

		generateLights();
		drawAxes();

		scene.add(ballMesh);
	
		ballMesh.position.set(0, 0, 0);

		renderer.render(scene, camera);
	};

	useEffect(() => {
		// const { paddleSize, goalSize, wallSize, ballSize, nbrOfPlayers } = stateRef.current;
		let startShape = -Math.PI/2;
		// let wallDist = 0, goalDist = 0, a = 0, gs = 0, ws = 0;

		function updateGoals(dist, array, angle, size) {
			for (let i = 0; i < playersMax; i++) {
				if (i + 1 > nbrOfPlayers && array[i]) {
					// if (array[i].geometry)
						// array[i].geometry.dispose;
					array[i].material.dispose;
					array.splice(i, 1);
				}
				else if (i + 1 <= nbrOfPlayers && !array[i]) {
					const mesh = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial({ color: 0x00c000, transparent: true, opacity: 0}));
					scene.add(mesh);
					array.splice(i, 0, mesh);
					array[i].rotation.z = startShape + angle * i;
				}
				if (i + 1 <= nbrOfPlayers) {
					array[i].position.set(
						dist * Math.cos(startShape + angle * i),
						dist * Math.sin(startShape + angle * i),
						0);
					array[i].scale.set(1, size, 1);
				}
			}
		}

		function updatePlayers(dist, array, angle, size) {
			for (let i = 0; i < playersMax; i++) {
				if (i + 1 > nbrOfPlayers && array[i]) {
					// if (array[i].geometry)
						// array[i].geometry.dispose;
					array[i].material.dispose;
					array.splice(i, 1);
				}
				else if (i + 1 <= nbrOfPlayers && !array[i]) {
					const mesh = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial({ color: 0x0080ff, transparent: true, opacity: 1}));
					scene.add(mesh);
					array.splice(i, 0, mesh);
					array[i].rotation.z = startShape + angle * i;
				}
				if (i + 1 <= nbrOfPlayers) {
					array[i].position.set(
						dist * Math.cos(startShape + angle * i),
						dist * Math.sin(startShape + angle * i),
						0);
					array[i].scale.set(1, size, 1);
				}
			}
		}

		function updateWalls(dist, array, angle, size) {
			// console.log("updating walls");
			for (let i = 0; i < playersMax; i++) {
				if (i + 1 > nbrOfPlayers && array[i]) {
					// if (array[i].geometry)
						// array[i].geometry.dispose;
					array[i].material.dispose;
					array.splice(i, 1);
				}
				else if (i + 1 <= nbrOfPlayers && !array[i]) {
					const mesh = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 1}));
					scene.add(mesh);
					array.splice(i, 0, mesh);
					array[i].rotation.z = startShape + angle / 2 + angle * i;
				}
				if (i + 1 <= nbrOfPlayers) {
					// console.log("scaling walls");
					array[i].position.set(
						dist * Math.cos(startShape + angle / 2 + angle * i),
						dist * Math.sin(startShape + angle / 2 + angle * i),
						0);
					array[i].scale.set(1, size, 1);
				}
			}
		}

		const animate = () => {
			const { paddleSize, goalSize, wallSize, ballSize, nbrOfPlayers } = stateRef.current;

			renderer.setSize(viewPort.width, viewPort.height);
			camera.aspect = viewPort.width / viewPort.height;
			camera.updateProjectionMatrix();
	
			ballMesh.scale.set(ballSize / 2, ballSize / 2, ballSize / 2);

			let angle = 2 * Math.PI/nbrOfPlayers;
			let a = angle / 2;
			let gs = goalSize / 2;
			let ws = (goalSize * wallSize) / 2;

			let wallDist = gs / Math.sin(a) + ws / Math.tan(a);
			let goalDist = gs / Math.tan(a) + ws / Math.sin(a);

			// updateGoals(goalDist, goals, angle, goalSize);
			updateWalls(wallDist, walls, angle, goalSize * wallSize);
			updatePlayers(goalDist - 2, players, angle, paddleSize);

			let camDist = (wallDist > goalDist ? wallDist : goalDist);
			camera.position.set(0, 0, camDist * 2);
	
			// camera.position.set(0, 0, 200);
			renderer.render(scene, camera);
		};

		generateScene();
		requestAnimationFrame(animate);

		return () => {
			if (renderer) {
				// console.log("renderer exists");
				containerRef.current.removeChild(renderer.domElement);
			}
		}
	}, [nbrOfPlayers, paddleSize, goalSize, ballSize, wallSize]);

	useEffect(() => {
		// Update the stateRef whenever the state changes
		stateRef.current = {
			paddleSize,
			goalSize,
			wallSize,
			ballSize,
			nbrOfPlayers,
		};
	}, [paddleSize, goalSize, wallSize, ballSize, nbrOfPlayers]);

	return (
	<div id="menu">
		<div id="viewPort" ref={containerRef}/>
		<div id="slidersBlock" style={{ textAlign: 'center' }}>
			<h3 id="menuTitle">Game Settings</h3>
			<div>
				<div className="inputInfo">Paddle Length: {Math.round(100 * (paddleSize.toFixed(1) - paddleMin) / (paddleMax - paddleMin))}%</div>
				<input
					type="range"
					min={paddleMin}
					max={paddleMax}
					step={(paddleMax - paddleMin) / 100}
					value={paddleSize}
					onChange={handleSliderChange(setPaddleSize)}
				/>
			</div>

			<div>
				<div className="inputInfo">Goal Size: {Math.round(100 * (goalSize.toFixed(1) - goalMin) / (goalMax - goalMin))}%</div>
				<input
					type="range"
					min={goalMin}
					max={goalMax}
					step={(goalMax - goalMin) / 100}
					value={goalSize}
					onChange={handleSliderChange(setGoalSize)}
				/>
			</div>

			<div>
				<div className="inputInfo">Wall to Goal ratio: {wallSize.toFixed(1)}</div>
				<input
					type="range"
					min={wallMin}
					max={wallMax}
					step="0.1"
					value={wallSize}
					onChange={handleSliderChange(setWallSize)}
				/>
			</div>

			<div>
				<div className="inputInfo">Ball Size: {Math.round(100 * (ballSize.toFixed(1) - ballMin) / (ballMax - ballMin))}%</div>
				<input
					type="range"
					min={ballMin}
					max={ballMax}
					step={(ballMax - ballMin) / 100}
					value={ballSize}
					onChange={handleSliderChange(setBallSize)}
				/>
			</div>

			<div>
				<div className="inputInfo">Nbr of Players: {nbrOfPlayers}</div>
				<input
					type="range"
					min={playersMin}
					max={playersMax}
					step="1.0"
					value={nbrOfPlayers}
					onChange={handleSliderChange(setNbrOfPlayers)}
				/>
			</div>
		</div>
	</div>
	);
};

export default GameOptions;

