import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
		const jwt = getCookie('jwtToken')
		console.log('JWT: ', jwt);
		this.state = {
			
		};
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		// history.replaceState(null, null, document.location.origin + '/api/user_management');
		// window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');

		const testy = await makeApiRequest('/api/user_management/', 'GET');

		const csrftoken = getCookie('csrftoken');
		// const jwtToken = getCookie('jwtToken');
		console.log("CSRF: " + csrftoken);
		// console.log("JWT: " + jwtToken);

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

		let signUpForm = htmlToElement(`
		<form class="sign-up-form">
			<input type="text" id="username" name="username" placeholder="Username">
			<input type="password" id="password" name="password" placeholder="Password">
			<input type="confirm_password" id="confirm_password" name="confirm_password" placeholder="Confirm Password">
			<input type="playername" id="playername" name="playername" placeholder="Name">
			<input type="signupEmail" id="signupEmail" name="signupEmail" placeholder="Email Address">
		</form>
		<button class="sign-up-form">Sign Up</button>
		`);

		// csrfmiddlewaretoken: BElrVdZWVMe739faEBIRobmbaZ9sNc6Q2gkE67MRDKScu3oLq56smwm9D3zT4nXk
		// username: player1
		// password: Passw0rd1
		// confirm_password: Passw0rd1
		// playername: Player1
		// signupEmail: player@gmail.com
		// access_code: 960029

		let loginForm = htmlToElement(
		`<form class="login-form">
			<h3>LOGIN</h3>
			<input type="text" id="username" name="username" placeholder="Username">
			<input type="password" id="password" name="password" placeholder="Password">
			<button class="login-form">Submit</button>
		</form>
		`);

		// loginForm.appendChild(createElement('div', { id: 'test' }));
		
		this.container = createElement('div', { id: 'loginContainer' });
		let formContainer = createElement('div', { id: 'form-container' });
		formContainer.appendChild(loginForm);
		this.container.appendChild(formContainer);
		// this.formContainer.appendChild(signUpForm);
		
		
		// let banana = document.createElement('a');
		// banana.textContent = 'small-textytoo banana nanana';
		// this.container.appendChild(banana);
		
		const htmlContent = this.container.innerHTML;
		return htmlContent;
	}
	
	async init() {
		this.setupFormListener('sign-up-form', '/api/user_management/auth/login', 'application/x-www-form-urlencoded');
	}

	destroy() {
		// Check if the submit button exists and if handleSubmit is bound
		if (this.submitBtn && this.handleSubmit) {
			this.submitBtn.removeEventListener('click', this.handleSubmit);
		}
	}

	// Generalized setup form listener method
	async setupFormListener(formClass, apiEndpoint, contentType) {
		const form = document.querySelector(`.${formClass}`);
		const submitBtn = document.querySelector(`button.${formClass}`); // button must have the same class

		if (!submitBtn) {
			console.log("form button not found");
			return ;
		}

		submitBtn.addEventListener('click', async () => {
			submitBtn.textContent = 'SUBMITING...';
			// event.preventDefault(); // Prevent form from submitting traditionally

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

			try {
				const response = await makeApiRequest(apiEndpoint, 'POST', formData, {
					'Content-Type': contentType || 'application/json',
					'X-CSRFToken': getCookie('csrftoken'),
				});
				console.log('API Call Response:', response);
			} catch (error) {
				console.error('API Call Failed:', error);
			}
		});
	}
}