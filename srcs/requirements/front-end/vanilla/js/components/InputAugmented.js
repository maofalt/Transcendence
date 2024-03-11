import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/InputAugmented.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import WarnIndicator from "./WarnIndicator";
import InputField from "./InputField";
import CustomButton from "./CustomButton";

export default class InputAugmented extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;

		this.shadowRoot.appendChild(styleEl);

		// let	indicators = [];
		const title = document.createElement('p');
		title.id = "input-title";

		title.textContent = options.title ? options.title : "Input title";
		this.shadowRoot.appendChild(title);

		const input = new InputField({type: options.type, content: options.content});
		input.id = "input-field";

		this.shadowRoot.appendChild(input);

		let indicatorsBox = document.createElement('div');
		indicatorsBox.id = "indicators-box";

		if (options.indicators) {
			options.indicators.forEach(element => {
				console.log(element);
				let indicator = new WarnIndicator({content: element});
				indicator.id = element.replaceAll(' ', '-');
				// indicators.push(indicator);
				indicatorsBox.appendChild(indicator);
			});
		}
		this.shadowRoot.appendChild(indicatorsBox);

		if (options.button) {
			let button = new CustomButton({content : options.button.content, action: options.button.action});
			this.shadowRoot.appendChild(button);
		}

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}
		this.style.setProperty("font-family", "Anta");
	}

	// Implement other methods or properties as needed
}

customElements.define('input-augmented', InputAugmented);