import Row from './Row.js';
import Cell from './Cell.js';
import CustomButton from "@components/CustomButton";
import styles from '@css/DynamicTable.css?raw';

class BaseTable extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.innerHTML = `
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <body>
                <div id="buttons-bar">
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr id="table-headers"></tr>
                        </thead>
                        <tbody id="table-body">
                        </tbody>
                    </table>
                </div>
                <div class="pagination-controls">
                    <button id="prev-page"><</button>
                    <button id="next-page">></button>
                    <div id="mid-page-controls"></div>
                </div>
            </body>
        `;
		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

        this.columnStyles = {};
        this.dataRows = [];
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.rowIndexByIdentifier = [];
        this.totalRows= [];
        this.createButton = new CustomButton({content: "Create", action: true});
        this.createButton.id = "create-button";
        this.manageButton = new CustomButton({content: "Manage", action: false});
        this.manageButton.id = "manage-button";
        this.midSpace = document.createElement("div");
        this.midSpace.id = "mid-space";
        this.searchBar = document.createElement("input");
        this.searchBar.id = "search-bar";
        this.searchBar.placeholder = "Tournament name";
        // this.searchButton = new CustomButton({content: "Search", action: true});
        // this.searchButton.id = "search-button";
        this.refreshButton = new CustomButton({content: "Refresh", action: false});
        this.refreshButton.id = "refresh-button";
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.createButton);
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.manageButton);
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.midSpace);
        
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.searchBar);
        //this.shadowRoot.querySelector("#buttons-bar").appendChild(this.searchButton);
        this.searchBar.addEventListener('keyup', () => this.filterRows(this.searchBar.value));


        this.shadowRoot.querySelector(".pagination-controls").appendChild(this.refreshButton);
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
    

    renderCurrentPage() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.totalRows.forEach(row => {
            if (row && row.style) {
                row.style.display = 'none';
            }
        });
    
        let rowsToShow;
        if (this.filteredRows) {
            // We need to make sure we're dealing with DOM elements, not Row objects
            rowsToShow = this.filteredRows.map(row => row.domElement).slice(startIndex, endIndex);
        } else {
            rowsToShow = this.totalRows.slice(startIndex, endIndex);
        }
    
        // Check if the row is defined before trying to change its display property
        rowsToShow.forEach(row => {
            if (row) {
                row.style.display = '';
            }
        });
    }
    

    filterRows(searchTerm) {
        const searchLower = searchTerm.replace(/\s+/g, '').toLowerCase();
        this.filteredRows = this.dataRows.filter(row => {
            const cell = row.cells.get('Tournament Name');
            if (!cell) return false;

            const cellText = cell.domElement.textContent.toLowerCase();
    
            // Now check if cellText includes the search term.
            return cellText.includes(searchLower);
        });
    
        this.currentPage = 1;
        this.renderCurrentPage();
    }
    
    updateRowByIdentifier(identifier, newCells) {
        const rowIndex = this.rowIndexByIdentifier[identifier];
        if (rowIndex !== undefined && this.dataRows[rowIndex]) {
            const row = this.dataRows[rowIndex];
            newCells.forEach(newCell => {
                if (row.cells.has(newCell.header)) {
                    row.updateCell(newCell.header, newCell);
                } else {
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