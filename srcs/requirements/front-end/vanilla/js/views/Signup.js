import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/SignUpPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";
import Router from "@utils/Router";
import { getCookie } from "@utils/getCookie";
import { easyFetch } from "@utils/easyFetch";
import WarnIndicator from "@components/WarnIndicator";
import InputAugmented from "@components/InputAugmented";

export default class Signup extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		// let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Sign Up", dark: false});

		let formContainer = document.createElement('div');
		formContainer.id = "form-container";
		formContainer.style.setProperty("display", "flex");
		formContainer.style.setProperty("width", "100%");
		formContainer.style.setProperty("flex-direction", "row");

		// let idBlock = this.createInputAndTitle("Unique ID", "ID", "example: GigaBoomer69", 
		// "A unique ID that defines you in our Database.", "");
		// idBlock.style.setProperty("height", "130px");

		let idBlock = new InputAugmented({
			title: "Unique ID",
			content: "example: GigaBoomer69",
			type: "text",
			description: "A unique ID that defines you in our Database."
		});

		let passwordBlock = new InputAugmented({
			title: "Password",
			content: "Password",
			indicators: {
				lengthIndicator: "Minimum 8 characters",
				digitIndicator: "At least 1 digit",
				letterIndicator: "At least 1 letter",
				differentIndicator: "Different from your Playername and your Email"
			},
			type: "password"
		});
		let PasswordIndicators = passwordBlock.indicators;

		let confirmPasswordBlock = this.createInputAndTitle("Confirm Password", "con-password", "Password", "", "password");
		confirmPasswordBlock.style.setProperty("height", "130px");

		let playernameBlock = this.createInputAndTitle("Playername", "playername", "Playername", 
		"Your Playername will be displayed in games and tournaments.", "");

		let emailBlock = this.createInputAndTitle("Email", "email", "example@example.com", "", "");
		emailBlock.style.setProperty("height", "180px");

		let verifyCodeBlock = this.createInputAndTitle("Verify Code", "verif-code", "XXXXXX", "", "");
		verifyCodeBlock.style.setProperty("height", "170px");
		
		const sendCode = new CustomButton({content: "Send Code", action: false});
		emailBlock.appendChild(sendCode);
		
		const verifyCode = new CustomButton({content: "Verify Code", action: false});
		verifyCodeBlock.appendChild(verifyCode);
		
		let leftBlock = this.createBlock("left");
		let rightBlock = this.createBlock("right");
		
		const privacyBlock = this.createPrivacyBlock();
		
		leftBlock.appendChild(idBlock);
		leftBlock.appendChild(passwordBlock);
		leftBlock.appendChild(confirmPasswordBlock);
		leftBlock.appendChild(playernameBlock);
		
		rightBlock.appendChild(emailBlock);
		rightBlock.appendChild(verifyCodeBlock);
		rightBlock.appendChild(privacyBlock);
		
		formContainer.appendChild(leftBlock);
		formContainer.appendChild(rightBlock);
		
		const buttonsBlock = this.createBottomButtons();
		
		pannel.shadowRoot.appendChild(formContainer);
		pannel.shadowRoot.appendChild(buttonsBlock);
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("font-size", "36px");
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "20px 0px 34px 0px");

		const indicator = new WarnIndicator({style: {color: "red"}, content: "Invalid input"});
		pannel.shadowRoot.appendChild(indicator);
		// this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
		
		let usernameInput = idBlock.querySelector("input-field");
		let emailInput = emailBlock.querySelector("input-field");
		let passwordInput = passwordBlock.shadowRoot.querySelector("input-field");
		let confirmPasswordInput = confirmPasswordBlock.querySelector("input-field");
		let playerNameInput = playernameBlock.querySelector("input-field");
		let accessCodeInput = verifyCodeBlock.querySelector("input-field");
		
		let signUpButton = buttonsBlock.querySelector("#signUpButton");
		let backButton = buttonsBlock.querySelector("#backButton");

		sendCode.onclick = (e) => this.sendCodeToEmail(e, emailInput.getValue());
		verifyCode.onclick = (e) => this.verifyCode(e, emailInput, accessCodeInput);

		passwordInput.oninput = (e) => this.checkPassword(e, passwordInput, PasswordIndicators);
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

	verifyCode = (e, emailInput, verificationCodeInput) => {
		var email = emailInput.getValue();
		var verificationCode = verificationCodeInput.getValue();

		easyFetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams({ 'email': email, 'one_time_code': verificationCode, 'context': "signup" })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				alert('Request Failed');
				return ;
			}

			if (response.status === 400) {
				alert(body.error || JSON.stringify(body));
				return ;
			}
	
			if (!response.ok) {
				alert('Response Error: ' + (body.error || JSON.stringify(body)));
				return ;
			}

			if (response.status === 200 && body.success === true) {
				alert(body.message || JSON.stringify(body));
				return ;
			}

			alert(body.error || JSON.stringify(body));
		})
		.catch(error => {
			console.error('Request Failed:', error);
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
				alert('Response Error: ' + body.error || JSON.stringify(body));
				return ;
			}

			if (response.status === 200 && body.success === true) {
				alert('Login successful: ' + body.message || JSON.stringify(body));
				Router.navigateTo("/");
				return ;
			}

			alert(body.error || JSON.stringify(body));
		})
		.catch(error => {
			console.error('Request Failed:', error);
		});
	}

	checkPassword = (e, passwordInput, indicators) => {
		e && e.preventDefault();
		
		let password = passwordInput.getValue();
		let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		
		if (password.length >= 8) {
			passwordInput.input.style.outline = "2px solid green";
			indicators.lengthIndicator.setAttribute("valid", "true");
		} else {
			passwordInput.input.style.outline = "2px solid red";
			indicators.lengthIndicator.setAttribute("valid", "false");
		}

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

	buttonOnClick = (e, arg) => {
		console.log(arg);
	}

	createInputAndTitle(titleContent, id, content, descContent, inputType) {
		let title = document.createElement("p");
		title.id = id + "-title-id";
		title.textContent = titleContent;
		title.style.setProperty("font-family", "tk-421, Anta, sans-serif");
		title.style.setProperty("font-size", "26px");
		title.style.setProperty("margin", "0px 0px 10px 0px");
		// title.style.setProperty("border", "1px green solid");

		const input = new InputField({content: content, type: inputType});
		input.id = id + "-input-id";
		input.style.setProperty("marin-bottom", "0px");
		
		let inputBlock = document.createElement("div");
		inputBlock.id = id + "-block-id";
		inputBlock.style.setProperty("height", "145px");
		inputBlock.style.setProperty("margin", "0px 0px 20px 0px");
		// inputBlock.style.setProperty("border", "1px yellow solid");

		let description = document.createElement("p");
		description.id = id + "-desc-id";
		description.textContent = descContent;
		description.style.setProperty("font-family", "Anta, sans-serif");
		description.style.setProperty("font-size", "14px");
		description.style.setProperty("margin-top", "-3px");

		inputBlock.appendChild(title);
		inputBlock.appendChild(input);
		inputBlock.appendChild(description);
		return inputBlock;
	}

	createBlock(blockName) {
		let block = document.createElement('div');
		block.id = blockName + "-block";
		block.style.setProperty("flex", "1");
		block.style.setProperty("margin", "0px 15px");
		// block.style.setProperty("padding", "0px");
		// block.style.setProperty("border", "1px red solid");
		return block;
	}

	createPrivacyBlock() {
		const privacyBlock = document.createElement("div");
		privacyBlock.style.setProperty("width", "100%");
		privacyBlock.style.setProperty("height", "200px");
		// privacyBlock.style.setProperty("border", "1px yellow solid");

		const privacyTitle = document.createElement("p");
		privacyTitle.id = "privacy-title";
		privacyTitle.textContent = "Privacy Policy";
		privacyTitle.style.setProperty("font-size", "32px");
		privacyTitle.style.setProperty("font-family", "tk-421, Anta, sans-serif");
		privacyTitle.style.setProperty("margin", "15px 0px 10px 0px");
		
		const checkBox = document.createElement("input");
		checkBox.type = "checkbox";
		checkBox.style.setProperty("width", "24px");
		checkBox.style.setProperty("height", "24px");
		checkBox.style.setProperty("margin-right", "15px");

		const privacyDesc = document.createElement("p");
		privacyDesc.id = "privacy-desc";
		privacyDesc.textContent = "I agree to the terms and conditions.";
		privacyDesc.style.setProperty("width", "100%");
		privacyDesc.style.setProperty("font-size", "14px");

		const acceptPrivacyBlock = document.createElement("div");
		acceptPrivacyBlock.style.setProperty("width", "100%");
		acceptPrivacyBlock.style.setProperty("height", "50px");
		acceptPrivacyBlock.style.setProperty("margin", "10px 0px 10px 0px");
		acceptPrivacyBlock.style.setProperty("display", "flex");
		acceptPrivacyBlock.style.setProperty("flex-direction", "row");
		acceptPrivacyBlock.style.setProperty("justify-content", "center");
		acceptPrivacyBlock.style.setProperty("align-items", "center");
		// acceptPrivacyBlock.style.setProperty("border", "1px green solid");
		
		const privacyPolicy = new CustomButton({content: "Privacy Policy", action: false});
		
		acceptPrivacyBlock.appendChild(checkBox);
		acceptPrivacyBlock.appendChild(privacyDesc);
		privacyBlock.appendChild(privacyTitle);
		privacyBlock.appendChild(privacyPolicy);
		privacyBlock.appendChild(acceptPrivacyBlock);

		return privacyBlock;
	}

	createBottomButtons() {
		const block = document.createElement("div");
		block.style.setProperty("width", "100%");
		block.style.setProperty("height", "80px");
		block.style.setProperty("margin", "15px 0px");
		block.style.setProperty("display", "flex");
		block.style.setProperty("flex-direction", "row");
		// block.style.setProperty("border", "1px red solid");

		const leftButtonDiv = document.createElement("div");
		leftButtonDiv.style.setProperty("width", "100%");
		leftButtonDiv.style.setProperty("height", "80px");
		leftButtonDiv.style.setProperty("margin-right", "30px");
		leftButtonDiv.style.setProperty("flex", "1");

		let signUpButton = new CustomButton({content: "Sign Up", action: true, style: {margin: "0px 15px"}});
		signUpButton.style.setProperty("flex", "1");
		signUpButton.id = "signUpButton";
		let backButton = new CustomButton({content: "< Back", action: false, style: {margin: "0px 15px", width: "200px"}});
		backButton.style.setProperty("width", "50%");
		backButton.id = "backButton";

		leftButtonDiv.appendChild(backButton);
		block.appendChild(leftButtonDiv);
		block.appendChild(signUpButton);

		return block;
	}
	// Implement other methods or properties as needed
}

customElements.define('signup-page', Signup);
