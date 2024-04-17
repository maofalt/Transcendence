import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/SignUpPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";
import Router from "@utils/Router";
import getCookie from "@utils/getCookie";
import easyFetch from "@utils/easyFetch";
import WarnIndicator from "@components/WarnIndicator";
import InputAugmented from "@components/InputAugmented";
import InfoPopup from "@components/InfoPopup";
import displayPopup from "@utils/displayPopup";
import fetchUserDetails from "@utils/fetchUserDetails";
import { initSocketConnection } from "@utils/websocket";

export default class Signup extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let pannel = new Pannel({title: "Sign Up", dark: false});
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("font-size", "36px");
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "20px 0px 34px 0px");
		this.shadowRoot.appendChild(pannel);

		let formContainer = document.createElement('div');
		formContainer.id = "form-container";
		formContainer.style.setProperty("display", "flex");
		formContainer.style.setProperty("width", "100%");
		formContainer.style.setProperty("flex-direction", "column");
	
		pannel.shadowRoot.appendChild(formContainer);

		/* Player Name and Email */
		let playernameBlock = new InputAugmented({
			title: "Player Name",
			content: "Player Name",
			indicators: {
				emptyIndicator: ["Please enter your name", () => playernameBlock.input.getValue() != ""],
				backendIndicator: ["Invalid Player Name", () => this.verifySignupInput('validate_playername', { playername: playernameBlock.input.getValue() })],
			},
			description: "Can be changed anytime.",
			type: "text"
		});
		playernameBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				emailBlock.input.input.focus();
			}
		}

		let emailBlock = new InputAugmented({
			title: "Email",
			content: "example@example.com",
			indicators: {
				emptyIndicator: ["Please enter your email", () => emailBlock.input.getValue() != ""],
				backendIndicator: ["Invalid Email", () => this.verifySignupInput('validate_email', { email: emailBlock.input.getValue() })],
				// invalidEmailIndicator: ["Invalid Email", () => this.emailIsValid(emailBlock)],
			},
			type: "email",
			// button: {content: "Send Code", action: false}
		});
		emailBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				nextButton.click();
			}
		}

		/* Username and Password */
		let idBlock = new InputAugmented({
			title: "Username",
			content: "example: GigaBoomer69",
			indicators: {
				emptyIndicator: ["Please enter a username", () => idBlock.input.getValue() != ""],
				backendIndicator: ["Invalid Username", () => this.verifySignupInput('validate_username', { username: idBlock.input.getValue() })],
			},
			type: "text",
			description: "A unique Username. Will be displayed in Games and Tournaments. Cannot be changed."
		});
		idBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				passwordBlock.input.input.focus();
			}
		}

		let passwordBlock = new InputAugmented({
			title: "Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please enter a password", () => passwordBlock.input.getValue() != ""],
				lengthIndicator: ["Minimum 8 characters", () => passwordBlock.input.getValue().length >= 8],
				digitIndicator: ["At least 1 digit", () => /\d/.test(passwordBlock.input.getValue())],
				letterIndicator: ["At least 1 letter", () => /[a-zA-Z]/.test(passwordBlock.input.getValue())],
				// backendIndicator: ["Invalid Password", () => this.verifySignupInput('validate_password', { password: passwordBlock.input.getValue() })],
				// differentIndicator: ["Different from your Playername and your Email" () => this.],
			},
			type: "password"
		});
		passwordBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				confirmPasswordBlock.input.input.focus();
			}
		}

		let confirmPasswordBlock = new InputAugmented({
			title: "Confirm Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please confirm your password", () => confirmPasswordBlock.input.getValue() != ""],
				matchIndicator: ["Passwords don't match", () => passwordBlock.input.getValue() == confirmPasswordBlock.input.getValue()],
			},
			type: "password"
		});
		confirmPasswordBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				nextButton.click();
			}
		}

		/* Verify Code */
		let verifyCodeBlock = new InputAugmented({
			title: "Verify Code",
			content: "XXXXXX",
			indicators: {
				emptyIndicator: ["Please enter the code sent to your email", () => verifyCodeBlock.input.getValue() != ""],
				badCodeIndicator: ["Incorrect Code", () => this.verifyCode(emailBlock, verifyCodeBlock)],
				// badCodeIndicator: "Incorrect Code"
			},
			type: "text",
			// button: {content: "Verify Code", action: false}
		});
		verifyCodeBlock.onkeydown = (e) => {
			if (e.key === "Enter") {
				finalSignupButton.click();
			}
		}

		/* Privacy Policy */
			// put privacy policy block here

		let nextButton = new CustomButton({content: "Next", action: true});
		nextButton.id = "nextButton";
		nextButton.tabIndex = 0;
		
		let backButton = new CustomButton(
			{
				content: "↩", // "⇦", // "↵", //"↶", //"↩", 
				action: true, 
				style: {
					'position': 'absolute',
					'top': '10px',
					'left': '10px',
					'padding': '1px',
					'width': '40px',
					'height': '40px',
					'font-size': '25px',
					// 'display': 'none',
					// 'background-color': 'lightblue',
				}
			});
		backButton.id = "backButton";
	
		let finalSignupButton = new CustomButton({content: "Sign Up", action: true});
		finalSignupButton.style.display = "none";
		finalSignupButton.id = "finalSignupButton";
		
		pannel.shadowRoot.appendChild(nextButton);
		pannel.shadowRoot.appendChild(finalSignupButton);
		pannel.shadowRoot.appendChild(backButton);

		/* Define Signup flow steps/views */
		this.flowIndex = 0;

		// define input blocks to be displayed in each step and functions (actions) to be called when the next button is pressed 
		let flow = [
			{ 
				blocks: [playernameBlock, emailBlock], 
				actions: [] 
			}, 
			{ 
				blocks: [idBlock, passwordBlock, confirmPasswordBlock], 
				actions: [
					async (e) => await this.sendCodeToEmail(e, emailBlock.input.getValue()),
					async () => await this.verifySignupInput('validate_password', { password: passwordBlock.input.getValue() })
				],
			}, 
			{ 
				blocks: [verifyCodeBlock], 
				actions: [] 
			}
		];

		// hide all the steps apart from the first one
		flow.forEach((step, index) => {
			step.blocks.forEach((inputBlock) => {
				formContainer.appendChild(inputBlock);
				if (index > 0) {
					inputBlock.style.setProperty("display", "none");
				}
			});
		});

		passwordBlock.input.oninput = (e) => passwordBlock.validate();
		confirmPasswordBlock.input.oninput = (e) => confirmPasswordBlock.validate();

		nextButton.onclick = async (e) => {
			await this.goNext(e, flow);
			if (this.flowIndex >= flow.length - 1) {
				finalSignupButton.style.display = "block";
				nextButton.style.display = "none";
			}
		}

		backButton.onclick = (e) => {
			finalSignupButton.style.display = "none";
			nextButton.style.display = "block";
			this.goBack(e, flow);
		}

		finalSignupButton.onclick = async (e) => {
			if (await verifyCodeBlock.validate() == false)
				return ;
			let isSignedUp = await this.submitSignup(e, {
				username: idBlock.input.getValue(),
				password: passwordBlock.input.getValue(),
				confirm_password: confirmPasswordBlock.input.getValue(),
				playername: playernameBlock.input.getValue(),
				signupEmail: emailBlock.input.getValue(),
				access_code: verifyCodeBlock.input.getValue()
			});
			if (isSignedUp) {
				displayPopup("Sign Up Successful: \nYou now have an account and are connected.", "success");
				Router.navigateTo("/");
			}
		}
	}

	/* FORM FLOW MANAGEMENT */
	goNext = async (e, flow) => { // called when next button is pressed
		e.preventDefault();
		if (this.flowIndex >= flow.length - 1)
			return ;
		console.log("before");

		// validate input blocks (show warnings and dont advance if invalid)
		for (const block of flow[this.flowIndex].blocks) {
			let res = await block.validate();
			if (res == false) {
				return ;
			}
		}

		// call functions that are defined for this step
		for (const action of flow[this.flowIndex].actions) {
			let res = await action();
			console.log("actionresulty: ", res);
			if (res == false) {
				console.log("oh no");
				return ;
			}
			console.log("actionresult: ", res);
		}
		
		console.log("after");
		this.flowIndex++;
		// if (this.flowIndex > 0)
		// 	document.getElementById("backButton").style.display = "block";
		this.updateFormView(flow, this.flowIndex);
	}

	goBack = (e, flow) => { // called when back button is pressed
		e.preventDefault();
		if (this.flowIndex <= 0) {
			history.back();
			return ;
		}
		this.flowIndex--;
		this.updateFormView(flow, this.flowIndex);
	}

	updateFormView = (flow, index) => { // called after goBack() / goNext() to change the form flow view
		flow.forEach((step) => {
			step.blocks.forEach((inputBlock) => {
				inputBlock.style.setProperty("display", "none");
			});
		});
		flow[index].blocks.forEach((inputBlock) => {
			inputBlock.style.setProperty("display", "block");
		});
	}

	/* VALIDATION CONDITION FUNCTIONS */
	emailIsValid = (emailBlock) => {
		let value = emailBlock.input.getValue();
		let valid = value.includes('@');
		return valid;
	}

	/* API VALIDATION + SUBMIT FUNCTIONS */
	verifySignupInput = async (endpoint, formData) => {
		let valid = false;

		await easyFetch(`/api/user_management/auth/${endpoint}`, {
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
				throw new Error('Empty Response');
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.status === 200) {
				if (body.valid === true) {
					// displayPopup(body.message || JSON.stringify(body), 'success');
					valid = true;
				} else {
					displayPopup(body.error || JSON.stringify(body), 'error');
					valid = false;
				}
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

	verifyCode = async (emailBlock, verifyCodeBlock) => {
		var email = emailBlock.input.getValue();
		var verificationCode = verifyCodeBlock.input.getValue();

		let valid = false;

		await easyFetch('/api/user_management/auth/verify_code', {
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
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup(body.error || JSON.stringify(body), 'error');
				valid = false;
			} else if (!response.ok) {
				displayPopup('Response Error: ' + (body.error || JSON.stringify(body)), 'error');
				valid = false;
			} else if (response.status === 200 && body.success === true) {
				// displayPopup(body.message || JSON.stringify(body), 'success');
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

	submitSignup = async (e, formData) => {
		e && e.preventDefault();
		
		let valid = false;

		console.log('submitSignup');
		console.log('values:', formData);

		await easyFetch('/api/user_management/auth/signup', {
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
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup('Invalid signup data', 'error');
				valid = false;
			} else if (!response.ok) {
				displayPopup('Response Error: ' + body.error || JSON.stringify(body), 'error');
				valid = false;
			} else if (response.status === 200 && body.success === true) {

				// Store the access token and details in memory
				sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expires_in * 1000);
				sessionStorage.setItem('accessToken', body.access_token);
				sessionStorage.setItem('tokenType', body.token_type);

				// connect to the socket
				initSocketConnection();

				// get user details for the profile page
				let details = await fetchUserDetails();
				// sessionStorage.setItem('userDetails', JSON.stringify(details));

				Router.navigateTo("/");
				// window.location.reload();
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

	sendCodeToEmail = async (e, email) => {
		if (e)
			e.preventDefault();
		let valid = false;
		await easyFetch('/api/user_management/auth/access_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: new URLSearchParams({ email })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup(body.error || 'Invalid email', 'error');
				valid = false;
			} else if (!response.ok) {
				displayPopup('Request Failed:', body.error || JSON.stringify(body), 'error');
				valid = false;
			} else if (response.status === 200 && body.success === true) {
				displayPopup('Email sent to \'' + email + '\'', 'success');
				valid = true;
			} else {
				displayPopup(body.error || JSON.stringify(body), 'error');
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
			valid = false;
		});
		console.log("valid2: ", valid);
		return valid;
	}


	/* UTIL PAGE CREATION FUNCTIONS */
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
		// privacyTitle.style.setProperty("font-family", "tk-421, Anta, sans-serif");
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

	buttonOnClick = (e, arg) => {
		console.log(arg);
		return true;
	}

}

customElements.define('signup-page', Signup);
