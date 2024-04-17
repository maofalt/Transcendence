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
        this.ascending = [];
        //Design buttons
        this.createButton = new CustomButton({content: "Create", action: true});
        this.createButton.id = "create-button";
        
        this.manageButton = new CustomButton({content: "Manage", action: false});
        this.manageButton.id = "manage-button";

        this.midSpace = document.createElement("div");
        this.midSpace.id = "mid-space";

        this.searchBar = document.createElement("input");
        this.searchBar.id = "search-bar";
        this.searchBar.placeholder = "Tournament name";

        this.refreshButton = new CustomButton({content: "Refresh", action: false});
        this.refreshButton.id = "refresh-button";

        //Appending all new buttons
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.createButton);
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.manageButton);
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.midSpace);        
        this.shadowRoot.querySelector("#buttons-bar").appendChild(this.searchBar);
        this.shadowRoot.querySelector(".pagination-controls").appendChild(this.refreshButton);
        
        //Attach searching fonction to the compoenent
        this.searchBar.addEventListener('keyup', () => this.filterRows(this.searchBar.value));
    }

    //Utility to set column styles
    setColumnStyles(styles) {
        this.columnStyles = styles;
    }


    //Utility to inject headers
    setHeaders(headers) {
        let tableHeaders = this.shadowRoot.getElementById('table-headers');
        tableHeaders.innerHTML = '';
        
        headers.forEach(header => {
            // Create the header cell
            let th = document.createElement('th');
            let div = document.createElement('div');
            div.textContent = header;
            div.style.display = 'inline';
            div.style.marginRight = '5px';

            // Create the sort icon
            let sortSpan = document.createElement('span');
            sortSpan.textContent = this.ascending[header] ? '🔼' : '🔽';
            sortSpan.style.cursor = 'pointer';
            sortSpan.addEventListener('click', () => this.sortColumn(header));
            
            // Append the text div and sort span to the header cell
            th.appendChild(div);
            th.appendChild(sortSpan);
            
            // Append the header cell to the table headers
            tableHeaders.appendChild(th);
        });
    }

    sortColumn(header) {
        // Toggle sort direction
        //console.log("Sorting by:", header);
        if (this.ascending[header] === undefined)
            this.ascending[header] = true;
        else {
            this.ascending[header] = !this.ascending[header];
        }
        //selec tthe right header and change the icon for only that header
        const headerCells = this.shadowRoot.getElementById('table-headers').querySelectorAll('th');
        headerCells.forEach(cell => {
            const cellText = cell.querySelector('div').textContent;
            if (cellText === header) {
                cell.querySelector('span').textContent = this.ascending[header] ? '🔼' : '🔽';
            }
        });

        // Get all rows as an array of objects containing the row and its sort key
        const rowContent= [];
        const rowData = this.dataRows.map(row => {
            rowContent.push(row.cells.get(header)?.domElement.textContent || "");
            return {
                row: row,
                key: (row.cells.get(header)?.domElement.textContent || "").trim()
            };
        });
        //console.log(rowContent);
        // Apply natural sort algorithm
        rowData.sort((a, b) => this.naturalSort(a.key, b.key));
        //console.log("sorted", rowData);
        rowContent.sort((a,b) => this.naturalSort(a,b));
        //console.log("sorted", rowContent);
        // If descending sort, reverse the array
        if (!this.ascending[header]) rowData.reverse();
        //console.log("sorted", rowData);
        // Set sorted rows back to dataRows
        this.dataRows = rowData.map(item => item.row);
        //console.log("sorted", this.dataRows);

        // // Rebuild rowIndexByIdentifier and totalRows
        this.updateRowsPostSort();
        //console.log("Final sorted rows:", this.dataRows.map(row => row.cells.get(header)?.domElement.textContent.trim()));

        // Re-render the page to show the sorted rows
        this.renderCurrentPage();
    }

    naturalSort(a, b) {
        const ax = [], bx = [];

        a.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]) });
        b.replace(/(\d+)|(\D+)/g, function(_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]) });

        while (ax.length && bx.length) {
            const an = ax.shift();
            const bn = bx.shift();
            const nn = (an[0] === bn[0] ? an[1].localeCompare(bn[1]) : (an[0] - bn[0]));
            if (nn) return nn;
        }

        return ax.length - bx.length;
    }

    updateRowsPostSort() {
        // Clear the table body to reorder the elements
        const tableBody = this.shadowRoot.querySelector('#table-body');
        tableBody.innerHTML = '';  // Remove all child nodes
    
        this.totalRows = this.dataRows.map(row => row.domElement);
    
        // Re-append each row element in the new order to the DOM
        this.totalRows.forEach(rowElement => {
            tableBody.appendChild(rowElement);
        });
    
        // Update rowIndexByIdentifier based on the new order
        this.rowIndexByIdentifier = {};
        this.dataRows.forEach((row, index) => {
            this.rowIndexByIdentifier[row.identifier] = index;
        });
    }
    

    addRow(cells, identifier) {
        const newRow = new Row(identifier);
        cells.forEach(cellContent => {
            newRow.addCell(cellContent, cellContent.header);
        });
        this.dataRows.push(newRow);
        this.totalRows.push(newRow.domElement);
        newRow.domElement.style.display = 'none';
        this.shadowRoot.querySelector('#table-body').appendChild(newRow.domElement);

        if (identifier) {
            this.rowIndexByIdentifier[identifier] = this.totalRows.length - 1;
        }
    }

    connectedCallback() {
        this.shadowRoot.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderCurrentPage();
            }
        });
        this.shadowRoot.getElementById('next-page').addEventListener('click', () => {
            const maxPage = Math.ceil(this.dataRows.length / this.itemsPerPage);
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
            //console.log("filtered rows");
            rowsToShow = this.filteredRows.map(row => row.domElement).slice(startIndex, endIndex);
        } else {
            //console.log("total rows");
            rowsToShow = this.totalRows.slice(startIndex, endIndex);
        }
        // console.log("Rows to Show:", rowsToShow.map(row => {
        //     // Extract text from cells under the "Tournament Name" header
        //     const cell = row.querySelector('td'); // Assuming the "Tournament Name" is the first cell if no specific class or attribute identifies it
        //     return cell ? cell.textContent.trim() : "No data for header";
        // }));
        // Check if the row is defined before trying to change its display property
        rowsToShow.forEach(row => {
            if (row) {
                const cell = row.querySelector('td');
                //console.log("Row to show:", cell ? cell.textContent.trim() : "No data for header");
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
        //console.log('Updating row with identifier:', identifier);
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
           // console.log(`Row with identifier ${identifier} not found.`);
            console.error(`Row with identifier ${identifier} not found.`);
        }
    }

}

customElements.define('base-table', BaseTable);
export default BaseTable;