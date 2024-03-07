import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import homePageStyle from '@css/HomePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';

export default class HomePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = homePageStyle;
		this.shadowRoot.appendChild(styleEl);

		const title = new BigTitle({content: "Cosmic<br>Pong", style: {border: "solid 1px blue"}});
		const footer = new Pannel({title: "Footer", dark: true, style: {width: "300px", height: "300px", background: "red"}});
		const playButton = new CustomButton({content: "Play", action: true});
		const tournamentsButton = new CustomButton({content: "Tournaments"});
		const optionsButton = new CustomButton({content: "Options"});

		let div = document.createElement('div');
		div.appendChild(title);
		div.appendChild(playButton);
		div.appendChild(tournamentsButton);
		div.appendChild(optionsButton);
		div.appendChild(footer);
		this.shadowRoot.appendChild(div);
		// this.shadowRoot.appendChild(footer);
	}
}

customElements.define('home-page', HomePage);