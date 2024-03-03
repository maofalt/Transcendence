import AbstractView from "./AbstractView";
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import HighLightButton from "@components/HighLightButton";
import BigTitle from "../components/BigTitle";
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
		const bigTitle = new BigTitle();
		div.appendChild(bigTitle);
		const pannelComponent = new Pannel();
		div.appendChild(pannelComponent);
		const darkPannelComponent = new DarkPannel();
		div.appendChild(darkPannelComponent);
		const highLightButton = new HighLightButton({content: "HELLooo"});
		div.appendChild(highLightButton);
		this.shadowRoot.appendChild(div);
		this.highLightButton = highLightButton;
		// inject raw html into shadow dom
		// this.shadowRoot.innerHTML += `
		// <div>
		// 	<glass-pannel></glass-pannel>
		// 	<dark-glass-pannel></dark-glass-pannel>
		// </div>`;
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		// this.darkPannelComponent.height = "300px";
		// this.darkPannelComponent.width = "500px";
		this.highLightButton.onEvent((e) => this.buttonOnClick(e, "button clicked!"), "click");
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
		// this.shadowRoot.querySelectorAll('highlight-button').forEach((button) => {
		// 	button.onClick((e) => this.testButton(e, "hello?"));
		// });

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

	buttonOnClick = (e, arg) => {
		console.log(e, arg);
	}
}

customElements.define('design-page', Design);
