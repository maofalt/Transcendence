import styles from '@css/NumberOfPlayers.css?raw';

class NumberOfPlayers extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <img class="players-icon" style="">
        `;
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['nbrOfPlayers'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const nbrOfPlayers = this.getAttribute('nbrOfPlayers') || "?"; // Fallback to default avatar
        if (nbrOfPlayers === "?") {
            this.shadowRoot.querySelector('.players-icon').src = "";
            return;
        }
        const url = `../js/assets/images/${nbrOfPlayers}_players.svg`;
        this.shadowRoot.querySelector('.players-icon').src = url;
    }
}

customElements.define('number-of-players', NumberOfPlayers);
export default NumberOfPlayers;

