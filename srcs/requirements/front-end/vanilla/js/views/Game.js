import AbstractView from "./AbstractView";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Texture } from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';


function createCallTracker() {
	let lastCallTime = 0; // Timestamp of the last call
  
	// This function is called every time you want to track a call
	return function trackCall() {
	  const now = Date.now(); // Get current timestamp in milliseconds
	  let elapsedTime = 0; // Initialize elapsed time
  
	  if (lastCallTime !== 0) { // Check if this is not the first call
		elapsedTime = now - lastCallTime; // Calculate time since last call
		// console.log(`Time since last call: ${elapsedTime} ms`);
	  }
  
	  lastCallTime = now; // Update last call time to the current time for the next call
  
	  return elapsedTime; // Return the elapsed time between the last two calls
	};
  }

// instance of the call tracker
const callTracker = createCallTracker();

let fps = 0;

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

export default class Game extends AbstractView {
	constructor(element) {
		super(element);
		this.loader = new GLTFLoader();
		
        // controls
        this.controls = null;
        
        // rendering
        this.renderer = null;
        this.scene = null;
        this.camera = null;

        this.playerID = null;
		this.matchID = null;

        // objects
        this.ball = null;
		this.banana = null;
        this.paddles = [];
        this.walls = [];
		this.goals = [];
		this.scores = [];

        // lights
        this.ambientLight = null;
        this.directionalLight = null;

		// text
		this.textSettings = {
			size: 2,
			height: 0.2,
			curveSegments: 12,
		}
		this.prevScores = [];
		this.dir = 0;
	};

	async getHtml() {
		return `
			<div id="gameContainer"></div>
		`;
	};

