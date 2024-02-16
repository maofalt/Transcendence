import '@css/tournament.css'
import AbstractView from "./AbstractView";
<<<<<<< HEAD
// import DynamicTable from "../components/DynamicTable";

export default class Tournament extends AbstractView {
	constructor(element) {
		super(element);
		// this.dynamicTable = new DynamicTable();
	}

	async getHtml() {
		// await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds
		console.log("path: ", document.location.origin);
		history.replaceState(null, null, document.location.origin + '/api/tournament/create-and-list/');
		window.location.href = document.location.origin + '/api/tournament/create-and-list/';
		return `
			<div class="card">
				<h1>Tournament</h1>
				<div id="dynamic-table-container"></div>
			</div>
		`;
	}

	async init() {
		// document.getElementById('dynamic-table-container').appendChild(this.dynamicTable.render());
	}

	async destroy() {
		// if (this.dynamicTable)
			// this.dynamicTable.destroy();
	}

=======
import { makeApiRequest } from '@utils/makeApiRequest.js';

export default class Tournament extends AbstractView {
    constructor(element) {
        super(element);
        this.element = element;
    }

    appendChildren(parent, ...children) {
        children.forEach(child => {
            parent.appendChild(child);
        });
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

        // const elems = [];

        const titleElement = this.createElement('h1', null, 'Tournament');
        // const deleteButton = this.createElement('a', { id: 'deleteButton', class: 'deleteButton', href: '/create-and-list' }, "delete");

        const tournamentListTable = this.createElement('table', { id: 'tournament-list-table' });
        const tableHead = this.createElement('thead', { id: 'tournament-list-head' });
        const tableBody = this.createElement('tbody', { id: 'tournament-list-body' });
        const headRow = this.createElement('tr', { id: 'tournament-head-row' });
        const bodyRow1 = this.createElement('tr', { id: 'tournament-body-row1' });
        const bodyRow2 = this.createElement('tr', { id: 'tournament-body-row2' });
        
        this.appendChildren(headRow, 
            this.createElement('td', null, 'Month'), 
            this.createElement('td', null, 'Savings'));

        this.appendChildren(bodyRow1, 
            this.createElement('td', null, 'January'), 
            this.createElement('td', null, '$100'));
        
        this.appendChildren(bodyRow2, 
            this.createElement('td', null, 'Febuary'), 
            this.createElement('td', null, '$80'));

        this.appendChildren(tableBody, bodyRow1, bodyRow2)

        this.appendChildren(tableHead, headRow);

        this.appendChildren(tournamentListTable,
            tableHead,
            tableBody);

        // headRow.appendChild(this.createElement('td', null, 'Month'));
        // headRow.appendChild(this.createElement('td', null, 'Savings'));
        
        // Ajout des éléments créés au conteneur
        this.appendChildren(tournamentContainer, 
            titleElement,
            // deleteButton, 
            tournamentListTable);

        // get info from tournament api
        try {
            const response = await makeApiRequest('api/tournament/create-and-list/', 'GET');
            console.log('Status Code:', response.status);
            console.log('Response Body:', response.body);
        } catch (error) {
            console.error('Request Failed:', error);
        }

        const htmlContent = tournamentContainer.innerHTML;

        // Retour du HTML
        return htmlContent;
        return `
        <style>
        table, th, td {
            border: 1px solid white;
        }
        </style>
        <table>
            <thead>
                <tr>
                <th>Month</th>
                <th>Savings</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>January</td>
                <td>$100</td>
                </tr>
                <tr>
                <td>February</td>
                <td>$80</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                <td>Sum</td>
                <td>$180</td>
                </tr>
            </tfoot>
        </table>
        `;
    }
>>>>>>> 18e9b5ffa1150d3841e7ce8cb63b25498b2a5c6c
}