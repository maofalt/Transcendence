import AbstractView from "./AbstractView";
import AbstractComponent from "@components/AbstractComponent";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Texture } from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";
import purpleSpaceImg from '@images/purpleSpace.jpg';

import gameSettings from '@gameLogic/gameSettings.json';

// importing game logic code :
import lobbySettings from '@gameLogic/lobbySettings.js';
import { initLobby, initFieldShape } from '@gameLogic/init.js';
import debugDisp from '@gameLogic/debugDisplay.js';
import render from '@gameLogic/rendering.js';
// import { initFieldShape } from "../gameLogic/init";

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

export default class BasicGameV2 extends AbstractComponent {
	constructor(screenWidth, screenHeight) {
		super();
		this.loader = new GLTFLoader();
		// console.log("Game View created with matchID: ", query);
		// this.query = 'matchID=' + query;
		
        this.match = {};

		this.data;

		this.latency = 0;

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
		this.ballModel = null;
        this.paddles = [];
        this.walls = [];
		this.goals = [];
		this.scores = [];

		this.starSphere = null;
		this.starTexture = null;
		this.starGeometry = null;
		this.starMaterial = null;

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
		this.facing = 0.5;

		this.screenWidth = screenWidth || window.innerWidth;
		this.screenHeight = screenHeight || window.innerHeight;
		console.log("Screen size: ", this.screenWidth, this.screenHeight);
	};

	disconnectedCallback() {
        // clearInterval(this.match.gameInterval);
		this.cleanAll();
	}

	connectedCallback() {
		console.log("init Game View...");
		// Set up the game container
		this.container = document.createElement('div');
        this.container.id = 'game-container';
        this.shadowRoot.appendChild(this.container);

		// Create a new div
		let countDown = document.createElement('div');
		countDown.id = 'count-down';
		countDown.style.position = 'absolute';
		countDown.style.top = '0';
		countDown.style.width = "100%";
		countDown.style.textAlign = 'center';
		countDown.style.fontSize = '30px';
		countDown.style.color = 'white';
		countDown.innerHTML = `
			<style>			
				#timer {
					margin-bottom: 0;
				}
				#timer-message {
					font-size: 20px;
					margin: 0;
				}
			</style>
			<p id="timer"></p>
			<p id="timer-message"></p>
		`;

		let leaveButton = new CustomButton({ content: "< Leave", style: {
			padding: "0px 20px",
			position: "absolute",
			left: "50px",
			bottom: "30px",
			// width: "100px",
		}});

		leaveButton.onclick = () => {
			this.cleanAll();

			window.history.back();
		}

		this.container.appendChild(countDown);
		this.container.appendChild(leaveButton);
		
		// Your game setup logic here (init socket, create scene, etc.)
		// this.generateScene();

		// Initialize socket connection
		// this.initSocket();

		// Add event listeners (resize, key events, etc.)
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		window.addEventListener("keydown", this.handleKeyPress.bind(this));
		window.addEventListener("keyup", this.handleKeyRelease.bind(this));
        console.log("Game View initialized");

        console.log(this.match);
        this.localconnection();
	};

