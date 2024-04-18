import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";
import { navigateTo } from "@utils/Router";
import fetchUserDetails from "./fetchUserDetails";

export default async function updateUser(data) {
	const formData = new FormData();
	formData.append('playername', data.playername);
	formData.append('avatar', data.avatar);
	formData.append('email', data.email);
	formData.append('two_factor_method', data.two_factor_method);

	await easyFetch('/api/user_management/auth/profile_update', {
		method: 'POST',
		headers: {},
		body: formData
	})
	.then(async res => {
		let response = res.response;
		let body = res.body;

		if (!response || !body) {
			throw new Error('Empty Response');
		} else if (!response.ok) {
			throw new Error(body.error || JSON.stringify(body));
		} else if (response.status === 200) {
			displayPopup(body.success || JSON.stringify(body), 'success');

			await fetchUserDetails(); // Update new user details

			navigateTo("/profile");
		} else {
			throw new Error(body.error || JSON.stringify(body));
		}
	})
	.catch(error => {
		displayPopup(`Profile Modification Failed: ${error}`, 'error');
	});
}