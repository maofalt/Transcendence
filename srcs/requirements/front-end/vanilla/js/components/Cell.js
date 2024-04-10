class Cell {
    constructor(content) {
      this.content = content;
      this.domElement = document.createElement('td');
      this.updateValue(content);
    }
  
    updateValue(newValue) {
      this.domElement.innerHTML = '';
      if (newValue instanceof HTMLElement) {
        this.domElement.appendChild(newValue);
      } else {
        this.domElement.textContent = newValue;
      }
    }
  }

export default Cell;