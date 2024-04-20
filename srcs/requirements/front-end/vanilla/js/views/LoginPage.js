import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";
import Router from "@utils/Router";
import getCookie from "@utils/getCookie";
import easyFetch from "@utils/easyFetch";
import fetchUserDetails from "@utils/fetchUserDetails";
import InputAugmented from "@components/InputAugmented";
import displayPopup from "@utils/displayPopup";
import { refreshTokenLoop } from "@utils/pollingFunctions";
import { initSocketConnection } from "@utils/websocket";
import TwoFactorAuth from "@components/TwoFactorAuth";
import { fadeIn } from "@utils/animate";
import setupLogin from "@utils/setupLogin";

export default class LoginPage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Log In", dark: false});
		// let usernameInput = new InputField({content: "Username", name: "username", type: "text"});
		// let passwordInput = new InputField({content: "Password", name: "password", type: "password"});
		
		let usernameBlock = new InputAugmented({
			title: "Username",
			content: "Username",
			indicators: {
				emptyIndicator: ["Please enter a username", () => usernameBlock.input.getValue() != ""],
			},
			type: "text"
		});

		let passwordBlock = new InputAugmented({
			title: "Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please enter a password", () => passwordBlock.input.getValue() != ""],
			},
			type: "password"
		});
		
		let loginButton = new CustomButton({content: "Log In", action: true, style: {margin: "15px 0px 0px 0px", "border-radius": "20px"}});
		// loginButton.tabIndex = 0;

		let signUpButton = new CustomButton({content: "Sign Up", action: false, style: {margin: "20px 0px 20px 0px"}});
		// signUpButton.tabIndex = 0;

		let buttons = document.createElement('div');
		buttons.appendChild(loginButton);
		buttons.appendChild(signUpButton);
		buttons.id = "buttons";

		let p = document.createElement('p');
		p.id = "forgot-password";
		p.textContent = "Forgot Password ?";

		p.style.setProperty("font-size", "20px");
		p.style.setProperty("margin", "0px");
		p.style.setProperty("margin-bottom", "35px");
		p.style.setProperty("padding", "0px");
		p.style.setProperty("cursor", "pointer");
		p.style.setProperty("text-decoration", "underline");
		p.style.setProperty("color", "rgba(0, 217, 255, 1)");

		pannel.shadowRoot.appendChild(usernameBlock);
		pannel.shadowRoot.appendChild(passwordBlock);
		pannel.shadowRoot.appendChild(p);
		pannel.shadowRoot.appendChild(buttons);

		loginButton.onclick = async (e) => {
			if (!await usernameBlock.validate() || ! await passwordBlock.validate()) {
				return ;
			}
			this.submitLoginForm(e, usernameBlock, passwordBlock);
		};

		passwordBlock.input.onkeydown = (e) => {
			passwordBlock.input.input.style.outline = "";
			if (e.key === "Enter") {
				loginButton.click();
			}
		}

		usernameBlock.input.onkeydown = (e) => {
			usernameBlock.input.input.style.outline = "";
			if (e.key === "Enter") {
				passwordBlock.input.input.focus();
			}
		}

		p.onclick = () => Router.navigateTo("/forgot");

		signUpButton.onclick = () => Router.navigateTo("/signup");
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		this.verifyCode = new TwoFactorAuth();

		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
		this.shadowRoot.appendChild(this.verifyCode);
	}
	
	buttonOnClick = (e, arg) => {
		console.log(arg);
	}
	
	// Implement other methods or properties as needed
	submitLoginForm = async (e, usernameBlock, passwordBlock) => {
		let formData = {
			username: usernameBlock.input.getValue(),
			password: passwordBlock.input.getValue()
		}
		if (e)
			e.preventDefault();
		console.log('values:', formData);
		easyFetch('/api/user_management/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
		})
		.then(async res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty response or body');
			} else if (response.status === 400) {
				displayPopup('Wrong username or password', 'error');
				usernameBlock.input.input.style.outline = "2px solid red";
				passwordBlock.input.input.style.outline = "2px solid red";
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.status === 200 && body.success === true) {
				
				if (body.requires_2fa) {
					displayPopup('login successful, please enter your 2fa code', 'info');
					// Router.redirectTo("/2fa");
					fadeIn(this.verifyCode);
					return ;
				}

				// get user details for the profile page and start the socket connection
				await setupLogin(body);

				displayPopup('Login successful', 'success');

				refreshTokenLoop();

				Router.redirectTo("/");
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}` , 'error');
		});
	}
}

customElements.define('login-page-v2', LoginPage);