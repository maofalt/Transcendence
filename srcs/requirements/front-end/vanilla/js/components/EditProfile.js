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

		const saveButton = new CustomButton({content: "Save", action: true, style: {width: "520px"}});
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => navigateTo("/profile"); // do adapt if needed

		let playernameBlock = new InputAugmented({
			title: "New Playername",
			content: "Playername",
			indicators: {
				emptyIndicator: ["Please enter your name", () => playernameBlock.input.getValue() != ""],
			},
			description: "Your Playername will be displayed in games and tournaments.",
			type: "text"
		});

		let emailBlock = new InputAugmented({
			title: "New Email",
			content: "example@example.com",
			indicators: {
				emptyIndicator: ["Please enter your email", () => emailBlock.input.getValue() != ""],
				invalidEmailIndicator: ["Invalid Email", () => this.emailIsValid(emailBlock)],
			},
			type: "email",
			// button: {content: "Send Code", action: false}
		});

		let avatarBlock = new InputAugmented({
			title: "Upload Avatar",
			content: "Avatar",
			indicators: {
				emptyIndicator: ["Please upload a file", () => avatarBlock.input.getValue() != ""],
				// differentIndicator: ["Different from your Playername and your Email" () => this.],
			},
			type: "file"
		})

		let passwordBlock = new InputAugmented({
			title: "New Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please enter a password", () => passwordBlock.input.getValue() != ""],
				lengthIndicator: ["Minimum 8 characters", () => passwordBlock.input.getValue().length >= 8],
				digitIndicator: ["At least 1 digit", () => /\d/.test(passwordBlock.input.getValue())],
				letterIndicator: ["At least 1 letter", () => /[a-zA-Z]/.test(passwordBlock.input.getValue())],
				// differentIndicator: ["Different from your Playername and your Email" () => this.],
			},
			type: "password"
		});

		let confirmPasswordBlock = new InputAugmented({
			title: "Confirm Password",
			content: "Password",
			indicators: {
				emptyIndicator: ["Please confirm your password", () => confirmPasswordBlock.input.getValue() != ""],
				matchIndicator: ["Passwords don't match", () => passwordBlock.input.getValue() == confirmPasswordBlock.input.getValue()],
			},
			type: "password"
		});

		const form = document.createElement('div');
		form.style.setProperty("display", "block");

		form.appendChild(playernameBlock);
		form.appendChild(emailBlock);
		form.appendChild(avatarBlock);
		form.appendChild(passwordBlock);
		form.appendChild(confirmPasswordBlock);
		form.appendChild(saveButton);

		profile.shadowRoot.appendChild(form);
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
	}
}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('edit-profile', EditProfile);