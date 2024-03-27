import getCookie from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/user.css?raw';
import userPageSource from '@html/userPageSource';

export default class User extends HTMLElement {
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

	async getHtml() {
		let logincontainer = document.createElement('div');
		logincontainer.appendChild(document.createElement('user-page'));
		return logincontainer.innerHTML;
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		// console.log('connectedCallback() called\n\n');
		this.setupEventListeners();
	}

	// this function gets called when the custom component is removed from the dom
	disconnectedCallback() {
		// console.log('disconnectedCallback() called\n\n');
	}

	// garbage collection for my event listeners
	addTrackedListener = (target, type, listener, options) => {
		// console.log("target:", target, "type:", type, "listener:", listener, "options:", options);
		target.addEventListener(type, listener, options);
		this.eventListeners.push({ target, type, listener }); // Store the listener details
	}

	setupEventListeners = () => {
		// get all the clickable elements in the page
		let clickableElems = {
			// '#closeLoginPopup': this.closeLoginPopup,
			'#deleteAccountLink': this.deleteAccount,
			'#redirectToGameStatsPage': this.redirectToGameStatsPage,
			'#confirmDeleteAccount': this.confirmDeleteAccount,
			'#cancelDeleteAccount': this.cancelDeleteAccount,
			'#redirectToHome': this.redirectToHome,
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
	
	deleteAccount = () => {
		this.shadowRoot.getElementById('deleteAccountModal').style.display = 'block';
	}
	
	redirectToGameStatsPage = () => {
		const username = "{{ data.username }}";
		window.location.href = '../gameHistory_microservice/api/game-stats/\${username}/';
	}
	
	confirmDeleteAccount = () => {
		this.shadowRoot.getElementById('deleteAccountModal').style.display = 'none';
	
		$.ajax({
			type: 'POST',
			url: '{% url "account:delete_account" %}',
			headers: { "X-CSRFToken": getCookie('csrftoken') },
			success: function (data) {
				if (data.success) {
					console.log('Print all user data successful:', data);
					this.shadowRoot.getElementById('deleteConfirmationModal').style.display = 'block';
				} else {
					console.error('Error deleting account:', data.error);
				}
			},
			error: function (error) {
				console.error('Error deleting account:', error);
			}
		});
	}
	
	cancelDeleteAccount = () => {
		this.shadowRoot.getElementById('deleteAccountModal').style.display = 'none';
	}
	
	redirectToHome = () => {
		window.location.href = '{% url "home" %}';
	}
	
}

customElements.define('user-page', User);
