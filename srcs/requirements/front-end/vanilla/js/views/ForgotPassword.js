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

export default class ForgotPassword extends AbstractComponent {
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
		
		let loginButton = new CustomButton({content: "Log In", action: true, style: {margin: "15px 0px 0px 0px"}});
		let signUpButton = new CustomButton({content: "Sign Up", action: false, style: {margin: "20px 0px 20px 0px"}});

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
			let ready = await this.submitLoginForm(e, usernameBlock, passwordBlock);
			if (!ready) {

			}
		};

		passwordBlock.input.oninput = () => {
			passwordBlock.input.input.style.outline = "none";
		}

		usernameBlock.input.oninput = () => {
			usernameBlock.input.input.style.outline = "none";
		}

		p.onclick = () => Router.navigateTo("/forgot");

		signUpButton.onclick = () => Router.navigateTo("/signup");
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => Router.navigateTo("/"); // do adapt if needed

		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
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
		let valid = false;
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

				// Store the access token and details in memory
				sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expires_in * 1000);
				sessionStorage.setItem('accessToken', body.access_token);
				sessionStorage.setItem('tokenType', body.token_type);

				let details = await fetchUserDetails();
				sessionStorage.setItem('userDetails', JSON.stringify(details));

				if (body.requires_2fa) {
					displayPopup('login successful, please enter your 2fa code', 'info');
					Router.navigateTo("/2fa");
				}

				displayPopup('Login successful', 'success');

				Router.navigateTo("/");
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}` , 'error');
		});
	}
}

customElements.define('forgot-password', ForgotPassword);