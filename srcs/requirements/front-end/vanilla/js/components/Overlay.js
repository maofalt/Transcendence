import styles from '@css/Overlay.css?raw';

class Overlay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div class="overlay">
                <span class="closebtn">&times;</span>
                <div class="overlay-content">
                    <slot></slot>
                </div>
            </div>
        `;
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

        this.overlay = this.shadowRoot.querySelector('.overlay');
        this.closeButton = this.shadowRoot.querySelector('.closebtn');
        this.closeButton.addEventListener('click', () => this.hide());
    }

    connectedCallback() {
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'dialog');
    }

    show() {
        this.overlay.style.visibility = 'visible';
        this.overlay.style.height = '100%';
    }

    hide() {
        this.overlay.style.height = '0%';
        setTimeout(() => {
            this.overlay.style.visibility = 'hidden';
        }, 500);
    }
}

customElements.define('custom-overlay', Overlay);
export default Overlay;
