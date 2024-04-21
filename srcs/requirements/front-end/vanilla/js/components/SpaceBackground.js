import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Texture } from 'three';
import AbstractComponent from "./AbstractComponent";
import spaceBackgroundStyle from '@css/SpaceBackground.css?raw';
import purpleSpaceImg from '@images/purpleSpace.jpg';
import venusImg from '@images/1.8kVenus.jpg';
import cloudsImg from '@images/1.8kClouds_A.png';

export default class SpaceBackground extends AbstractComponent {
	constructor(options = {}) {
		super();
		
		const styleEl = document.createElement('style');
		styleEl.textContent = spaceBackgroundStyle;
		this.shadowRoot.appendChild(styleEl);
		
		// Scene setup
		const scene = new THREE.Scene();
		
		// Camera setup
		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		// Create a container for the renderer's DOM element
		const container = document.createElement('div');
		this.shadowRoot.appendChild(container);
		
		// Renderer setup
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);
		// document.body.appendChild(renderer.domElement);

		// Resize listener
		window.addEventListener('resize', () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
		});
		
		const textureLoader = new THREE.TextureLoader();
		// Background setup
		// const loader = new THREE.TextureLoader();
		textureLoader.load(purpleSpaceImg, function(texture) {
			texture.colorSpace = THREE.SRGBColorSpace;
			scene.background = texture;
		});

		// Textured spheres
		const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);

		// Material for sphere 1
		const venus = textureLoader.load(venusImg);
		venus.colorSpace = THREE.SRGBColorSpace;
		const material1 = new THREE.MeshStandardMaterial({
			map: venus,
			roughness: 0.6, // Adjust roughness for specular reflections
			metalness: 0.7, // Adjust metalness for specular reflections
			transparent: false, // Make the material transparent if needed
			opacity: 1 // Set the opacity level if needed
		});
		const sphere1 = new THREE.Mesh(sphereGeometry, material1);
		sphere1.position.x = -1.4;
		sphere1.position.z = 3.7;
		sphere1.position.y = -0.6;

		const atm = textureLoader.load(cloudsImg);
		atm.colorSpace = THREE.SRGBColorSpace;
		const atmMaterial = new THREE.MeshStandardMaterial({
			// color: 0xbbffff, // Set color to white
			map: atm,
			roughness: 0.4, // Adjust roughness for specular reflections
			metalness: 0.6, // Adjust metalness for specular reflections
			transparent: true, // Make the material transparent if needed
			opacity: 1 // Set the opacity level if needed
		});
		
		const atmSphere = new THREE.Mesh(sphereGeometry, atmMaterial);

		atmSphere.scale.set(1.008, 1.008, 1.008); // Slightly larger scale
		atmSphere.position.x = -1.4;
		atmSphere.position.z = 3.7;
		atmSphere.position.y = -0.6;
		// atmSphere.position.x = 0;
		// atmSphere.position.z = 0;
		// atmSphere.position.y = 0;

		// Material for sphere 2
		const material2 = new THREE.MeshPhongMaterial({
			emissive: 0xfffffa, // Set the emissive color
			emissiveIntensity: 1 // Set the intensity of the emissive color
		});
		const sphere2 = new THREE.Mesh(sphereGeometry, material2);
		sphere2.position.x = 42;
		sphere2.position.z = -76;
		sphere2.scale.set(0.5, 0.5, 0.5);

		// Add spheres to the scene
		scene.add(sphere1);
		scene.add(sphere2);
		scene.add(atmSphere);

		// Light setup
		// const light = new THREE.PointLight(0xffffff, 1);
		// light.position.set(-0.1, 0, 3.7); // Position the light near the emitting sphere
		// scene.add(light);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.copy(sphere2.position); // Adjust position accordingly
		directionalLight.target = sphere1; // Target the first sphere
		scene.add(directionalLight);
		scene.add(directionalLight.target); // Add the target object to the scene

		// Animation function
		function animate() {
			requestAnimationFrame(animate);
			
			// Rotate spheres
			sphere1.rotation.y += 0.0001;
			atmSphere.rotation.y += 0.00006;
			// sphere2.rotation.y += 0.0001;
			
			renderer.render(scene, camera);
		}

		animate();

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				this.style.setProperty(key, value);
			}
		}
	}
}

customElements.define('space-background', SpaceBackground);