import Row from './Row.js';
import Cell from './Cell.js';

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
                <div class="pagination-controls">
                    <button id="prev-page">Previous</button>
                    <button id="next-page">Next</button>
                </div>
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-kenU1KFdBIe4zVF0s0G1M5b4hcpxyD9F7jL+jjXkk+Q2h455rYXK/7HAuoJl+0I4" crossorigin="anonymous"></script>
            </body>
        `;
        this.columnStyles = {};
        this.dataRows = [];
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.rowIndexByIdentifier = [];
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
    
    addRow(cells, identifier) {
        const newRow = new Row(identifier);
        const index = this.dataRows.length;

        cells.forEach(cellContent => {
            newRow.addCell(cellContent, cellContent.header);
        });

        this.dataRows.push(newRow);

        if (identifier) {
            this.rowIndexByIdentifier[identifier] = index;
        }
        this.renderCurrentPage();
    }

    connectedCallback() {
        this.shadowRoot.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderCurrentPage(); // Implement this method
            }
        });
        this.shadowRoot.getElementById('next-page').addEventListener('click', () => {
            const maxPage = Math.ceil(this.dataRows.length / this.itemsPerPage);
            if (this.currentPage < maxPage)
            {            
                this.currentPage++;
                this.renderCurrentPage(); // Implement this method
            }
        });
       this.renderCurrentPage();
    }

    renderCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageRows = this.dataRows.slice(startIndex, endIndex);

        // Clear the table body to prepare for new rows
        const tbody = this.shadowRoot.querySelector('#table-body');
        tbody.innerHTML = '';

        // Add rows for the current page
        pageRows.forEach(row => {
            tbody.appendChild(row.domElement);
        });
    }

    updateRowByIdentifier(identifier, newCells) {
        const rowIndex = this.rowIndexByIdentifier[identifier];
        console.log('updateRowByIdentifier', identifier, rowIndex);
        if (rowIndex !== undefined && this.dataRows[rowIndex]) {
            const row = this.dataRows[rowIndex];
            newCells.forEach(newCell => {
                if (row.cells.has(newCell.header)) {
                    console.log('row and cell exist');
                    row.updateCell(newCell.header, newCell);
                } else {
                    // If the cell doesn't exist, add it
                    console.log('row and cell do not exist');
                    row.addCell(newCell, newCell.header);
                }
            });
            this.renderCurrentPage();
        } else {
            console.log(`Row with identifier ${identifier} not found.`);
            console.error(`Row with identifier ${identifier} not found.`);
        }
    }
    

}

customElements.define('base-table', BaseTable);
export default BaseTable;