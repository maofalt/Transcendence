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
		input.setAttribute("placeholder", "Write something !");

		if (options.content) {
			console.log(options.content);
			// p.textContent = options.content;
			// input.placeholder = options.content;
			input.setAttribute("placeholder", options.content);
		}

		if (options.width) {
			this.style.width = options.width;
		}
		if (options.height) {
			this.style.height = options.height;
		}

		this.shadowRoot.appendChild(input);
	}
}

customElements.define('input-field', InputField);