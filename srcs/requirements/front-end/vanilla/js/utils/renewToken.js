import { easyFetch } from "@utils/easyFetch";

export function renewToken() {
	
	const now = new Date().getTime();

	const expiryTimestamp = parseInt(sessionStorage.getItem("expiryTimestamp") || now + 60000, 10);
	const accessToken = sessionStorage.getItem("accessToken") || null;
	const tokenType = sessionStorage.getItem("tokenType") || "Bearer";

	console.log('expiryTimestamp:', expiryTimestamp);
	console.log('accessToken:', accessToken);
	console.log('tokenType:', tokenType);

	if (accessToken !== null && now >= expiryTimestamp - 60000) {
		easyFetch('/api/user_management/auth/check_refresh', {
			method: 'GET',
			headers: {
				'Authorization': tokenType + " " + accessToken
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
			
			sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expires_in * 1000);
			sessionStorage.setItem('accessToken', body.access_token);
			sessionStorage.setItem('tokenType', body.token_type);

			console.log('Updated accessToken on Storage');
		}).catch(error => {
			console.error('Error checking refresh:', error);
		});
	}

	// calculate remaining time until the token needs refreshing
	console.log('expiryTimestamp:', expiryTimestamp);
	const delayUntilRefresh = expiryTimestamp - now - 30000;
	if (delayUntilRefresh < 0)
		delayUntilRefresh = 120

	console.log('Token will be refreshed in:', delayUntilRefresh);

	// timeout to refresh the token just before it expires
	setTimeout(renewToken, delayUntilRefresh);
}
