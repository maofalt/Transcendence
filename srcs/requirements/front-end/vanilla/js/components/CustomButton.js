import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import actionButtonStyles from '@css/ActionButtonV2.css?raw';
import normalButtonStyles from '@css/NormalButtonV2.css?raw';

export default class CustomButton extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = options.action ? actionButtonStyles : normalButtonStyles
		this.shadowRoot.appendChild(styleEl);

		let p = document.createElement('p');
		p.id = "buttonText"

		p.textContent = options.content ? options.content : "Go !";

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}

		this.shadowRoot.appendChild(p);
	}
}

customElements.define('custom-button', CustomButton);