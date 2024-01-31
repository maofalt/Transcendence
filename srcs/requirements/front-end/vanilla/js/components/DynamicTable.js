class DynamicTable {
    constructor() {
        // TODO
    }
    
    /**
     * Loads the Bootstrap CSS file dynamically by creating a link element and appending it to the document head.
     * @function loadBootstrap
     * @returns {void}
     */
    loadBootstrap() {
        const loadBootstrap = 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'
        const link = document.createElement('link');
        link.href = loadBootstrap;
        link.rel = 'stylesheet';
        link.id  = 'bootstrap-css';
        document.head.appendChild(link);
    }

    unloadBootstrap() {
        const bootstrapLink = document.getElementById('bootstrap-css');
        if (bootstrapLink) {
            //bootstrapLink.head.removeChild(bootstrapLink);
            document.head.removeChild(bootstrapLink);
        }
    }

    render() {
        this.loadBootstrap();

        //Crea tea simple Bootrrape-syled element
        const container = document.createElement('div');
        container.className = 'boostrap-container';
        container.innerHTML = '<div class="alert alert-info">Dynamic Table Component</div';
        
        return container;
    }

    destroy() {
        this.unloadBootstrap();
    }
}

export default DynamicTable;