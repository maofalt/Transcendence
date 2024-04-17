import styles from '@css/ActionButton.css?raw';

class ActionButton extends HTMLElement {
    static get observedAttributes() {
        return ['data-text'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <div>
                <button class="action-button"> </button>
            </div>
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
        this.shadowRoot.querySelector('.action-button').textContent = buttonText;
    }
     
}

customElements.define('action-button', ActionButton);
export default ActionButton;
