import AbstractView from "./AbstractView";

export default class Tournament extends AbstractView {
	constructor(element) {
		super(element);
		this.element = element; 
	}

	createElement(tag, attributes, content) {
        const element = document.createElement(tag);
		// const tournamentElement = document.getElementById('tournamentContainer');
		// const tournamentView = new Tournament(tournamentElement);

        // Ajout des attributs à l'élément
        if (attributes) {
            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
        }

        // Ajout du contenu à l'élément
        if (content) {
            element.innerHTML = content;
        }

        return element;
    }

	// Fonction pour obtenir le HTML
	async getHtml() {
        const tournamentContainer = this.createElement('div', { id: 'tournamentContainer' });

        const titleElement = this.createElement('h1', null, 'Tournament');
		const deleteButton = this.createElement('a', { id: 'deleteButton', class: 'deleteButton', href: 'https://google.com'}, "delete");

        // Ajout des éléments créés au conteneur
        tournamentContainer.appendChild(titleElement);
		tournamentContainer.appendChild(deleteButton);

        const htmlContent = tournamentContainer.innerHTML;

        // Retour du HTML
        return htmlContent;
	}
}