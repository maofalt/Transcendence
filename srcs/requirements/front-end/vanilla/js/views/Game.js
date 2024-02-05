import AbstractView from "./AbstractView";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Texture } from 'three';

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

        this.clientId = null;
        this.clientNbr = null;

        // objects
        this.ball = null;
		this.banana = null;
        this.paddles = [];
        this.walls = [];

        // lights
        this.ambientLight = null;
        this.directionalLight = null;
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
		const io_url = hostname.includes("github.dev") ? `${protocol}://${hostname}` : `${protocol}://${hostname}:9443`;
		console.log(`Connecting to ${io_url}`)
		this.socket = io(`${io_url}`, {
			path: '/game-logic/socket.io',
			secure: hostname !== 'localhost',
			rejectUnauthorized: false,
			transports: ['websocket']
		});

		this.socket.on('generate', data => {
			// Generate scene and update it
			this.generateScene(data, this.socket);
			this.updateScene(data, this.socket);
			this.renderer.render(this.scene, this.camera);
		});

		this.socket.on('render', data => {
			console.log("Rendering Frame...");
			this.updateScene(data);
			this.renderer.render(this.scene, this.camera);
		});

		this.socket.on('clientId', (id, num) => {
			this.clientNbr = num;
			this.clientId = id;
			console.log("Client connected with ID: " + this.clientId);
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
		// this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		// this.controls.target.set(0, 0, 0);
		
		this.camera.position.set(data.camera.pos.x, data.camera.pos.y, data.camera.pos.z);
		this.camera.lookAt(new THREE.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			if (data.players[i].socketID == socket.id) {
				console.log(`socket : ${data.players[i].socketID}, client : ${socket.id}, ${i}, angle = ${data.players[i].paddle.angle}`);
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
		// this.generateField(data);
		this.generateLights(data);
		// this.generateSkyBox(data);
		this.drawAxes();

		this.generateBanana(data);

		// render scene
		this.renderer.render(this.scene, this.camera);
	};

	// Other methods (generateScene, updateScene, etc.) here
	updateScene(data, socket) {
		console.log("Updating Scene...");
		this.ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		// this.ball.dirMesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			this.paddles[i].mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
			this.paddles[i].mesh.material.opacity = data.players[i].connected ? 0.7 : 0.3;
			// this.paddles[i].dir1Mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
			// this.paddles[i].dir2Mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, data.players[i].paddle.pos.z);
			// for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			// 	if (data.players[i].socketID = socket.id) {
			// 		this.camera.rotation.set(0, 0, data.players[i].paddle.angle + Math.PI / 2);
			// 	}
			// }
		}
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

		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			this.walls[i] = new THREE.Mesh(wallGeometry, wallMaterial); // create Material
			this.scene.add(this.walls[i]); // add mesh to the scene
			this.walls[i].position.set(data.field.walls[i].pos.x, data.field.walls[i].pos.y, 0); // set the position
			this.walls[i].rotation.set(0, 0, data.field.walls[i].angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
		}
	}

	generatePaddles(data) {
		for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
			const paddleGeometry = new THREE.BoxGeometry(data.players[i].paddle.h, 1, 2);
			const paddleMaterial = new THREE.MeshPhongMaterial({ color: data.players[i].color, transparent: true, opacity: 0.7, reflectivity: 0.5 });

			const dir1 = new THREE.ArrowHelper(
				new THREE.Vector3(data.players[i].paddle.dirToCenter.x,
								data.players[i].paddle.dirToCenter.y,
								data.players[i].paddle.dirToCenter.z,),
					data.players[i].paddle.pos, 10, 0xff0000);
			const dir2 = new THREE.ArrowHelper(
				new THREE.Vector3(data.players[i].paddle.dirToTop.x,
								data.players[i].paddle.dirToTop.y,
								data.players[i].paddle.dirToTop.z,),
					data.players[i].paddle.pos, 10, 0x00ff00);

            this.paddles[i] = new BoxObject(new THREE.Mesh(paddleGeometry, paddleMaterial), dir1, dir2);
			this.scene.add(this.paddles[i].mesh); // add mesh to the scene
			// this.scene.add(this.paddles[i].dir1Mesh);
			// this.scene.add(this.paddles[i].dir2Mesh);

			this.paddles[i].mesh.position.set(data.players[i].paddle.pos.x, data.players[i].paddle.pos.y, 0); // set the position
			this.paddles[i].mesh.rotation.set(0, 0, data.players[i].paddle.angle + Math.PI / 2); // set the rotation to the proper orientation (facing center)
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
