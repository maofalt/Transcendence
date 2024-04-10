import Cell from './Cell.js';

class Row {
    constructor(identifier) {
        this.identifier = identifier;
        this.cells = [];
        this.domElement = document.createElement('tr');
    }

    addCell(cell) {
        const newCell = newCell(cellContent);
        this.cells.push(cell);
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