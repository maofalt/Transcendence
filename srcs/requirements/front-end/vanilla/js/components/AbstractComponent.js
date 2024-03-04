export default class AbstractComponent extends HTMLElement {
	constructor() {
		super();

		this.eventListeners = []; // garbage bin for my event listeners

		// Customize the constructor if needed
		this.attachShadow({ mode: 'open' });

		// Example: Set inner HTML
		this.shadowRoot.innerHTML += "";
	}

	static get observedAttributes() {
		return ['width', 'height', 'color', 'background', 'margin', 'font-size'];
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		// this.setupEventListeners(); // setup all event listeners for the page and track them
	}

	attributeChangedCallback(name, oldValue, newValue) {
		// if (name === 'width' || name === 'height') {
			// Select an element inside the shadow root
			let element = this.shadowRoot.querySelector('div');
	
			// Set the style of the selected element
			if (element) {
				element.style[name] = newValue;
			}
		// }
	}

	// this function gets called when the custom component is removed from the dom
	disconnectedCallback() {
		console.log('disconnectedCallback() called\n\n');
		// remove all tracked event listeners on the page
		this.eventListeners.forEach(({ target, type, listener }) => {
			target.removeEventListener(type, listener);
		});
		this.eventListeners = [];
	}

	// garbage collection for my event listeners
	addTrackedListener = (target, type, listener, options) => {
		target.addEventListener(type, listener, options);
		this.eventListeners.push({ target, type, listener }); // Store the listener details
	}

	onEvent = (funct, type) => {
		// event.preventDefault();
		// event.stopPropagation();
		console.log('funct: ', funct);
		console.log('type: ', type);
		// console.trace();
		this.addTrackedListener(this, type, funct);
	}

	setupEventListeners = () => {
		let clickableElems = {
			// '#idOfElement': functionToRun,
		};

		let submitableElems = {
			// '#idOfElement': functionToRun,
		}

		// add all 'submit' event listeners to all forms
		Object.entries(submitableElems).forEach(([selector, action]) => {
			this.addTrackedListener(this.shadowRoot.querySelector(selector), "submit", action)
		});

		// add 'click' event listeners to each clickable element with corresponding function
		Object.entries(clickableElems).forEach(([selector, action]) => {
			this.addTrackedListener(this.shadowRoot.querySelector(selector), 'click', action);
		});
	}
}
