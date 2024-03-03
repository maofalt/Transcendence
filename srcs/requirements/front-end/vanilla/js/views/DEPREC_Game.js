import AbstractView from "./AbstractView";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { Texture } from 'three';

export default class Game extends AbstractView {
	constructor(element) {
		super(element);
		this.socket = null;

		// meta
		this.renderer = null;
		this.controls = null;
		this.scene = null;
		this.clientNbr = 0;
		this.clientId = 0;

		// meshes
		this.ball = null;
		this.paddle1 = null;
		this.paddle2 = null;
		this.wall1 = null;
		this.wall2 = null;
		this.field = null;

		// lights & camera
		this.camera = null;
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
			this.generateScene(data);
			this.updateScene(data);
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

	generateScene(data) {
		console.log("Generating Scene...");

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.renderer = new THREE.WebGLRenderer();

		this.camera.position.set(0, 0, 40);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		// camera.rotation.set(0, 0, Math.PI / 2);
		this.camera.rotation.set(0, 0, Math.PI);
		if (this.clientId == 2)
			this.camera.rotation.set(0, 0, Math.PI);
		
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.container.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);

		// generate objects
		this.generateBall(data);
		this.generatePaddles(data);
		this.generateWalls(data);
		this.generateField(data);
		this.generateLights(data);
		this.generateSkyBox(data);
		this.drawAxes();

		// render scene
		this.renderer.render(this.scene, this.camera);
	};

	// Other methods (generateScene, updateScene, etc.) here
	updateScene(data) {
		// console.log("Updating Scene...");
		this.ball.position.set(data.ball.x, data.ball.y, 0);
		this.paddle1.position.set(data.paddle1.x, data.paddle1.y, 0);
		this.paddle2.position.set(data.paddle2.x, data.paddle2.y, 0);
	};

	drawAxes() {
		// axes length
		const axisLength = 5;
	
		// X, Y & Z in Red, Green & Blue
		const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
		const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
		const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);
		
		//add to scene
		this.scene.add(arrowX);
		this.scene.add(arrowY);
		this.scene.add(arrowZ);
	};

	generateBall(data) {
		const ballGeometry = new THREE.SphereGeometry(data.ball.r, 24, 12);
		const ballMaterial = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: false, opacity: 1 });

		this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
		
		// add to scene
		this.scene.add(this.ball);
	};

	generateWalls(data) {
		const wallGeometry = new THREE.BoxGeometry(data.field.width, data.paddle1.width, 2);
		const wallMaterial1 = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		const wallMaterial2 = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 1, reflectivity: 0.5 });

		this.wall1 = new THREE.Mesh(wallGeometry, wallMaterial1);
		this.wall2 = new THREE.Mesh(wallGeometry, wallMaterial2);

		// add to scene
		this.scene.add(this.wall1);
		this.scene.add(this.wall2);
		this.wall1.position.set(0, data.field.height / 2 + data.paddle1.width / 2, 0);
		this.wall2.position.set(0, -data.field.height / 2 - data.paddle1.width / 2, 0);
	};

	generateField(data) {
		const fieldGeometry = new THREE.BoxGeometry(data.field.width, data.field.height, 1);
		const fieldMaterial = new THREE.MeshPhongMaterial({ color: data.ball.color, transparent: true, opacity: 0.1, reflectivity: 0.5 });

		this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);

		this.scene.add(this.field);
		this.field.position.set(0, 0, -1.5);
	};

	generatePaddles(data) {
		// const paddleMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff,  });
		const paddleGeometry = new THREE.BoxGeometry(data.paddle1.width, data.paddle1.height, 2);
		const paddleMaterial1 = new THREE.MeshPhongMaterial({ color: data.paddle1.color, transparent: true, opacity: 1, reflectivity: 0.5 });
		const paddleMaterial2 = new THREE.MeshPhongMaterial({ color: data.paddle2.color, transparent: true, opacity: 1, reflectivity: 0.5 });

		this.paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial1);
		this.paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);

		// add to scenethis.f
		this.scene.add(this.paddle1);
		this.scene.add(this.paddle2);
	};

	generateLights(data) {
		this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		this.directionalLight.position.set(0, 1, 1);

		this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

		// add to scene
		this.scene.add(this.directionalLight);
		this.scene.add(this.ambientLight);
	};

	generateSkyBox(data) {
		// Charger la texture de ciel étoilé
		const starTexture = new THREE.TextureLoader().load('../../assets/3D_Models/banana.jpg'); // Remplacez par le chemin de votre texture
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
		this.scene.add(starSphere);
	};
}
