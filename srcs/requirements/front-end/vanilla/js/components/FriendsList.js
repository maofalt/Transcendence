
import AbstractComponent from "./AbstractComponent";
import FriendBlock from "./FriendBlock";
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";
import { router } from "@utils/Router";
import deleteIcon from "@images/delete-icon.png";
import fetchUserDetails from "@utils/fetchUserDetails";

export default class FriendsList extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.friends = [];

		// const styleEl = document.createElement('style');
		// styleEl.textContent = profilePageStyles;
		// this.shadowRoot.appendChild(styleEl);

		const listContainer = document.createElement("div");
		listContainer.id = "list-container";
		listContainer.style.setProperty("height", "350px");
		listContainer.style.setProperty("padding-top", "10px");
		listContainer.style.setProperty("overflow-y", "scroll");
		listContainer.style.setProperty("border-top", "2px solid rgba(255, 255, 255, 0.1)");
		listContainer.style.setProperty("border-radius", "0px 0px 20px 20px");
		listContainer.style.setProperty("scrollbar-color", "rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1)");
		listContainer.style.setProperty("scrollbar-width", "thin");

		this.fillList(listContainer, options.profileClick);
	}

	fillList = async (listContainer, profileClick) => {
		const friends = await easyFetch(`/api/user_management/auth/friends`)
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (response === null) {
				throw new Error("Response is null");
			} else if (response.status === 404) {
				throw new Error("User not found");
			} else if (response.status !== 200) {
				throw new Error(body.message || body.error || body);
			} else if (body === null) {
				throw new Error("Body is null");
			} else if (body.friends === null) {
				throw new Error("Friends is null")
			} else {
				return body.friends;
			}
		}).catch(error => {
			console.error('Error retrieving user details:', error);
		});

		for (const friend of friends) {
			friend.avatar = '/api/user_management' + friend.avatar;
			let friendBlock = new FriendBlock(
				{
					avatar: friend.avatar,
					userName: friend.username,
					status: friend.is_online ? "online" : "offline",
				});
			let image = friendBlock.shadowRoot.querySelector("#img-container img");
			let container = friendBlock.shadowRoot.querySelector("#container");
			container.style.setProperty("background-color", "rgba(0, 0, 0, 0)");
			// container.style.setProperty("transition", "background-color 0.1s ease-in-out");
			friendBlock.onmouseover = () => container.style.setProperty("background-color", "rgba(0, 0, 0, 0.3)");
			friendBlock.onmouseout = () => container.style.setProperty("background-color", "rgba(0, 0, 0, 0)");
			if (profileClick)
				friendBlock.onclick = () => profileClick(friend);
			image.onmouseover = () => image.src = deleteIcon;
			image.onmouseout = () => image.src = friend.avatar;
			image.onclick = () => this.removeFriend(friend.username);
			listContainer.appendChild(friendBlock);
			this.friends.push([friendBlock, friend]);
		}
		this.shadowRoot.appendChild(listContainer);
	}

	removeFriend = async (username) => {

		await easyFetch(`/api/user_management/auth/remove_friend/${username}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})
		.then(async res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error("Response is null");
			} else if (response.status === 200) {
				displayPopup("Friend removed", "info");
				await fetchUserDetails(); // Update new user details
				router();
			} else {
				throw new Error(body.error || JSON.stringify(body));
			}
		})
		.catch(error => {
			displayPopup(error.message || error, "error");
		});
	}
}

customElements.define('friends-list', FriendsList);