import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/Pannel.css?raw';
import AbstractComponent from '@components/AbstractComponent';

export default class Pannel extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		const p = document.createElement('p');
		p.id = "pannelTitle";

		if (options.title)
			p.textContent = options.title;

		this.shadowRoot.appendChild(p);

		if (options.width)
			this.style.width = options.width;
		if (options.height)
			this.style.height = options.height;

		this.setPannelStyle(options.dark);
	}

	setPannelStyle(dark) {
		if (dark) {
			this.style.background = "rgba(0, 0, 0, 0.7)";
			this.style.borderRadius = "20px";
			this.style.backdropFilter = "blur(12px)";
			return ;
		}
		this.style.background = "rgba(255, 255, 255, 0.1)";
		this.style.borderRadius = "20px";
		this.style.backdropFilter = "blur(16px)";
	}

	// Implement other methods or properties as needed
}

customElements.define('glass-pannel', Pannel);