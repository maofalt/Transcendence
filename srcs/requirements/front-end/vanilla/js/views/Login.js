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
		<form id="sign-up-form">
			<input type="text" id="username" name="username" placeholder="Username">
			<input type="password" id="password" name="password" placeholder="Password">
		</form>
		<button id="submitBtn">Submit</button>
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
		this.setupFormListener();
	}

	async setupFormListener() {
		const submitBtn = document.getElementById('submitBtn');
		submitBtn.addEventListener('click', async () => {
			const form = document.getElementById('sign-up-form');
			
			// Optional: Manual Validation
			if (!form.checkValidity()) {
				form.reportValidity(); // This will show validation messages if any field is invalid
				return; // Prevent form submission if validation fails
			}
			
			// Prepare the form data manually
			const formData = {
				username: document.getElementById('username').value,
				password: document.getElementById('password').value
			};
	
			// Call your async function to handle the submission logic
			try {
				await this.submitForm(formData);
				// Optionally, call form.submit() if you need to submit the form to a server-side endpoint
				// form.submit();
			} catch (error) {
				console.error('Error during form submission:', error);
			}
		});
	}

	async submitForm(formData) {
		// Handle API call or other async actions here
		console.log('Form Data:', formData);
		// Replace this log with your actual submission logic
	}

}