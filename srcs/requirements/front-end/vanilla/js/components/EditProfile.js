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
			if (verifyCodePannel.name = "phone" && !await this.verifySms(phoneBlock, verifyCodeInput)) {
				return ;
			} else if (verifyCodePannel.name = "email" && !await this.verifyEmail(emailBlock, verifyCodeInput)) {
				return ;
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
				invalidEmailIndicator: ["Please click 'Verify' to update your email", () => this.emailIsValid(emailBlock)],
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
			emailBlock.button.style.setProperty("border", "");
			verifyCodePannel.name = "email";
			fadeIn(verifyCodeBlock);
		};

		let phoneBlock = new InputAugmented({
			title: "New Phone Number",
			content: "+33 6 12 34 56 78",
			indicators: {
				invalidPhoneIndicator: ["Please click 'Verify' to update your phone number", () => this.phoneIsValid(phoneBlock)],
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
			phoneBlock.button.style.setProperty("border", "");
			verifyCodePannel.name = "phone";
			fadeIn(verifyCodeBlock);
		};

		let avatarBlock = new InputAugmented({
			title: "Upload Avatar",
			content: "Avatar",
			type: "file"
		});
		let avatarFile = "";
		avatarBlock.input.onchange = (e) => {
			if (e.target.files.length > 0) {
				avatarFile = e.target.files[0];
				console.log(file);
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
				email: "",
				phone: "",
				two_factor_method: "",
			});
		}

		const form = document.createElement('div');
		form.style.setProperty("display", "block");

		form.appendChild(playernameBlock);
		form.appendChild(emailBlock);
		form.appendChild(phoneBlock);
		form.appendChild(avatarBlock);
		form.appendChild(resetPasswordButton);
		form.appendChild(saveButton);

		profile.shadowRoot.appendChild(form);
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
		this.shadowRoot.appendChild(verifyCodeBlock);
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

	// sendEmail = async (emailBlock) => {
	// 	let valid = false;
	// 	console.log("SENDING")
	// 	const phone_number = phoneBlock.input.getValue().replace(/\s/g, '');

	// 	await easyFetch('/api/user_management/auth/updateSandbox', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/x-www-form-urlencoded',
	// 		},
	// 		body: new URLSearchParams({ phone_number })
	// 	})
	// 	.then(res => {
	// 		let response = res.response;
	// 		let body = res.body;

	// 		if (!response || !body) {
	// 			throw new Error('Empty Response');
	// 		} else if (response.status === 400) {
	// 			displayPopup(body.error || 'Invalid number', 'error');
	// 		} else if (!response.ok) {
	// 			displayPopup('Request Failed:', body.error || JSON.stringify(body), 'error');
	// 		} else if (response.status === 200 && body.success === true) {
	// 			displayPopup('SMS code sent to \'' + phone_number + '\'', 'success');
	// 			valid = true;
	// 		} else {
	// 			displayPopup(body.error || JSON.stringify(body), 'error');
	// 		}
	// 	})
	// 	.catch(error => {
	// 		displayPopup(`Request Failed: ${error}`, 'error');
	// 	});
	// 	return valid;
	// }

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

	// verifySms = async (phoneBlock, verifyCodeBlock) => {
	// 	var phone = phoneBlock.input.getValue();
	// 	var verificationCode = verifyCodeBlock.input.getValue();

	// 	let valid = false;

	// 	await easyFetch('api/user_management/auth/verifySandBox', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/x-www-form-urlencoded',
	// 		},
	// 		body: new URLSearchParams({ 'phone_number': phone, 'otp': verificationCode })
	// 	})
	// 	.then(res => {
	// 		let response = res.response;
	// 		let body = res.body;

	// 		if (!response || !body) {
	// 			throw new Error('Empty Response');
	// 		} else if (response.status === 400) {
	// 			displayPopup(body.error || JSON.stringify(body), 'error');
	// 			valid = false;
	// 		} else if (!response.ok) {
	// 			displayPopup('Response Error: ' + (body.error || JSON.stringify(body)), 'error');
	// 			valid = false;
	// 		} else if (response.status === 200 && body.success === true) {
	// 			// displayPopup(body.message || JSON.stringify(body), 'success');
	// 			valid = true;
	// 		} else {
	// 			displayPopup(body.error || JSON.stringify(body), 'error');
	// 		}
	// 	})
	// 	.catch(error => {
	// 		displayPopup(`Request Failed: ${error}`, 'error');
	// 		valid = false;
	// 	});
	// 	return valid
	// }

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