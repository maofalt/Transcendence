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
import FriendBlock from "./FriendBlock";

export default class EditProfile extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = profilePageStyles;
		this.shadowRoot.appendChild(styleEl);

		// let user = options.user;
		let user = options;

		const profile = new Pannel({dark: false, title: "Edit Profile", style: {padding: "15px"}});
		const friendsPannel = new Pannel({dark: false, title: "Friends"});

		// profile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		// profile.style.setProperty("display", "block");

		// user.friends = 4;
		const friendsList = new Pannel({dark: true, title: `Friends List  ( ${user.friends} )`});
		const listContainer = document.createElement("div");
		listContainer.id = "list-container";
		listContainer.style.setProperty("height", "350px");
		listContainer.style.setProperty("padding-top", "10px");
		listContainer.style.setProperty("overflow-y", "scroll");
		listContainer.style.setProperty("border-top", "2px solid rgba(255, 255, 255, 0.1)");
		listContainer.style.setProperty("border-radius", "0px 0px 20px 20px");
		listContainer.style.setProperty("scrollbar-color", "rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1)");
		listContainer.style.setProperty("scrollbar-width", "thin");

		let friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", remove: true});

		friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-size", "22px");
		friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-family", "Space Grotesk, sans-serif");
		friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-weight", "bold");

		listContainer.appendChild(friend);
		friendsList.shadowRoot.appendChild(listContainer);

		// TESTING
		friend = new FriendBlock({avatar: "", userName: "Jean", remove: true});
		listContainer.appendChild(friend);
		friend = new FriendBlock({avatar: "", userName: "Miguel", remove: true});
		listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// listContainer.appendChild(friend);

		friendsPannel.shadowRoot.appendChild(friendsList);

		const saveButton = new CustomButton({content: "Save", action: true, style: {width: "520px"}});
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => navigateTo("/"); // do adapt if needed

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