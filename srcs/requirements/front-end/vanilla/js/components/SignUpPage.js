import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/SignUpPage.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "@components/Pannel";
import CustomButton from "@components/CustomButton";
import BigTitle from "@components/BigTitle";
import InputField from "@components/InputField";

export default class SignUpPage extends AbstractComponent {
	constructor(options = {}) {
		super();
		
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
		
		// let bigTitle = new BigTitle({content: "Cosmic<br>Pong", style: {margin: "-10vh 0 10vh 0"}});
		let pannel = new Pannel({title: "Sign Up", dark: false});

		let formContainer = document.createElement('div');
		formContainer.id = "form-container";
		formContainer.style.setProperty("display", "flex");
		formContainer.style.setProperty("width", "100%");
		formContainer.style.setProperty("flex-direction", "row");
		
		let idBlock = this.createInputAndTitle("Unique ID", "ID", "example: GigaBoomer69", 
		"A unique ID that defines you in our Database.");
		idBlock.style.setProperty("height", "130px");

		let passwordBlock = this.createInputAndTitle("Password", "password", "Password", 
		"Minimum 8 characters, at least 1 digit, 1 letter, and different from your Playername and your Email.");

		let confirmPasswordBlock = this.createInputAndTitle("Confirm Password", "con-password", "Password", "");
		confirmPasswordBlock.style.setProperty("height", "130px");

		let playernameBlock = this.createInputAndTitle("Playername", "playername", "Playername", 
		"Your Playername will be displayed in games and tournaments.");

		let emailBlock = this.createInputAndTitle("Email", "email", "example@example.com", "");
		emailBlock.style.setProperty("height", "180px");

		let verifyCodeBlock = this.createInputAndTitle("Verify Code", "verif-code", "XXXXXX", "");
		verifyCodeBlock.style.setProperty("height", "170px");
		
		const sendCode = new CustomButton({content: "Send Code", action: false});
		emailBlock.appendChild(sendCode);

		const verifyCode = new CustomButton({content: "Verify Code", action: false});
		verifyCodeBlock.appendChild(verifyCode);

		let leftBlock = this.createBlock("left");
		let rightBlock = this.createBlock("right");

		const privacyBlock = this.createPrivacyBlock();
		
		leftBlock.appendChild(idBlock);
		leftBlock.appendChild(passwordBlock);
		leftBlock.appendChild(confirmPasswordBlock);
		leftBlock.appendChild(playernameBlock);
		
		rightBlock.appendChild(emailBlock);
		rightBlock.appendChild(verifyCodeBlock);
		rightBlock.appendChild(privacyBlock);
		
		formContainer.appendChild(leftBlock);
		formContainer.appendChild(rightBlock);

		const buttonsBlock = this.createBottomButtons();

		pannel.shadowRoot.appendChild(formContainer);
		pannel.shadowRoot.appendChild(buttonsBlock);
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("font-size", "36px");
		pannel.shadowRoot.querySelector("#pannel-title").style.setProperty("margin", "20px 0px 34px 0px");
		// signUpButton.onclick = (e) => this.buttonOnClick(e, "Sign Up button clicked!");
		
		// this.shadowRoot.appendChild(bigTitle);
		this.shadowRoot.appendChild(pannel);
	}
	
	buttonOnClick = (e, arg) => {
		console.log(arg);
	}

	createInputAndTitle(titleContent, id, content, descContent) {
		let title = document.createElement("p");
		title.id = id + "-title-id";
		title.textContent = titleContent;
		title.style.setProperty("font-family", "tk-421, Anta, sans-serif");
		title.style.setProperty("font-size", "26px");
		title.style.setProperty("margin", "0px 0px 10px 0px");
		// title.style.setProperty("border", "1px green solid");

		const input = new InputField({content: content});
		input.id = id + "-input-id";
		input.style.setProperty("marin-bottom", "0px");
		
		let inputBlock = document.createElement("div");
		inputBlock.id = id + "-block-id";
		inputBlock.style.setProperty("height", "145px");
		inputBlock.style.setProperty("margin", "0px 0px 20px 0px");
		// inputBlock.style.setProperty("border", "1px yellow solid");

		let description = document.createElement("p");
		description.id = id + "-desc-id";
		description.textContent = descContent;
		description.style.setProperty("font-family", "Anta, sans-serif");
		description.style.setProperty("font-size", "14px");
		description.style.setProperty("margin-top", "-3px");

		inputBlock.appendChild(title);
		inputBlock.appendChild(input);
		inputBlock.appendChild(description);
		return inputBlock;
	}

