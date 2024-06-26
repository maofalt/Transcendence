import AbstractComponent from "@components/AbstractComponent";
import Pannel from '@components/Pannel';
import InputAugmented from '@components/InputAugmented';
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";
import { fadeIn, fadeOut, transition } from "@utils/animate";
import { redirectTo } from "@utils/Router";
import setupLogin from "@utils/setupLogin";

export default class TwoFactorAuth extends AbstractComponent {
	constructor(emailBlock, context, options = {}) {
		super();

		this.method = options.method || "email";
		this.email = options.email || "";
		this.phone = options.phone || "";
		this.context = context || "login";

		this.style.display = "none";
		this.style.position = "fixed";
		this.style.top = "0";
		this.style.left = "0";
		this.style.width = "100%";
		this.style.height = "100%";
		this.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
		const container = document.createElement("div");
		container.style.display = "block";
		container.style.position = "fixed";
		container.style.top = "0";
		container.style.left = "0";
		container.style.width = "100%";
		container.style.height = "100%";
		container.onclick = (e) => { // Close the pannel when clicking outside
			if (e.target === container) {
				fadeOut(this);
			}
		}
		
		const verifyCodePannel = new Pannel({dark: false, title: "Verify Code", style: {padding: "15px"}});
		verifyCodePannel.style.position = "fixed";
		verifyCodePannel.style.top = "50%";
		verifyCodePannel.style.left = "50%";
		verifyCodePannel.style.transform = "translate(-50%, -50%)";
		verifyCodePannel.style.setProperty("display", "block");

		const verifyCodeInput = new InputAugmented({
			title: "Code Code",
			content: "Code Code",
			type: "text",
			button: {content: "Verify", action: true}
		});
		verifyCodeInput.button.onclick = async () => {
			let valid = await this.verifyEmail(emailBlock, verifyCodeInput);
			if (!valid && emailBlock) {
				emailBlock.setAttribute("verified", false);
			} else if (emailBlock) {
				emailBlock.input.input.style.setProperty("border", "2px solid green");
				emailBlock.setAttribute("verified", true);
			}
			if (!emailBlock && valid)
				redirectTo('/');
			fadeOut(this);
		}

		verifyCodePannel.shadowRoot.appendChild(verifyCodeInput);

		container.appendChild(verifyCodePannel);

		this.shadowRoot.appendChild(container);
	}

	verifyEmail = async (emailBlock, verifyCodeInput) => {
		let email;
		if (emailBlock) {
			email = emailBlock.input.getValue();
		}
		const one_time_code = verifyCodeInput.input.getValue();
		const context = this.context;

		let valid = false;

		let body;

		if (context === "update") {
			body = new URLSearchParams({ email, one_time_code, context });
		} else {
			body = new URLSearchParams({ one_time_code, context });
		}

		await easyFetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body
		})
		.then(async res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup(body.error || JSON.stringify(body), 'error');
				valid = false;
			} else if (!response.ok) {
				displayPopup('Response Error: ' + (body.error || JSON.stringify(body)), 'error');
				valid = false;
			} else if (response.status === 200 && body.success === true) {
				// get user details for the profile page and start the socket connection
				await setupLogin(body);

				displayPopup(body.message || JSON.stringify(body), 'success');
				valid = true;
			} else {
				displayPopup(body.error || JSON.stringify(body), 'error');
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
			valid = false;
		});
		return valid
	}

	verifySms = async (phoneBlock, verifyCodeInput) => {
		let phone_number
		if (phoneBlock) {
			phone_number = phoneBlock.input.getValue().replace(/\s/g, '');
		}
		const otp = verifyCodeInput.input.getValue();

		let valid = false;

		let body;

		if (context === "update") {
			body = new URLSearchParams({ phone_number, otp, context});
		} else {
			body = new URLSearchParams({ phone_number, otp, context });
		}

		await easyFetch('api/user_management/auth/verifySandBox', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ phone_number, otp })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup(body.error || JSON.stringify(body), 'error');
				valid = false;
			} else if (!response.ok) {
				displayPopup('Response Error: ' + (body.error || JSON.stringify(body)), 'error');
				valid = false;
			} else if (response.status === 200 && body.success === true) {
				displayPopup(body.message || JSON.stringify(body), 'success');
				valid = true;
			} else {
				displayPopup(body.error || JSON.stringify(body), 'error');
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
			valid = false;
		});
		return valid
	}
}

customElements.define('two-factor-auth', TwoFactorAuth);