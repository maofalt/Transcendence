import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import AbstractView from "@views/AbstractView";
import homePageStyle from '@css/ProfilePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import InputAugmented from '@components/InputAugmented';
import { navigateTo } from "@utils/Router";
import UserInfo from "./UserInfo";
import FriendBlock from "./FriendBlock";

export default class ProfilePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = homePageStyle;
		this.shadowRoot.appendChild(styleEl);

		// let user = options.user;
		let user = options;
		const userInfo = new UserInfo({
			profilePicPath: user.avatar,
			username: user.username,
			status: user.status,
			wins: user.wins,
			losses: user.losses});

		const profile = new Pannel({dark: false, title: "Profile"});
		const friendsPannel = new Pannel({dark: false, title: "Friends"});
		const personalInfo = new Pannel({dark: true, title: "Personal Info", style: {display: "block",  padding: "0px 0px 0px 20px"}});
		const gameStats = new Pannel({dark: true, title: "Game Stats", style: {display: "block", padding: "0px 0px 0px 20px"}});

		profile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		profile.style.setProperty("display", "block");

		let infos = document.createElement("div");
		infos.innerHTML = `
		<style>
			.infos-container {
			}
			.titles-container {
				display: inline-block;
			}
			.values-container {
				display: inline-block;
				margin: 0px 0px 0px 15px;
			}
			.values-container p {
				margin: 22px 0px 0px 0px;
			}
		</style>
		<div class="infos-container">
			<div class="titles-container">
				<h3>Playername :</h3>
				<h3>E-Mail :</h3>
				<h3>Friends :</h3>
			</div>
			<div class="values-container">
				<p>${user.playername}</p>
				<p>${user.email}</p>
				<p>${user.friends}</p>
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
			.infos-container {
			}
			.titles-container {
				display: inline-block;
			}
			.values-container {
				display: inline-block;
				margin: 0px 0px 0px 15px;
			}
			.values-container p {
				margin: 22px 0px 0px 0px;
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
				<p>${user.total}</p>
				<p>${user.wins}</p>
				<p>${user.losses}</p>
				<p>${user.winrate}</p>
			</div>
		</div>
		`;

		const addFriend = new InputAugmented({
			title: "Add Friend",
			content: "Username",
			type: "text",
			button: {content: "+ Add Friend", action: false}
		});
		addFriend.shadowRoot.querySelector("#input-button").style.setProperty("font-size", "28px");

		const friendsList = new Pannel({dark: true, title: "Friends List"});
		let friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		friendsList.shadowRoot.appendChild(friend);

		// TESTING
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);
		// friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "offline"});
		// friendsList.shadowRoot.appendChild(friend);


		friendsPannel.shadowRoot.appendChild(addFriend);
		friendsPannel.shadowRoot.appendChild(friendsList);

		personalInfo.shadowRoot.appendChild(infos);
		gameStats.shadowRoot.appendChild(stats);

		profile.shadowRoot.appendChild(userInfo);
		profile.shadowRoot.appendChild(personalInfo);
		profile.shadowRoot.appendChild(gameStats);

		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendsPannel);
	}
}

customElements.define('profile-page', ProfilePage);