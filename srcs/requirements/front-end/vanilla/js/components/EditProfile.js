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
		const resetPasswordButton = new CustomButton({content: "Reset Password", action: false, style: {width: "520px", margin: "20px 0px"}});
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

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
				invalidEmailIndicator: ["Invalid Email", () => this.emailIsValid(emailBlock)],
			},
			type: "email",
			// button: {content: "Send Code", action: false}
		});

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
				|| !await passwordBlock.validate() 
				|| !await confirmPasswordBlock.validate()) {
				return ;
			}
			updateUser({
				username: "",
				playername: playernameBlock.input.getValue() || "",
				avatar: avatarFile || "",
				email: emailBlock.input.getValue() || "",
				phone: "",
				two_factor_method: "",
			});
			// password: passwordBlock.input.getValue() || "",
			// confirmPassword: confirmPasswordBlock.input.getValue() || "",
		}

		const form = document.createElement('div');
		form.style.setProperty("display", "block");

		form.appendChild(playernameBlock);
		form.appendChild(emailBlock);
		form.appendChild(avatarBlock);
		form.appendChild(resetPasswordButton);
		form.appendChild(saveButton);

		profile.shadowRoot.appendChild(form);
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
	}

	emailIsValid = (emailBlock) => {
		if (!emailBlock.input.getValue())
			return true;
		let value = emailBlock.input.getValue();
		let valid = value.includes('@');
		return valid;
	}

}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('edit-profile', EditProfile);