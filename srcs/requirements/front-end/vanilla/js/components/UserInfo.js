import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/UserInfo.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";
import isLoggedIn from "@utils/isLoggedIn";
import fetchUserDetails from "@utils/fetchUserDetails";
import logOut from "@utils/logOut";
import defaultAvatar from "@images/default-avatar.webp";
import editIcon from "@images/square_edit_outline_icon.png";

export default class UserInfo extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.elemsToBeFilled = {};

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		/* MAIN PANNEL */
		const pannel = new Pannel({title: "", dark: false, style: {width: "520px", height: "150px"}});
		pannel.id = "pannel";
		pannel.shadowRoot.removeChild(pannel.shadowRoot.querySelector("#pannel-title"));
		
		// setup avatar image and container
		const avatarContainer = new Pannel({title: "", dark: true, style: {width: "120px", height: "120px"}});
		avatarContainer.id = "avatar-container";
		avatarContainer.shadowRoot.removeChild(avatarContainer.shadowRoot.querySelector("#pannel-title"));
		avatarContainer.style.setProperty("display", "flex");
		avatarContainer.style.setProperty("justify-content", "center");
		
		this.imgBox = document.createElement('div');
		this.styleImageBox(this.imgBox);

		this.editOverlay = this.createProfilePicture(editIcon);
		this.editOverlay.style.display = "none";
		this.editOverlay.style.setProperty("position", "absolute"); 
		this.editOverlay.style.setProperty("width", "60%");
		this.editOverlay.style.setProperty("height", "60%");
		this.editOverlay.style.setProperty("border-radius", "20%");
		this.editOverlay.style.setProperty("backdrop-filter", "blur(5px)");
		this.editOverlay.style.setProperty("border", "10px solid transparent");
		this.editOverlay.style.setProperty("background-clip", "padding-box");
		this.editOverlay.style.setProperty("box-shadow", "0 0 0 10px rgba(0,0,0,0.5)");
		this.editOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
	
		const profilePicture = this.createProfilePicture();
		this.elemsToBeFilled.avatar = profilePicture;
		
		const userText = this.createUserText();

		this.imgBox.appendChild(this.editOverlay);
		this.imgBox.appendChild(profilePicture);
		avatarContainer.shadowRoot.appendChild(this.imgBox);
		pannel.shadowRoot.appendChild(avatarContainer);
		pannel.shadowRoot.appendChild(userText);
		this.createButtons(pannel);

		this.fetchAndFillElems(options.details);

		// pannel.onmouseover = (e) => this.pannelHover(e, pannel, "pannel HOVERED !");
		// pannel.onmouseleave = (e) => this.pannelLeave(e, pannel, "pannel LEFT !");

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}

		// this.style.setProperty("font-family", "Anta");

		this.shadowRoot.appendChild(pannel);
	}

	fetchAndFillElems = async (details) => {
		// if details has been passed in options, use it. Otherwise, fetch current user details
		if (!details) {
			details = JSON.parse(sessionStorage.getItem("userDetails"));
			// console.log("DETAILS:", details);
			if (!details) {
				details = await fetchUserDetails();
			}
		}
		if (!details)
			return ;
		details.wins = details.wins ? details.wins : "-";
		details.losses = details.losses ? details.losses : "-";
		this.elemsToBeFilled.avatar.src = details.avatar;
		this.elemsToBeFilled.username.textContent = details.username;
		this.elemsToBeFilled.statusIndicator.textContent = details.is_online ? "online" : "offline";
		this.elemsToBeFilled.winsLosses.textContent = `${details.wins} W / ${details.losses} L`
		this.elemsToBeFilled.status.style.color = details.is_online ? "green" : "red";
		this.elemsToBeFilled.statusCircle.style.backgroundColor = details.is_online ? "green" : "red";
	}

	createProfilePicture(avatar) {
		const profilePicture = new Image();
		profilePicture.classList.add("profile-picture");
		profilePicture.src = avatar || defaultAvatar;
		profilePicture.style.setProperty("width", "100%");
		profilePicture.style.setProperty("height", "100%");
		profilePicture.style.setProperty("object-fit", "cover");
		profilePicture.style.setProperty("border-radius", "16px");
		profilePicture.style.setProperty("box-shadow", "0 0 20px rgba(0, 0, 0, 0.6)");
		return profilePicture;
	}

	createUserText() {
		let statusColor = "red";
		const userText = document.createElement('div');
		userText.id = "user-text";
		userText.style.setProperty("width", "100%");
		userText.style.setProperty("height", "100%");
		userText.style.setProperty("padding", "5px 15px 5px 15px");
		userText.style.setProperty("flex", "1");
		userText.innerHTML = `
		<style>
			h2 {
				margin: 15px 0px;
				padding: 0px;
			}
			p {
				margin: 10px 0px;
				padding: 0px;
			}
			#status {
				margin: 0;
				padding: 0;
				display: flex;
				flex-direction: row;
				align-items: center;
				color: ${statusColor};
			}
			#status-circle {
				width: 15px;
				height: 15px;
				margin-right: 5px;
				background-color: ${statusColor};
				border-radius: 50%;
			}
			#status-circle p {
				margin: 0;
				padding: 0;
			}
		</style>
		<h2 id="user-username">Guest</h2>
		<div id="status">
			<div id="status-circle"></div>
			<p id="status-indicator">offline</p>
		</div>
		<p id="wins-and-losses">- W / - L</p>
		`;
		userText.querySelector('h2').style.setProperty("color", "rgba(0, 217, 255, 1)");
		// userText.querySelector('#status').style.setProperty("font-style", "italic");

		this.elemsToBeFilled.username = userText.querySelector("#user-username");
		this.elemsToBeFilled.statusIndicator = userText.querySelector("#status-indicator");
		this.elemsToBeFilled.winsLosses = userText.querySelector("#wins-and-losses");
		this.elemsToBeFilled.status = userText.querySelector("#status");
		this.elemsToBeFilled.statusCircle = userText.querySelector('#status-circle');
		
		return userText;
	}

	createButtons(pannel) {
		let button1, button2;
		let style = {display: "block", margin: "15px 0px"};

		if (isLoggedIn()) {
			button1 = new CustomButton({content: "Edit", action: true, style});
			button1.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/edit-profile");
			};
			button2 = new CustomButton({content: "Log out", style});
			button2.onclick = (e) => {
				e.stopPropagation();
				logOut();
			};
		} else {
			button1 = new CustomButton({content: "Log in", action: true, style});
			button1.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/login");
			};
	
			button2 = new CustomButton({content: "Sign up", style});
			button2.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/signup");
			};
		}

		const container = document.createElement("div");
		container.id = "button-container";
		container.appendChild(button1);
		container.appendChild(button2);
		container.style.setProperty("margin", "0px 15px 0px 15px");
		container.style.setProperty("flex", "1");
		pannel.shadowRoot.appendChild(container);
	}

	styleImageBox(imgBox) {
		imgBox.id = "img-box";
		imgBox.style.setProperty("width", "85%");
		imgBox.style.setProperty("height", "85%");
		imgBox.style.setProperty("display", "flex");
		imgBox.style.setProperty("justify-content", "center");
		imgBox.style.setProperty("align-items", "center");
	}

	pannelHover = (e, pannel, arg) => {
		console.log(arg);
		pannel.style.setProperty("background", "rgba(0, 0, 0, 0.5)");
		pannel.style.setProperty("backdrop-filter", "blur(6px)");
		// pannel.style.setProperty("color", "rgba(0, 217, 255, 1)");
	}
	
	pannelLeave = (e, pannel, arg) => {
		console.log(arg);
		pannel.style.setProperty("background", "rgba(255, 255, 255, 0.1)");
		pannel.style.setProperty("backdrop-filter", "blur(16px)");
		// pannel.style.setProperty("color", "white");
	}

	// Implement other methods or properties as needed
}

/* To add :
- Buttons Edit and Log out
- Add an option if user not logged : Buttons in home page are : log in / sign up on this block;
Which will also make it so that they cant access the profile pannel.
*/

customElements.define('user-info', UserInfo);