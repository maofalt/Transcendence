import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";
import Router from "@utils/Router";
import { getCookie } from "@utils/getCookie";
import { easyFetch } from "@utils/easyFetch";

export default class LoginPage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Log In", dark: false});
		let usernameInput = new InputField({content: "Username", name: "username", type: "text"});
		let passwordInput = new InputField({content: "Password", name: "password", type: "password"});
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

		pannel.shadowRoot.appendChild(usernameInput);
		pannel.shadowRoot.appendChild(passwordInput);
		pannel.shadowRoot.appendChild(p);
		pannel.shadowRoot.appendChild(buttons);

		loginButton.onclick = (e) => this.submitLoginForm(e, 
			{
				username: usernameInput.getValue(),
				password: passwordInput.getValue()
			});

		p.onclick = () => Router.navigateTo("/forgot_password");

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
	submitLoginForm = (e, formData) => {
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
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				console.error('Request Failed');
				return ;
			}

			if (response.status === 400) {
				alert('Wrong username or password');
				return ;
			}
	
			if (!response.ok) {
				console.error('Request Failed:', body.error || JSON.stringify(body));
				return ;
			}

			if (response.status === 200 && body.success === true) {

				// Store the access token and details in memory
				sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expires_in * 1000);
				sessionStorage.setItem('accessToken', body.access_token);
				sessionStorage.setItem('tokenType', body.token_type);
				
				if (body.requires_2fa) {
					Router.navigateTo("/2fa");
					return ;
				}
	
				console.log('Login successful:', body);
				Router.navigateTo("/");
			}
		})
		.catch(error => {
			console.error('Request Failed:', error);
		});
	}
}

customElements.define('login-page-v2', LoginPage);