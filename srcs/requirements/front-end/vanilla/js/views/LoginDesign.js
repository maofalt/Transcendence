import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/LoginDesign.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import DarkPannel from "@components/DarkPannel";
import Pannel from "@components/Pannel";
import HighLightButton from "@components/HighLightButton";
import BigTitle from "@components/BigTitle";
import ChillButton from "@components/ChillButton";

export default class LoginDesign extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		let container = document.createElement('div');
		let buttonRow = document.createElement('div');

		const pannel = new Pannel({content: "Log In"});

		const logButton = new HighLightButton({content: "Log In"});
		const signButton = new ChillButton({content: "Sign Up"});

		const inputField = new DarkPannel({content:"placeHolder"});

		// inputField.shadowRoot.querySelector('div').style.width = "140%";
		inputField.shadowRoot.querySelector('div').style.width = "420px";
		inputField.shadowRoot.querySelector('div').style.height = "42px";
		inputField.shadowRoot.querySelector('div').style.border = "1px red solid";

		pannel.shadowRoot.querySelector('div').style.display = "flex";
		pannel.shadowRoot.querySelector('div').style.flexDirection = "column";
		pannel.shadowRoot.querySelector('div').style.alignItems = "center";
		pannel.shadowRoot.querySelector('div').style.height = "70vh";

		this.styleButton(logButton);
		this.styleButton(signButton);
		this.styleButtonRow(buttonRow);

		buttonRow.appendChild(signButton);
		buttonRow.appendChild(logButton);

		const inputField1 = inputField.cloneNode(true);
		const inputField2 = inputField.cloneNode(true);

		pannel.shadowRoot.querySelector('div').appendChild(inputField);
		pannel.shadowRoot.querySelector('div').appendChild(buttonRow);

		container.appendChild(pannel);
		container.style.display = "flex";
		container.style.justifyContent = "center";
		this.shadowRoot.appendChild(container);
	}

	styleButtonRow(buttonRow) {
		buttonRow.style.display = "flex";
		buttonRow.style.flexDirection = "row";
		buttonRow.style.alignItems = "center";
		buttonRow.style.justifyContent = "center";
		buttonRow.style.width = "80%";
		buttonRow.style.border = "1px red solid";
	}

	styleButton(button) {
		button.setAttribute("width", "110px");
		button.setAttribute("font-size", "32px");
		button.style.border = "1px red solid";
	}
	// Implement other methods or properties as needed
}

customElements.define('login-design', LoginDesign);