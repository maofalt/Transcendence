import AbstractView from "./AbstractView";

export default class Login extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		return `
		<div class="card">
			<h1>Login</h1>
		</div>
		`;
	}

}