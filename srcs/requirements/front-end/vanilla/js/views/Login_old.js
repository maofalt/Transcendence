import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
		const jwt = getCookie('jwtToken');
		const sess = getCookie('sessionid');
		const csrf = getCookie('csrftoken');
		console.log('tokenys: ', sess, jwt, csrf);
		this.state = {
			
		};

		this.accessCodeForm = htmlToElement(
		`<form class="access-code-form">
			<h3>ACCESS CODE</h3>
			<input type="text" name="access_code" placeholder="Access Code">
			<button class="access-code-form">Submit</button>
		</form>
		`);
		
		this.verifyCodeForm = htmlToElement(
		`<form class="verify-code-form">
			<h3>VERIFY CODE</h3>
			<input type="text" name="one_time_code" placeholder="Access Code">
			<button class="verify-code-form">Submit</button>
		</form>
		`);

		this.signUpForm = htmlToElement(
		`<form class="sign-up-form">
			<h3>SIGNUP</h3>
			<input type="text" name="username" placeholder="Username">
			<input type="password" name="password" placeholder="Password">
			<input type="confirm_password" name="confirm_password" placeholder="Confirm Password">
			<input type="playername" name="playername" placeholder="Name">
			<input type="signupEmail" name="signupEmail" placeholder="Email Address">
			<button class="sign-up-form">Sign Up</button>
		</form>
		`);

		this.loginForm = htmlToElement(
			`<form class="login-form">
				<h3>LOGIN</h3>
				<input type="text" name="username" placeholder="Username">
				<input type="password" name="password" placeholder="Password">
				<button class="login-form">Submit</button>
			</form>
			`);
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		// history.replaceState(null, null, document.location.origin + '/api/user_management');
		// window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');

		const testy = await makeApiRequest('/api/user_management/', 'GET');

		// try {
		// 	const response = await makeApiRequest(
		// 		'/api/user_management/auth/accesas_code', 
		// 		'POST', 
		// 		{ email: 'yoelridgway@gmail.com' }, { 'Content-Type': 'application/x-www-form-urlencoded' });
		// 	console.log('Status Code:', response.status);
		// 	console.log('Response Body:', response.body);
		// } catch (error) {
		// 	console.error('Request Failed:', error);
		// }


		// let signUpForm = createElement('form', { class: 'sign-up-form' });
		// signUpForm.appendChild('input', { type: 'text', id: 'username', name: 'username', placeholder: 'Username' });
		// signUpForm.appendChild('input', { type: 'password', id: 'username', name: 'password', placeholder: 'Password' });
		// signUpForm.appendChild('input', { type: 'confirm_password', id: 'onfirm_passwordd', name: 'confirm_password', placeholder: 'Confirm Password' });
		// signUpForm.appendChild('input', { type: 'playername', id: 'playername', name: 'playername', placeholder: 'Name' });
		// signUpForm.appendChild('input', { type: 'signupEmail', id: 'signupEmail', name: 'signupEmail', placeholder: 'Email' });

		// csrfmiddlewaretoken: BElrVdZWVMe739faEBIRobmbaZ9sNc6Q2gkE67MRDKScu3oLq56smwm9D3zT4nXk
		// username: player1
		// password: Passw0rd1
		// confirm_password: Passw0rd1
		// playername: Player1
		// signupEmail: player@gmail.com
		// access_code: 960029


		// loginForm.appendChild(createElement('div', { id: 'test' }));
		
		this.container = createElement('div', { id: 'loginContainer' });
		let formContainer = createElement('div', { id: 'form-container' });
		formContainer.appendChild(this.loginForm);
		formContainer.appendChild(this.signUpForm);
		formContainer.appendChild(this.accessCodeForm);
		// formContainer.appendChild(this.verifyCodeForm);
		this.container.appendChild(formContainer);
		// this.formContainer.appendChild(signUpForm);
		
		
		// let banana = document.createElement('a');
		// banana.textContent = 'small-textytoo banana nanana';
		// this.container.appendChild(banana);
		
		const htmlContent = this.container.innerHTML;
		return htmlContent;
	}
	
	async init() {
		this.setupFormListener('login-form', 
								'/api/user_management/auth/login', 
								'application/x-www-form-urlencoded',
								this.loginAction);
		this.setupFormListener('sign-up-form',
								'/api/user_management/auth/signup',
								'application/x-www-form-urlencoded',
								this.signupAction);
		this.setupFormListener('access-code-form',
								'/api/user_management/auth/access_code',
								'application/x-www-form-urlencoded',
								this.accessCodeAction);
		// this.setupFormListener('verify-code-form',
		// 						'/api/user_management/auth/verify_code',
		// 						'application/x-www-form-urlencoded',
		// 						this.verifyCodeAction);
	}

	async accessCodeAction(apiEndpoint, contentType, formData, form) {
		try {
			const response = await makeApiRequest(apiEndpoint, 'POST', formData, {
				'Content-Type': contentType || 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			});
			if (response && response.status === 200) {
				console.log('Access Code API Response:', response);
			}
		} catch (error) {
			console.error('Access Code API Call Failed:', error);
		}
	}

	async verifyCodeAction(apiEndpoint, contentType, formData, form) {
		try {
			const response = await makeApiRequest(apiEndpoint, 'POST', formData, {
				'Content-Type': contentType || 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			});
			if (response && response.status === 200) {
				console.log('Verify Code API Response:', response);
			}
		} catch (error) {
			console.error('Verify Code API Call Failed:', error);
		}
	}

	loginAction = async (apiEndpoint, contentType, formData, form) => {
		try {
			const response = await makeApiRequest(apiEndpoint, 'POST', formData, {
				'Content-Type': contentType || 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			});
			if (response && response.status === 200) {
				if (response.body && response.body.requires_2fa == true) {
					console.log('Login API Call Response:', response);
					// console.log('verifycodefor: ', this.verifyCodeForm);
					document.querySelector('#form-container').appendChild(this.verifyCodeForm);
					this.setupFormListener('verify-code-form',
											'/api/user_management/auth/verify_code',
											'application/x-www-form-urlencoded',
											this.verifyCodeAction);
					// form.appendChild(createElement('input', { type: 'text', id: 'access_code', name: 'access_code', placeholder: 'Access Code' }));
					// form.outerHTML = this.AccesCodeForm.outerHTML;
				}
			}
		} catch (error) {
			console.error('Login API Call Failed:', error);
		}
	}

	async signupAction(apiEndpoint, contentType, formData, form) {
		try {
			const response = await makeApiRequest(apiEndpoint, 'POST', formData, {
				'Content-Type': contentType || 'application/json',
				'X-CSRFToken': getCookie('csrftoken'),
			});
				// window.location.href
			console.log('Signup API Call Response:', response);
		} catch (error) {
			console.error('Signup API Call Failed:', error);
		}
	}
	
	destroy() {
		// Check if the submit button exists and if handleSubmit is bound
		if (this.submitBtn && this.handleSubmit) {
			this.submitBtn.removeEventListener('click', this.handleSubmit);
		}
	}

	// Generalized setup form listener method
	async setupFormListener(formClass, apiEndpoint, contentType, action) {
		const form = document.querySelector(`.${formClass}`);
		const submitBtn = document.querySelector(`button.${formClass}`); // button must have the same class

		if (!submitBtn) {
			console.log("form button not found");
			return ;
		}

		submitBtn.addEventListener('click', async (e) => {
			submitBtn.textContent = 'SUBMITING...';
			e.preventDefault(); // Prevent form from submitting traditionally

			// validate the form data
			// if (!form.checkValidity()) {
			//     form.reportValidity();
			//     return;
			// }

			// construct formData object dynamically from form fields
			const formData = {};
			new FormData(form).forEach((value, key) => {
				formData[key] = value;
			});

			// make the api request
			action(apiEndpoint, contentType, formData, form);
		});
	}
}