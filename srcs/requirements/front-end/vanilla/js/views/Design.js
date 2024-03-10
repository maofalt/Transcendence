import AbstractView from "./AbstractView";
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/Design.css?raw';
import LoginPage from '@components/LoginPage'
import SignUpPage from "@components/SignUpPage";
import HomePage from "@components/HomePage";
import PlayMenu from "@components/PlayMenu";

export default class Design extends HTMLElement {
	constructor(element) {
		super(element);

		this.eventListeners = []; // garbage bin for my event listeners

		this.attachShadow({ mode: 'open' });

		// inject css into the shadow dom
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// let div = document.createElement('div');
		// let div1 = document.createElement('div');
		// let div2 = document.createElement('div');
		// let div3= document.createElement('div');
		// let div4 = document.createElement('div');

		// div1.id = "div1";
		// div2.id = "div2";
		// div3.id = "div3";
		// div4.id = "div4";

		// div.appendChild(div1);
		// div.appendChild(div2);
		// div.appendChild(div3);
		// div.appendChild(div4);

		// let glassPannel = new Pannel({title: "Pannel", dark: false});
		// let darkPannel = new Pannel({title: "Dark Pannel", dark: true});
		// let actionButton = new CustomButton({content: "Start", action: true});
		// let normalButton = new CustomButton({content: "Credits"});
		// let inputField = new InputField({content: "This is a test!", width: "300px"});

		// div1.appendChild(glassPannel);
		// div1.appendChild(darkPannel);
		// div2.appendChild(actionButton);
		// div2.appendChild(normalButton);
		// div3.appendChild(inputField);

		let loginPage = new LoginPage();
		let homePage = new HomePage();
		let playMenu = new PlayMenu();
		let signupPage = new SignUpPage();

		this.shadowRoot.appendChild(loginPage);
		// this.shadowRoot.appendChild(signupPage);
		// this.shadowRoot.appendChild(homePage);
		// this.shadowRoot.appendChild(playMenu);
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		console.log('connectedCallback() called\n\n');
		// this.highLightButton.onEvent((e) => this.buttonOnClick(e, "button clicked!"), "click");
		// this.highLightButton.onclick = (e) => this.buttonOnClick(e, "Play button clicked!");
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
