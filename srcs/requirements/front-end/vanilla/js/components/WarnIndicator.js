import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import alertTriangle from "@public/alert-triangle.svg?raw";
import checkCircle from "@public/check-circle.svg?raw";
import googleAlert from "@public/google-alert.svg?raw";
// import inputFieldStyle from '@css/warnIndicator.css?raw';

var html = `

`;

export default class WarnIndicator extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = "";
		this.shadowRoot.appendChild(styleEl);

		this.div = document.createElement('div');
		this.div.innerHTML = alertTriangle;
		this.div.style.setProperty("display", "flex");
		this.div.style.setProperty("justify-content", "center");
		this.shadowRoot.appendChild(this.div);

		if (options.content) {
			this.div.append(options.content);
		}

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
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
				this.div.innerHTML = `<img src="${alertTriangle}" alt="Icon">`;
			} else {
				this.div.innerHTML = `<img src="${checkCircle}" alt="Icon">`;
			}
		}
	}
}

customElements.define('warn-indicator', WarnIndicator);