import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/darkPannel.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class DarkPannel extends AbstractComponent {
	constructor() {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<div>
			<p>DARK PANNEL</p>
		</div>`;
	}

	// Implement other methods or properties as needed
}

customElements.define('dark-glass-pannel', DarkPannel);