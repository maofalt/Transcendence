import easyFetch from "@utils/easyFetch";
import fetchUserDetails from "@utils/fetchUserDetails";
import { refreshSocketConnection } from "@utils/websocket"; 
import { initSocketConnection } from "@utils/websocket";

export async function renewToken() {
	const accessToken = sessionStorage.getItem("accessToken");
	const tokenType = sessionStorage.getItem("tokenType");

	easyFetch('/api/user_management/auth/check_refresh', {
		method: 'GET',
		headers: {
			'Authorization': tokenType + " " + accessToken
		}
	}).then(async res => {
		let response = res.response;
		let body = res.body;
		// console.log("body", body);
		if (response === null) {
			throw new Error("Response is null");
		}
		if (response.status !== 200) {
			throw new Error(body.message || body.error || body);
		}
		if (body === null) {
			throw new Error("Body is null");
		}
		if (body.access_token === null) {
			throw new Error("Access token is null");
		}
		if (body.expires_in === null) {
			throw new Error("Expires in is null");
		}
		if (body.token_type === null) {
			throw new Error("Token type is null");
		}

		console.log('Check refresh successful:', response);
		
		// get user details for the profile page and start the socket connection
		await setupLogin(body);

		console.log('Updated accessToken on Storage');
	}).catch(error => {
		console.error('Error checking refresh:', error);
		sessionStorage.clear();
	});
}

export function refreshTokenLoop() {
	const now = new Date().getTime();

	const expiryTimestamp = sessionStorage.getItem("expiryTimestamp");
	let expiryTime = parseInt(expiryTimestamp, 10);
	if (expiryTime && expiryTime > now && expiryTime < now + 100 * 24 * 60 * 60 * 1000) {
		const accessToken = sessionStorage.getItem("accessToken");
		const tokenType = sessionStorage.getItem("tokenType");

		console.log('expiryTimestamp:', expiryTimestamp);
		console.log('expiryTime:', expiryTime);
		console.log('accessToken:', accessToken);
		console.log('tokenType:', tokenType);

		if (now >= expiryTime - 60000) {
			renewToken();
		}

		// calculate remaining time until the token needs refreshing
		let delayUntilRefresh = expiryTime - now - 30000;

		console.log("delay", delayUntilRefresh);
		console.log('Token will be refreshed in:', delayUntilRefresh);

		if (delayUntilRefresh < 0) {
			delayUntilRefresh = 30000;
		}

		// timeout to refresh the token just before it expires
		setTimeout(refreshTokenLoop, delayUntilRefresh);
	} else {
		sessionStorage.clear();
	}
}

export function pollingFunctions() {
	
	refreshTokenLoop();

	initSocketConnection();

}
