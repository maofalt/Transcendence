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

		let elemsToBeFilled = {};

		// this.user = JSON.parse(sessionStorage.getItem("userDetails"));
		// // console.log("USER:", this.user);
		// if (!this.user)
		// 	this.user = fetchUserDetails();

		const userInfo = new UserInfo({});
		userInfo.imgBox.onmouseover = (e) => {
			userInfo.editOverlay.style.display = "block";
			transition(userInfo.editOverlay, [["opacity", 0, 0.8]], 100);
			userInfo.imgBox.onmouseleave = (e) => {
				transition(userInfo.editOverlay, [["opacity", 0.8, 0]], 100).then(() => userInfo.editOverlay.style.setProperty("display", "none"));
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
		profile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		profile.style.setProperty("display", "block");
				
		const personalInfo = new Pannel({dark: true, title: "Personal Info", style: {display: "block",  padding: "0px 0px 0px 20px"}});
		personalInfo.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		
		const gameStats = new Pannel({dark: true, title: "Game Stats", style: {display: "block", padding: "0px 0px 0px 20px"}});
		gameStats.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");

		const matchHistory = new Pannel({dark: true, title: "Match History", style: {display: "block", padding: "20px 20px 20px 20px"}});
		matchHistory.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");

		const areYouSure = new Pannel({dark: true, title: "Are you sure you want to delete your account?\nThis can't be undone!", style: {display: "none", padding: "20px 20px 20px 20px"}});
		areYouSure.style.position = "fixed";
		areYouSure.style.top = "50%";
		areYouSure.style.left = "50%";
		areYouSure.style.transform = "translate(-50%, -50%)";
		areYouSure.style.zIndex = "9999";

		const confirmDeleteButton = new CustomButton({content: "Yes, delete my account", delete: true, style: {margin: "10px"}});
		confirmDeleteButton.onclick = () => {
			this.deleteAccount();
		};
		const cancelDeleteButton = new CustomButton({content: "No, keep my account", action: true, style: {margin: "10px"}});
		cancelDeleteButton.onclick = () => {
			areYouSure.style.display = "none";
		};

		areYouSure.shadowRoot.appendChild(confirmDeleteButton);
		areYouSure.shadowRoot.appendChild(cancelDeleteButton);

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
				<p id="user-playername">loading...</p>
				<p id="user-email">loading...</p>
			</div>
		</div>
		`;
		elemsToBeFilled.userPlayername = infos.querySelector("#user-playername");
		elemsToBeFilled.userEmail = infos.querySelector("#user-email");

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
				<p id="match-total">loading...</p>
				<p id="match-wins">loading...</p>
				<p id="match-losses">loading...</p>
				<p id="match-winrate">loading...</p>
			</div>
		</div>
		`;
		elemsToBeFilled.matchTotal = stats.querySelector("#match-total");
		elemsToBeFilled.matchWins = stats.querySelector("#match-wins");
		elemsToBeFilled.matchLosses = stats.querySelector("#match-losses");
		elemsToBeFilled.matchWinrate = stats.querySelector("#match-winrate");

		let history = document.createElement("div");
		history.innerHTML = `
		<style>
			* {
				margin: 0;
				padding: 0;
			}
			.history-container {
				font-family: "Space Grotesk", sans-serif;
			}
			.titles-container {
				display: inline-block;
			}
			.values-container {
				display: inline-block;
				margin: 0px 0px 0px 15px;
				height: 35px;
				width: 100%;
				padding-top: 10px;
				overflow-y: scroll;
				border-top: 2px solid rgba(255, 255, 255, 0.1);
				scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1);
				scrollbar-width: thin;
			}
			.titles-container h3 {
				margin: 0px 0px 14px 0px;
			}
			.values-container p {
				margin: 0px 0px 18px 0px;
			}
			.history-container {
				width: 100%; /* Adjust based on your layout */
				padding: 10px;
				box-sizing: border-box;
			}
			
			.match-row {
				display: flex;
				justify-content: space-between;
				margin-bottom: 10px; /* Spacing between rows */
				overflow: auto; /* Adds a scrollbar if the row's content is too wide */
			}
			
			.match-id, .tournament-name, .date, .winner {
				min-width: 0; /* Allows the item to shrink below its content size, if necessary */
				text-align: center;
				white-space: nowrap; /* Ensures the content of each item stays on one line */
				overflow: hidden; /* Hide overflow content */
				text-overflow: ellipsis; /* Add ellipsis if the content is too long */
			}
			
			/* Adjusting padding to ensure spacing around text */
			.match-id, .tournament-name, .date, .winner {
				# padding: 0 10px; /* Increase padding for better spacing */
			}
			
			/* Align the first and last items with the container's edges */
			.match-id {
				flex: 1;
				text-align: left;
			}

			.tournament-name {
				flex: 3;
				text-align: center;
			}
			
			.date {
				flex: 2;
				text-align: center;
			}
			
			.winner {
				flex: 2;
				text-align: right;
			}
			#table-head {
				text-decoration: underline;
			}
		</style>
		<div class="history-container">
			<div id="table-head" class="match-row">
				<span class="match-id">Id</span>
				<span class="tournament-name">Tournament</span>
				<span class="date">Date</span>
				<span class="winner">Winner</span>
			</div>
			<div id="match-rows">
				<div class="match-row">
					<span class="match-id">001</span>
					<span class="tournament-name">Great Big Tournament</span>
					<span class="date">01-03-2021</span>
					<span class="winner">yridgway</span>
				</div>
			</div>
			<!-- Add more match-rows here -->
		</div>
		`;
		elemsToBeFilled.matchRows = history.querySelector("#match-rows");

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

		const friendPannel = new Pannel({dark: false, title: "Friends"});

		const friendsListPannel = new Pannel({dark: true, title: `Friends List  ( this.user.friends_count} )`});

		const friendsList = new FriendsList();
		friendsListPannel.shadowRoot.appendChild(friendsList);

		friendPannel.shadowRoot.appendChild(addFriend);
		friendPannel.shadowRoot.appendChild(friendsListPannel);
		// friendPannel.shadowRoot.appendChild(friendsContainer);

		personalInfo.shadowRoot.appendChild(infos);
		gameStats.shadowRoot.appendChild(stats);
		matchHistory.shadowRoot.appendChild(history);

		const deleteButton = new CustomButton({content: "Delete Account", delete: true, style: {margin: "10px 10px"}});
		deleteButton.onclick = () => {
			areYouSure.style.display = "block";
		};
		
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		profile.shadowRoot.appendChild(userInfo);
		profile.shadowRoot.appendChild(personalInfo);
		profile.shadowRoot.appendChild(gameStats);
		profile.shadowRoot.appendChild(matchHistory);
		
		profile.shadowRoot.appendChild(deleteButton);
		
		this.shadowRoot.appendChild(areYouSure);
		
		this.shadowRoot.appendChild(goBack);
		this.shadowRoot.appendChild(profile);
		this.shadowRoot.appendChild(friendPannel);

		this.fillValues(elemsToBeFilled);
		this.fillMatchHistory(elemsToBeFilled.matchRows);
	}

	fillValues = async (elemsToBeFilled) => {
		let user = JSON.parse(sessionStorage.getItem("userDetails"));
		if (!user)
			user = await fetchUserDetails();
		elemsToBeFilled.userPlayername.textContent = user.playername;
		elemsToBeFilled.userEmail.textContent = user.email;
		elemsToBeFilled.matchTotal.textContent = user.total;
		elemsToBeFilled.matchWins.textContent = user.wins;
		elemsToBeFilled.matchLosses.textContent = user.losses;
		elemsToBeFilled.matchWinrate.textContent = user.winrate;
	}

	fillMatchHistory = async (matchRows) => {
		// let matchHistory = await fetchMatchHistory();
		let matchHistory = [
			{
				id: "001",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "002",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "003",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "004",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "005",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "006",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "007",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "008",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "009",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			},
			{
				id: "010",
				tournament: "Great Big Tournament",
				date: "01-03-2021",
				winner: "yridgway"
			}
		];
		matchRows.innerHTML = "";
		matchHistory.forEach(match => {
			console.log("Match:", match);
			let matchRow = document.createElement("div");
			matchRow.classList.add("match-row");
			matchRow.innerHTML = `
			<span class="match-id">${match.id}</span>
			<span class="tournament-name">${match.tournament}</span>
			<span class="date">${match.date}</span>
			<span class="winner">${match.winner}</span>
			`;
			matchRows.appendChild(matchRow);
		});
	}

	fetchMatchHistory = async (userId) => {
		let matchHistory = [];
		await easyFetch(`/api/user_management/auth/stats/${userId}`)
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error("Response is null");
			} else if (response.status === 200) {
				matchHistory = body;
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(error.message || error, "error");
		});
		return matchHistory;
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