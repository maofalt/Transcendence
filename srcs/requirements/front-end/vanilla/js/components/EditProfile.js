import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import AbstractView from "@views/AbstractView";
import profilePageStyles from '@css/EditProfile.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import InputAugmented from '@components/InputAugmented';
import { navigateTo } from "@utils/Router";
import UserInfo from "./UserInfo";
import FriendsList from "@components/FriendsList";
import updateUser from "@utils/updateUser";
import fetchUserDetails from "@utils/fetchUserDetails";
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";
import twoFactorChoiceHtml from '@html/twoFactorChoice.html?raw';
import { fadeIn, fadeOut, transition } from "@utils/animate";

export default class EditProfile extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = profilePageStyles;
		this.shadowRoot.appendChild(styleEl);

		// let user = options.user;
		this.user = JSON.parse(sessionStorage.getItem("userDetails"));
		if (!this.user)
			this.user = fetchUserDetails();

		const profile = new Pannel({dark: false, title: "Edit Profile", style: {padding: "15px"}});
		const friendsPannel = new Pannel({dark: false, title: "Friends"});

		const friendsListPannel = new Pannel({dark: true, title: `Friends List  ( ${this.user.friends_count} )`});

		const friendsList = new FriendsList();
		friendsListPannel.shadowRoot.appendChild(friendsList);

		// friendsPannel.shadowRoot.appendChild(addFriend);
		friendsPannel.shadowRoot.appendChild(friendsListPannel);

		this.shadowRoot.appendChild(friendsPannel);

		const saveButton = new CustomButton({content: "Save", action: true, style: {width: "520px", margin: "20px 0px"}});
		const resetPasswordButton = new CustomButton({content: "Change Password", action: false, style: {width: "520px", margin: "20px 0px"}});
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		const verifyCodeBlock = document.createElement("div");
		verifyCodeBlock.style.display = "none";
		verifyCodeBlock.style.position = "fixed";
		verifyCodeBlock.style.top = "0";
		verifyCodeBlock.style.left = "0";
		verifyCodeBlock.style.width = "100%";
		verifyCodeBlock.style.height = "100%";
		verifyCodeBlock.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
		verifyCodeBlock.onclick = (e) => { // Close the pannel when clicking outside
			if (e.target === verifyCodeBlock) {
				fadeOut(verifyCodeBlock);
			}
		}
		
		const verifyCodePannel = new Pannel({dark: false, title: "Verify Code", style: {padding: "15px"}});
		// verifyCodePannel.shadowRoot.querySelector("#button-container").shadowRoot.style.setProperty("display", "none");
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
			if (verifyCodePannel.name == "phone") {
				if (!await this.verifySms(phoneBlock, verifyCodeInput)) {
					phoneBlock.setAttribute("verified", false);
				} else {
					phoneBlock.input.input.style.setProperty("border", "2px solid green");
					phoneBlock.setAttribute("verified", true);
				}
			} else if (verifyCodePannel.name == "email") {
				if (!await this.verifyEmail(emailBlock, verifyCodeInput)) {
					emailBlock.setAttribute("verified", false);
				} else {
					emailBlock.input.input.style.setProperty("border", "2px solid green");
					emailBlock.setAttribute("verified", true);
				}
			}
			fadeOut(verifyCodeBlock);
		}

		verifyCodePannel.shadowRoot.appendChild(verifyCodeInput);

		verifyCodeBlock.appendChild(verifyCodePannel);

		let playernameBlock = new InputAugmented({
			title: "New Playername",
			content: "Playername",
			description: "Your Playername will be displayed in games and tournaments.",
			type: "text"
		});

		let emailBlock = new InputAugmented({
			title: "New Email",
			content: "example@example.com",
			indicators: {
				unverifiedIndicator: ["Please verify your email", () => this.isVerified(emailBlock)],
				emptyIndicator: ["Please enter your verified email", () => this.emptyBlock(emailBlock)],
			},
			type: "email",
			button: {content: "Verify", action: false}
		});
		emailBlock.button.onclick = async () => {
			let shouldContinue = await this.sendEmail(emailBlock);
			if (!shouldContinue) {
				emailBlock.input.input.style.setProperty("border", "2px solid red");
				return ;
			}
			emailBlock.input.input.style.setProperty("border", "");
			verifyCodePannel.name = "email";
			fadeIn(verifyCodeBlock);
		};

		let phoneBlock = new InputAugmented({
			title: "New Phone Number",
			content: "+33 6 12 34 56 78",
			indicators: {
				unverifiedIndicator: ["Please verify your phone number", () => this.isVerified(emailBlock)],
				emptyIndicator: ["Please enter your verified phone", () => this.emptyBlock(emailBlock)],
			},
			type: "tel",
			button: {content: "Verify", action: false}
		});
		phoneBlock.button.onclick = async () => {
			let shouldContinue = await this.sendSMS(phoneBlock);
			if (!shouldContinue) {
				phoneBlock.input.input.style.setProperty("border", "2px solid red");
				return ;
			}
			phoneBlock.input.input.style.setProperty("border", "");
			verifyCodePannel.name = "phone";
			fadeIn(verifyCodeBlock);
		};

		let twoFactorBlock = document.createElement("div");
		twoFactorBlock.innerHTML = twoFactorChoiceHtml;

		console.log(twoFactorBlock);

		let avatarBlock = new InputAugmented({
			title: "Upload Avatar",
			content: "Avatar",
			type: "file"
		});
		let avatarFile = "";
		avatarBlock.input.input.onchange = (e) => {
			if (e.target.files.length > 0) {
				avatarFile = e.target.files[0];
				// console.log(avatarFile);
			}
		}

		resetPasswordButton.onclick = () => navigateTo("/reset");

		saveButton.onclick = async () => {
			if (!await playernameBlock.validate() 
				|| !await emailBlock.validate() 
				|| !await avatarBlock.validate()
				|| !await phoneBlock.validate()) {
				return ;
			}
			updateUser({
				playername: playernameBlock.input.getValue() || "",
				avatar: avatarFile || "",
				email: emailBlock.input.getValue() || "",
				phone: phoneBlock.input.getValue() || "",
				two_factor_method: twoFactorBlock.querySelector("#input-tag").value || "",
			});
		}

		const form = document.createElement('div');
		form.style.setProperty("display", "block");

		form.appendChild(playernameBlock);
		form.appendChild(emailBlock);
		form.appendChild(phoneBlock);
		form.appendChild(twoFactorBlock);
		form.appendChild(avatarBlock);
		form.appendChild(resetPasswordButton);
		form.appendChild(saveButton);

		profile.shadowRoot.appendChild(form);
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
		this.shadowRoot.appendChild(verifyCodeBlock);
	}

	sendEmail = async (emailBlock) => {
		const email = emailBlock.input.getValue();
		let valid = false;
		await easyFetch('/api/user_management/auth/access_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
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

	sendSMS = async (phoneBlock) => {
		let valid = false;
		console.log("SENDING")
		const phone_number = phoneBlock.input.getValue().replace(/\s/g, '');

		await easyFetch('/api/user_management/auth/updateSandbox', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ phone_number })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (response.status === 400) {
				displayPopup(body.error || 'Invalid number', 'error');
			} else if (!response.ok) {
				displayPopup('Request Failed:', body.error || JSON.stringify(body), 'error');
			} else if (response.status === 200 && body.success === true) {
				displayPopup('SMS code sent to \'' + phone_number + '\'', 'success');
				valid = true;
			} else {
				displayPopup(body.error || JSON.stringify(body), 'error');
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
		});
		return valid;
	}

	verifyEmail = async (emailBlock, verifyCodeBlock) => {
		var email = emailBlock.input.getValue();
		var verificationCode = verifyCodeBlock.input.getValue();

		let valid = false;

		await easyFetch('/api/user_management/auth/verify_code', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ 'email': email, 'one_time_code': verificationCode, 'context': "update" })
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

	verifySms = async (phoneBlock, verifyCodeBlock) => {
		var phone = phoneBlock.input.getValue();
		var verificationCode = verifyCodeBlock.input.getValue();

		let valid = false;

		await easyFetch('api/user_management/auth/verifySandBox', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({ 'phone_number': phone, 'otp': verificationCode })
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

	isVerified = (block) => {
		if (block.getAttribute('verified') == 'true') {
			return true;
		} else if (block.getAttribute('verified') == 'false') {
			return false;
		} else {
			if (block.input.getValue() != '')
				return false;
			return true;
		}
	}

	emptyBlock = (block) => {
		if (block.getAttribute('verified') == 'true' && block.input.getValue() == '') {
			return false;
		}
		return true;
	}

	emailIsValid = (emailBlock) => {

		if (!emailBlock.input.getValue())
			return true;
		// let value = emailBlock.input.getValue();
		// let valid = value.includes('@');
		// return valid;
		return false;
	}

	phoneIsValid = (phoneBlock) => {
		if (!phoneBlock.input.getValue())
			return true;
		// let value = phoneBlock.input.getValue();
		// let valid = value.includes('+') && value.length > 10;
		// return valid;
		return false;
	}

}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('edit-profile', EditProfile);