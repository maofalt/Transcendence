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

export default class ProfilePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = profilePageStyles;
		this.shadowRoot.appendChild(styleEl);

		// let user = options.user;
		// let user = options;

		this.user = this.getUserDetails();

		const userInfo = new UserInfo({
			profilePicPath: this.user.avatar,
			username: this.user.username,
			status: this.user.status,
			wins: this.user.wins,
			losses: this.user.losses,
			button1: {content: "Edit", action: true},
			button2: {content: "Log out", onclick: () => logOut()}});

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

		// this.user.friends = 4;
		const friendsList = new Pannel({dark: true, title: `Friends List  ( ${this.user.friends} )`});
		// const listContainer = document.createElement("div");
		// listContainer.id = "list-container";
		// listContainer.style.setProperty("height", "350px");
		// listContainer.style.setProperty("padding-top", "10px");
		// listContainer.style.setProperty("overflow-y", "scroll");
		// listContainer.style.setProperty("border-top", "2px solid rgba(255, 255, 255, 0.1)");
		// listContainer.style.setProperty("border-radius", "0px 0px 20px 20px");
		// listContainer.style.setProperty("scrollbar-color", "rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1)");
		// listContainer.style.setProperty("scrollbar-width", "thin");

		// let friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "online"});

		// friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-size", "22px");
		// friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-family", "Space Grotesk, sans-serif");
		// friendsList.shadowRoot.querySelector("#pannel-title").style.setProperty("font-weight", "bold");

		// listContainer.appendChild(friend);
		// friendsList.shadowRoot.appendChild(listContainer);

		// // TESTING
		// friend = new FriendBlock({avatar: "", userName: "Jean", status: "in game"});
		// listContainer.appendChild(friend);
		// friend = new FriendBlock({avatar: "", userName: "Miguel", status: "offline"});
		// listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);
		// // friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// // listContainer.appendChild(friend);

		const friendsContainer = new FriendsList();
		friendsList.shadowRoot.appendChild(friendsContainer);

		friendsPannel.shadowRoot.appendChild(addFriend);
		friendsPannel.shadowRoot.appendChild(friendsList);

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

		await easyFetch(`/api/user_management/auth/add_friend/${username}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'X-CSRFToken': getCookie('csrftoken')
			},
			// body: new URLSearchParams({ 'search': email })
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				alert('Request Failed');
				valid = false;
			} else if (response.status === 400) {
				alert(body.error || JSON.stringify(body));
				valid = false;
			} else if (!response.ok) {
				alert('Response Error: ' + (body.error || JSON.stringify(body)));
				valid = false;
			} else if (response.status === 200) {
				// alert(body.message || JSON.stringify(body));
				displayPopup("Friend added", "success");
				valid = true;
			} else {
				alert(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			console.error('Request Failed:', error);
			valid = false;
		});
		return valid;
	}


	getUserDetails = () => {
		let tokenType = sessionStorage.getItem("tokenType");
		let accessToken = sessionStorage.getItem("accessToken");
		let username = sessionStorage.getItem("username");
		let playername = sessionStorage.getItem("playername");
		let avatar = sessionStorage.getItem("avatar");
		let friends = sessionStorage.getItem("friends");
		let email = sessionStorage.getItem("email");

		// {"username": "yridgway", "playername": "Yoel", "avatar": "/media/default_avatar.jpeg", "friends_count": 0, "two_factor_method": null}

		let user = {
			avatar,
			username,
			status: "online",
			wins: 10,
			losses: 5,
			playername,
			email,
			total: 15,
			winrate: "66%",
			friends
		};

		console.log("Returning user:", this.user);
		return user;
	}
}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('profile-page', ProfilePage);