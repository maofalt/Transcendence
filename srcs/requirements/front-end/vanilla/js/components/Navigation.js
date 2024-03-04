import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/Navigation.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import BigTitle from "../components/BigTitle";

export default class Navigation extends AbstractComponent {
	constructor() {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		const glassPannel = new Pannel({content: "Pannel", width: "90vw", height: "10vh"});
		const darkPannel = new DarkPannel();
		const darkPannel1 = new DarkPannel();
		let title = glassPannel.shadowRoot.querySelector("#pannelTitle");
		glassPannel.shadowRoot.querySelector('div').removeChild(title);
		glassPannel.setAttribute("width", "90vw");
		glassPannel.setAttribute("height", "10vh");
		darkPannel.setAttribute("width", "0");
		darkPannel.setAttribute("height", "0");
		darkPannel1.setAttribute("width", "0");
		darkPannel1.setAttribute("height", "0");
		glassPannel.shadowRoot.querySelector('div').appendChild(darkPannel);
		glassPannel.shadowRoot.querySelector('div').appendChild(darkPannel1);
		this.shadowRoot.appendChild(glassPannel);
	}

	// Implement other methods or properties as needed
}

customElements.define('navigation-bar', Navigation);