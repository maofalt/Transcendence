//NormalButton.js
class NormalButton extends HTMLElement {
    static get observedAttributes() {
        return ['data-text'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../css/NormalButton.css">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <body>
                <button class="start-btn"></button>
            </body>
        `;
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
