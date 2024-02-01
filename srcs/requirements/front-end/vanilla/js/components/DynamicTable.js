class DynamicTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
    }
    
    connectedCallback() {
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <div class="alert alert-info">Dynamic Table Component</div>
        `;
    }

}

customElements.define('dynamic-table', DynamicTable);
export default DynamicTable;