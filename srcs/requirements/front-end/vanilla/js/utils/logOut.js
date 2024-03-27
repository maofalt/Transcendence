import easyFetch from "@utils/easyFetch";
import getCookie from "@utils/getCookie";
import displayPopup from "@utils/displayPopup";
import fetchUserDetails from "@utils/fetchUserDetails";
import { navigateTo } from '@utils/Router.js';

export default async function logOut() {
	sessionStorage.removeItem("accessToken");
	sessionStorage.removeItem("tokenType");
	await easyFetch('/api/user_management/auth/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'X-CSRFToken': getCookie('csrftoken')
		}
	}).then(res => {
		let response = res.response;
		let body = res.body;

		if (!response || !body) {
			console.error('Request Failed');
			return ;
		}

		if (response.status === 400) {
			alert('Wrong username or password');
			return ;
		}

		if (!response.ok) {
			console.error('Request Failed:', body.error || JSON.stringify(body));
			return ;
		}

		if (response.status === 200 && body.success === true) {
			alert('Logout successful: ' + body.message);
		}
	}).catch(error => {
		console.error('Request Failed:', error);
	});
	
	await fetchUserDetails();

	displayPopup("You have been logged out", "success");

	navigateTo("/");
}