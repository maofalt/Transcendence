import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { Texture } from 'three';

let	clientNbr = 0;
let clientId = 0;

const RemoteGame = () => {
	// meta
	const containerRef = useRef();
	let renderer, controls, scene;

	class SpObject {
		constructor(objMesh, dirMesh) {
			this.mesh = objMesh;
			this.dirMesh = dirMesh;
		}
	}

	class BoxObject {
		constructor(objMesh, dir1Mesh, dir2Mesh) {
			this.mesh = objMesh;
			this.dir1Mesh = dir1Mesh;
			this.dir2Mesh = dir2Mesh;
		}
	}
	// meshes
	let ball;
	let paddles = [];
	let walls = [];

	// lights & camera
	let camera, ambientLight, directionalLight;

	function drawAxes() {
		// axes length
		const axisLength = 5;
		const center = new THREE.Vector3(0, 0, 0);
		// X, Y & Z in Red, Green & Blue
		const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), center, axisLength, 0xff0000);
		const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), center, axisLength, 0x00ff00);
		const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), center, axisLength, 0x0000ff);
		
		//add to scene
		scene.add(arrowX);
		scene.add(arrowY);
		scene.add(arrowZ);
	};

	function generateBall(data) {
		const ballGeometry = new THREE.SphereGeometry(data.ball.r, 24, 12);
		const ballMaterial = new THREE.MeshPhongMaterial({ color: data.ball.col, transparent: false, opacity: 0.7 });
		const dir1 = new THREE.ArrowHelper(
			new THREE.Vector3(data.ball.dir.x,
							data.ball.dir.y,
							data.ball.dir.z,),
				data.ball.pos, 5, 0xff0000);

		ball = new SpObject(new THREE.Mesh(ballGeometry, ballMaterial), dir1);
		
		// add to scene
		scene.add(ball.mesh);
		scene.add(ball.dirMesh);

		ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, data.ball.pos.z);
	}

	function generateWalls(data) {
		const wallGeometry = new THREE.BoxGeometry(data.field.wallsSize, 1, 2);
		const wallMaterial = new THREE.MeshPhongMaterial({ color: data.ball.col, transparent: true, opacity: 1, reflectivity: 0.5 });

		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			walls[i] = new THREE.Mesh(wallGeometry, wallMaterial); // create Material
			scene.add(walls[i]); // add mesh to the scene
			walls[i].position.set(data.field.walls[i].pos.x, data.field.walls[i].pos.y, 0); // set the position
			walls[i].rotation.set(0, 0, data.field.walls[i].angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
		}
	}

	function generatePaddles(data) {
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			const paddleGeometry = new THREE.BoxGeometry(data.players[i].paddle.h, 1, 2);
			const paddleMaterial = new THREE.MeshPhongMaterial({ color: data.players[i].color, transparent: true, opacity: 0.7, reflectivity: 0.5 });

			const dir1 = new THREE.ArrowHelper(
				new THREE.Vector3(data.players[i].paddle.dirToCenter.x,
								data.players[i].paddle.dirToCenter.y,
								data.players[i].paddle.dirToCenter.z,),
					data.players[i].paddle.pos, 5, 0xff0000);
			const dir2 = new THREE.ArrowHelper(
				new THREE.Vector3(data.players[i].paddle.dirToTop.x,
								data.players[i].paddle.dirToTop.y,
								data.players[i].paddle.dirToTop.z,),
					data.players[i].paddle.pos, 5, 0x00ff00);

			paddles[i] = new BoxObject(new THREE.Mesh(paddleGeometry, paddleMaterial), dir1, dir2);
			scene.add(paddles[i].mesh); // add mesh to the scene
			scene.add(paddles[i].dir1Mesh);
			scene.add(paddles[i].dir2Mesh);

			paddles[i].mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, 0); // set the position
			paddles[i].mesh.rotation.set(0, 0, data.players[i].paddle.angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
		}
	}

	function generateLights(){
		directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(0, 1, 1);

		ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

		// add to scene
		scene.add(directionalLight);
		scene.add(ambientLight);
	}

	function generateSkyBox(data){
		// Charger la texture de ciel étoilé
		const starTexture = new THREE.TextureLoader().load('../../assets/banana.jpg'); // Remplacez par le chemin de votre texture
		// Créer la géométrie de la sphère
		starTexture.colorSpace = THREE.SRGBColorSpace;
		const starGeometry = new THREE.SphereGeometry(300, 64, 64); // Rayon, segmentsWidth, segmentsHeight
		// starTexture.offset.set(0.5, 0); // Shifts the texture halfway across its width

		// Créer le matériau avec la texture
		const starMaterial = new THREE.MeshBasicMaterial({
    		map: starTexture,
    		side: THREE.BackSide
		});

		// Créer le mesh de la sphère
		const starSphere = new THREE.Mesh(starGeometry, starMaterial);

		// Ajouter la sphère étoilée à la scène
		scene.add(starSphere);
	}

	function generateScene(data) {
		console.log("Generating Scene...");

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.4, 1000);
		renderer = new THREE.WebGLRenderer();

		camera.position.set(data.camera.pos.x, data.camera.pos.y, data.camera.pos.z);
		camera.lookAt(new THREE.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));
		// camera.rotation.set(0, 0, Math.PI / 2);
		// camera.rotation.set(0, 0, Math.PI);
		// if (clientId == 2)
			// camera.rotation.set(0, 0, Math.PI);
		
		renderer.setSize(window.innerWidth, window.innerHeight);
		containerRef.current.appendChild(renderer.domElement);

		controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);

		// generate objects
		generateBall(data);
		generatePaddles(data);
		generateWalls(data);
		// generateField(data);
		generateLights(data);
		generateSkyBox(data);
		drawAxes();

		// render scene
		renderer.render(scene, camera);
	};

	function updateScene(data) {
		console.log("Updating Scene...");
		ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			paddles[i].mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
			paddles[i].mesh.material.opacity = data.players[i].connected ? 0.7 : 0.3;
			paddles[i].dir1Mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
			paddles[i].dir2Mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
		}
	}

	useEffect(() => {
		// connect to socket server
		const hostname = window.location.hostname;
		const protocol = 'wss';
		const io_url = hostname.includes("github.dev") ? `${protocol}://${hostname}` : `${protocol}://${hostname}:9443`;
		// `${protocol}://${hostname}`
		console.log(`Connecting to ${io_url}`)
		const socket = io(`${io_url}`, {
			path: '/game-logic/socket.io',
			secure: hostname !== 'localhost',
			rejectUnauthorized: false,
			transports: ['websocket']
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
		});

		socket.on('clientId', (id, num) => {
			clientNbr = num
			clientId = id;
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
			window.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('keyup', handleKeyRelease);
			socket.disconnect();
			if (renderer) {
				console.log("renderer exists");
				containerRef.current.removeChild(renderer.domElement);
			}
		}
	}, []);

	return <div ref={containerRef} />;
};

export default RemoteGame;