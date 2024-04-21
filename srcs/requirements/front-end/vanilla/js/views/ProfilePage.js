import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "../components/AbstractComponent";
import AbstractView from "@views/AbstractView";
import profilePageStyles from '@css/ProfilePage.css?raw';
import BigTitle from '@components/BigTitle';
import Brackets from '@components/Brackets';
import Overlay from '@components/Overlay';
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

		this.data = {
			playername: "",
			avatar: "",
			email: "",
			phone: "",
			two_factor_method: "",
		}

		this.userElemsToBeFilled = {};
		this.friendElemsToBeFilled = {};

		// this.user = JSON.parse(sessionStorage.getItem("userDetails"));
		// // // console.log("USER:", this.user);
		// if (!this.user)
		// 	this.user = fetchUserDetails();

		/* PROFILE PANNEL */
		const profile = new Pannel({dark: false, title: "Profile"});
		profile.style.setProperty("display", "block");
		
		// create the user info section with editable avatar
		const userInfo = this.makeEditableUserInfo();
		
		// create the three pannels with user info and stats
		const personalInfo = this.createPersonalInfoPannel(this.userElemsToBeFilled);
		const gameStats = this.createGameStatsPannel(this.userElemsToBeFilled);
		const matchHistory = this.createMatchHistoryPannel(this.userElemsToBeFilled);

		profile.shadowRoot.appendChild(userInfo);
		profile.shadowRoot.appendChild(personalInfo);
		profile.shadowRoot.appendChild(gameStats);
		profile.shadowRoot.appendChild(matchHistory);


		/* FRIEND PROFILE PANNEL */
		const friendProfile = document.createElement("div");
		friendProfile.style.display = "none";
		friendProfile.style.position = "fixed";
		friendProfile.style.top = "0";
		friendProfile.style.left = "0";
		friendProfile.style.width = "100%";
		friendProfile.style.height = "100%";
		friendProfile.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
		
		const friendProfilePannel = new Pannel({dark: false, title: "Profile"});
		// friendProfilePannel.shadowRoot.querySelector("#button-container").shadowRoot.style.setProperty("display", "none");
		friendProfilePannel.style.position = "fixed";
		friendProfilePannel.style.top = "50%";
		friendProfilePannel.style.left = "50%";
		friendProfilePannel.style.transform = "translate(-50%, -50%)";
		friendProfilePannel.style.setProperty("display", "block");
		friendProfilePannel.style.setProperty("border-radius", "20px 20px 0px 20px");

		friendProfile.appendChild(friendProfilePannel);

		this.friendElemsToBeFilled.friendProfile = friendProfile;
		
		// create the user info section with the avatar
		const friendUserInfo = new UserInfo({});
		this.friendElemsToBeFilled.friendUserInfo = friendUserInfo;
		
		// create the two pannels with history and stats
		const friendGameStats = this.createGameStatsPannel(this.friendElemsToBeFilled);
		const friendMatchHistory = this.createMatchHistoryPannel(this.friendElemsToBeFilled);

		friendProfilePannel.shadowRoot.appendChild(friendUserInfo);
		friendProfilePannel.shadowRoot.appendChild(friendGameStats);
		friendProfilePannel.shadowRoot.appendChild(friendMatchHistory);


		/* FRIENDS SECTION */
		const friendPannel = new Pannel({dark: false, title: "Friends", style: {"border-radius": "20px 20px 0px 20px"}});

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
		addFriend.button.onkeydown = (e) => {
			if (e.key === "Enter") {
				addFriend.button.click();
			}
		};
		// addFriend.button.tabIndex = 0;
		addFriend.button.style.setProperty("font-size", "28px");
		addFriend.input.input.onkeydown = (e) => {
			if (e.key === "Enter") {
				addFriend.button.click();
			}
		};

		// friends list pannel
		const friendsListPannel = new Pannel({dark: true, title: `Friends List  ()} )`, style: {"border-radius": "20px 20px 0px 20px"}});
		this.userElemsToBeFilled.pannelTitle = friendsListPannel.shadowRoot.querySelector("#pannel-title"); // add to elemsToBeFilled to fill in fetch function

		// create the friends list
		const friendsList = new FriendsList({ profileClick: this.showFriendProfile });

		friendsListPannel.shadowRoot.appendChild(friendsList);
		friendPannel.shadowRoot.appendChild(addFriend);
		friendPannel.shadowRoot.appendChild(friendsListPannel);

		/* OTHER CONSTRUCTION */
		// create go back button
		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		// append all elements to the shadowRoot
		this.shadowRoot.appendChild(goBack); // go back button
		this.shadowRoot.appendChild(profile); // profile section with stats and info
		this.shadowRoot.appendChild(friendPannel); // friends section with add friend input and friends list
		this.shadowRoot.appendChild(friendProfile); // friend profile popup with stats and info about a friend

		// fill in the values that need to be fetched
		this.fillUserValues(this.userElemsToBeFilled);

		//initialize the overlay
		this.overlay = document.createElement('custom-overlay');
		this.shadowRoot.appendChild(this.overlay);
	}

	showFriendProfile = async (friendData) => {
		// this.friendElemsToBeFilled.friendProfile.style.setProperty("display", "block");
		fadeIn(this.friendElemsToBeFilled.friendProfile);
		this.friendElemsToBeFilled.friendUserInfo.fetchAndFillElems(friendData);
		let gameStats = await this.fetchGameStats(friendData.username);
		this.fillGameStats(this.friendElemsToBeFilled, friendData.username, gameStats);
		this.friendElemsToBeFilled.friendProfile.onclick = (e) => {
			if (e.target === this.friendElemsToBeFilled.friendProfile) {
				// this.friendElemsToBeFilled.friendProfile.style.setProperty("display", "none");
				fadeOut(this.friendElemsToBeFilled.friendProfile);
			}
		}
	}

	fillUserValues = async (elemsToBeFilled) => {
		// let user = JSON.parse(sessionStorage.getItem("userDetails"));
		let user = this.user;
		if (!user)
			user = await fetchUserDetails();
		let gameStats = await this.fetchGameStats(user.username);
		user.wins = gameStats.nbr_of_won_matches;
		user.losses = gameStats.nbr_of_lost_matches;
		await elemsToBeFilled.userInfo.fetchAndFillElems(user);
		elemsToBeFilled.userPlayername.textContent = user.playername || "N/A";
		elemsToBeFilled.userEmail.textContent = user.email || "N/A";
		// elemsToBeFilled.userPhone.textContent = user.phone || "N/A";
		// console.log("user", user);
		elemsToBeFilled.pannelTitle.textContent = `Friends List  ( ${user.friends_count} )`;
		this.fillGameStats(this.userElemsToBeFilled, user.username, gameStats);
	}

	fillGameStats = async (elemsToBeFilled, username, gameStats) => {

		elemsToBeFilled.matchTotal.textContent = gameStats.total_played;
		elemsToBeFilled.tournamentsWon.textContent = gameStats.nbr_of_won_tournaments;
		elemsToBeFilled.matchWins.textContent = gameStats.nbr_of_won_matches;
		elemsToBeFilled.matchLosses.textContent = gameStats.nbr_of_lost_matches;
		elemsToBeFilled.matchWinrate.textContent = !gameStats.total_played ? "N/A" : (gameStats.nbr_of_won_matches / gameStats.total_played * 100).toFixed(1).toString() + "%";
		let matchHistory = gameStats.played_tournaments;
		// console.log("Match History:", matchHistory);
		elemsToBeFilled.matchRows.innerHTML = "";
		matchHistory.forEach(match => {
			// // console.log("Match:", match);
			let matchRow = document.createElement("div");
			matchRow.classList.add("match-row");
			matchRow.innerHTML = `
			<span class="match-id">${match.id}</span>
			<span class="tournament-name">${match.tournament_name}</span>
			<span class="date">${match.date}</span>
			<span class="winner">${match.winner}</span>
			`;
			matchRow.onmouseover = () => matchRow.style.setProperty("background-color", "rgba(0, 0, 0, 0.3)");
			matchRow.onmouseout = () => matchRow.style.setProperty("background-color", "rgba(0, 0, 0, 0)");
			//matchRow.onclick = () => navigateTo("/brackets?tournament=" + match.id);
			matchRow.addEventListener('click', () => {
				this.overlay.show();
	
				const overlayContent = this.overlay.shadowRoot.querySelector('.overlay-content');
				overlayContent.innerHTML = ``;
	
				const bracketsComponent = new Brackets(match.id);
				overlayContent.appendChild(bracketsComponent);
			});
			elemsToBeFilled.matchRows.appendChild(matchRow);
		});
	}

	fetchGameStats = async (username) => {
		let gameStats = [];
		await easyFetch(`/api/tournament/stats/${username}/`)
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error("Response is null");
			} else if (response.ok) {
				gameStats = body;
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(error.message || error, "error");
		});
		return gameStats;
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
		.then(async res => {
			let response = res.response;
			let body = res.body;
			// console.log("Response:", response);
			if (!response) {
				throw new Error("Response is null");
			} else if (response.status === 404) {
				throw new Error("Username not found");
			} else if (response.status === 200) {
				displayPopup("Friend added", "success");
				await fetchUserDetails(); // Update new user details
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
		// elemsToBeFilled.userPhone = infos.querySelector("#user-phone");
		personalInfo.shadowRoot.appendChild(infos);
		return personalInfo;
	}

	createGameStatsPannel = (elemsToBeFilled) => {
		const gameStats = new Pannel({dark: true, title: "Game Stats", style: {display: "block", padding: "0px 0px 0px 20px"}});
		gameStats.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		let stats = document.createElement("div");
		stats.innerHTML = profileStatsHtml;
		elemsToBeFilled.tournamentsWon = stats.querySelector("#tournaments-won");
		elemsToBeFilled.matchTotal = stats.querySelector("#match-total");
		elemsToBeFilled.matchWins = stats.querySelector("#match-wins");
		elemsToBeFilled.matchLosses = stats.querySelector("#match-losses");
		elemsToBeFilled.matchWinrate = stats.querySelector("#match-winrate");
		gameStats.shadowRoot.appendChild(stats);
		return gameStats;
	}

	createMatchHistoryPannel = (elemsToBeFilled) => {
		const matchHistory = new Pannel({dark: true, title: "Tournament History", style: {display: "block", "border-radius": "20px 20px 0px 20px"}});
		matchHistory.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "10px 0px");
		let history = document.createElement("div");
		history.innerHTML = profileHistoryHtml;
		elemsToBeFilled.matchRows = history.querySelector("#match-rows");
		matchHistory.shadowRoot.appendChild(history);
		return matchHistory;
	}

	makeEditableUserInfo = () => {
		const userInfo = new UserInfo({});
		this.userElemsToBeFilled.userInfo = userInfo;
		
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
					this.data.avatar = file;
					updateUser(this.data);
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