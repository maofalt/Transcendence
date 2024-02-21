import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";

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

		try {
			const response = await makeApiRequest(
				'/api/user_management/auth/accesas_code', 
				'POST', 
				{ email: 'yoelridgway@gmail.com' }, { 'Content-Type': 'application/x-www-form-urlencoded' });
			console.log('Status Code:', response.status);
			console.log('Response Body:', response.body);
		} catch (error) {
			console.error('Request Failed:', error);
		}

		this.container = document.createElement('loginContainer');
		let banana = document.createElement('a');
		banana.textContent = 'small-textytoo banana nanana';
		this.container.appendChild(banana);

		const htmlContent = this.container.innerHTML;

		return htmlContent;
		return `
		<div id="loginContainer">
			<h1>Login</h1>
		</div>
		`;
	}

}