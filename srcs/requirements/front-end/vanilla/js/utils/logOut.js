import easyFetch from "@utils/easyFetch";
import getCookie from "@utils/getCookie";
import displayPopup from "@utils/displayPopup";
import fetchUserDetails from "@utils/fetchUserDetails";
import { navigateTo } from '@utils/Router.js';

export default async function logOut() {

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
			throw new Error('empty response');
		}

		if (response.ok) {
			throw new Error(body.error || body.message || body);
		}

	}).catch(error => {
		console.error('Request Failed:', error);
	});

	sessionStorage.clear();

	displayPopup("You have been logged out", "success");

	navigateTo("/");
}