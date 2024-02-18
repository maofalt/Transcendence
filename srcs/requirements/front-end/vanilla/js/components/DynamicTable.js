class DynamicTable extends HTMLElement {
    static get observedAttributes() {
        return ['data-title','data-headers', 'data-rows'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../css/DynamicTable.css">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <body>Tournament
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
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-title') {
            this.buildCaption(newValue);
        }else if (name === 'data-headers') {
            this.buildHeaders(JSON.parse(newValue));
        } else if (name === 'data-rows') {
            this.buildRows(JSON.parse(newValue));
        }
    }

    buildCaption(Title){
        const tableTitle = this.shadowRoot.getElementById('table-title');
        tableTitle.innerHTML = Title;
    }

    buildHeaders(headers) {
        const headersRow = this.shadowRoot.getElementById('table-headers');
        headersRow.innerHTML = headers.map(header => `<th class="align-top">${header}</th>`).join('');
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