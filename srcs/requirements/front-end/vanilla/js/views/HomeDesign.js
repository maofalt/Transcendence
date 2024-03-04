import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/HomeDesign.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import HighLightButton from "@components/HighLightButton";
import BigTitle from "../components/BigTitle";
import ChillButton from "../components/ChillButton";

export default class HomeDesign extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let div = document.createElement('div');
		const bigTitle = new BigTitle({content: "Cosmic<br>Pong"});
		bigTitle.setAttribute("margin", "5vh 0 15vh 0");
		bigTitle.setAttribute("margin-bottom", "300px");
		div.appendChild(bigTitle);
		const highLightButton = new HighLightButton({content: "Play !"});
		div.appendChild(highLightButton);
		const chillButton = new ChillButton({content : "Options"});
		div.appendChild(chillButton);
		this.shadowRoot.appendChild(div);
	}

	// Implement other methods or properties as needed
}

customElements.define('home-design', HomeDesign);