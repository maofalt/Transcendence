import { easyFetch } from "@utils/easyFetch";

export function renewToken() {
	const expiryTimestamp = parseInt(sessionStorage.getItem("expiryTimestamp"), 10);
	const accessToken = sessionStorage.getItem("accessToken");
	const tokenType = sessionStorage.getItem("tokenType");

	const now = new Date().getTime();

	if (accessToken !== null && now >= expiryTimestamp - 60000) {
		easyFetch('/api/user_management/auth/check_refresh', {
			method: 'GET',
			headers: {
				'Authorization': tokenType + accessToken
			}
		}).then(res => {
			let response = res.response;
			let body = res.body;
			console.log("body", body);
			if (response === null) {
				throw new Error("Response is null");
			}
			if (body === null) {
				throw new Error("Body is null");
			}
			if (response.status !== 200) {
				throw new Error(body.message || body.error || body);
			}
			if (body.accessToken === null) {
				throw new Error("Access token is null");
			}
			if (body.expiresIn === null) {
				throw new Error("Expires in is null");
			}
			if (body.tokenType === null) {
				throw new Error("Token type is null");
			}

			console.log('Check refresh successful:', response);
			
			sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expiresIn * 1000);
			sessionStorage.setItem('accessToken', body.accessToken);
			sessionStorage.setItem('tokenType', body.tokenType);

			console.log('Updated accessToken on Storage');
		}).catch(error => {
			console.error('Error checking refresh:', error);
		});
	}
	// calculate remaining time until the token needs refreshing
	let delayUntilRefresh = 60000;
	if (expiryTimestamp !== null)
		delayUntilRefresh = expiryTimestamp - now - 60000;

	// timeout to refresh the token just before it expires
	setTimeout(renewToken, delayUntilRefresh);
}
