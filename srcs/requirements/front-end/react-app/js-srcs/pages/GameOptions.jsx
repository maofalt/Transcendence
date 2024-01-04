import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import './GameOptions.css'

const GameOptions = () => {
	// meta
	const containerRef = useRef();
	let renderer, scene;

	// lights & camera
	let camera, ambientLight, directionalLight;

	const [paddleSize, setPaddleSize] = useState(5);
	const [goalSize, setGoalSize] = useState(5);
	const [wallSize, setWallSize] = useState(5);
	const [ballSize, setBallSize] = useState(5);

	const stateRef = useRef({
		paddleSize,
		goalSize,
		wallSize,
		ballSize,
	});

	const handleSliderChange = (setter) => (event) => {
		const value = parseFloat(event.target.value);
		setter(value);
	};

	const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);
	const paddleMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: 0x0000ff }));
	const goalMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
	const wallMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
	const ballMesh = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({ color: 0xffa500 }));

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
		directionalLight.position.set(0, 1, 1);

		ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

		// add to scene
		scene.add(directionalLight);
		scene.add(ambientLight);
	}

	function generateScene(data) {
		console.log("Generating Scene...");

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		renderer = new THREE.WebGLRenderer();

		camera.position.set(0, 0, 40);
		
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		generateLights();
		drawAxes();

		scene.add(paddleMesh);
		scene.add(goalMesh);
		scene.add(wallMesh);
		scene.add(ballMesh);
		
		paddleMesh.position.set(-45, 0, 0);
		goalMesh.position.set(-15, 0, 0);
		wallMesh.position.set(15, 0, 0);
		ballMesh.position.set(45, 0, 0);

		renderer.render(scene, camera);
	};

	const animate = () => {
		requestAnimationFrame(animate);

		const { paddleSize, goalSize, wallSize, ballSize } = stateRef.current;

		renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		paddleMesh.scale.set(paddleSize, paddleSize, paddleSize);
		goalMesh.scale.set(goalSize, goalSize, goalSize);
		wallMesh.scale.set(wallSize, wallSize, wallSize);
		ballMesh.scale.set(ballSize, ballSize, ballSize);
		renderer.render(scene, camera);
	};

	useEffect(() => {

		generateScene();
		requestAnimationFrame(animate);

		return () => {
			if (renderer) {
				console.log("renderer exists");
				containerRef.current.removeChild(renderer.domElement);
			}
		}
	}, []);

	useEffect(() => {
		// Update the stateRef whenever the state changes
		stateRef.current = {
			paddleSize,
			goalSize,
			wallSize,
			ballSize,
		};
	}, [paddleSize, goalSize, wallSize, ballSize]);

	return (
	<div>
		<div ref={containerRef} />
		<div style={{ textAlign: 'center' }}>
			<div>
				<div>Paddle Size: {paddleSize.toFixed(1)}</div>
				<input
					type="range"
					min="0"
					max="10"
					step="0.1"
					value={paddleSize}
					onChange={handleSliderChange(setPaddleSize)}
				/>
			</div>

			<div>
				<div>Goal Size: {goalSize.toFixed(1)}</div>
				<input
					type="range"
					min="0"
					max="10"
					step="0.1"
					value={goalSize}
					onChange={handleSliderChange(setGoalSize)}
				/>
			</div>

			<div>
				<div>Wall Size: {wallSize.toFixed(1)}</div>
				<input
					type="range"
					min="0"
					max="10"
					step="0.1"
					value={wallSize}
					onChange={handleSliderChange(setWallSize)}
				/>
			</div>

			<div>
				<div>Ball Size: {ballSize.toFixed(1)}</div>
				<input
					type="range"
					min="0"
					max="10"
					step="0.1"
					value={ballSize}
					onChange={handleSliderChange(setBallSize)}
				/>
			</div>
		</div>
	</div>
	);
};

export default GameOptions;

