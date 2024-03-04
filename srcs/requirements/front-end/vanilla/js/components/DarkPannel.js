import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/darkPannel.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class DarkPannel extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		// this.shadowRoot.innerHTML += `
		// <div>
		// 	<p>DARK PANNEL</p>
		// </div>`;

		const div = document.createElement('div');
		const p = document.createElement('p');
		p.textContent = options.content;
		div.appendChild(p);
		this.shadowRoot.appendChild(div);
	}

	// Implement other methods or properties as needed
}

customElements.define('dark-glass-pannel', DarkPannel);