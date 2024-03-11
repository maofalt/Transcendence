import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
// import inputFieldStyle from '@css/warnIndicator.css?raw';

var html = `
<span>
	<svg aria-hidden="true" fill="currentColor" focusable="false" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
	</svg>
</span>
`;

export default class WarnIndicator extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = "";
		this.shadowRoot.appendChild(styleEl);

		this.div = document.createElement('div');
		this.div.innerHTML = html;
		this.div.style.setProperty("display", "flex");
		this.div.style.setProperty("justify-content", "center");
		this.shadowRoot.appendChild(this.div);

		if (options.content) {
			this.div.append(options.content);
		}

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.div.style.setProperty(key, value);
			}
		}
	}
}

customElements.define('warn-indicator', WarnIndicator);