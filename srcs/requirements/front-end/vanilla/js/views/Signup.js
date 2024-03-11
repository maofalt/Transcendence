import AbstractComponent from "@components/AbstractComponent";
// import styles from '@css/TwoFactorAuth.css?raw';
import Pannel from "@components/Pannel";
import InputField from "@components/InputField";
import CustomButton from "@components/CustomButton";
import Router from "@utils/Router";
import { getCookie } from "@utils/getCookie";
import { easyFetch } from "@utils/easyFetch";
import { htmlToElement } from "@utils/htmlToElement";
import WarnIndicator from "@components/WarnIndicator";

export default class Signup extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = `
			#signup {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
			}
			#title {
				font-size: 40px;
				margin-bottom: 20px;
			}
			#buttons {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				width: 100%;
			}
			#submit, #cancel {
				width: 45%;
				height: 50px;
				font-size: 20px;
				cursor: pointer;
			}
		`;
		this.shadowRoot.appendChild(styleEl);

		let pannel = new Pannel({title: "Sign Up", dark: false});
		let usernameInput = new InputField({content: "Username", name: "username", type: "text"});
		let passwordInput = new InputField({content: "Password", name: "password", type: "password"});
		let confirmPasswordInput = new InputField({content: "Confirm Password", name: "confirm_password", type: "password"});
		let playerNameInput = new InputField({content: "Player Name", name: "playername", type: "text"});
		let emailInput = new InputField({content: "Email", name: "email", type: "text"});
		let sendCodeToEmail = new CustomButton({content: "Send Code to Email", action: true, style: {margin: "15px 0px 0px 0px"}});
		let accessCodeInput = new InputField({content: "Access Code", name: "access_code", type: "text"});
		let signUpButton = new CustomButton({content: "Sign Up", action: true});

		let indicator = new WarnIndicator({style: {color: "red"}, content: "Invalid input"});

		pannel.shadowRoot.appendChild(usernameInput);
		pannel.shadowRoot.appendChild(passwordInput);
		pannel.shadowRoot.appendChild(confirmPasswordInput);
		pannel.shadowRoot.appendChild(playerNameInput);
		pannel.shadowRoot.appendChild(emailInput);
		pannel.shadowRoot.appendChild(sendCodeToEmail);
		pannel.shadowRoot.appendChild(accessCodeInput);
		pannel.shadowRoot.appendChild(signUpButton);

		pannel.shadowRoot.appendChild(indicator);

		this.shadowRoot.appendChild(pannel);

		sendCodeToEmail.onclick = (e) => this.sendCodeToEmail(e, emailInput.getValue());
		
		passwordInput.oninput = (e) => this.checkPassword(e, passwordInput);
		confirmPasswordInput.oninput = (e) => this.checkPasswordMatch(e, passwordInput, confirmPasswordInput);

		signUpButton.onclick = (e) => this.submitSignup(e, {
			username: usernameInput.getValue(),
			password: passwordInput.getValue(),
			confirm_password: confirmPasswordInput.getValue(),
			playername: playerNameInput.getValue(),
			signupEmail: emailInput.getValue(),
			access_code: accessCodeInput.getValue()
		});
	}

	submitSignup = (e, formData) => {
		e && e.preventDefault();
		
		console.log('submitSignup');
		console.log('values:', formData);

		easyFetch('/api/user_management/auth/signup', {
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
				alert('Request Failed');
				return ;
			}

			if (response.status === 400) {
				alert('Invalid signup data');
				return ;
			}
	
			if (!response.ok) {
				alert('Response Error:', body.error || JSON.stringify(body));
				return ;
			}

			if (response.status === 200 && body.success === true) {
				alert('Login successful:', body.message || JSON.stringify(body));
				Router.navigateTo("/");
			}
		})
		.catch(error => {
			console.error('Request Failed:', error);
		});
	}

	checkPassword = (e, passwordInput) => {
		e && e.preventDefault();
		
		let password = passwordInput.getValue();
		let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		
		if (!passwordRegex.test(password)) {
			passwordInput.input.style.outline = "2px solid red";
		} else {
			passwordInput.input.style.outline = "2px solid green";
		}
	}

	checkPasswordMatch = (e, passwordInput, confirmPasswordInput) => {
		e && e.preventDefault();
		
		let password = passwordInput.getValue();
		let confirmPassword = confirmPasswordInput.getValue();

		if (password !== confirmPassword) {
			confirmPasswordInput.input.style.outline = "2px solid red";
		} else {
			confirmPasswordInput.input.style.outline = "2px solid green";
		}
	}

	sendCodeToEmail = (e, email) => {
		if (e)
			e.preventDefault();
		easyFetch('/api/user_management/auth/access_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: JSON.stringify({ 'email': email })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				console.error('Request Failed');
				return ;
			}

			if (response.status === 400) {
				alert(body.error || 'Invalid email');
				return ;
			}
	
			if (!response.ok) {
				console.error('Request Failed:', body.error || JSON.stringify(body));
				return ;
			}

			if (response.status === 200 && body.success === true) {
				alert('Email sent to \'' + email + '\'');
				// Router.navigateTo("/");
			}
		})
		.catch(error => {
			console.error('Request Failed:', error);
		});
	}

	cancelSignup = (e) => {
		e.preventDefault();
		console.log('cancelSignup');
	}
}

customElements.define('signup-page', Signup);