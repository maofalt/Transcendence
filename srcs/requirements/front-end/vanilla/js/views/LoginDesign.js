import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginDesign.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";

export default class LoginDesign extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let container = document.createElement('div');
		this.shadowRoot.appendChild(container);
	}

	styleButtonRow(buttonRow) {
		buttonRow.style.display = "flex";
		buttonRow.style.flexDirection = "row";
		buttonRow.style.alignItems = "center";
		buttonRow.style.justifyContent = "center";
		buttonRow.style.width = "80%";
		buttonRow.style.border = "1px red solid";
	}

	styleButton(button) {
		button.setAttribute("width", "110px");
		button.setAttribute("font-size", "32px");
		button.style.border = "1px red solid";
	}
	// Implement other methods or properties as needed
}

customElements.define('login-design', LoginDesign);