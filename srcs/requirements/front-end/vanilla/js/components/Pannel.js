import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/pannel.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class Pannel extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		// this.shadowRoot.innerHTML += `
		// <div>
		// 	<p>PANNEL</p>
		// </div>`;

		const div = document.createElement('div');
		const p = document.createElement('p');
		p.textContent = options.content;
		p.id = "pannelTitle";
		div.appendChild(p);
		this.shadowRoot.appendChild(div);
		div.setAttribute('width', options.width);
		div.setAttribute('height', options.height);
	}

	// Implement other methods or properties as needed
}

customElements.define('glass-pannel', Pannel);