import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import inputFieldStyle from '@css/InputField.css?raw';

export default class InputField extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = inputFieldStyle;
		this.shadowRoot.appendChild(styleEl);

		let input = document.createElement('input');
		input.setAttribute("placeholder", (options.content ? options.content : "Write something !"));

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}

		this.shadowRoot.appendChild(input);
	}
}

customElements.define('input-field', InputField);