	onWindowResize() {
		this.camera.aspect = this.screenWidth / this.screenHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.screenWidth, this.screenHeight);
	};

	handleKeyPress(event) {
		// console.log(event.key);
		if (event.key == "s")
			this.localmoveUp(0);
		if (event.key == "w")
			this.localmoveDown(0);
		// console.log("KEYYYYYY: ", event.key);
		if (event.key == "ArrowUp")
			this.localmoveUp(1);
		if (event.key == "ArrowDown")
			this.localmoveDown(1);
    }
	handleKeyRelease(event) {
		if (event.key == "w" || event.key == "s")
			this.localstop(0);
		if (event.key == "ArrowUp" || event.key == "ArrowDown")
			this.localstop(1);
	};

    localerror = (error) => {
		console.error("Socket error: ", error);
		alert("Socket error: " + error);
	}

	localconnect_error = (error) => {
		console.error("Socket connection error we are here: ", error);
		alert("Socket connection error: " + error);
	}

	localwhoareyou = () => {
		this.socket.emit('ID', this.playerID, this.matchID);
	}

	localgenerate = (data) => {
		// Generate scene and update it
		data.playersArray = Object.values(data.players);
		// console.log("data : ", data);
		this.generateScene(data, this.socket);
		this.updateScene(data, this.socket);
		this.renderer.render(this.scene, this.camera);
	};
	
	localrender = (data) => {
		data.playersArray = Object.values(data.players);
		// if (data.ball.model && this.ballModel) {
			//console.log("Rendering Frame...");
			this.updateScene(data);
		// }
		// console.log("FPS: " + 1000 / callTracker() + "fps");
		// fps = 1000 / callTracker();
		this.renderer.render(this.scene, this.camera);
	};

	localdestroy = (data) => {
		this.scene.clear();
		console.log("DESTROY SCENE");
	}

	localrefresh = (data) => {
		// console.log("REFRESH SCENE");
		data.playersArray = Object.values(data.players);
		this.refreshScene(data);
	}

	localping = ([timestamp, latency]) => {
		this.socket.emit('pong', timestamp);
		let str = `Ping: ${latency}ms - FPS: ${fps.toFixed(1)}`;
		document.title = str;
		//console.log(str);
	};

	cleanAll() {
		console.log("CLEANING CLIENT !!");
		// Cleanup logic here (remove event listeners, etc.)
		window.removeEventListener('resize', this.onWindowResize.bind(this));
		window.removeEventListener("keydown", this.handleKeyPress.bind(this));
		window.removeEventListener("keyup", this.handleKeyRelease.bind(this));

        if(this.match.gameInterval)
            clearInterval(this.match.gameInterval);

		if (this.socket)
			this.socket.disconnect();

		if (this.scene)
			this.scene.clear();
		// Dispose of the renderer and remove its DOM element
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer.domElement.remove();
			this.renderer = null;
		}
	
		// Set the scene and camera to null
		this.scene = null;
		this.camera = null;
	}

	launchEndGameAnimation(winner) {
		let winColor = winner.color.toString(16);
		winColor = winColor.length < 6 ? "0".repeat(6 - winColor.length) + winColor : winColor;

		let uiLayer = document.createElement('div');
		uiLayer.id = 'uiLayer';
		uiLayer.style.width = '100%';
		uiLayer.style.height = '100%';
		uiLayer.style.background = 'rgba(0, 0, 0, 0)';
		uiLayer.style.position = 'absolute';
		uiLayer.style.top = '0';
		uiLayer.style.left = '0';
		uiLayer.style.display = 'flex';
		// uiLayer.style.textAlign = "center";
		uiLayer.style.setProperty("flex-direction", "column");
		uiLayer.style.justifyContent = 'center';
		uiLayer.innerHTML = `
			<style>
				#end-game-block {
					color: white;
					text-align: center;
					display: flex;
					flex-direction: column;
					// justify-content: center;
					// align-items: center;
				}
				h3 {
					margin: 0;
					padding: 0;
					font-family: 'tk-421', sans-serif;
					font-size: 100px;
				}
				p {
					display: inline;
					font-size: 50px;
				}
				#winner-name {
					color: #${winColor};
				}
			</style>
			<div id="end-game-block">
				<h3>Game Over</h3>
				<div id="winner-info">
					<p>Winner : </p><p id="winner-name">${winner.accountID}</p>
				</div>
			</div>
		`;

		let leaveButton = new CustomButton({ content: "< Leave", style: {padding: "0px 20px"}});
		leaveButton.style.position = "absolute";
		leaveButton.style.left = "50px";
		leaveButton.style.bottom = "30px";
		leaveButton.onclick = () => {
			this.cleanAll();

			window.history.back();
		}
		
		uiLayer.appendChild(leaveButton);

		this.container.appendChild(uiLayer);

		this.endGameAnimation(uiLayer);
	}

	// Define your animation function
	endGameAnimation = (uiLayer, frame = 0) => {
		let maxFrame = 50;

		uiLayer.style.background = `rgba(0, 0, 0, ${frame / (maxFrame * 1.8)})`;
		uiLayer.style.opacity = frame / maxFrame;
		uiLayer.style.backdropFilter = `blur(${frame / maxFrame * 16}px)`;
		// console.log(`blur(${frame / maxFrame * 16}px)`);
		if (frame == maxFrame) {
			console.log("End of Game !!");
			return ;
		}

		// Request the next frame
		requestAnimationFrame(() => this.endGameAnimation(uiLayer, frame + 1));
	}

	refreshScene(data) {
		this.scene = new THREE.Scene();
		const back = new THREE.TextureLoader().load('public/assets/3D_Models/deepspace.jpg');
		back.colorSpace = THREE.SRGBColorSpace;
		this.scene.background = back;
		
		this.renderer.setSize(this.screenWidth, this.screenHeight);
		
		this.container.appendChild(this.renderer.domElement);
		
		// generate objects
		this.generateSkyBox(data);
		this.generateBall(data);
		this.generatePaddles(data);
		this.generateWalls(data);
		this.generateGoals(data);
		this.generateLights(data);
		this.generateScores(data);
		
		// rotate the scene relative to the current client (so the paddle is at the bottom)
		this.scene.rotateZ(-2 * Math.PI/data.gamemode.nbrOfPlayers * this.facing)

		// this.drawAxes();
	}

	generateScene(data, socket) {
		console.log("Generating Scene...");

		this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

		// set the camera and set it to look at the center of the match
		this.camera = new THREE.PerspectiveCamera(45, this.screenWidth / this.screenHeight, 0.1, 1000);
		this.camera.position.set(data.camera.pos.x, data.camera.pos.y, data.camera.pos.z);
		this.camera.lookAt(new THREE.Vector3(data.camera.target.x, data.camera.target.y, data.camera.target.z));
		
		// set controls to orbit around the center of the match with the mouse
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 0);

		// get the direction to later rotate the scene relative to the current client
		// for (let i=0; i<data.playersArray.length; i++) {
		// 	if (data.playersArray[i].socketID == socket.id) {
		// 		console.log(`socket : ${data.playersArray[i].socketID}, client : ${socket.id}, ${i}, angle = ${data.playersArray[i].paddle.angle}`);
		// 		this.dir = i
		// 	}
		// }

		this.refreshScene(data);
	};

	displayTimer(data) {
		// in here : formatting the timer interface;
		let timer = this.shadowRoot.getElementById('timer');
		let timerMessage = this.shadowRoot.getElementById('timer-message');

		timer.textContent = data.ongoing ? "" : data.countDownDisplay;
		timerMessage.textContent = "";
		
		if (data.imminent) {
			timer.style.color = "red";
			timer.style.fontWeight = "bold";
			timerMessage.textContent = "Game will start soon";
		} else if (!data.ongoing) {
			timer.style.color = "white";
			timerMessage.textContent = "Waiting for players...";
		}
	}

	// Other methods (generateScene, updateScene, etc.) here
	updateScene(data, socket) {
		this.displayTimer(data);

		// console.log("Updating Scene...");
		// if (data.ball.model) {
		// 	this.ballModel.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		// 	this.ballModel.rotateX((-Math.PI / 20) * data.ball.sp);
		// 	this.ballModel.rotateZ((Math.PI / 24) * data.ball.sp);
		// } else {
		// 	if (data.ball.texture) {
		// 		// this.ball.mesh.rotateX(-Math.PI / 42 * data.ball.sp);
		// 		// this.ball.mesh.rotateX((-Math.PI / 20) * data.ball.sp);
		// 		// this.ball.mesh.rotateZ((Math.PI / 24) * data.ball.sp);
		// 		this.ball.mesh.rotateY(Math.PI / 42 * data.ball.sp);
		// 		this.ball.mesh.rotateZ(Math.PI / 36 * data.ball.sp);
		// 	}
			this.ball.mesh.position.set(data.ball.pos.x, data.ball.pos.y, 0);
		// }

		for (let i=0; i<data.playersArray.length; i++) {
			this.paddles[i].mesh.position.set(data.playersArray[i].paddle.pos.x, data.playersArray[i].paddle.pos.y, data.playersArray[i].paddle.pos.z);
			this.paddles[i].mesh.material.opacity = 1;
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
		// for (let i = 0; i < data.playersArray.length; i++) {
		// 	if (data.playersArray[i].socketID === this.socket.id) {
		// 		this.dir = i;
		// 	}
		// }

		if (!loader)
			return console.error("FontLoader not found");

		loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', ( response ) => {

			this.textSettings.font = response;

			this.refreshScores(data);

			console.log("Normal Font loaded");

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
		const profilePic = new THREE.TextureLoader().load(`public/assets/images/default-avatar.webp`);
		profilePic.wrapS = profilePic.wrapT = THREE.RepeatWrapping;
		profilePic.offset.set( 0, 0 );
		profilePic.repeat.set( 2, 1 );
		const loginText = player.accountID;
		const scoreText = player.score.toString();
		const ppRadius = 2;

		console.log("Creating score: " + scoreText + " for player " + i + " with dir: " + this.dir);
		// this.textSettings.font = this.textSettings.fontNormal;
		const profilePicGeo = new THREE.SphereGeometry(ppRadius, 12, 24);
		const loginGeo = new TextGeometry(loginText, this.textSettings);
		// const loginGeo = new TextGeometry(loginText, this.TKtext);
		const scoreGeo = new TextGeometry(scoreText, this.textSettings);
		// const scoreGeo = new TextGeometry(scoreText, this.TKtext);
		
		const profilePicMaterial = new THREE.MeshBasicMaterial({ map:profilePic });
		var scoreMaterial = new THREE.MeshBasicMaterial({ color: data.gamemode.gameType ? 0xff0000 : 0xffffff });
		var loginMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		
		const loginMesh = new THREE.Mesh(loginGeo, loginMaterial);
		const scoreMesh = new THREE.Mesh(scoreGeo, scoreMaterial);
		const profilePicMesh = new THREE.Mesh(profilePicGeo, profilePicMaterial);
		
		// computing bounding boxes
		profilePicGeo.computeBoundingBox();
		loginGeo.computeBoundingBox();
		scoreGeo.computeBoundingBox();
		
		// calculating sizes in order to setup the objects later
		const spaceBetween = 2; // change this to the amount of space you want between the meshes
		const textHeight = loginGeo.boundingBox.max.y - loginGeo.boundingBox.min.y;
		const loginWidth = loginGeo.boundingBox.max.x - loginGeo.boundingBox.min.x;
		const scoreWidth = scoreGeo.boundingBox.max.x - scoreGeo.boundingBox.min.x;
		const topWidth = (ppRadius * 2 + spaceBetween + scoreWidth);

		const totalWidth = Math.max(loginWidth, topWidth);
		const totalHeight = textHeight + ppRadius * 2 + spaceBetween;
		
		// creating a box that will contain everything.
		// login, score, profile picture.
		// this box can be truned visible for debug.
		const boxGeo = new THREE.BoxGeometry(totalWidth, textHeight + spaceBetween + ppRadius * 2, ppRadius * 2);
		const boxMesh = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
		const scoreBox = new THREE.Mesh(boxGeo, boxMesh);
		boxGeo.computeBoundingBox();
		
		// adding items to the parent box
		this.scores[i] = scoreBox;
		this.scores[i].add(profilePicMesh);
		this.scores[i].add(loginMesh);
		// if (data.ongoing || data.imminent)
		this.scores[i].add(scoreMesh);

		// positioning ui items

		profilePicMesh.position.set(-topWidth / 2 + ppRadius, spaceBetween, 0);
		scoreMesh.position.set(topWidth / 2 - scoreWidth, (totalHeight - textHeight) / 2 - ppRadius, 0);
		loginMesh.position.set(-loginWidth / 2, -totalHeight / 2, 0);
	
		// positionning ui box
		this.scores[i].position.set(
			data.playersArray[i].scorePos.x,
			data.playersArray[i].scorePos.y,
			data.playersArray[i].scorePos.z
		);

		this.scene.add(this.scores[i]);

		// rotate the score to face client
		this.scores[i].rotation.set(0, 0, 2 * Math.PI/data.gamemode.nbrOfPlayers * this.facing);
	}

	refreshScores(data) {
		if (!data || !data.playersArray || !this.textSettings || !this.textSettings.font)
			return console.log("Data or font not found");

		data.playersArray.forEach((player, index) => {

			if (this.prevScores[index] != player.score) {
				// console.log("Refreshing score: " + player.score + " for player " + index);
				if (this.scores[index])
					this.scene.remove(this.scores[index]);
				this.createScore(data, player, index);
			}
		
		});

		this.prevScores = data.playersArray.map(player => player.score);
	};

	async loadModel(path) {
		return new Promise((resolve, reject) => {
			this.loader.load(
				// Model URL
				path,
				// onLoad callback
				(gltf) => {
					resolve(gltf.scene);
				},
				// onProgress callback (optional)
				undefined,
				// onError callback (optional)
				(error) => reject(error)
			);
		});
	};

	async loadBallModel(data) {
		// Load the model
		this.loadModel(`public/assets/3D_Models/${data.ball.model}/scene.gltf`).then((model) => {
			console.log("MODEL LOADED", model);

			// Assign the loaded model to this.ballModel
			this.ballModel = model;

			let boundingBox = new THREE.Box3().setFromObject(this.ballModel);
			let size = boundingBox.getSize(new THREE.Vector3()); // Returns Vector3
			let len = size.x > size.y ? size.x : size.y;
			let scale = data.ball.r / (len / 2.2);
			this.ballModel.scale.set(scale, scale, scale);
	
			// Add the model to the scene
			this.scene.add(this.ballModel);
	
			// Continue with other setup or rendering logic
		}).catch((error) => {
			console.error("Error loading model: ", error);
		});
	}

	generateBall(data) {
		let ballTexture;
		let ballMaterial;

		// if (data.ball.model) {
		// 	console.log("LOAD STUFF");
		// 	this.loadBallModel(data);
		// 	return ;
		// }
		// console.log("DIDNT LOADGE");
		// if (data.ball.texture != "") {
		// 	ballTexture = new THREE.TextureLoader().load(`public/assets/images/${data.ball.texture}`);
		// 	ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture, transparent: false, opacity: 0.7 });
		// 	// ballTexture.wrapS = ballTexture.wrapT = THREE.RepeatWrapping;
		// 	// ballTexture.offset.set( 0, 0 );
		// 	// ballTexture.repeat.set( 2, 1 );
		// } else {
			ballMaterial = new THREE.MeshPhongMaterial({ color: data.ball.col, transparent: false, opacity: 0.7 });
		// }
		const ballGeometry = new THREE.SphereGeometry(data.ball.r, 24, 12);
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
		if (data.field.wallsSize == 0) {
			return ;
		}
		const wallGeometry = new THREE.BoxGeometry(data.field.wallsSize, 1, 2);
		const wallMaterial = new THREE.MeshBasicMaterial({ color: data.ball.col, transparent: true, opacity: 1, reflectivity: 0.5 });
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

	generateSkyBox(data) {
		// Charger la texture de ciel étoilé
		// this.starTexture = new THREE.TextureLoader().load('public/assets/images/blueSpace.jpg');
		// const starTexture1 = new THREE.TextureLoader().load('public/assets/images/PurpleLayer1.png');
		// const starTexture2 = new THREE.TextureLoader().load('public/assets/images/PurpleLayer2.png');
		// const starTexture3 = new THREE.TextureLoader().load('public/assets/images/PurpleLayer3.png');
		const starTextureBase = new THREE.TextureLoader().load(purpleSpaceImg);
		starTextureBase.colorSpace = THREE.SRGBColorSpace;
		// this.starTexture = new THREE.TextureLoader().load('public/assets/images/redSpace.jpg');

		// Créer la géométrie de la sphère
		// starTexture.colorSpace = THREE.SRGBColorSpace;
		// const starGeometry1 = new THREE.SphereGeometry(180, 32, 32);
		// const starGeometry2 = new THREE.SphereGeometry(200, 32, 32);
		// const starGeometry3 = new THREE.SphereGeometry(220, 32, 32);
		const starGeometryBase = new THREE.SphereGeometry(120, 32, 32);

		// Créer le matériau avec la texture
		// const starMaterial1 = new THREE.MeshBasicMaterial({
		// 	map: starTexture1,
		// 	side: THREE.BackSide,
		// 	transparent: true,
		// 	blending: THREE.AlphaBlending, // Use AlphaBlending for transparency
		// });
		// const starMaterial2 = new THREE.MeshBasicMaterial({
		// 	map: starTexture2,
		// 	side: THREE.BackSide,
		// 	transparent: true,
		// 	blending: THREE.AlphaBlending,
		// });
		// const starMaterial3 = new THREE.MeshBasicMaterial({
		// 	map: starTexture3,
		// 	side: THREE.BackSide,
		// 	transparent: true,
		// 	blending: THREE.AlphaBlending,
		// });
		// starTextureBase.colorSpace = THREE.SRGBColorSpace;
		const starMaterialBase = new THREE.MeshBasicMaterial({
			map: starTextureBase,
			side: THREE.BackSide,
			// transparent: true,
			// blending: THREE.AlphaBlending,
		});

		// Créer le mesh de la sphère
		// const starSphere1 = new THREE.Mesh(starGeometry1, starMaterial1);
		// const starSphere2 = new THREE.Mesh(starGeometry2, starMaterial2);
		// const starSphere3 = new THREE.Mesh(starGeometry3, starMaterial3);
		const starSphereBase = new THREE.Mesh(starGeometryBase, starMaterialBase);

		// Ajouter la sphère étoilée à la scène
		// this.scene.add(starSphere1);
		// this.scene.add(starSphere2);
		// this.scene.add(starSphere3);
		this.scene.add(starSphereBase);
	};

    handleConnectionV2() {

        console.log("\nCLIENT CONNECTED\n");
    
        // console.log('---DATA---\n', this.match.gameState, '\n---END---\n');
        this.localgenerate(this.match.gameState);
        console.log("handleconnection",this.match);
        
        this.match.gameInterval = setInterval(this.waitingRoom.bind(this), 20);

        console.log(`Player connected with ID: `);
    
        // client.emit('generate', data);
        // debugDisp.displayData(this.match.gameState);
    }
    
    // Set up Socket.IO event handlers
    localconnection = () => {
        // console.log("Socket connected");
        this.initMatch();
        // console.log("localconnection",this.match);
        //handle client connection and match init + players status
        // console.log("\nclient:\n", client.decoded);
        this.data = this.match.gameState;
        this.handleConnectionV2();
    }
    
    // player controls
    localmoveUp = (playerindex) => {
        // console.log(`client moving up`);
        let player = this.data.playersArray[playerindex];
        // console.log("player: ", player);
        // console.log("data: ", this.data);
        if (player && player.paddle && !player.paddle.dashSp) {
            player.paddle.currSp = player.paddle.sp;
        }
    }
    
    localmoveDown = (playerindex) => {
        // console.log(`client moving down`);
        let player = this.data.playersArray[playerindex];
        if (player && player.paddle && !player.paddle.dashSp) {
            player.paddle.currSp = -player.paddle.sp;
        }
    }
    
    localdash = (playerindex) => {
        // console.log(`client dashing`);
        let player = this.data.playersArray[playerindex];
        if (player && player.paddle && !player.paddle.dashSp) {
            if (player.paddle.currSp == 0) {
                // do something for this err case
                return ;
            }
            player.paddle.dashSp = player.paddle.currSp > 0 ? player.paddle.w * 1.5 : player.paddle.w * -1.5;
            // player.paddle.dashSp = player.paddle.w * 1.5 * (player.paddle.currSp > 0);
        }
    }
    
    localstop = (playerindex) => {
        // console.log(`client stopping`);
        let player = this.data.playersArray[playerindex];
        if (player && player.paddle && !player.paddle.dashing) {
            player.paddle.currSp = 0;
        }
    }
    
    // disconnect event
    localdisconnect = (playerindex) => {
        client.leave("gameRoom");
        this.data.connectedPlayers--;
        let player = this.data.playersArray[playerindex];
        if (player)
            player.connected = false;
        if (this.data.connectedPlayers < 1) {
            console.log("CLEARING INTERVAL");
            clearInterval(this.match.gameInterval);
            this.cleanAll();
            // matches.delete(client.matchID);
            // delete data;
        }
        console.log(`Client disconnected with ID: ${client.id})`);
    }
    
    // generateMatchID = (gameSettings) => {
    // 	// Convert request content to a string representation
    // 	const string = JSON.stringify(gameSettings);
    // 	// Use SHA-256 to hash the string
    // 	return crypto.createHash('sha256').update(string).digest('hex');
    // }
    
    // app.use(express.static('./public/remote/'));
    initMatch = () => {
        // Convert game settings to game state
        const gameState = initLobby(gameSettings);
        gameState.imminent = true;
        console.log("\nMATCH CREATED\n");
        this.match = { gameState: gameState, gameInterval: 0 };
    }

    localEndgame = (data) => {
        this.controls.enabled = false;

		this.launchEndGameAnimation(data.winner);

        // this.scene.clear();
        console.log("END OF GAME");
    }

    gameLoop() {
        let gameState = render.updateData(this.match.gameState);
        this.data = this.match.gameState;
        if (gameState == 1) {
            this.localdestroy(this.match.gameState);
			this.localrefresh(this.match.gameState);
        } else if (gameState == -1) {
            clearInterval(this.match.gameInterval); // stop the loop
            this.localdestroy(this.match.gameState);
            this.localEndgame(this.match.gameState);
            return ;
        }
        // else if (gameState == 0) {
        this.localrender(this.match.gameState);
    }
    
    countDown(match, mins, secs) {
        if (!match.gameState.timeLimit) {
            match.gameState.timeLimit = Date.now() + ((mins * 60) + secs) * 1000;
            console.log(`TIMER ENDS IN ${mins}:${secs}`);
        }
    
        // calculate the remaining time
        match.gameState.waitingRemainingTime = match.gameState.timeLimit - Date.now();
        let minutes = Math.floor(match.gameState.waitingRemainingTime / 60000);
        let seconds = Math.floor((match.gameState.waitingRemainingTime % 60000) / 1000);
        match.gameState.countDownDisplay = `${minutes < 10 ? "0" + minutes : minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
        // console.log(match.gameState.waitingRemainingTime);
        // console.log(`MATCH ${matchID} STARTS IN ${minutes}:${seconds}`);
    
        // if the countdown has finished, reset
        if (match.gameState.waitingRemainingTime <= 0) {
            // console.log("Countdown finished");
            match.gameState.timeLimit = null;
            match.gameState.waitingRemainingTime = null;
            return 1;
        }
        return 0;
    }
    
    waitingRoom() {
        // console.log("waitingroom",this.match);

        if (!this.match.gameState.imminent && !this.match.gameState.ongoing) {
            // this is called during the waiting of other players
            // if the game is still waiting for players we count down from a chosen amount
            // game status = !ongoing && !imminent;
            if (this.countDown(this.match, 0, 10) || this.match.gameState.connectedPlayers == this.match.gameState.gamemode.nbrOfPlayers) {
                // in here = timer has run out or enough players have joined
                // we set the ball at the center and keep it there
                // and put the game status to imminent;
                this.match.gameState.ball.pos.x = 0;
                this.match.gameState.ball.pos.y = 0;
                this.match.gameState.ball.dir.x = 0;
                this.match.gameState.ball.dir.y = 0;
                this.match.gameState.imminent = true;
            }
        }
        else if (this.match.gameState.imminent) {
            // this is called when the game status is imminent;
            // it is just going to count down 3 seconds for players to get ready.
            // game status = imminent but !ongoing;
            if (this.countDown(this.match, 0, 3)) {
                // in here = game is starting
                // we get rid of the timer, send the ball and put the
                // game status to ongoing, !imminent;
                // and we call the loop for the game physics and scoring;
                clearInterval(this.match.gameInterval);
                render.getBallDir(this.match.gameState);
                this.match.gameState.ongoing = true;
                this.match.gameState.imminent = false;
                this.match.gameInterval = setInterval(this.gameLoop.bind(this), 20);
            }
        }
    
        render.updateData(this.match.gameState);
        this.localrender(this.match.gameState);
    }
}

customElements.define('basic-game-v2', BasicGameV2);