import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import AbstractView from "@views/AbstractView";
import style from '@css/PlayMenu.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';

export default class PlayMenu extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = style;
		this.shadowRoot.appendChild(styleEl);

		// let div = document.createElement('div');
        let classicPong = new Pannel({title: "Classic Pong"});
        let customGame = new Pannel({title: "Custom Game"});
        let bigTitle = new BigTitle({content: "Cosmic<br>Pong"});
		bigTitle.style.setProperty("border", "3px green solid");

		const menu = document.createElement('div');
		menu.id = "menu";

		const classicDesc = document.createElement('p');
		classicDesc.className = "gameDesc";
		classicDesc.textContent = "Play a game of classic Pong with a friend, on the same keyboard.";
		classicDesc.style.setProperty("font-size", "20px");

		const classicContainer = document.createElement('div');
		classicContainer.className = "container";
		
		const classicPongImage = new Image();
        classicPongImage.src = '../js/assets/images/purpleSpace.jpg'; // Replace with your image path
        classicPongImage.className = 'pannel-image';
		classicPong.shadowRoot.appendChild(classicDesc);
		// classicContainer.appendChild(classicPongImage);
        classicPong.shadowRoot.appendChild(classicContainer);


		const customDesc = document.createElement('p');
		customDesc.className = "gameDesc";
		customDesc.textContent = "Create your own game of Pong and play remotely with up to 7 friends."
		customDesc.style.setProperty("font-size", "20px");
		
		const customContainer = document.createElement('div');
		customContainer.className = "container";

        const customGameImage = new Image();
        customGameImage.src = '../js/assets/images/purpleSpace.jpg'; // Replace with your image path
        customGameImage.className = 'pannel-image';
		customGame.shadowRoot.appendChild(customDesc);
		// customContainer.appendChild(customGameImage);
        customGame.shadowRoot.appendChild(customContainer);
		

		menu.appendChild(classicPong);
        menu.appendChild(customGame);

		// menu.style.setProperty("border", "1px red solid");
		
        this.shadowRoot.appendChild(bigTitle);
        this.shadowRoot.appendChild(menu);

		// this.shadowRoot.appendChild(div);
		// this.shadowRoot.appendChild(footer);
	}
}

customElements.define('play-menu', PlayMenu);
