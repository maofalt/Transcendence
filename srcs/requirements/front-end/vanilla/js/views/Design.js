import AbstractView from "./AbstractView";
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import HighLightButton from "@components/HighLightButton";
import BigTitle from "../components/BigTitle";
import Navigation from "../components/Navigation";
import ChillButton from "../components/ChillButton";
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
		const bigTitle = new BigTitle({content: "Cosmic<br>Pong"});
		bigTitle.setAttribute("margin", "5vh 0 15vh 0");
		bigTitle.setAttribute("margin-bottom", "300px");
		div.appendChild(bigTitle);
		const highLightButton = new HighLightButton({content: "Play !"});
		div.appendChild(highLightButton);
		const chillButton = new ChillButton({content : "Options"});
		div.appendChild(chillButton);
		this.shadowRoot.appendChild(div);
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		// this.highLightButton.onEvent((e) => this.buttonOnClick(e, "button clicked!"), "click");
		this.highLightButton.onclick = (e) => this.buttonOnClick(e, "Play button clicked!");
		// this.chillButton.onclick = (e) => this.buttonOnClick(e, "Options button clicked!");
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
