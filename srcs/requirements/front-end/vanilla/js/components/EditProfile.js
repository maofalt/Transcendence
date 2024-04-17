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
import toggleHtml from '@html/toggle.html?raw';
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

		/* DELETION CONFIRMATION PANNEL */
		const areYouSure = document.createElement("div"); // dark background overlay
		areYouSure.style.display = "none";
		areYouSure.style.position = "fixed";
		areYouSure.style.top = "0";
		areYouSure.style.left = "0";
		areYouSure.style.width = "100%";
		areYouSure.style.height = "100%";
		areYouSure.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
		areYouSure.style.zIndex = "9999";

		// pannel with delete account confirmation / cancel
		const areYouSurePannel = new Pannel({dark: true, title: "Are you sure you want to delete your account?\nThis can't be undone!", style: {padding: "20px 20px 20px 20px"}});
		areYouSurePannel.style.position = "fixed";
		areYouSurePannel.style.top = "50%";
		areYouSurePannel.style.left = "50%";
		areYouSurePannel.style.transform = "translate(-50%, -50%)";

		const confirmDeleteButton = new CustomButton({content: "Yes, delete my account", delete: true, style: {margin: "10px"}});
		confirmDeleteButton.onclick = () => { // send delete request when clicking confirm
			this.deleteAccount();
		};
		const cancelDeleteButton = new CustomButton({content: "No, keep my account", action: true, style: {margin: "10px"}});
		cancelDeleteButton.onclick = () => { // fade out when clicking cancel
			fadeOut(areYouSure);
		};
		areYouSure.onclick = (e) => { // fade out when clicking away from pannel
			if (e.target === areYouSure) {
				fadeOut(areYouSure);
			}
		}

		areYouSurePannel.shadowRoot.appendChild(confirmDeleteButton);
		areYouSurePannel.shadowRoot.appendChild(cancelDeleteButton);

		areYouSure.appendChild(areYouSurePannel);

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
			if (!await this.verifyEmail(emailBlock, verifyCodeInput)) {
					emailBlock.setAttribute("verified", false);
			} else {
				emailBlock.input.input.style.setProperty("border", "2px solid green");
				emailBlock.setAttribute("verified", true);
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

		let twoFactorBlock = document.createElement("div");
		twoFactorBlock.innerHTML = toggleHtml;

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
				|| !await avatarBlock.validate()) {
				return ;
			}
			let checked = twoFactorBlock.querySelector(".toggle-input").checked;
			console.log("checked: ", checked);
			updateUser({
				playername: playernameBlock.input.getValue() || "",
				avatar: avatarFile || "",
				email: emailBlock.input.getValue() || "",
				two_factor_method: checked ? "email" : "off",
			});
		}

		// create the delete account button
		const deleteButton = new CustomButton({content: "Delete Account", delete: true, style: {margin: "10px 10px"}});
		deleteButton.onclick = () => {
			fadeIn(areYouSure);
		};

		const form = document.createElement('div');
		form.style.setProperty("display", "block");

		form.appendChild(playernameBlock);
		form.appendChild(emailBlock);
		form.appendChild(twoFactorBlock);
		form.appendChild(avatarBlock);
		form.appendChild(resetPasswordButton);
		form.appendChild(saveButton);
		form.appendChild(deleteButton);

		profile.shadowRoot.appendChild(form);
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
		this.shadowRoot.appendChild(verifyCodeBlock);
		this.shadowRoot.appendChild(areYouSure); // delete account confirmation pannel
	}

	deleteAccount = async () => {
		await easyFetch(`/api/user_management/auth/delete_account`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error("Response is null");
			} else if (response.status === 200) {
				displayPopup("Account Deleted!", "info");
				sessionStorage.clear();
				navigateTo("/");
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(error.message || error, "error");
		});
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

}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('edit-profile', EditProfile);