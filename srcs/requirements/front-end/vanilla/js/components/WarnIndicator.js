import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import alertTriangle from "@public/alert-triangle.svg?raw";
import checkCircle from "@public/check-circle.svg?raw";
import googleAlert from "@public/google-alert.svg?raw";
// import inputFieldStyle from '@css/warnIndicator.css?raw';

export default class WarnIndicator extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.options = options;

		// const styleEl = document.createElement('style');
		// styleEl.textContent = "";
		// this.shadowRoot.appendChild(styleEl);

		this.div = document.createElement('div');
		this.div.appendChild(htmlToElement(alertTriangle));
		this.div.style.setProperty("display", "flex");
		this.div.style.setProperty("justify-content", "center");
		this.div.style.setProperty("align-items", "center");
		this.div.style.setProperty("color", "red");
		this.shadowRoot.appendChild(this.div);

		if (!options.content) {
			this.options.content = "This is a warning!";
		}
		this.div.append(options.content);

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				this.div.style.setProperty(key, value);
			}
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'width' || name === 'height') {
			this.style.setProperty(name, newValue);
		}
		if (name === 'valid') {
			if (newValue === "false") {
				// console.log('newValue', newValue);
				this.div.innerHTML = alertTriangle;
				this.div.style.setProperty("color", "red");
				this.div.append(this.options.content);
			} else {
				this.div.innerHTML = checkCircle;
				this.div.style.setProperty("color", "green");
				this.div.append(this.options.content);
			}
			this.div.querySelector('svg').style.setProperty("margin-right", "5px");
		}
	}
}

customElements.define('warn-indicator', WarnIndicator);