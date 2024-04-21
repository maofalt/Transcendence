class Cell {
    constructor(content) {
      this.domElement = document.createElement('td');
      this.content = content;
      this.updateValue(content);
    }
  
    updateValue(newValue) {
      //// console.log('Cell updateValue', newValue);
      this.domElement.innerHTML = '';
      if (newValue instanceof HTMLElement) {
        this.domElement.appendChild(newValue);
      } else {
        this.domElement.textContent = String(newValue);
      }
    }
  }

export default Cell;