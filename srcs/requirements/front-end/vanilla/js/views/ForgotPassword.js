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
import { navigateTo } from "@utils/Router";

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
			const urlParams = new URLSearchParams(window.location.search);
			const token = urlParams.get("token");
			const uidb = urlParams.get("uidb");
			inputContainer = this.resetPassPage(token, uidb);
		} else {
			inputContainer = this.sendLinkPage();
		}

		pannel.shadowRoot.appendChild(inputContainer);
		
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
			content: "password",
			indicators: {
				emptyIndicator: ["Please enter a password", () => passwordBlock.input.getValue() != ""],
				lengthIndicator: ["Minimum 8 characters", () => passwordBlock.input.getValue().length >= 8],
				digitIndicator: ["At least 1 digit", () => /\d/.test(passwordBlock.input.getValue())],
				letterIndicator: ["At least 1 letter", () => /[a-zA-Z]/.test(passwordBlock.input.getValue())],
				// differentIndicator: ["Different from your Playername and your Email" () => this.],
			},
			description: "Enter your new password here to reset it.",
			type: "password"
		});

		let confirmPasswordBlock = new InputAugmented({
			title: "Confirm Password",
			content: "password",
			indicators: {
				emptyIndicator: ["Please confirm your password", () => confirmPasswordBlock.input.getValue() != ""],
				matchIndicator: ["Passwords don't match", () => passwordBlock.input.getValue() == confirmPasswordBlock.input.getValue()],
			},
			description: "Confirm your new password here.",
			type: "password"
		});

		let resetButton = new CustomButton({content: "Reset Password", action: true, style: {margin: "15px 0px 0px 0px"}});
		resetButton.onclick = async (e) => {
			if (!await passwordBlock.validate() || !await confirmPasswordBlock.validate()) {
				return ;
			}
			this.resetPassword(query, passwordBlock, confirmPasswordBlock);
		};
		confirmPasswordBlock.input.oninput = () => {confirmPasswordBlock.validate()};
		passwordBlock.input.oninput = () => {passwordBlock.validate()};

		let buttons = document.createElement('div');
		buttons.appendChild(resetButton);
		buttons.id = "buttons";

		container.appendChild(passwordBlock);
		container.appendChild(confirmPasswordBlock);
		container.appendChild(buttons);
		return container;
	}

	resetPassword = (query, passwordBlock, confirmPasswordBlock) => {
		let formData = {
			new_password1: passwordBlock.input.getValue(),
			new_password2: confirmPasswordBlock.input.getValue(),
		}
		easyFetch(`/api/user_management/auth/password_reset/MTY/${query}/`, {
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
				displayPopup('Password reset successfully. You can now login.', 'success');
				navigateTo("/login");
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}. Please try sending again.` , 'error');
			navigateTo("/forgot");
		});
	}

	sendLinkPage = () => {
		let container = document.createElement('div');

		let usernameBlock = new InputAugmented({
			title: "Username",
			content: "Username",
			indicators: {
				emptyIndicator: ["Please enter a username", () => usernameBlock.input.getValue() != ""],
			},
			description: "Enter your username here to receive a password reset link.",
			type: "text"
		});
		
		let sendLinkButton = new CustomButton({content: "Send Reset Link", action: true, style: {margin: "15px 0px 0px 0px"}});
		sendLinkButton.onclick = async (e) => {
			if (!await usernameBlock.validate()) {
				return ;
			}
			this.sendLink(usernameBlock);
		};
		usernameBlock.input.oninput = () => {usernameBlock.validate()};

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
			} else if (response.status === 400) {
				displayPopup('Username not found', 'error');
				usernameBlock.input.input.style.outline = "2px solid red";
				return ;
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.status === 200 && body.success === true) {
				displayPopup('Reset link sent: Please follow instructions in the link sent to your email', 'success');
				navigateTo("/login");
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
			usernameBlock.input.input.style.outline = "2px solid red";
		});
	}
}

customElements.define('forgot-password', ForgotPassword);