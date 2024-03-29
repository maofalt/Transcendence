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
		let pannel = new Pannel({title: "Reset Password", dark: false});

		let inputContainer;
		if (window.location.search.includes("reset")) {
			const query = window.location.search.split("=")[1];
			inputContainer = this.resetPassPage(query);
		} else {
			inputContainer = this.sendLinkPage();
		}

		pannel.shadowRoot.appendChild(inputContainer);

		usernameBlock.input.oninput = () => {
			usernameBlock.input.input.style.outline = "none";
		}
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => Router.navigateTo("/"); // do adapt if needed

		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
	}
	
	resetPassPage = (query) => {
		let container = document.createElement('div');

		let passwordBlock = new InputAugmented({
			title: "New Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please enter a password", () => passwordBlock.input.getValue() != ""],
				lengthIndicator: ["Minimum 8 characters", () => passwordBlock.input.getValue().length >= 8],
				digitIndicator: ["At least 1 digit", () => /\d/.test(passwordBlock.input.getValue())],
				letterIndicator: ["At least 1 letter", () => /[a-zA-Z]/.test(passwordBlock.input.getValue())],
				// differentIndicator: ["Different from your Playername and your Email" () => this.],
			},
			type: "password"
		});

		let confirmPasswordBlock = new InputAugmented({
			title: "Confirm Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please confirm your password", () => confirmPasswordBlock.input.getValue() != ""],
				matchIndicator: ["Passwords don't match", () => passwordBlock.input.getValue() == confirmPasswordBlock.input.getValue()],
			},
			type: "password"
		});

		let resetButton = new CustomButton({content: "Reset Password", action: true, style: {margin: "15px 0px 0px 0px"}});
		
		let buttons = document.createElement('div');
		buttons.appendChild(resetButton);
		buttons.id = "buttons";

		container.appendChild(passwordBlock);
		container.appendChild(confirmPasswordBlock);
		container.appendChild(buttons);
		return container;
	}

	sendLinkPage = () => {
		let container = document.createElement('div');

		let usernameBlock = new InputAugmented({
			title: "Username",
			content: "Username",
			indicators: {
				emptyIndicator: ["Please enter a username", () => usernameBlock.input.getValue() != ""],
			},
			type: "text"
		});
		
		let sendLinkButton = new CustomButton({content: "Send Reset Link", action: true, style: {margin: "15px 0px 0px 0px"}});
		sendLinkButton.onclick = async (e) => {
			if (!await usernameBlock.validate()) {
				return ;
			}
			this.sendLink(usernameBlock);
		};
		sendLinkButton.oninput = () => {usernameBlock.validate()};

		let buttons = document.createElement('div');
		buttons.appendChild(sendLinkButton);
		buttons.id = "buttons";

		container.appendChild(usernameBlock);
		container.appendChild(buttons);
		return container;
	}

	sendLink = (usernameBlock) => {
		let formData = {
			username: usernameBlock.input.getValue()
		}
		easyFetch('/api/user_management/auth/send_reset_link', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(formData)
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty response or body');
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.status === 200 && body.success === true) {
				displayPopup('Reset link sent:\nPlease follow instructions in the link sent to your email', 'success');
				navigateTo("/login");
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}` , 'error');
			usernameBlock.input.input.style.outline = "2px solid red";
		});
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