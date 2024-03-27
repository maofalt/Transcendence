import easyFetch from "@utils/easyFetch";

export default async function fetchUserDetails() {
	let details = {
		username: "Logged Out",
		playername: "Logged Out",
		avatar: "../js/assets/images/default-avatar.webp",
		friends_count: 0,
		email: "Logged Out"
	}
	try {
		const accessToken = sessionStorage.getItem("accessToken");
		const tokenType = sessionStorage.getItem("tokenType");

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
					avatar: "/api/user_management" + body.avatar,
					friends_count: body.friends_count,
					email: body.email
				}
			}
		}).catch(error => {
			console.error('Error retrieving user details:', error);
		});

		sessionStorage.setItem('username', details.username);
		sessionStorage.setItem('playername', details.playername);
		sessionStorage.setItem('avatar', details.avatar);
		sessionStorage.setItem('friends', details.friends_count);
		sessionStorage.setItem('email', details.email);
	} catch (error) {
		console.error('Error fetching user details:', error);
	}

	return details;
}