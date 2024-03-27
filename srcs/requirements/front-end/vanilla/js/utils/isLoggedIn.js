
export default function isLoggedIn() {
	if (sessionStorage.getItem('accessToken'))
		return true;
	return false;
}