// import '@css/tournament.css'
import AbstractView from "./AbstractView";
import DynamicTable from "@components/DynamicTable";
import TournamentTable from "@components/TournamentTable";
import ActionButton from "@components/ActionButton";
import NormalButton from '@components/NormalButton';
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';

export default class Tournament extends AbstractView {

	constructor() {
		super();

		this.createMatch = this.createMatch.bind(this);
		this.createTournament = this.createTournament.bind(this);		
		this.data = [];
	}

	async getHtml() {
		return `
			<div class="tournament">
				<div class="action-button">    
					<action-button 
            		    data-text=" ⚡ Play Now"
						id="createMatchButton"
						>
            		</action-button>
				</div>
				<div class="help">
					<start-btn
						data-text="CREATE"
						id="createTournamentButton"
						>
					</start-btn>
					<start-btn
						data-text="MANAGE"
						id="manageTournamentButton"
						>
					</start-btn>
				</div>
	                <tournament-table id="tournamentTable"></tournament-table>
			</div>
		`;
	}

	async init() {
		await this.getTournamentList();
		
		const tournamentTable =  document.querySelector('tournament-table');

		for (let  i = 0; i < 5; i++) {
			tournamentTable.addDummyRow();
		}

		//for each tournament in each data populate the table


		const createMatchButton = document.getElementById('createMatchButton');
		createMatchButton.addEventListener('click', this.createMatch);

		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		
	}

	async getTournamentList() { 
		try {
			const response = await makeApiRequest('https://localhost:9443/api/tournament/create-and-list/','GET', {});
			const tournaments = response.body;
			console.log('Tournament list:', response.body);
			
			// Transform the data
			if (tournaments.length === 0) {
				this.data = [];
				return;
			}
			// this.data = tournaments.map(tournament => ({
			// 	tournamentName: tournament.tournament_name,
			// 	host: tournament.host_id,
			// 	numberOfPlayers: `${tournament.nbr_of_player}/${tournament.nbr_of_player}`,
			// 	timeRemaining: '2:00', // Assuming a placeholder value
			// 	tournamentType: tournament.tournament_type === 1 ? 'Single Elimination' : 'Other Type', // Adjust as necessary
			// 	registrationMode: tournament.registration === 1 ? 'Open' : 'invitational', // Adjust as necessary
			// 	action: 'Join',
			// }));
        	// Modify how we map tournament data to table rows
        	this.data = tournaments.map(tournament => {
            	// Create a join button for each tournament
            	const joinButton = document.createElement('button');
            	joinButton.textContent = 'Join';
            	joinButton.addEventListener('click', () => this.joinTournament(tournament.id));
            	Object.assign(joinButton.style, this.columnStyles.action); // Apply styles

            	// Create host element (could be more complex, e.g., including an image)
            	const hostElement = document.createElement('div');
            	hostElement.textContent = `Host: ${tournament.host_id}`; // Example content
            	Object.assign(hostElement.style, this.columnStyles.host.container); // Apply styles

            	return {
            	    tournamentName: this.createStyledElement('div', tournament.tournament_name, this.columnStyles.tournamentName),
            	    host: hostElement, // Assuming you might want to include more than just text
            	    numberOfPlayers: `${tournament.nbr_of_player}/${tournament.nbr_of_player_required}`,
            	    timeRemaining: '2:00', // Placeholder
            	    tournamentType: tournament.tournament_type === 1 ? 'Single Elimination' : 'Other Type',
            	    registrationMode: tournament.registration === 1 ? 'Open' : 'Invitational',
            	    action: joinButton.outerHTML, // Assuming TournamentTable can handle HTML strings or you might append child directly
            	};
        	});
		} catch (error) {
			console.error('Failed to get tournament list:', error);
		}
	}

	async createMatch() {
		console.log('Create Match');
		const gameSettings = this.getGameSettings();
		try {
			const response = await makeApiRequest('https://localhost:9443/game-logic/createMatch','POST',gameSettings);
			console.log('Match created:', response.body);
			navigateTo('/play?matchID=' + response.body.matchID);
		} catch (error) {
			console.error('Failed to create match:', error);
		}
	}

	async createTournament() {
		navigateTo('/create-tournament');
	}

	getGameSettings() {
		return {
			"gamemodeData": {
			  "nbrOfPlayers": 7,
			  "nbrOfRounds": 1,
			  "timeLimit": 0
			},
			"fieldData": {
			  "wallsFactor": 1,
			  "sizeOfGoals": 20
			},
			"paddlesData": {
			  "width": 2,
			  "height": 12,
			  "speed": 0.5
			},
			"ballData": {
			  "speed": 0.7,
			  "radius": 1,
			  "color": "0xffffff",
			  "texture": "yridgway",
			},
			"playersData": [
			  {
				"accountID": "motero",
				"color": "0x0000ff"
			  },
			  {
				"accountID": "yridgway",
				"color": "0x00ff00"
			  },
			  {
				"accountID": "tata3",
				"color": "0x00ff00"
			  },
			  {
				"accountID": "tata4",
				"color": "0x0000ff"
			  },
			  {
				"accountID": "tata5",
				"color": "0x00ff00"
			  },
			  {
				"accountID": "tata6",
				"color": "0x00ff00"
			  },
			  {
				"accountID": "tata7",
				"color": "0x00ff00"
			  },
			]
		};
	}
}