	async init() {
		console.log("init Game View...");
		// Set up the game container
		this.container = document.getElementById('gameContainer');
		
		// Your game setup logic here (init socket, create scene, etc.)
		// this.generateScene();

		// Initialize socket connection
		this.initSocket();

		// Add event listeners (resize, key events, etc.)
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		window.addEventListener("keydown", this.handleKeyPress.bind(this));
		window.addEventListener("keyup", this.handleKeyRelease.bind(this));
	};

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	};

	handleKeyPress(event) {
		console.log(event.key);
		if (event.key == "w")
			this.socket.emit('moveUp');
		if (event.key == "s")
			this.socket.emit('moveDown');
		if (event.key == "d")
			this.socket.emit('dash');
	};

	handleKeyRelease(event) {
		if (event.key == "w" || event.key == "s")
			this.socket.emit('stop');
	};

	initSocket() {
		// socket initialization and event handling logic
		const hostname = window.location.hostname;
		const protocol = 'wss';
		const query = window.location.search.replace('?', '');
		const io_url = hostname.includes("github.dev") ? `${protocol}://${hostname}` : `${protocol}://${hostname}:9443`;
		console.log(`Connecting to ${io_url}`)
		this.socket = io(`${io_url}`, {
			path: '/game-logic/socket.io',
			query: query,
			secure: hostname !== 'localhost',
			rejectUnauthorized: false,
			transports: ['websocket']
		});

		this.socket.on('error', (error) => {
			console.error("Socket error: ", error);
			alert("Socket error: " + error);
		});

		this.socket.on('connect_error', (error) => {
			console.error("Socket connection error: ", error);
			alert("Socket connection error: " + error);
		});

		this.socket.on('whoareyou', () => {
			this.socket.emit('ID', this.playerID, this.matchID);
		});

		this.socket.on('generate', data => {
			// Generate scene and update it
			data.playersArray = Object.values(data.players);
			console.log("data : ", data);
			this.generateScene(data, this.socket);
			this.updateScene(data, this.socket);
			this.renderer.render(this.scene, this.camera);
		});
		
		this.socket.on('render', data => {
			data.playersArray = Object.values(data.players);
			console.log("Rendering Frame...");
			this.updateScene(data);
			// console.log("FPS: " + 1000 / callTracker() + "fps");
			fps = 1000 / callTracker();
			this.renderer.render(this.scene, this.camera);
		});

		this.socket.on('destroy', data => {
			this.scene.clear();
			console.log("DESTROY SCENE");
		})

		this.socket.on('refresh', data => {
			console.log("REFRESH SCENE");
			data.playersArray = Object.values(data.players);
			this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
			// this.renderer = new THREE.WebGLRenderer();
			this.controls = new OrbitControls(this.camera, this.renderer.domElement);
			this.controls.target.set(0, 0, 0);
			
			this.camera.position.set(data.camera.pos.x, data.camera.pos.y, data.camera.pos.z);
			this.camera.lookAt(new THREE.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));
			for (let i=0; i<data.playersArray.length; i++) {
				if (data.playersArray[i].socketID == this.socket.id) {
					console.log(`socket : ${data.playersArray[i].socketID}, client : ${this.socket.id}, ${i}, angle = ${data.playersArray[i].paddle.angle}`);
					this.camera.rotation.set(0, 0, 2 * Math.PI/data.gamemode.nbrOfPlayers * i);
				}
			}

			// this.camera.rotation.set(0, 0, 90);
			// for later : set cam rotation depending on which client this is so the player is always at the same place;
			
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.container.appendChild(this.renderer.domElement);

			// generate objects
			this.generateBall(data);
			this.generatePaddles(data);
			this.generateWalls(data);
			this.generateGoals(data);
			this.generateLights(data);
			this.generateScores(data);
			this.drawAxes();
		})

		this.socket.on('ping', ([timestamp, latency]) => {
			this.socket.emit('pong', timestamp);
			let str = `Ping: ${latency}ms - FPS: ${fps.toFixed(1)}`;
			document.title = str;
			console.log(str);
		});

	};

	destroy() {
		if (this.socket) {
			this.socket.disconnect();
		}
		
		console.log("Destroying Game View...");
		// Cleanup logic here (remove event listeners, etc.)
		window.removeEventListener('resize', this.onWindowResize.bind(this));
		window.removeEventListener("keydown", this.handleKeyPress.bind(this));
		window.removeEventListener("keyup", this.handleKeyRelease.bind(this));

		// Additional cleanup (disposing Three.js objects, etc.)
	};

	generateScene(data, socket) {
		console.log("Generating Scene...");

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);
		
		this.camera.position.set(data.camera.pos.x, data.camera.pos.y, data.camera.pos.z);
		this.camera.lookAt(new THREE.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));
		for (let i=0; i<data.playersArray.length; i++) {
			if (data.playersArray[i].socketID == socket.id) {
				console.log(`socket : ${data.playersArray[i].socketID}, client : ${socket.id}, ${i}, angle = ${data.playersArray[i].paddle.angle}`);
				this.camera.rotation.set(0, 0, 2 * Math.PI/data.gamemode.nbrOfPlayers * i);
			}
		}
		// this.camera.rotation.set(0, 0, 90);
		// for later : set cam rotation depending on which client this is so the player is always at the same place;

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);
		
		// generate objects
		this.generateBall(data);
		this.generatePaddles(data);
		this.generateWalls(data);
		this.generateGoals(data);
		this.generateLights(data);
		this.generateScores(data);
		this.drawAxes();
	};

	// Other methods (generateScene, updateScene, etc.) here
	updateScene(data, socket) {
		// console.log("Updating Scene...");
		this.ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		// this.ball.dirMesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		for (let i=0; i<data.playersArray.length; i++) {
			this.paddles[i].mesh.position.set(data.playersArray[i].paddle.pos.x, data.playersArray[i].paddle.pos.y, data.playersArray[i].paddle.pos.z);
			this.paddles[i].mesh.material.opacity = data.playersArray[i].connected ? 0.7 : 0.3;
			// this.paddles[i].dir1Mesh.position.set(data.playersArray[i].paddle.pos.x, data.playersArray[i].paddle.pos.y, data.playersArray[i].paddle.pos.z);
			// this.paddles[i].dir2Mesh.position.set(data.playersArray[i].paddle.pos.x, data.playersArray[i].paddle.pos.y, data.playersArray[i].paddle.pos.z);
			// for (let i=0; i<data.playersArray.length; i++) {
				// 	if (data.playersArray[i].socketID = socket.id) {
					// 		this.camera.rotation.set(0, 0, data.playersArray[i].paddle.angle + Math.PI / 2);
					// 	}
					// }
		}
				
		// update scores
		this.refreshScores(data);
	}

	drawAxes() {
		// axes length
		const axisLength = 10;
		const center = new THREE.Vector3(0, 0, 0);
		// X, Y & Z in Red, Green & Blue
		const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), center, axisLength, 0xff0000);
		const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), center, axisLength, 0x00ff00);
		const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), center, axisLength, 0x0000ff);
		
		//add to scene
		this.scene.add(arrowX);
		this.scene.add(arrowZ);
		this.scene.add(arrowY);
	};


	generateScores(data) {

		const loader = new FontLoader();

		// get previous scores for comparison when updating score text meshes
		this.prevScores = data.playersArray.map(player => -1);

		// get the direction of the client to rotate the scores to face the client
		for (let i = 0; i < data.playersArray.length; i++) {
			if (data.playersArray[i].socketID === this.socket.id) {
				this.dir = i;
			}
		}

		if (!loader)
			return console.error("FontLoader not found");

		loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', ( response ) => {

			this.textSettings.font = response;

			this.refreshScores(data);

			console.log("Font loaded");

		} );

	}

		// font: font,

		// size: size,
		// height: height,
		// curveSegments: curveSegments,

		// bevelThickness: bevelThickness,
		// bevelSize: bevelSize,
		// bevelEnabled: bevelEnabled

	
	createScore(data, player, i) {

		let dir = 0; // used to rotate scores to face client

		// generate scores for each player
		const scoreText = player.score.toString();
		console.log("Creating score: " + scoreText + " for player " + i + " with dir: " + this.dir);

		const geometry = new TextGeometry(scoreText, this.textSettings);

		var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		this.scores[i] = new THREE.Mesh(geometry, material);

		// calculate bounds of score
		geometry.computeBoundingBox();
		const scoreWidth = this.scores[i].geometry.boundingBox.max.x - this.scores[i].geometry.boundingBox.min.x;
		const scoreHeight = this.scores[i].geometry.boundingBox.max.y - this.scores[i].geometry.boundingBox.min.y;
		const scoreThickness = this.scores[i].geometry.boundingBox.max.z - this.scores[i].geometry.boundingBox.min.z;

		// set center of score to center of paddle
		const centerX = data.playersArray[i].paddle.pos.x - scoreWidth / 2;
		const centerY = data.playersArray[i].paddle.pos.y - scoreHeight / 2;
		const centerZ = data.playersArray[i].paddle.pos.z - scoreThickness / 2;

		this.scores[i].position.set(centerX, centerY, centerZ);

		this.scene.add(this.scores[i]);

		// rotate the score to face client
		this.scores[i].rotation.set(0, 0, 2 * Math.PI/data.gamemode.nbrOfPlayers * this.dir);
		
	}

	refreshScores(data) {

		if (!data || !data.playersArray || !this.textSettings || !this.textSettings.font)
			return console.error("Data or font not found");

		data.playersArray.forEach((player, index) => {

			if (this.prevScores[index] != player.score) {
				console.log("Refreshing score: " + player.score + " for player " + index);
				this.scene.remove( this.scores[index] );
				this.createScore(data, player, index);
			}
		
		});

		this.prevScores = data.playersArray.map(player => player.score);

	}

	generateBanana(data) {
		this.loader.load(
			// resource URL
			'../assets/banana/scene.gltf',
			// called when the resource is loaded
			function ( gltf ) {
		
				this.banana = gltf.scene;
				this.banana.scale.set(5, 5, 5);
		
				this.scene.add(this.banana);
		
			},
			// called while loading is progressing
			function ( xhr ) {
		
				console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		
			},
			// called when loading has errors
			function ( error ) {
		
				console.log( 'An error happened while loading model' );
		
			}
		);
	}

	generateBall(data) {
		const ballGeometry = new THREE.SphereGeometry(data.ball.r, 24, 12);
		const ballMaterial = new THREE.MeshPhongMaterial({ color: data.ball.col, transparent: false, opacity: 0.7 });
		const dir1 = new THREE.ArrowHelper(
			new THREE.Vector3(data.ball.dir.x,
							data.ball.dir.y,
							data.ball.dir.z,),
				data.ball.pos, 10, 0xff0000);

        this.ball = new SpObject(new THREE.Mesh(ballGeometry, ballMaterial), dir1);
		
		// add to scene
		this.scene.add(this.ball.mesh);
		// this.scene.add(this.ball.dirMesh);

		this.ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, data.ball.pos.z);
	}

	generateWalls(data) {
		const wallGeometry = new THREE.BoxGeometry(data.field.wallsSize, 1, 2);
		const wallMaterial = new THREE.MeshPhongMaterial({ color: data.ball.col, transparent: true, opacity: 1, reflectivity: 0.5 });
		// console.log("number of players : ", data.gamemode.nbrOfPlayers);
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			this.walls[i] = new THREE.Mesh(wallGeometry, wallMaterial); // create Material
			this.scene.add(this.walls[i]); // add mesh to the scene
			this.walls[i].position.set(data.field.walls[i].pos.x, data.field.walls[i].pos.y, 0); // set the position
			this.walls[i].rotation.set(0, 0, data.field.walls[i].angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
		}
	}

	generateGoals(data) {
		// console.log("number of players : ", data.gamemode.nbrOfPlayers);
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			const top = data.field.walls[i].top;
			const bottom = data.field.walls[(i + 1) % data.gamemode.nbrOfPlayers].bottom;
			const points = [];
			points.push(new THREE.Vector3( top.x, top.y, top.z ));
			points.push(new THREE.Vector3( bottom.x, bottom.y, bottom.z ));
			const goalGeometry = new THREE.BufferGeometry().setFromPoints( points );
			const goalMaterial = new THREE.LineBasicMaterial( { color: data.playersArray[(i + 1) % data.gamemode.nbrOfPlayers].color } );
			const goalLine = new THREE.Line( goalGeometry, goalMaterial );
			this.scene.add(goalLine);
		}
	}

	// deleteGoals(data) {
	// 	for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
	// 		const top = data.field.walls[i].top;
	// 		const bottom = data.field.walls[(i + 1) % data.gamemode.nbrOfPlayers].bottom;
	// 		const points = [];
	// 		points.push(new THREE.Vector3( top.x, top.y, top.z ));
	// 		points.push(new THREE.Vector3( bottom.x, bottom.y, bottom.z ));
	// 		const goalGeometry = new THREE.BufferGeometry().setFromPoints( points );
	// 		const goalMaterial = new THREE.LineBasicMaterial( { color: data.playersArray[(i + 1) % data.gamemode.nbrOfPlayers].color } );
	// 		const goalLine = new THREE.Line( goalGeometry, goalMaterial );
	// 		this.scene.add(goalLine);
	// 	}
	// }

	generatePaddles(data) {
		for (let i=0; i<data.playersArray.length; i++) {
			const paddleGeometry = new THREE.BoxGeometry(data.playersArray[i].paddle.h, 1, 2);
			const paddleMaterial = new THREE.MeshPhongMaterial({ color: data.playersArray[i].color, transparent: true, opacity: 1, reflectivity: 0 });

			const dir1 = new THREE.ArrowHelper(
				new THREE.Vector3(data.playersArray[i].paddle.dirToCenter.x,
								data.playersArray[i].paddle.dirToCenter.y,
								data.playersArray[i].paddle.dirToCenter.z,),
					data.playersArray[i].paddle.pos, 10, 0xff0000);
			const dir2 = new THREE.ArrowHelper(
				new THREE.Vector3(data.playersArray[i].paddle.dirToTop.x,
								data.playersArray[i].paddle.dirToTop.y,
								data.playersArray[i].paddle.dirToTop.z,),
					data.playersArray[i].paddle.pos, 10, 0x00ff00);

            this.paddles[i] = new BoxObject(new THREE.Mesh(paddleGeometry, paddleMaterial), dir1, dir2);
			this.scene.add(this.paddles[i].mesh); // add mesh to the scene
			// this.scene.add(this.paddles[i].dir1Mesh);
			// this.scene.add(this.paddles[i].dir2Mesh);

			this.paddles[i].mesh.position.set(data.playersArray[i].paddle.pos.x, data.playersArray[i].paddle.pos.y, 0); // set the position
			this.paddles[i].mesh.rotation.set(0, 0, data.playersArray[i].paddle.angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
			// this.deletePaddles(data);
		}
	}

	deletePaddles(data) {
		for (let i=0; i<data.playersArray.length; i++) {
			this.paddles[i].mesh.paddleGeometry.dispose();
			this.paddles[i].mesh.paddleMaterial.dispose();
		}
	}

	generateLights(){
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.directionalLight.position.set(0, 1, 1);

		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

		// add to scene
		this.scene.add(this.directionalLight);
		this.scene.add(this.ambientLight);
	}

	deleteLights() {
		this.directionalLight.dispose();
		this.ambientLight.dispose();
	}

	// generateSkyBox(data) {
	// 	// Charger la texture de ciel étoilé
	// 	const starTexture = new THREE.TextureLoader().load('../../assets/banana.jpg'); // Remplacez par le chemin de votre texture
	// 	// Créer la géométrie de la sphère
	// 	starTexture.colorSpace = THREE.SRGBColorSpace;
	// 	const starGeometry = new THREE.SphereGeometry(300, 64, 64); // Rayon, segmentsWidth, segmentsHeight
	// 	// starTexture.offset.set(0.5, 0); // Shifts the texture halfway across its width

	// 	// Créer le matériau avec la texture
	// 	const starMaterial = new THREE.MeshBasicMaterial({
    // 		map: starTexture,
    // 		side: THREE.BackSide
	// 	});

	// 	// Créer le mesh de la sphère
	// 	const starSphere = new THREE.Mesh(starGeometry, starMaterial);

	// 	// Ajouter la sphère étoilée à la scène
	// 	this.scene.add(starSphere);
	// };
}
