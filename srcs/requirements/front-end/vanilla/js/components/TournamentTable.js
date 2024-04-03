import BaseTable from "@components/BaseTable";

class TournamentTable extends BaseTable {
    constructor() {
        super();
        this.setHeaders(['Tournament Name', 'Host', 'Number of Players', 'Players Per Match', 'Status', 'Action', 'Details']);
        this.applyColumnStyles = this.applyColumnStyles.bind(this);
    }


    //Method apply styles to the hable columns
    async applyColumnStyles() {
        this.columnStyles = {
            tournamentName: {
                'font-weight': '700',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            host: {
                'display': 'block',
                'vertical-align': 'middle',
                'text-align': 'center',
                'color': '#008000',
            },
            nbrOfPlayersTournament: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            nbrOfPlayersMatch: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            state: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            action: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
                'cursor': 'pointer',
            },
            details: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
        };
    }

    //Method to create a style HTMl object (e.g. a button)
    createStyledHTMLObject = (tagName, content, style) => {
        const element = document.createElement(tagName);
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }

        //Apply styles
        Object.assign(element.style, style);
        return element;
    }

    // Example method to add a row with dummy values and styled elements
    addDummyRow = () => {
        const tournamentName = this.createStyledHTMLObject('div', 'Tournament XYZ', '');
        const host = this.createStyledHTMLObject('div', 'Host Name', '');
        const numberOfPlayers = '32/64'; // Simple text example
        const timeRemaining = '10:00'; // Simple text example
        const tournamentType = 'Single Elimination'; // Simple text example
        const registrationMode = 'Open'; // Simple text example
        const joinButton = this.createStyledHTMLObject('button', 'Join', this.columnStyles.action);
        joinButton.addEventListener('click', () => console.log('Join clicked'));

        this.addRow([tournamentName, host, numberOfPlayers, timeRemaining, tournamentType, registrationMode, joinButton]);
    }
}

customElements.define('tournament-table', TournamentTable);
export default TournamentTable;