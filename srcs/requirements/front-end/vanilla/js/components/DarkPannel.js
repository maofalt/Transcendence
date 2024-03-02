import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/darkPannel.css?raw';

export default class DarkPannel extends HTMLElement {
	constructor(element) {
		super(element);

		// Customize the constructor if needed
		this.attachShadow({ mode: 'open' });

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<div>
			<h3>DARK PANNEL</h3>
		</div>`;
	}

	// Implement other methods or properties as needed
}

customElements.define('dark-glass-pannel', DarkPannel);