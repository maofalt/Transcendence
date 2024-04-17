import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import alertTriangle from "@public/alert-triangle.svg?raw";
import checkCircle from "@public/check-circle.svg?raw";
import googleAlert from "@public/google-alert.svg?raw";
import CustomButton from "@components/CustomButton";
import infoPopupStyle from "@css/InfoPopup.css?raw";
import anim from "@utils/animate.js";

export default class InfoPopup extends AbstractComponent {
	constructor(options = {}) {
		super();

		this.options = options;

		const styleEl = document.createElement('style');
		styleEl.textContent = infoPopupStyle;
		this.shadowRoot.appendChild(styleEl);

		this.closeButton = new CustomButton({content: "X"});
		this.closeButton.textContent = "X";
		this.closeButton.id = "closePopupButton";
	
		this.closeButton.onclick = (e) => {
			e.stopPropagation();
			anim.slideOut(this, 500, true);
		}
		
		this.div = document.createElement('div');
		this.div.id = "popupBody";

		this.div.appendChild(this.closeButton);

		this.icons = {
			alertTriangle: htmlToElement(alertTriangle),
			checkCircle: htmlToElement(checkCircle),
			googleAlert: htmlToElement(googleAlert),
		}

		for (const svg of Object.values(this.icons)) {
			svg.style.setProperty("flex-shrink", "0");
			svg.style.setProperty("margin", "8px");
		}

		this.div.appendChild(this.icons.alertTriangle);
		
		if (!options.content) {
			this.options.content = "This is a warning!";
		}

		this.messageP = htmlToElement(`<p>${options.content}</p>`);
		this.div.append(this.messageP);
		
		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.div.style.setProperty(key, value);
			}
		}

		this.shadowRoot.appendChild(this.div);

		this.onmouseenter = () => {
			this.closeButton.style.setProperty("display", "flex");
			anim.fadeIn(this.closeButton, 200, 'flex');
		}
		this.onmouseleave = () => {
			anim.fadeOut(this.closeButton, 200);
		}
	}

	static get observedAttributes() {
		return [
			'width', 
			'height', 
			'valid', 
			'content',
			'type',
			'message',
		];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'width' || name === 'height') {
			this.style.setProperty(name, newValue);
		}
		if (name === 'type') {
			if (newValue === "error") {``
				// console.log('newValue', newValue);
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.alertTriangle, icon);
				this.div.style.setProperty("color", "red");
			} else if (newValue === "success") {
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.checkCircle, icon);
				this.div.style.setProperty("color", "green");
			} else if (newValue === "info") {
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.googleAlert, icon);
				this.div.style.setProperty("color", "orange");
			} else {
				console.log("Unknown type: ", newValue);
				let icon = this.div.querySelector('svg');
				this.div.replaceChild(this.icons.googleAlert, icon);
				this.div.style.setProperty("color", "blue");
			}
		}
		if (name === 'message') {
			this.options.content = newValue;
			let message = this.div.querySelector('p');
			message.textContent = newValue;
			// console.log('message', message);
			// console.log("newValue", newValue);
		}
	}
}

customElements.define('info-popup', InfoPopup);