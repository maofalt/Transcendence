import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import AbstractView from "@views/AbstractView";
import homePageStyle from '@css/HomePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";

export default class HomePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = homePageStyle;
		this.shadowRoot.appendChild(styleEl);

		// let div = document.createElement('div');
		const title = new BigTitle({content: "Cosmic<br>Pong", style: {width: "500px"}});
		title.style.setProperty("margin-left", "42px");
		// title.style.setProperty("text-justify", "center");
		this.shadowRoot.appendChild(title);
		title.shadowRoot.querySelector('p').style.setProperty('margin', '50px');
	
		const playButton = new CustomButton({content: "Play", action: true, style: {margin: "15px 0px"}});
		const tournamentsButton = new CustomButton({content: "Tournaments", style: {margin: "15px 0px"}});
		const optionsButton = new CustomButton({content: "Options", style: {margin: "15px 0px"}});
		const loginButton = new CustomButton({content: "Login", style: {margin: "15px 0px"}});

		const menu = document.createElement('div');
		menu.id = "menu";

		menu.appendChild(playButton);
		menu.appendChild(tournamentsButton);
		menu.appendChild(optionsButton);
		menu.appendChild(loginButton);

		const footer = new Pannel({title: " ", dark: true, style: {width: "100vw", height: "100px"}});

		// this.shadowRoot.appendChild(playButton);
		// this.shadowRoot.appendChild(tournamentsButton);
		// this.shadowRoot.appendChild(optionsButton);
		this.shadowRoot.appendChild(menu);
		this.shadowRoot.appendChild(footer);
		// this.shadowRoot.appendChild(div);
		// this.shadowRoot.appendChild(footer);

		playButton.onclick = () => navigateTo("/game");
		tournamentsButton.onclick = () => navigateTo("/tournament");
		optionsButton.onclick = () => navigateTo("/options");
		loginButton.onclick = () => navigateTo("/login");
	}
}

customElements.define('home-page', HomePage);