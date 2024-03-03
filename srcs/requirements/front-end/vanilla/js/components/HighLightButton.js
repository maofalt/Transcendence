import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import styles from '@css/HighLightButton.css?raw';

export default class HighLightButton extends AbstractComponent {
	constructor(element) {
		super(element);

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<div>
			<p>PLAY</p>
		</div>`;
	}
}

customElements.define('highlight-button', HighLightButton);