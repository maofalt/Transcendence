import AbstractComponent from "@components/AbstractComponent";

export default class ForgotPassword extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.shadowRoot.innerHTML = `
			<div id="forgot-password" class="pannel">
				<div id="title">
					<h1>Forgot Password</h1>
				</div>
				<div id="input">
					<input type="text" placeholder="Username" name="username" id="username">
				</div>
				<div id="buttons">
					<button id="submit" class="action">Submit</button>
					<button id="cancel" class="action">Cancel</button>
				</div>
			</div>
		`;

		this.shadowRoot.querySelector('#submit').onclick = this.submitForgotPassword;
		this.shadowRoot.querySelector('#cancel').onclick = this.cancelForgotPassword;
	}

	submitForgotPassword = (e) => {
		e.preventDefault();
		console.log('submitForgotPassword');
	}

	cancelForgotPassword = (e) => {
		e.preventDefault();
		console.log('cancelForgotPassword');
	}
}
