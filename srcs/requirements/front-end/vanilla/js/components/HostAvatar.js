import styles from '@css/HostAvatar.css?raw';

class HostAvatar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <div class="host-container">
                <img class="host-avatar" style="">
                <div class="host-name"><slot></slot></div>
            </div>
        `;
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['avatar', 'name'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const avatar = this.getAttribute('avatar') || "public/assets/images/default-avatar.webp"; // Fallback to default avatar
        const name = this.getAttribute('name') || 'Unknown Host'; // Fallback to a default name

        this.shadowRoot.querySelector('.host-avatar').src = avatar;
        //this.shadowRoot.querySelector('.host-avatar').alt = `${name}'s avatar`;
        this.shadowRoot.querySelector('.host-name').textContent = name;
    }
}

customElements.define('host-avatar', HostAvatar);
export default HostAvatar;
