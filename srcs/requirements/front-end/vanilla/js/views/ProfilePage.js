import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "../components/AbstractComponent";
import AbstractView from "@views/AbstractView";
import profilePageStyles from '@css/ProfilePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import InputAugmented from '@components/InputAugmented';
import { navigateTo } from "@utils/Router";
import UserInfo from "../components/UserInfo";
import FriendBlock from "../components/FriendBlock";
import logOut from "@utils/logOut";
import easyFetch from "@utils/easyFetch";
import getCookie from "@utils/getCookie";
import displayPopup from "@utils/displayPopup";
import FriendsList from "@components/FriendsList";
import { router } from "@utils/Router";
import fetchUserDetails from "@utils/fetchUserDetails";
import { fadeIn, fadeOut, transition } from "@utils/animate";
import updateUser from "@utils/updateUser";

export default class ProfilePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = profilePageStyles;
		this.shadowRoot.appendChild(styleEl);

		// let user = options.user;
		// let user = options;

		let data = {
			username: "",
			playername: "",
			avatar: "",
			email: "",
			phone: "",
			two_factor_method: "",
		}

		this.user = JSON.parse(sessionStorage.getItem("userDetails"));
		// console.log("USER:", this.user);
		if (!this.user)
			this.user = fetchUserDetails();

		const userInfo = new UserInfo({});
		userInfo.imgBox.onmouseover = (e) => {
			userInfo.editOverlay.style.display = "block";
			transition(userInfo.editOverlay, [["opacity", 0, 0.5]], 100);
			userInfo.imgBox.onmouseleave = (e) => {
				transition(userInfo.editOverlay, [["opacity", 0.5, 0]], 100).then(() => userInfo.editOverlay.style.setProperty("display", "none"));
			}
		};

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.style.display = 'none';

		userInfo.shadowRoot.appendChild(fileInput);

		userInfo.editOverlay.onclick = () => {
			fileInput.onchange = () => {
				if (fileInput.files.length > 0) {
					const file = fileInput.files[0];
					data.avatar = file;
					updateUser(data);
				}
			};
			fileInput.click(); // Trigger the click event
		};

		const profile = new Pannel({dark: false, title: "Profile"});
		const friendsPannel = new Pannel({dark: false, title: "Friends"});
		const personalInfo = new Pannel({dark: true, title: "Personal Info", style: {display: "block",  padding: "0px 0px 0px 20px"}});
		const gameStats = new Pannel({dark: true, title: "Game Stats", style: {display: "block", padding: "0px 0px 0px 20px"}});
		gameStats.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		personalInfo.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");

		profile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		profile.style.setProperty("display", "block");

		let infos = document.createElement("div");
		infos.innerHTML = `
		<style>
			* {
				margin: 0;
				padding: 0;
			}
			.infos-container {
				margin-top: 0;
				padding-top: 0;
			}
			.titles-container {
				display: inline-block;
			}
			.values-container {
				display: inline-block;
				margin: 0px 0px 0px 15px;
			}
			.titles-container h3 {
				margin: 0px 0px 14px 0px;
			}
			.values-container p {
				margin: 0px 0px 18px 0px;
			}
		</style>
		<div class="infos-container">
			<div class="titles-container">
				<h3>Playername :</h3>
				<h3>E-Mail :</h3>
			</div>
			<div class="values-container">
				<p>${this.user.playername}</p>
				<p>${this.user.email}</p>
			</div>
		</div>
		`;

		infos.style.setProperty("display", "block");
		infos.style.setProperty("align-items", "left");
		infos.style.setProperty("justify-content", "left");
		infos.style.setProperty("align-text", "left");

		let stats = document.createElement("div");
		stats.innerHTML = `
		<style>
			* {
				margin: 0;
				padding: 0;
			}
			.infos-container {
				font-family: "Space Grotesk", sans-serif;
			}
			.titles-container {
				display: inline-block;
			}
			.values-container {
				display: inline-block;
				margin: 0px 0px 0px 15px;
			}
			.titles-container h3 {
				margin: 0px 0px 14px 0px;
			}
			.values-container p {
				margin: 0px 0px 18px 0px;
			}
		</style>
		<div class="infos-container">
			<div class="titles-container">
				<h3>Total games played :</h3>
				<h3>Wins :</h3>
				<h3>Losses :</h3>
				<h3>Win rate :</h3>
			</div>
			<div class="values-container">
				<p>${this.user.total}</p>
				<p>${this.user.wins}</p>
				<p>${this.user.losses}</p>
				<p>${this.user.winrate}</p>
			</div>
		</div>
		`;

		const addFriend = new InputAugmented({
			title: "Add Friend",
			content: "Username",
			indicators: {
				emptyIndicator: ["Please enter a username", () => addFriend.input.getValue() != ""],
				invalidIndicator: ["Username not found", () => this.postAddFriend(addFriend.input.getValue())]
			},
			type: "text",
			button: {content: "+ Add Friend", action: false}
		});
		addFriend.button.onclick = async () => await addFriend.validate();
		addFriend.shadowRoot.querySelector("#input-button").style.setProperty("font-size", "28px");

		const friendsListPannel = new Pannel({dark: true, title: `Friends List  ( ${this.user.friends_count} )`});

		const friendsList = new FriendsList();
		friendsListPannel.shadowRoot.appendChild(friendsList);

		friendsPannel.shadowRoot.appendChild(addFriend);
		friendsPannel.shadowRoot.appendChild(friendsListPannel);

		personalInfo.shadowRoot.appendChild(infos);
		gameStats.shadowRoot.appendChild(stats);

		const deleteButton = new CustomButton({content: "Delete Account", delete: true, style: {margin: "10px"}});
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => navigateTo("/"); // do adapt if needed

		profile.shadowRoot.appendChild(userInfo);
		profile.shadowRoot.appendChild(personalInfo);
		profile.shadowRoot.appendChild(gameStats);
		profile.shadowRoot.appendChild(deleteButton);

		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
	}

	postAddFriend = async (username) => {
		let valid = false;

		if (!username) {
			// displayPopup("Please enter a username", "error");
			return true;
		}
		await easyFetch(`/api/user_management/auth/add_friend/${username}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		.then(res => {
			let response = res.response;
			let body = res.body;
			console.log("Response:", response);
			if (!response) {
				throw new Error("Response is null");
			} else if (response.status === 404) {
				throw new Error("Username not found");
			} else if (response.status === 200) {
				displayPopup("Friend added", "success");
				router();
				valid = true;
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(error.message || error, "error");
			valid = false;
		});
		return valid;
	}
}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('profile-page', ProfilePage);