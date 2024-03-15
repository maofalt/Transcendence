class BaseTable extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="../../css/DynamicTable.css">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
            <body>
                <div class="table-responsive">
                    <h1 id='table-title'></h1>
                    <table class="table table-dark table-striped table-borderless bg-success table-hover caption-top">                
                        <thead>
                            <tr id="table-headers"></tr>
                        </thead>
                        <tbody id="table-body">
                        </tbody>
                    </table>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
            </body>
        `;
        this.columnStyles = {};
    }

    //Utility to set column styles
    setColumnStyles(styles) {
        this.columnStyles = styles;
    }

    //Utility method to set headers
    setHeaders(headers) {
        let tableHeaders = this.shadowRoot.getElementById('table-headers');
        tableHeaders.innerHTML = '';
        tableHeaders.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
    }
    
    addRow(cells) {
        const tbody = this.shadowRoot.querySelector('#table-body');
        const row = document.createElement('tr');
        cells.forEach(cellContent => {
            const cell = document.createElement('td');
            if (cellContent instanceof HTMLElement) {
                cell.appendChild(cellContent);
            } else {
                cell.innerHTML = cellContent;
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    }

}

customElements.define('base-table', BaseTable);
export default BaseTable;