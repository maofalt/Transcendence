import ModalTable from "./ModalTable";

class DynamicTable extends HTMLElement {
    static get observedAttributes() {
        return ['data-headers', 'data-rows'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../css/DynamicTable.css">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <table class="table">
                <thead><tr id="table-headers"></tr></thead>
                <tbody id="table-body"></tbody>
            </table>
        `;
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-headers') {
            this.buildHeaders(JSON.parse(newValue));
        } else if (name === 'data-rows') {
            this.buildRows(JSON.parse(newValue));
        }
    }

    buildHeaders(headers) {
        const headersRow = this.shadowRoot.getElementById('table-headers');
        headersRow.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    }

    buildRows(dataRows) {
        const tbody = this.shadowRoot.querySelector('#table-body');
        tbody.innerHTML = dataRows.map(row => {
            // Assuming row is an object with keys matching headers
            const rowHTML = Object.values(row).map(value => {
                // Check for special types like avatars or badges
                if (typeof value === 'object' && value.type === 'avatar') {
                    return `<td><img src="${value.src}" class="rounded-circle" width="30" height="30"></td>`;
                } else if (typeof value === 'object' && value.type === 'badge') {
                    return `<td><span class="badge badge-${value.variant}">${value.text}</span></td>`;
                } else if (typeof value === 'object' && value.type === 'button') {
                    return `<td><button class="btn btn-${value.variant}">${value.text}</button></td>`;
                }
                return `<td>${value}</td>`;
            }).join('');
            return `<tr>${rowHTML}</tr>`;
        }).join('');
    }
}

customElements.define('dynamic-table', DynamicTable);
export default DynamicTable;