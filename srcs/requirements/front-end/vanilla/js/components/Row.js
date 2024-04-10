import Cell from './Cell.js';

class Row {
    constructor(identifier) {
        this.identifier = identifier;
        this.cells = [];
        this.domElement = document.createElement('tr');
    }

    addCell(cell) {
        const newCell = new Cell(cell);
        this.cells.push(newCell);
        this.domElement.appendChild(cell.domElement);
    }

    // updateCell(cellIndex, newValue) {
    //     if(this.cells[cellIndex]) {
    //         this.cells[cellIndex].updateValue(newValue);
    //     } else {
    //         console.error(`Cell at index ${cellIndex} does not exist.`);
    //     }
    // }
}

export default Row;