import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import alertTriangle from "@public/alert-triangle.svg?raw";
import checkCircle from "@public/check-circle.svg?raw";
import googleAlert from "@public/google-alert.svg?raw";
// import inputFieldStyle from '@css/warnIndicator.css?raw';

export default class InfoPopup extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.options = options;

		// const styleEl = document.createElement('style');
		// styleEl.textContent = "";
		// this.shadowRoot.appendChild(styleEl);

		this.div = document.createElement('div');

		this.icons = {
			alertTriangle: htmlToElement(alertTriangle),
			checkCircle: htmlToElement(checkCircle),
			googleAlert: htmlToElement(googleAlert),
		}

		for (const svg of Object.values(this.icons)) {
			svg.style.setProperty("flex-shrink", "0");
			svg.style.setProperty("margin", "8px");
		}

		this.div.appendChild(this.icons.alertTriangle);

		this.div.style.setProperty("display", "flex");
		this.div.style.setProperty("justify-content", "center");
		this.div.style.setProperty("align-items", "center");
		this.div.style.setProperty("color", "red");
		
		if (!options.content) {
			this.options.content = "This is a warning!";
		}

		this.messageP = htmlToElement(`<p>${options.content}</p>`);
		// this.messageP.style.setProperty("flex-shrink", "1");
		// this.messageP.style.setProperty("margin", "0");
		this.div.append(this.messageP);
		
		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.div.style.setProperty(key, value);
			}
		}

		this.shadowRoot.appendChild(this.div);
	}

	static get observedAttributes() {
		return [
			'width', 
			'height', 
			'valid', 
			'content',
			'type',
			'message',
		];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log("attributeChangedCallback: ", name, oldValue, newValue);
		if (name === 'width' || name === 'height') {
			this.style.setProperty(name, newValue);
		}
		if (name === 'type') {
			if (newValue === "error") {``
				// console.log('newValue', newValue);
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.alertTriangle, icon);
				this.div.style.setProperty("color", "red");
			} else if (newValue === "success") {
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.checkCircle, icon);
				this.div.style.setProperty("color", "green");
			} else if (newValue === "info") {
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.googleAlert, icon);
				this.div.style.setProperty("color", "orange");
			} else {
				console.log("Unknown type: ", newValue);
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.googleAlert, icon);
				this.div.style.setProperty("color", "blue");
			}
		}
		if (name === 'message') {
			this.options.content = newValue;
			let message = this.div.querySelector('p');
			message.textContent = newValue;
			// console.log('message', message);
			// console.log("newValue", newValue);
		}
	}
}

customElements.define('info-popup', InfoPopup);