
import AbstractComponent from "./AbstractComponent";
import FriendBlock from "./FriendBlock";
import easyFetch from "@utils/easyFetch";
import getCookie from "@utils/getCookie";
import displayPopup from "@utils/displayPopup";

export default class FriendsList extends AbstractComponent {
	constructor(options = {}) {
		super();

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

		let friend = new FriendBlock({avatar: "../js/assets/images/yridgway.jpg", userName: "Yoel", status: "online"});

		listContainer.appendChild(friend);

		this.fillList(listContainer);
	}

	fillList = async (listContainer) => {
		const friends = await easyFetch(`/api/user_management/auth/friends`).then(res => {
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
		console.log("friends:", friends);

		for (const friend of friends) {
			let friendBlock = new FriendBlock(
				{
					avatar: '/api/user_management' + friend.avatar,
					userName: friend.username,
					status: friend.is_online ? "online" : "offline",
				});
			listContainer.appendChild(friendBlock);
		}
		this.shadowRoot.appendChild(listContainer);
	}

}

customElements.define('friends-list', FriendsList);