import styles from '@css/DynamicTable.css?raw';

class DynamicTable extends HTMLElement {
    static get observedAttributes() {
        return ['data-title','data-headers', 'data-rows', 'data-style'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <body>
                <div class="table-responsive">
                    <h1 id='table-title'></h1>
                    <table class="table table-dark table-striped table-borderless bg-success table-hover caption-top">                
                        <thead><tr id="table-headers"></tr></thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
            </body>
        `;
        this.columnStyles = {};
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);
    }
    
    styleToString(styleObj){
        return Object.entries(styleObj)
            .map(([key, value]) => `${key}:${value};`)
            .join(' ');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name){
            case 'data-title':
                this.buildCaption(newValue);
                break;
            case 'data-headers':
                this.buildHeaders(JSON.parse(newValue));
                break;
            case 'data-rows':
                this.buildRows(JSON.parse(newValue));
                break;
            case 'data-style':
                this.applyColumnStyles(JSON.parse(newValue));
                break;
        }
    }

    handleComplexCellType(cellValue) {
        if (cellValue.type === 'image') {
            return `<img src="${cellValue.src}" alt="${cellValue.alt}" style="${this.styleToString(cellValue.style)}">`;
        }
        return cellValue;
    }

    buildCaption(Title){
        const tableTitle = this.shadowRoot.getElementById('table-title');
        tableTitle.innerHTML = Title;
    }

    buildHeaders(headers) {
        const headersRow = this.shadowRoot.getElementById('table-headers');
        headersRow.innerHTML = headers.map(header => `<th class="align-top">${header}</th>`).join('');
    }

    applyColumnStyles(styles) {
        this.columnStyles = styles;
    }

    buildRows(dataRows) {
        const tbody = this.shadowRoot.querySelector('#table-body');
        tbody.innerHTML = dataRows.map(row => {
            return `<tr>${
                Object.entries(row).map(([columnName, cellValue]) => {
                    const style = this.columnStyles[columnName] ? this.styleToString(this.columnStyles[columnName]) : '';
                    let content = typeof cellValue === 'object' ? this.handleComplexCellType(cellValue) : cellValue;
                    return `<td style="${style}">${content}</td>`;
                }).join('')
            }</tr>`;
        }).join('');
    }
    
}

customElements.define('dynamic-table', DynamicTable);
export default DynamicTable;