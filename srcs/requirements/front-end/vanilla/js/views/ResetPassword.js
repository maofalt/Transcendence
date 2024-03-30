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

export default class ResetPassword extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Reset Password", dark: false});

		let inputContainer = this.resetPassPage();

		pannel.shadowRoot.appendChild(inputContainer);
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back(); // do adapt if needed

		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
	}
	
	resetPassPage = () => {
		let container = document.createElement('div');

		let oldPasswordBlock = new InputAugmented({
			title: "Old Password",
			content: "password",
			indicators: {
				emptyIndicator: ["Please enter your old password", () => oldPasswordBlock.input.getValue() != ""],
			},
			description: "Enter your old password here.",
			type: "password"
		});

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
			if (!await oldPasswordBlock.validate() || !await passwordBlock.validate() || !await confirmPasswordBlock.validate()) {
				return ;
			}
			this.resetPassword(oldPasswordBlock, passwordBlock, confirmPasswordBlock);
		};

		oldPasswordBlock.input.oninput = () => {oldPasswordBlock.validate()};
		passwordBlock.input.oninput = () => {passwordBlock.validate()};
		confirmPasswordBlock.input.oninput = () => {confirmPasswordBlock.validate()};

		let buttons = document.createElement('div');
		buttons.appendChild(resetButton);
		buttons.id = "buttons";

		container.appendChild(oldPasswordBlock);
		container.appendChild(passwordBlock);
		container.appendChild(confirmPasswordBlock);
		container.appendChild(buttons);
		return container;
	}

	resetPassword = (oldPasswordBlock, passwordBlock, confirmPasswordBlock) => {
		let formData = {
			old_password: oldPasswordBlock.input.getValue(),
			new_password1: passwordBlock.input.getValue(),
			new_password2: confirmPasswordBlock.input.getValue(),
		}
		easyFetch('/api/user_management/auth/PasswordChangeForm', {
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
			oldPasswordBlock.input.input .style.outline = "2px solid red";
			passwordBlock.input.input .style.outline = "2px solid red";
			confirmPasswordBlock.input.input .style.outline = "2px solid red";
		});
	}
}

customElements.define('reset-password', ResetPassword);