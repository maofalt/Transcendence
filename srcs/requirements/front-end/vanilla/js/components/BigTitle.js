import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/BigTitle.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class BigTitle extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `<p>${options.content}</p>`;

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}
	}

	// Implement other methods or properties as needed
}

customElements.define('big-title', BigTitle);