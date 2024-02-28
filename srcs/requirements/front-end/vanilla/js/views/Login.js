import { makeApiRequest } from "../utils/makeApiRequest";
import AbstractView from "./AbstractView";
import { getCookie } from "@utils/getCookie";
import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
// import '@css/login.css';
import loginPageSource from "@views/loginPageSource";
// import { toggleClass, prop, fadeIn, fadeOut } from "@utils/jqueryUtils";
import LoginPage from "./LoginShadow";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		let logincontainer = document.createElement('div');
		logincontainer.appendChild(document.createElement('login-page'));
		return logincontainer.innerHTML;
	}
}
