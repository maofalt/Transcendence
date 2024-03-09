import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";

export default class LoginPage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Log In", dark: false});
		let usernameInput = new InputField({content: "Username"});
		let passwordInput = new InputField({content: "Password"});
		let loginButton = new CustomButton({content: "Log In", action: true, style: {margin: "15px 0px 0px 0px"}});
		let signUpButton = new CustomButton({content: "Sign Up", action: false, style: {margin: "20px 0px 20px 0px"}});

		let buttons = document.createElement('div');
		buttons.appendChild(loginButton);
		buttons.appendChild(signUpButton);
		buttons.id = "buttons";

		let p = document.createElement('p');
		p.id = "forgot-password";
		p.textContent = "Forgot Password ?";
		p.style.setProperty("font-size", "20px");
		p.style.setProperty("margin", "0px");
		p.style.setProperty("margin-bottom", "35px");
		p.style.setProperty("padding", "0px");
		p.style.setProperty("cursor", "pointer");

		pannel.shadowRoot.appendChild(usernameInput);
		pannel.shadowRoot.appendChild(passwordInput);
		pannel.shadowRoot.appendChild(p);
		pannel.shadowRoot.appendChild(buttons);

		loginButton.onclick = (e) => this.buttonOnClick(e, "Login button clicked!");
		
		this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
	}
	
	buttonOnClick = (e, arg) => {
		console.log(arg);
	}
	// Implement other methods or properties as needed
}

customElements.define('login-page-v2', LoginPage);