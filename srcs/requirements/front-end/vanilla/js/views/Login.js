import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import '@css/login.css';
import loginPageSource from "@views/loginPageSource";
import { toggleClass, prop, fadeIn, fadeOut } from "@utils/jqueryUtils";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
		const jwt = getCookie('jwtToken');
		const sess = getCookie('sessionid');
		const csrf = getCookie('csrftoken');
		console.log('tokenys: ', sess, jwt, csrf);
		this.state = {
			
		};
		this.loginForm = htmlToElement(loginPageSource);
		// console.log('loginForm: ', this.loginForm);
		// this.loginForm.classList.add('loginForm');
	}

	async init() {
		this.setupEventListeners();
	}

	destroy() {
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		// history.replaceState(null, null, document.location.origin + '/api/user_management');
		// window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');

		const testy = await makeApiRequest('/api/user_management/', 'GET');
		
		return loginPageSource;
	}

	setupEventListeners() {
		this.updateSignupButtonStatus();
		toggleClass("#signupButton", "enabled", false);
	
		document.querySelectorAll("#signupForm input").forEach(input => {
			input.addEventListener("input", () => {
				this.updateSignupButtonStatus();
			});
		});

		document.querySelector('#devDbButton').addEventListener("click", () => {
			makeApiRequest('/api/user_management/auth/developer_setting', 'GET')
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
		});

		var signupClicked = false;

		document.querySelector("#forgotPasswordLink").addEventListener("click", () => {
			fadeIn("#darkLayer");
			fadeIn("#forgotPasswordModal");
		});
	
		document.querySelector("#signupLink").addEventListener("click", (event) => {
			event.stopPropagation()
			signupClicked = true;
			console.log('close login popup');
			fadeIn("#darkLayer");
			console.log('opacity applied');
			fadeIn("#signupPopup");
			console.log('fade in signup popup\n\n');
		});

		document.querySelector("#loginLink").addEventListener("click", () => {
			console.log('log in link clicked');
			if (!signupClicked) {
				fadeIn("#darkLayer");
				console.log('opacity applied');
				fadeIn("#loginPopup");
				console.log('fade in login popup\n\n');
			}
			signupClicked = false; // Reset the flag after handling the click
		});
	}

	checkPasswordMatch() {
		var password = document.querySelector("#signupForm input[name='password']").value;
		var confirmPassword = document.querySelector("#confirmPassword").value;

		if (password !== confirmPassword) {
			document.querySelector("#confirmPasswordError").textContent = "Passwords do not match";
		} else {
			document.querySelector("#confirmPasswordError").textContent = "";
		}
	}

	updateSignupButtonStatus() {
		console.log('updateSignupButtonStatus() called\n\n');

		var form = document.querySelector("#signupForm");
		var allFieldsFilled = Array.from(form.elements).every((element) => {
			return element.checkValidity();
		});

		var password = document.querySelector("#signupForm input[name='password']").value;
		var confirmPassword = document.querySelector("#confirmPassword").value;
		var isPasswordMatch = password === confirmPassword;

		var isCodeVerified = document.querySelector("#successMessage").textContent === "Verified successfully";

		if (allFieldsFilled && isPasswordMatch && isCodeVerified) {
			prop("#signupButton", "disabled", false);
			console.log('BUTTON: need to be enable\n\n');
			
		} else {
			prop("#signupButton", "disabled", true);
		}
		toggleClass("#signupButton", "enabled", allFieldsFilled && isPasswordMatch && isCodeVerified);
	}

	sendVerificationCode() {
		var email = document.querySelector("#signupEmail").value;
		makeApiRequest('/api/user_management/auth/access_code',
					'POST',
					{ 'email': email },
					{ 'X-CSRFToken': getCookie('csrftoken') })
		.then(response => response.json)
		.then(data => {
			if (data.success) {
				console.log('Code sent successfully');
			} else {
				console.log('Failed to send code:', data.error_message);
			}
		});
	}
	
	openPrivacyPolicyPopup() {
		fetch("/api/user_management/auth/policy")
		.then(response => response.text())
		.then(data => {
			document.querySelector("#privacyPolicyPopup").innerHTML = data;
			document.querySelector("#privacyPolicyPopup").style.display = "block";
		});
	}
	
	closePrivacyPolicyPopup() {
		fadeOut("#privacyPolicyPopup");
	}

	closeForgotPasswordModal() {
		fadeOut("#darkLayer");
		fadeOut("#forgotPasswordModal");
	}
	
	closeSignupPopup() {
		// $("#darkLayer").fadeOut();
		fadeOut("#signupPopup");
		console.log('closeSignupPopup() called\n\n');
	}

	closeLoginPopup() {
		fadeOut("#darkLayer");
		fadeOut("#loginPopup");
		console.log('closeLoginPopup() called\n\n');
	}

	closeSignupPopup() {
		// $("#darkLayer").fadeOut();
		fadeOut("#signupPopup");
		console.log('closeSignupPopup() called\n\n');
	}

	displayErrorMessage(message) {
		document.getElementById('errorMessage').textContent = message;
		document.getElementById('errorMessage').style.color = 'red';
	}

	// window.addEventListener("message", (event) => {
	// 	if (event.data.type === "checkboxStateChange") {
	// 		document.getElementById('agreementCheckbox').checked = event.data.checked;
	// 	}
	// }, false);
	
	verifyCode(context) {
		var email = document.querySelector("#signupEmail").value;
		var verificationCode = document.querySelector("#verificationCode").value;
		makeApiRequest('/api/user_management/auth/verify_code',
					'POST',
					{ 'email': email, 'one_time_code': verificationCode, 'context': context },
					{ 'X-CSRFToken': getCookie('csrftoken') })
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				console.log('Code verified successfully');
				document.querySelector("#successMessage").textContent = "Verified successfully";
				updateSignupButtonStatus();
				// submitSignupForm();
			} else {
				console.log('Failed to verify code:', data.error_message);
			}
		})
		.catch(() => {
			console.log('An error occurred while processing your request.');
		});
	}
	
	submitSignupForm() {
		formData = new FormData(document.querySelector('#signupForm'));
		makeApiRequest('/api/user_management/auth/signup',
					'POST',
					formData,
					{	'X-CSRFToken': getCookie('csrftoken'),
						'Content-Type': 'application/x-www-form-urlencoded' })
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				console.log('signed up success\n\n');
				closeSignupPopup();
			} else {
				document.querySelector('#signupPopupError').textContent = data.error_message;
			}
		})
		.catch(() => {
			console.log('An error occurred while processing your request.');
		});
	}

	submitLoginForm() {
		var formData = new FormData(document.querySelector('#loginForm'));
		makeApiRequest('/api/user_management/auth/login',
					'POST',
					formData,
					{	'X-CSRFToken': getCookie('csrftoken'),
						'Content-Type': 'application/x-www-form-urlencoded' })
		.then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('An error occurred while processing your request.');
			}
		})
		.then(data => {
			console.log('Login successful:', data);
			if (data.requires_2fa) {
				document.querySelector('#loginForm').style.display = 'none'; // hide
				document.querySelector('#forgotPasswordLink').style.display = 'none'; // hide
				document.querySelector('#signupLink').style.display = 'none'; // hide
				document.querySelector('#oneTimeCodeSection').style.display = 'block'; // show
			} else {
				console.log('2FA not required');
			}
		})
		.catch(error => {
			console.log('An error occurred while processing your request.');
			console.error(error);
			displayErrorMessage('An error occurred while processing your request.');
		});
	}

	submitOneTimeCode(context) {
		var oneTimeCode = document.querySelector('input[name="one_time_code"]').value;
		console.log('submitOneTimeCode submit');
		makeApiRequest('/api/user_management/auth/verify_code', 
					'POST', 
					{ 'one_time_code': oneTimeCode, 'context': context },
					{ 'X-CSRFToken': getCookie('csrftoken') })
		.then(response => {
			if (response.ok) {
				console.log('One-time code verification successful:', response);
				closeLoginPopup();
				window.location.href = '';
			} else {
				console.log('One-time code verification failed:', response.statusText);
				displayErrorMessage('An error occurred while processing your request.');
			}
		})
		.catch(error => {
			console.log('One-time code verification failed.');
			console.error(error);
			displayErrorMessage('An error occurred while processing your request.');
		})
	}
	
	sendUrlToEmail() {
		var username = document.querySelector('input[name="username_f"]').value;
		makeApiRequest('/api/user_management/auth/sendResetLink', 
					'POST', 
					{ 'username': username }, 
					{ 'X-CSRFToken': getCookie('csrftoken') })
		.then(response => {
			console.log('Status Code:', response.status);
			console.log('Response Body:', response.body);
			if (response.ok) {
				console.log('Password reset link sent successfully:', response);
				closeForgotPasswordModal();
			} else {
				console.log('Error sending reset Link:', response.statusText);
			}
		})
		.catch(error => {
			console.log('Error sending reset Link:', error);
		});
		return false;
	}
}