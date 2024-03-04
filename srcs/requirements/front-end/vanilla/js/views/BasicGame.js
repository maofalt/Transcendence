import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import io from 'socket.io-client';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Texture } from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/BasicGame.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class BasicGame extends AbstractComponent {
	constructor(element) {
		super(element);

		// inject css into the shadow dom
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
		
		let div = document.createElement('div');
		this.shadowRoot.appendChild(div);
		// const bigTitle = new BigTitle({content: "Cosmic<br>Pong"});
		// bigTitle.setAttribute("margin", "5vh 0 15vh 0");
		// bigTitle.setAttribute("margin-bottom", "300px");
		// div.appendChild(bigTitle);
		// const highLightButton = new HighLightButton({content: "Play !"});
		// div.appendChild(highLightButton);
		// const chillButton = new ChillButton({content : "Options"});
		// div.appendChild(chillButton);
		// this.shadowRoot.appendChild(div);
		// this.highLightButton = highLightButton;
		// // inject raw html into shadow dom
		// // this.shadowRoot.innerHTML += `
		// // <div>
		// // 	<glass-pannel></glass-pannel>
		// // 	<dark-glass-pannel></dark-glass-pannel>
		// // </div>`;
	}

}

customElements.define('basic-game', BasicGame);
