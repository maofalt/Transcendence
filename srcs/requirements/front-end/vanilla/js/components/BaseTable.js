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
        this.totalRows= [];
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
    
    // addRow(cells, identifier) {
    //     const newRow = new Row(identifier);
    //     const index = this.dataRows.length;

    //     cells.forEach(cellContent => {
    //         newRow.addCell(cellContent, cellContent.header);
    //     });

    //     this.dataRows.push(newRow);

    //     if (identifier) {
    //         this.rowIndexByIdentifier[identifier] = index;
    //     }
    //     this.renderCurrentPage();
    // }

    addRow(cells, identifier) {
        const newRow = new Row(identifier);
        cells.forEach(cellContent => {
            newRow.addCell(cellContent, cellContent.header);
        });
        this.dataRows.push(newRow);
        this.totalRows.push(newRow.domElement);
        this.shadowRoot.querySelector('#table-body').appendChild(newRow.domElement);
        newRow.domElement.style.display = 'none';

        if (identifier) {
            this.rowIndexByIdentifier[identifier] = this.totalRows.length - 1;
        }
    }

    connectedCallback() {
        this.shadowRoot.getElementById('prev-page').addEventListener('click', () => {
            console.log('prev-page clicked');
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderCurrentPage();
            }
        });
        this.shadowRoot.getElementById('next-page').addEventListener('click', () => {
            console.log('next-page clicked');
            const maxPage = Math.ceil(this.dataRows.length / this.itemsPerPage);
            console.log('maxPage', maxPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderCurrentPage();
            }
        });
        this.renderCurrentPage();
    }

    // disconnectedCallback() {
    //     console.log('disconnectedCallback for buttonq');
    //     // This will be called when the custom element is removed from the document
    //     this.dataRows.forEach(row => {
    //         console.log('       row', row);
    //         row.cells.forEach(cell => {
    //             const button = cell.domElement.querySelector('button');
    //             if (button && button.clickHandler) {
    //                 console.log('       removing button event', button);
    //                 button.removeEventListener('click', button.clickHandler);
    //             }
    //         });
    //     });
    // }

    
    renderCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;

        console.log('startIndex', startIndex);
        console.log('endIndex', endIndex);
        // Hide all rows
        this.totalRows.forEach(row => row.style.display = 'none');

        // Show only rows for the current page
        for (let i = startIndex; i < endIndex && i < this.totalRows.length; i++) {
            this.totalRows[i].style.display = '';
        }
    }


    updateRowByIdentifier(identifier, newCells) {
        const rowIndex = this.rowIndexByIdentifier[identifier];
        if (rowIndex !== undefined && this.dataRows[rowIndex]) {
            const row = this.dataRows[rowIndex];
            newCells.forEach(newCell => {
                if (row.cells.has(newCell.header)) {
                    row.updateCell(newCell.header, newCell);
                } else {
                    // If the cell doesn't exist, add it
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