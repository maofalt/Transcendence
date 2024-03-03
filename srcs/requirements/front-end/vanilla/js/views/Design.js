import AbstractView from "./AbstractView";
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import HighLightButton from "@components/HighLightButton";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/Design.css?raw';

export default class Design extends HTMLElement {
	constructor(element) {
		super(element);

		this.eventListeners = []; // garbage bin for my event listeners

		this.attachShadow({ mode: 'open' });

		// inject css into the shadow dom
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
		
		let div = document.createElement('div');
		const pannelComponent = new Pannel();
		div.appendChild(pannelComponent);
		const darkPannelComponent = new DarkPannel();
		div.appendChild(darkPannelComponent);
		const highLightButton = new HighLightButton();
		highLightButton.id = "highLightButton"; // Add the id "highLightButton"
		highLightButton.onEvent((event) => (event, this.testButton("hello?"), 'click'));
		div.appendChild(highLightButton);
		this.shadowRoot.appendChild(div);
		
		// inject raw html into shadow dom
		// this.shadowRoot.innerHTML += `
		// <div>
		// 	<glass-pannel></glass-pannel>
		// 	<dark-glass-pannel></dark-glass-pannel>
		// </div>`;
	}

	async getHtml() {
		let logincontainer = document.createElement('div');
		logincontainer.innerHTML = this.shadowRoot.innerHTML;
		// logincontainer.appendChild(document.createElement('design-page'));
		return logincontainer.innerHTML;

		// let logincontainer = document.createElement('div');
		// let designPage = document.createElement('design-page');
		// logincontainer.appendChild(designPage);
		// // document.body.appendChild(logincontaiTner); // Add logincontainer to the DOM
		// return logincontainer.outerHTML;
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		this.setupEventListeners(); // setup all event listeners for the page and track them
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

	setupEventListeners = () => {
		// get all the clickable elements in the page
		let clickableElems = {
			// '#closeLoginPopup': this.closeLoginPopup
			// '#submitOneTimeCode': this.submitOneTimeCode,
			// '#closeForgotPasswordModal': this.closeForgotPasswordModal,
			// '#sendUrlToEmail': this.sendUrlToEmail,
			// '#closeSignupPopup': this.closeSignupPopup,
			// '#sendVerificationCode': this.sendVerificationCode,
			// '#verifyCode': this.verifyCode,
			// '#openPrivacyPolicyPopup': this.openPrivacyPolicyPopup,
			// '#closePrivacyPolicyPopup': this.closePrivacyPolicyPopup,
			// '#darkLayer': this.closeLoginPopup,
			// '#devDbButton': this.redirectToDevSetting,
			// '#forgotPasswordLink': this.openForgotPasswordModal,
			// '#signupLink': this.openSignupPopup,
			// '#loginLink': this.openLoginPopup,
			// '#highLightButton': (e) => this.testButton(e, "button clicked arg!")
		};

		let submitableElems = {
			// '#signupForm': this.submitSignupForm,
			// '#loginForm': this.submitLoginForm
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

	testButton = (arg) => {
		// console.log(e, arg);
		console.log(arg);
	}
}

customElements.define('design-page', Design);
