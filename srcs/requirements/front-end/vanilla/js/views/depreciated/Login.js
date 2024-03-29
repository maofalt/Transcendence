import { makeApiRequest } from "../../utils/makeApiRequest";
import AbstractView from "../AbstractView";
import getCookie from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/login.css?raw';
// import loginPageSource from "@html/loginPageSource";
import loginPageSource from "@html/NewLoginPageSource";

export default class Login extends HTMLElement {
	constructor(element) {
		super(element);

		this.eventListeners = []; // garbage bin for my event listeners
		this.signupClicked = false; // flag to check if the signup link was clicked

		this.attachShadow({ mode: 'open' });
		
		// inject css into the shadow dom
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
		
		// inject raw html into shadow dom
		this.shadowRoot.innerHTML += loginPageSource;
	}

	async getHtml() {
		let logincontainer = document.createElement('div');
		logincontainer.appendChild(document.createElement('login-page'));
		return logincontainer.innerHTML;
	}

	// this function gets called when the custom component gets added to the dom
	connectedCallback() {
		// console.log('connectedCallback() called\n\n');
		this.setupEventListeners(); // setup all event listeners for the page and track them
	}

	// this function gets called when the custom component is removed from the dom
	disconnectedCallback() {
		// console.log('disconnectedCallback() called\n\n');
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
			'#closeLoginPopup': this.closeLoginPopup,
			'#submitOneTimeCode': this.submitOneTimeCode,
			'#closeForgotPasswordModal': this.closeForgotPasswordModal,
			'#sendUrlToEmail': this.sendUrlToEmail,
			'#closeSignupPopup': this.closeSignupPopup,
			'#sendVerificationCode': this.sendVerificationCode,
			'#verifyCode': this.verifyCode,
			'#openPrivacyPolicyPopup': this.openPrivacyPolicyPopup,
			'#closePrivacyPolicyPopup': this.closePrivacyPolicyPopup,
			'#darkLayer': this.closeLoginPopup,
			'#devDbButton': this.redirectToDevSetting,
			'#forgotPasswordLink': this.openForgotPasswordModal,
			'#signupLink': this.openSignupPopup,
			'#loginLink': this.openLoginPopup,
		};

		let submitableElems = {
			'#signupForm': this.submitSignupForm,
			'#loginForm': this.submitLoginForm
		}

		// add all 'submit' event listeners to all forms
		Object.entries(submitableElems).forEach(([selector, action]) => {
			this.addTrackedListener(this.shadowRoot.querySelector(selector), "submit", action)
		});

		// add 'click' event listeners to each clickable element with corresponding function
		Object.entries(clickableElems).forEach(([selector, action]) => {
			this.addTrackedListener(this.shadowRoot.querySelector(selector), "click", action);
		});

		// check that password confirmation matches the initial password
		this.addTrackedListener(this.shadowRoot.querySelector("#confirmPassword"), 'input', this.checkPasswordMatch);

		this.updateSignupButtonStatus();
		this.toggleClass("#signupButton", "enabled", false);

