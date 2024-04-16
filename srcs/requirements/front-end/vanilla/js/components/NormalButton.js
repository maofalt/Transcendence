//NormalButton.js
import styles from '@css/NormalButton.css?raw';

class NormalButton extends HTMLElement {
    static get observedAttributes() {
        return ['data-text'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <body>
                <span class="start-btn"></span>
            </body>
        `;
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-text') {
            this.updateButtonText(newValue);
        }
    }

    updateButtonText(text) {
        const buttonText = text || 'Default Text';
        this.shadowRoot.querySelector('.start-btn').textContent = buttonText;
    }
     
}

customElements.define('start-btn', NormalButton);
export default NormalButton;
