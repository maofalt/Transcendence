import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		// history.replaceState(null, null, document.location.origin + '/api/user_management');
		// window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');

		const testy = await makeApiRequest('/api/user_management/', 'GET');

		const csrftoken = getCookie('csrftoken');
		console.log("CSRF: " + csrftoken);

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

		let signUpForm = `
		<form class="sign-up-form">
			<input type="text" id="username" name="username" placeholder="Username">
			<input type="password" id="password" name="password" placeholder="Password">
		</form>
		<button class="sign-up-form">Submit</button>
		`;

		this.container = createElement('div', { id: 'loginContainer' });
		let formContainer = createElement('div', { id: 'form-container' }, signUpForm);
		this.container.appendChild(formContainer);
		
		
		// let banana = document.createElement('a');
		// banana.textContent = 'small-textytoo banana nanana';
		// this.container.appendChild(banana);
		
		const htmlContent = this.container.innerHTML;
		return htmlContent;
	}
	
	async init() {
		this.setupFormListener('sign-up-form', '/api/user_management/auth/login', 'application/x-www-form-urlencoded');
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