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

		this.input = document.createElement('input');
		this.input.setAttribute("placeholder", (options.content ? options.content : "Input"));
		this.input.setAttribute("type", options.type ? options.type : "text");
		this.input.setAttribute("name", options.name ? options.name : "input");
		this.shadowRoot.appendChild(this.input);

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				this.shadowRoot.querySelector('input').style.setProperty(key, value);
			}
		}
	}

	getValue = () => {
		// console.log('getValue', this.input.value);
		return this.input.value;
	}
}

customElements.define('input-field', InputField);