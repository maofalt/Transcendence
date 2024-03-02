import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import styles from '@css/HighLightButton.css?raw';

export default class HighLightButton extends AbstractComponent {
	constructor(element) {
		super(element);

		this.eventListeners = []; // garbage bin for my event listeners

		// Customize the constructor if needed
		// this.attachShadow({ mode: 'open' });

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += `
		<div>
			<p>PLAY</p>
		</div>`;
	}

	// // this function gets called when the custom component gets added to the dom
	// connectedCallback() {
	// 	console.log('connectedCallback() called\n\n');
	// 	// this.setupEventListeners(); // setup all event listeners for the page and track them
	// }

	// // this function gets called when the custom component is removed from the dom
	// disconnectedCallback() {
	// 	console.log('disconnectedCallback() called\n\n');
	// 	// remove all tracked event listeners on the page
	// 	this.eventListeners.forEach(({ target, type, listener }) => {
	// 		target.removeEventListener(type, listener);
	// 	});
	// 	this.eventListeners = [];
	// }

	// // garbage collection for my event listeners
	// addTrackedListener = (target, type, listener, options) => {
	// 	target.addEventListener(type, listener, options);
	// 	this.eventListeners.push({ target, type, listener }); // Store the listener details
	// }

	// onClick = (arg) => {
	// 	this.addTrackedListener(this, 'mouseover', arg)
	// }
	// Implement other methods or properties as needed
}

customElements.define('highlight-button', HighLightButton);