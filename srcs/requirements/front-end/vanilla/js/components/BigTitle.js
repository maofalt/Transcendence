import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/BigTitle.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class BigTitle extends AbstractComponent {
	constructor() {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<div>
			<h3>Cosmic Pong</h3>
		</div>`;
	}

	// Implement other methods or properties as needed
}

customElements.define('big-title', BigTitle);