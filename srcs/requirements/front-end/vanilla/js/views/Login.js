import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import '@css/login.css';
import loginPageSource from "@views/loginPageSource";
import { toggleClass, prop, fadeIn, fadeOut } from "@utils/jqueryUtils";
import LoginPage from "./LoginShaddow";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
		// const jwt = getCookie('jwtToken');
		// const sess = getCookie('sessionid');
		// const csrf = getCookie('csrftoken');
		// console.log('tokenys: ', sess, jwt, csrf);
		// this.state = {
			
		// };
		// this.loginForm = htmlToElement(loginPageSource);
		// console.log('loginForm: ', this.loginForm);
		// this.loginForm.classList.add('loginForm');
		// console.log('Login constructor called\n\n');
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		// history.replaceState(null, null, document.location.origin + '/api/user_management');
		// window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');

		let shadowEl = document.createElement('login-page');
		console.log("inner shadow", shadowEl.innerHTML);
		return shadowEl.innerHTML;
	}
}
