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
import profileInfoHtml from "@html/profileInfo.html?raw";
import profileStatsHtml from "@html/profileStats.html?raw";
import profileHistoryHtml from "@html/profileHistory.html?raw";

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

		/* PROFILE PANNEL */
		const profile = new Pannel({dark: false, title: "Profile"});
		profile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		profile.style.setProperty("display", "block");
		
		// create the user info section with editable avatar
		const userInfo = this.makeEditableUserInfo();
		
		// create the three pannels with user info and stats
		const personalInfo = this.createPersonalInfoPannel(elemsToBeFilled);
		const gameStats = this.createGameStatsPannel(elemsToBeFilled);
		const matchHistory = this.createMatchHistoryPannel(elemsToBeFilled);

		// create the delete account button
		const deleteButton = new CustomButton({content: "Delete Account", delete: true, style: {margin: "10px 10px"}});
		deleteButton.onclick = () => {
			areYouSure.style.display = "block";
		};

		profile.shadowRoot.appendChild(userInfo);
		profile.shadowRoot.appendChild(personalInfo);
		profile.shadowRoot.appendChild(gameStats);
		profile.shadowRoot.appendChild(matchHistory);
		profile.shadowRoot.appendChild(deleteButton);


		/* FRIEND PROFILE PANNEL */
		this.friendElemsToBeFilled = {};
		const friendProfile = new Pannel({dark: false, title: "Profile"});
		friendProfile.shadowRoot.querySelector("#pannel-title").style.setProperty("padding", "0px 0px 0px 30px");
		friendProfile.style.setProperty("display", "none");
		this.friendElemsToBeFilled.friendProfile = friendProfile;
		
		// create the user info section with the avatar
		const friendUserInfo = new UserInfo({});
		this.friendElemsToBeFilled.friendUserInfo = friendUserInfo;
		
		// create the two pannels with history and stats
		const friendGameStats = this.createGameStatsPannel(this.friendElemsToBeFilled);
		const friendMatchHistory = this.createMatchHistoryPannel(this.friendElemsToBeFilled);

		friendProfile.shadowRoot.appendChild(friendUserInfo);
		friendProfile.shadowRoot.appendChild(friendGameStats);
		friendProfile.shadowRoot.appendChild(friendMatchHistory);


		/* FRIENDS SECTION */
		const friendPannel = new Pannel({dark: false, title: "Friends"});

		// friend input form
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

		// friends list pannel
		const friendsListPannel = new Pannel({dark: true, title: `Friends List  ( ... )} )`});
		elemsToBeFilled.pannelTitle = friendsListPannel.shadowRoot.querySelector("#pannel-title"); // add to elemsToBeFilled to fill in fetch function

		// create the friends list
		const friendsList = new FriendsList({ profileClick: this.showFriendProfile });
		// console.log("\nWHAA\n", friendsList);
		// console.log("\nWHAA\n", friendsList.friends);

		// friendsList.friends.forEach(boop => {
		// 	console.log("boop", boop)
		// });
		// friendsList.friends.forEach(([block, data]) => {
		// 	console.log("bwh", data);
		// 	block.style.cursor = "pointer";
		// 	block.onclick = () => this.showFriendProfile(data);
		// });

		friendsListPannel.shadowRoot.appendChild(friendsList);
		friendPannel.shadowRoot.appendChild(addFriend);
		friendPannel.shadowRoot.appendChild(friendsListPannel);


		/* DELETION CONFIRMATION PANNEL */
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
	

		/* OTHER CONSTRUCTION */
		// create go back button
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		// append all elements to the shadowRoot
		this.shadowRoot.appendChild(areYouSure); // delete account confirmation pannel
		this.shadowRoot.appendChild(goBack); // go back button
		this.shadowRoot.appendChild(profile); // profile section with stats and info
		this.shadowRoot.appendChild(friendPannel); // friends section with add friend input and friends list
		this.shadowRoot.appendChild(friendProfile); // friend profile popup with stats and info about a friend

		// fill in the values that need to be fetched
		this.fillUserValues(elemsToBeFilled);
		this.fillMatchHistory(elemsToBeFilled.matchRows);
	}

	showFriendProfile = async (friendData) => {
		this.friendElemsToBeFilled.friendProfile.style.setProperty("display", "block");
		this.friendElemsToBeFilled.friendUserInfo.fetchAndFillElems(friendData);
	}

	fillUserValues = async (elemsToBeFilled) => {
		let user = JSON.parse(sessionStorage.getItem("userDetails"));
		if (!user)
			user = await fetchUserDetails();
		elemsToBeFilled.userPlayername.textContent = user.playername;
		elemsToBeFilled.userEmail.textContent = user.email;
		elemsToBeFilled.matchTotal.textContent = user.total;
		elemsToBeFilled.matchWins.textContent = user.wins;
		elemsToBeFilled.matchLosses.textContent = user.losses;
		elemsToBeFilled.matchWinrate.textContent = user.winrate;
		elemsToBeFilled.pannelTitle.textContent = `Friends List  ( ${user.friends_count} )`;
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

	createPersonalInfoPannel = (elemsToBeFilled) => {
		const personalInfo = new Pannel({dark: true, title: "Personal Info", style: {display: "block",  padding: "0px 0px 0px 20px"}});
		personalInfo.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		let infos = document.createElement("div");
		infos.innerHTML = profileInfoHtml;
		elemsToBeFilled.userPlayername = infos.querySelector("#user-playername");
		elemsToBeFilled.userEmail = infos.querySelector("#user-email");
		personalInfo.shadowRoot.appendChild(infos);
		return personalInfo;
	}

	createGameStatsPannel = (elemsToBeFilled) => {
		const gameStats = new Pannel({dark: true, title: "Game Stats", style: {display: "block", padding: "0px 0px 0px 20px"}});
		gameStats.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		let stats = document.createElement("div");
		stats.innerHTML = profileStatsHtml;
		elemsToBeFilled.matchTotal = stats.querySelector("#match-total");
		elemsToBeFilled.matchWins = stats.querySelector("#match-wins");
		elemsToBeFilled.matchLosses = stats.querySelector("#match-losses");
		elemsToBeFilled.matchWinrate = stats.querySelector("#match-winrate");
		gameStats.shadowRoot.appendChild(stats);
		return gameStats;
	}

	createMatchHistoryPannel = (elemsToBeFilled) => {
		const matchHistory = new Pannel({dark: true, title: "Match History", style: {display: "block", padding: "20px 20px 20px 20px"}});
		matchHistory.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		let history = document.createElement("div");
		history.innerHTML = profileHistoryHtml;
		elemsToBeFilled.matchRows = history.querySelector("#match-rows");
		matchHistory.shadowRoot.appendChild(history);
		return matchHistory;
	}

	makeEditableUserInfo = () => {
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

		return userInfo;
	}
}

/* To add :
- Pannel "User Preferences" with language, and paddle orientation, + maybe keys ?
not sure about that one
*/

customElements.define('profile-page', ProfilePage);