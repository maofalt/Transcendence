import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import actionButtonStyles from '@css/ActionButtonV2.css?raw';
import normalButtonStyles from '@css/NormalButtonV2.css?raw';

export default class CutsomButton extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = this.setButtonStyle(options.action);
		this.shadowRoot.appendChild(styleEl);

		let p = document.createElement('p');
		p.id = "buttonText"
		p.textContent = "Go !";

		if (options.content) {
			console.log(options.content);
			p.textContent = options.content;
		}

		this.shadowRoot.appendChild(p);
	}

	setButtonStyle(action) {
		if (action) {
			return actionButtonStyles;
		}
		return normalButtonStyles;
	}
}

customElements.define('custom-button', CutsomButton);