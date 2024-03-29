import easyFetch from "@utils/easyFetch";
import isLoggedIn from "@utils/isLoggedIn";

export default async function fetchUserDetails() {
	let details = {
		username: "Logged Out",
		playername: "Logged Out",
		email: "Logged Out",
		avatar: "../js/assets/images/default-avatar.webp",
		status: "Offline",
		friends_count: 0,
		wins: "-",
		losses: "-",
		total: 15,
		winrate: "66%",
	};
	try {
		const accessToken = sessionStorage.getItem("accessToken");
		const tokenType = sessionStorage.getItem("tokenType");
	
		if (!isLoggedIn()) {
			return details;
		}

		await easyFetch('/api/user_management/auth/detail', {
			method: 'GET',
			headers: {
				'Authorization': tokenType + " " + accessToken
			}
		}).then(res => {
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
			} else {
				details = {
					username: body.username,
					playername: body.playername,
					email: body.email,
					avatar: "/api/user_management" + body.avatar,
					status: "online",
					friends_count: body.friends_count,
					wins: body.wins,
					losses: body.losses,
					total: body.total,
					winrate: body.winrate,
				}
			}
		}).catch(error => {
			console.error('Error retrieving user details:', error);
		});
		// console.log("details:", details);
	} catch (error) {
		console.error('Error fetching user details:', error);
	}
	return details;
}