		this.shadowRoot.querySelectorAll("#signupForm input").forEach(input => {
			input.addEventListener("input", () => {
				this.updateSignupButtonStatus();
			});
		});
	}

	redirectToDevSetting = () => {
		fetch('/api/user_management/auth/developer_setting', {
			method: 'GET',
		})
			.then(response => {
				if (response.ok) {
					console.log('Print all user data successful:', response);
					window.location.href = '/api/user_management/auth/developer_setting';
				} else {
					console.log('Error Cannot print user data:', response.statusText);
				}
			})
			.catch(error => {
				console.error('Error Cannot print user data:', error);
			});
	}

	checkPasswordMatch = () => {
		var password = this.shadowRoot.querySelector("#signupForm input[name='password']").value;
		var confirmPassword = this.shadowRoot.querySelector("#confirmPassword").value;

		if (password !== confirmPassword) {
			this.shadowRoot.querySelector("#confirmPasswordError").textContent = "Passwords do not match";
		} else {
			this.shadowRoot.querySelector("#confirmPasswordError").textContent = "";
		}
	}

	updateSignupButtonStatus = () => {
		console.log('updateSignupButtonStatus() called\n\n');

		var form = this.shadowRoot.querySelector("#signupForm");
		var allFieldsFilled = Array.from(form.elements).every((element) => {
			return element.checkValidity();
		});

		var password = this.shadowRoot.querySelector("#signupForm input[name='password']").value;
		var confirmPassword = this.shadowRoot.querySelector("#confirmPassword").value;
		var isPasswordMatch = password === confirmPassword;

		var isCodeVerified = this.shadowRoot.querySelector("#successMessage").textContent === "Verified successfully";

		if (allFieldsFilled && isPasswordMatch && isCodeVerified) {
			this.prop("#signupButton", "disabled", false);
			console.log('BUTTON: need to be enable\n\n');
			
		} else {
			this.prop("#signupButton", "disabled", true);
		}
		this.toggleClass("#signupButton", "enabled", allFieldsFilled && isPasswordMatch && isCodeVerified);
	}


	/* Opening and Closing */

	openPrivacyPolicyPopup = (e) => {
		if (e)
			e.preventDefault();
		fetch("/api/user_management/auth/policy")
		.then(response => response.text())
		.then(data => {
			let popup = this.shadowRoot.querySelector("#privacyPolicyPopup");
			let container = document.createElement("div");
			container.innerHTML = data;
			popup.appendChild(container);
			popup.style.display = "block";
		});
	}

	closePrivacyPolicyPopup = (e) => {
		if (e)
			e.preventDefault();
		this.fadeOut("#privacyPolicyPopup");
	}

	openForgotPasswordModal = () => {
		this.fadeIn("#darkLayer");
		this.fadeIn("#forgotPasswordModal");
	}

	closeForgotPasswordModal = () => {
		this.fadeOut("#darkLayer");
		this.fadeOut("#forgotPasswordModal");
	}

	openSignupPopup = (event) => {
		if (event)
			event.stopPropagation()
		this.signupClicked = true;
		console.log('close login popup');
		this.fadeIn("#darkLayer");
		console.log('opacity applied');
		this.fadeIn("#signupPopup");
		console.log('fade in signup popup\n\n');
	}

	closeSignupPopup = (e) => {
		if (e)
			e.preventDefault();
		// $("#darkLayer").this.fadeOut();
		this.fadeOut("#signupPopup");
		console.log('closeSignupPopup() called\n\n');
	}

	openLoginPopup = (event) => {
		console.log('log in link clicked');
		if (!this.signupClicked) {
			this.fadeIn("#darkLayer");
			console.log('opacity applied');
			this.fadeIn("#loginPopup");
			console.log('fade in login popup\n\n');
		}
		this.signupClicked = false; // Reset the flag after handling the click
	}

	closeLoginPopup = (e) => {
		if (e)
			e.preventDefault();
		this.fadeOut("#darkLayer");
		this.fadeOut("#loginPopup");
		console.log('closeLoginPopup() called\n\n');
	}


	/* API Requests */

	sendVerificationCode = (e) => {
		if (e)
			e.preventDefault();
		var email = this.shadowRoot.querySelector("#signupEmail").value;
		fetch('/api/user_management/auth/access_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: JSON.stringify({ 'email': email })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					console.log('Code sent successfully');
				} else {
					console.log('Failed to send code:', data.error);
				}
			});
	}

	// window.addEventListener("message", (event) => {
	// 	if (event.data.type === "checkboxStateChange") {
	// 		this.shadowRoot.getElementById('agreementCheckbox').checked = event.data.checked;
	// 	}
	// }, false);
	
	verifyCode = (context) => {
		var email = this.shadowRoot.querySelector("#signupEmail").value;
		var verificationCode = this.shadowRoot.querySelector("#verificationCode").value;
		fetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams({ 'email': email, 'one_time_code': verificationCode, 'context': context })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					console.log('Code verified successfully');
					this.shadowRoot.querySelector("#successMessage").textContent = "Verified successfully";
					updateSignupButtonStatus();
					// submitSignupForm();
				} else {
					console.log('Failed to verify code:', data.error);
				}
			})
			.catch(() => {
				console.log('An error occurred while processing your request.');
			});
	}

	submitSignupForm = (e) => {
		if (e)
			e.preventDefault();
		let formData = new FormData(this.shadowRoot.querySelector('#signupForm'));
		fetch('/api/user_management/auth/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					console.log('signed up success\n\n');
					this.closeSignupPopup();
					var accessToken = xhr.getResponseHeader('Authorization');
                    if (accessToken) {
                        // Store the access token in memory
                        sessionStorage.setItem('accessToken', accessToken);
                        console.log('Access token stored:', accessToken);
                    }
				} else {
					console.log('bad signup: ', data.error)
					this.shadowRoot.querySelector('#signupPopupError').textContent = data.error;
				}
			})
			.catch((error) => {
				console.log('An error occurred while submiting form', error);
			});
	}

	submitLoginForm = (e) => {
		if (e)
			e.preventDefault();
		var formData = new FormData(this.shadowRoot.querySelector('#loginForm'));
		fetch('/api/user_management/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
		})
			.then(response => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error('An error occurred while processing your request.');
				}
			})
			.then(data => {
				console.log('Login successful:', data);
				
				// Store the access token and details in memory
				sessionStorage.setItem('expiryTimestamp', new Date().getTime() + data.expiresIn * 1000);
				sessionStorage.setItem('accessToken', data.accessToken);
				sessionStorage.setItem('tokenType', data.tokenType);
				
				if (data.requires_2fa) {
					this.shadowRoot.querySelector('#loginForm').style.display = 'none'; // hide
					this.shadowRoot.querySelector('#forgotPasswordLink').style.display = 'none'; // hide
					this.shadowRoot.querySelector('#signupLink').style.display = 'none'; // hide
					this.shadowRoot.querySelector('#oneTimeCodeSection').style.display = 'block'; // show
				} else {
					console.log('2FA not required');
				}
			})
			.catch(error => {
				console.log('An error occurred while processing your request.');
				console.error(error);
				this.displayErrorMessage('An error occurred while processing your request.');
			});
	}

	submitOneTimeCode = (context) => {
		var oneTimeCode = this.shadowRoot.querySelector('#oneTimeCodeSection input[name="one_time_code"]').value;
		console.log('submitOneTimeCode submit');
		fetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams({ 'one_time_code': oneTimeCode, 'context': 'signin' })
		})
			.then(response => {
				if (response.ok) {
					console.log('One-time code verification successful:', response);
					this.closeLoginPopup();
					// window.location.href = '';
				} else {
					console.log('One-time code verification failed:', response.statusText);
					this.displayErrorMessage('An error occurred while processing your request.');
				}
			})
			.catch(error => {
				console.log('One-time code verification failed.');
				console.error(error);
				this.displayErrorMessage('An error occurred while processing your request.');
			});
	}

	sendUrlToEmail = () => {
		var username = this.shadowRoot.querySelector('input[name="username_f"]').value;
		fetch('/api/user_management/auth/sendResetLink', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams({ 'username': username })
			// body: JSON.stringify({
				// 'username': username
			// })
		})
			.then(response => {
				if (response.ok) {
					console.log('Status Code:', response.status);
					return response.json();
				} else {
					console.log('Error sending reset Link:', response.statusText);
				}
			})
			.then(data => {
				console.log('Response Body:', data);
				if (data.success) {
					console.log('Password reset link sent successfully:');
					this.closeForgotPasswordModal();
				} else {
					throw new Error(data.error);
				}
			})
			.catch(error => {
				alert('Error sending reset Link: ' + error);
			});
		return false;
	}


	displayErrorMessage = (message) => {
		this.shadowRoot.getElementById('errorMessage').textContent = message;
		this.shadowRoot.getElementById('errorMessage').style.color = 'red';
	}


	/* Helper Functions */

	// add or remove a class from all elements matching the selector
	toggleClass(selector, className, state) {
		const elements = document.querySelectorAll(selector);
		elements.forEach((element) => {
			// If state is defined, add or remove based on its boolean value
			// If state is undefined, toggle based on the element's current class state
			if (typeof state !== 'undefined') {
				if (state) {
					element.classList.add(className);
				} else {
					element.classList.remove(className);
				}
			} else {
				element.classList.toggle(className);
			}
		});
	}

	// set property value for all elements matching the selector
	prop(selector, property, value) {
		const elements = this.shadowRoot.querySelectorAll(selector);
		elements.forEach((element) => {
			element[property] = value;
		});
	}
	
	// add '.in' class after 10ms
	fadeIn(selector) {
		const element = this.shadowRoot.querySelector(selector);
		element.style.display = 'block'; // reset the display property to its default value
		element.classList.add('fade');
		setTimeout(() => element.classList.add('in'), 10); // 10ms delay to allow the DOM to update
	}
	
	// remove '.fade' class after the transition is done
	fadeOut(selector) {
		const element = this.shadowRoot.querySelector(selector);
		// element.style.display = 'none'; // hide the element after the transition is done
		element.classList.remove('in');
		setTimeout(() => {
			element.classList.remove('fade');
			element.style.display = 'none'
		}, 500); // 500ms delay to allow the transition to finish (adjust to match the transition duration in the CSS file)
	}
}

customElements.define('login-page', Login);
