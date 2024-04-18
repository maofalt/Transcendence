import fetchUserDetails from "@utils/fetchUserDetails";
import { initSocketConnection } from "@utils/websocket";

export default async function setupLogin(body) {
	// Store the access token and details in memory
	sessionStorage.setItem('expiryTimestamp', new Date().getTime() + body.expires_in * 1000);
	sessionStorage.setItem('accessToken', body.access_token);
	sessionStorage.setItem('tokenType', body.token_type);
	
	// connect to the socket
	initSocketConnection();

	// get user details for the profile page
	await fetchUserDetails();
}