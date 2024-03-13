import AbstractComponent from "@components/AbstractComponent";
import styles from '@css/TwoFactorAuth.css?raw';
import Pannel from "@components/Pannel";
import InputField from "@components/InputField";
import CustomButton from "@components/CustomButton";
import Router from "@utils/Router";
import { getCookie } from "@utils/getCookie";
import { easyFetch } from "@utils/easyFetch";

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

		submitButton.onclick = (e) => this.submitTwoFactorAuth(e,
			{
				one_time_code: twoFactorAuthInput.getValue(),
				context: 'login'
			});
		// this.shadowRoot.querySelector('#cancel').onclick = this.cancelTwoFactorAuth;
	}

	// submitLoginForm = (e, formData) => {
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
				console.error('Request Failed');
				return ;
			}

			if (response.status === 400) {
				alert(body.error || 'Invalid code');
				return ;
			}
	
			if (!response.ok) {
				console.error('Request Failed:', body.error || JSON.stringify(body));
				return ;
			}

			if (response.status === 200 && body.success === true) {
				alert('Login successful: ' + body.message);
				Router.navigateTo("/");
			}
		})
		.catch(error => {
			console.error('Request Failed:', error);
		});
	}

	cancelTwoFactorAuth = (e) => {
		e.preventDefault();
		console.log('cancelTwoFactorAuth');
	}
}

customElements.define('two-factor-auth', TwoFactorAuth);
