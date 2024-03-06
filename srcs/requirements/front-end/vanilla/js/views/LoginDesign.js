import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginDesign.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "../components/InputField";

export default class LoginDesign extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let pannel = new Pannel({title: "Log In", width: "20vw", dark: false});
		let usernameInput = new InputField({content: "Username"});
		let passwordInput = new InputField({content: "Password"});
		let loginButton = new CustomButton({content: "Log In", action: true});
		let signUpButton = new CustomButton({content: "Sign In", action: false});

		pannel.shadowRoot.appendChild(usernameInput);
		pannel.shadowRoot.appendChild(passwordInput);
		pannel.shadowRoot.appendChild(loginButton);
		pannel.shadowRoot.appendChild(signUpButton);

		this.shadowRoot.appendChild(pannel);
	}
	
	// Implement other methods or properties as needed
}

customElements.define('login-design', LoginDesign);