	createBlock(blockName) {
		let block = document.createElement('div');
		block.id = blockName + "-block";
		block.style.setProperty("flex", "1");
		block.style.setProperty("margin", "0px 15px");
		// block.style.setProperty("padding", "0px");
		// block.style.setProperty("border", "1px red solid");
		return block;
	}

	createPrivacyBlock() {
		const privacyBlock = document.createElement("div");
		privacyBlock.style.setProperty("width", "100%");
		privacyBlock.style.setProperty("height", "200px");
		// privacyBlock.style.setProperty("border", "1px yellow solid");

		const privacyTitle = document.createElement("p");
		privacyTitle.id = "privacy-title";
		privacyTitle.textContent = "Privacy Policy";
		privacyTitle.style.setProperty("font-size", "32px");
		privacyTitle.style.setProperty("font-family", "tk-421, Anta, sans-serif");
		privacyTitle.style.setProperty("margin", "15px 0px 10px 0px");
		
		const checkBox = document.createElement("input");
		checkBox.type = "checkbox";
		checkBox.style.setProperty("width", "24px");
		checkBox.style.setProperty("height", "24px");
		checkBox.style.setProperty("margin-right", "15px");

		const privacyDesc = document.createElement("p");
		privacyDesc.id = "privacy-desc";
		privacyDesc.textContent = "I agree to the terms and conditions.";
		privacyDesc.style.setProperty("width", "100%");
		privacyDesc.style.setProperty("font-size", "14px");

		const acceptPrivacyBlock = document.createElement("div");
		acceptPrivacyBlock.style.setProperty("width", "100%");
		acceptPrivacyBlock.style.setProperty("height", "50px");
		acceptPrivacyBlock.style.setProperty("margin", "10px 0px 10px 0px");
		acceptPrivacyBlock.style.setProperty("display", "flex");
		acceptPrivacyBlock.style.setProperty("flex-direction", "row");
		acceptPrivacyBlock.style.setProperty("justify-content", "center");
		acceptPrivacyBlock.style.setProperty("align-items", "center");
		// acceptPrivacyBlock.style.setProperty("border", "1px green solid");
		
		const privacyPolicy = new CustomButton({content: "Privacy Policy", action: false});
		
		acceptPrivacyBlock.appendChild(checkBox);
		acceptPrivacyBlock.appendChild(privacyDesc);
		privacyBlock.appendChild(privacyTitle);
		privacyBlock.appendChild(privacyPolicy);
		privacyBlock.appendChild(acceptPrivacyBlock);

		return privacyBlock;
	}

	createBottomButtons() {
		const block = document.createElement("div");
		block.style.setProperty("width", "100%");
		block.style.setProperty("height", "80px");
		block.style.setProperty("margin", "15px 0px");
		block.style.setProperty("display", "flex");
		block.style.setProperty("flex-direction", "row");
		// block.style.setProperty("border", "1px red solid");

		const leftButtonDiv = document.createElement("div");
		leftButtonDiv.style.setProperty("width", "100%");
		leftButtonDiv.style.setProperty("height", "80px");
		leftButtonDiv.style.setProperty("margin-right", "30px");
		leftButtonDiv.style.setProperty("flex", "1");

		let signUpButton = new CustomButton({content: "Sign Up", action: true, style: {margin: "0px 15px"}});
		signUpButton.style.setProperty("flex", "1");
		let backButton = new CustomButton({content: "< Back", action: false, style: {margin: "0px 15px", width: "200px"}});
		backButton.style.setProperty("width", "50%");

		leftButtonDiv.appendChild(backButton);
		block.appendChild(leftButtonDiv);
		block.appendChild(signUpButton);

		return block;
	}
	// Implement other methods or properties as needed
}

customElements.define('signup-page-v2', SignUpPage);

// unique Id
// password "minimum 8 characters, at least 1 digit, 1 letter, and different from email and playername"
// confirm password
// playername
// email
// send code button
// verify code
// verify code button
// open privacy policy button
// "I agree to the terms and conditions."
// accept policy
// sign up button