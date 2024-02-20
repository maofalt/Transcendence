import AbstractView from "./AbstractView";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		console.log("path: ", document.location.origin);
		history.replaceState(null, null, document.location.origin + '/api/user_management');
		window.location.href = document.location.origin + '/api/user_management';
		// let html = fetch(document.location.origin + '/api/user_managemen');
		return `
		<div class="card">
			<h1>Login</h1>
		</div>
		`;
	}

}