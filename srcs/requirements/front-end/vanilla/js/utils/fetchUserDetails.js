import easyFetch from "@utils/easyFetch";
import isLoggedIn from "@utils/isLoggedIn";

export default async function fetchUserDetails() {
	let details = {
		username: "Logged Out",
		playername: "Logged Out",
		email: "Logged Out",
		avatar: "public/assets/images/default-avatar.webp",
		status: "Offline",
		is_online: false,
		friends_count: 0,
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
					phone: body.phone,
					avatar: "/api/user_management" + body.avatar,
					status: "online",
					is_online: true,
					friends_count: body.friends_count,
				}
			}
		}).catch(error => {
			console.error('Error retrieving user details:', error);
		});
		// console.log("details:", details);
	} catch (error) {
		console.error('Error fetching user details:', error);
	}
	sessionStorage.setItem('userDetails', JSON.stringify(details));
	return details;
}