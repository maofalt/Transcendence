import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/BigTitle.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class BigTitle extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		
		
		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
		<p>${options.content}</p>`;

		this.shadowRoot.appendChild(styleEl);
		
		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}
		// this.style.setProperty("font-family", "Anta");
	}

	// Implement other methods or properties as needed
}

customElements.define('big-title', BigTitle);