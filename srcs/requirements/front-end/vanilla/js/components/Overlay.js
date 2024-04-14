class Overlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../css/Overlay.css">
            <div class="overlay">
                <span class="closebtn">&times;</span>
                <div class="overlay-content">
                    <slot></slot>
                </div>
            </div>
        `;

        this.overlay = this.shadowRoot.querySelector('.overlay');
        this.closeButton = this.shadowRoot.querySelector('.closebtn');
        this.closeButton.addEventListener('click', () => this.hide());
    }

    connectedCallback() {
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'dialog');
    }

    show() {
        this.overlay.style.display = 'block';
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}

customElements.define('custom-overlay', Overlay);
export default Overlay;
