import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/userPage.css?raw';
import loginPageSource from "@views/loginPageSource";
// import { this.toggleClass, this.prop, this.fadeIn, this.fadeOut } from "@utils/jqueryUtils";

export default class UserPage extends HTMLElement {
	constructor() {
		super();

		this.eventListeners = []; // garbage bin for my event listeners

		this.attachShadow({ mode: 'open' });
		
		// inject css into the shadow dom
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
		
		// inject raw html into shadow dom
		this.shadowRoot.innerHTML += userPageSource;
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		this.setupEventListeners();
	}

	// this function gets called when the custom component is removed from the dom
	disconnectedCallback() {
		console.log('disconnectedCallback() called\n\n');
	}

	// garbage collection for my event listeners
	addTrackedListener = (target, type, listener, options) => {
		target.addEventListener(type, listener, options);
		this.eventListeners.push({ target, type, listener }); // Store the listener details
	}

	setupEventListeners = () => {
		// get all the clickable elements in the page
		let clickableElems = {
			// '#closeLoginPopup': this.closeLoginPopup,
			// '#submitOneTimeCode': this.submitOneTimeCode,
			// '#closeForgotPasswordModal': this.closeForgotPasswordModal,
			// '#sendUrlToEmail': this.sendUrlToEmail,
			// '#closeSignupPopup': this.closeSignupPopup,
			// '#sendVerificationCode': this.sendVerificationCode,
			// '#verifyCode': this.verifyCode,
			// '#openPrivacyPolicyPopup': this.openPrivacyPolicyPopup,
			// '#closePrivacyPolicyPopup': this.closePrivacyPolicyPopup,
			// '#darkLayer': this.closeLoginPopup,
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
			this.addTrackedListener(this.shadowRoot.querySelector(selector), "click", action);
		});

	}
}