import AbstractComponent from "@components/AbstractComponent";
import styles from '@css/TwoFactorAuth.css?raw';
import Pannel from "@components/Pannel";
import InputField from "@components/InputField";
import CustomButton from "@components/CustomButton";
import Router from "@utils/Router";
import getCookie from "@utils/getCookie";
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";
import { refreshTokenLoop } from "@utils/pollingFunctions";

export default class TwoFactorAuth extends AbstractComponent {
	constructor(options = {}) {
		super();

		console.log('TwoFactorAuth');

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let pannel = new Pannel({title: "Two Factor Auth", dark: false});
		let twoFactorAuthInput = new InputField({content: "Code", name: "code", type: "text"});
		let submitButton = new CustomButton({content: "Submit", action: true, style: {margin: "15px 0px 0px 0px"}});
	
		let resend = document.createElement('p');
		resend.id = "resend-code";
		resend.textContent = "Didn't recieve code ? Resend";
		
		resend.style.setProperty("font-size", "20px");
		resend.style.setProperty("margin", "0px");
		resend.style.setProperty("margin-bottom", "35px");
		resend.style.setProperty("padding", "0px");
		resend.style.setProperty("cursor", "pointer");
		
		pannel.shadowRoot.appendChild(twoFactorAuthInput);
		pannel.shadowRoot.appendChild(submitButton);
		pannel.shadowRoot.appendChild(resend);

		this.shadowRoot.appendChild(pannel);

		submitButton.onclick = (e) => this.submitTwoFactorAuth(e, {
				one_time_code: twoFactorAuthInput.getValue(),
				context: 'login'
		});
		// this.shadowRoot.querySelector('#cancel').onclick = this.cancelTwoFactorAuth;
	}

	submitTwoFactorAuth = (e, formData) => {
		if (e)
			e.preventDefault();
		console.log('values:', formData);
		easyFetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams(formData)
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty response');
			}

			if (response.status === 400) {
				displayPopup(body.error || 'Invalid code', 'error');
				return ;
			}
	
			if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			}

			if (response.status === 200 && body.success === true) {
				displayPopup('Login successful: ' + body.message, 'success');

				refreshTokenLoop();

				Router.redirectTo("/");
			}
		})
		.catch(error => {
			displayPopup('Request Failed' + error, 'error');
		});
	}

	cancelTwoFactorAuth = (e) => {
		e.preventDefault();
		console.log('cancelTwoFactorAuth');
	}
}

customElements.define('two-fa', TwoFactorAuth);
