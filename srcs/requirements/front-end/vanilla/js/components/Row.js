import Cell from './Cell.js';

class Row {
    constructor(identifier, header) {
        this.identifier = identifier;
        this.cells = new Map();
        this.domElement = document.createElement('tr');
    }

    addCell(cellContent, header) {
        const newCell = new Cell(cellContent);
        this.cells.set(header, newCell);
        this.domElement.appendChild(newCell.domElement);
    }

    updateCell(header, newValue) {
        const cell = this.cells.get(header);
        if (cell) {
            cell.updateValue(newValue);
        }
    }
}

export default Row;