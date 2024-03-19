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

		// for (let  i = 0; i < 0; i++) {
		// 	tournamentTable.addDummyRow();
		// }

		//for each tournament in each data populate the table


		const createMatchButton = document.getElementById('createMatchButton');
		createMatchButton.addEventListener('click', this.createMatch);

		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		
	}

	async getTournamentList() { 
		try {

			const accessToken = localStorage.getItem('accessToken');
			

			const response = await makeApiRequest('/api/tournament/create-and-list/','GET', null, {}, accessToken);
			const tournaments = response.body;
			console.log('Tournament list:', response.body);
			
			// Transform the data
			if (tournaments.length === 0) {
				this.data = [];
				return;
			}

			 // Map API data to table rows and add them to the table
			 tournaments.forEach(tournament => {
				console.log('Tournament:', tournament);
				const Styles = tournamentTable.columnStyles;
				const tournamentNameElement = tournamentTable.createStyledHTMLObject('div', tournament.tournament_name, Styles.tournamentName);
				const hostElement = tournamentTable.createStyledHTMLObject('div', `Host ${tournament.host_id}`, Styles.host);
				//64
				const numberOfPlayersElement = tournamentTable.createStyledHTMLObject('div', `0/${tournament.nbr_of_player_total}`, {}); 
				const timeRemainingElement = tournamentTable.createStyledHTMLObject('div', '2:00', {}); // Placeholder for time remaining
				const tournamentTypeElement = tournamentTable.createStyledHTMLObject('div', tournament.tournament_type === 1 ? 'Single Elimination' : 'Other Type', {});
				const registrationModeElement = tournamentTable.createStyledHTMLObject('div', tournament.registration === 1 ? 'Open' : 'Invitational', {});
				const joinButtonElement = document.createElement('button');
				joinButtonElement.textContent = 'Join';
				Object.assign(joinButtonElement.style, Styles.action);
				joinButtonElement.addEventListener('click', () => this.joinTournament(tournament.id));
			
				// Add the constructed row to the table
				tournamentTable.addRow([
					tournamentNameElement.outerHTML, 
					hostElement.outerHTML, 
					numberOfPlayersElement.outerHTML, 
					timeRemainingElement.outerHTML, 
					tournamentTypeElement.outerHTML, 
					registrationModeElement.outerHTML, 
					joinButtonElement.outerHTML
				]);
			});

		} catch (error) {
			console.error('Failed to get tournament list:', error);
		}
	}

	async createMatch() {
		console.log('Create Match');
		const gameSettings = this.getGameSettings();
		try {
			const response = await makeApiRequest('/game-logic/createMatch','POST',gameSettings );
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
			  "model": "banana",
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