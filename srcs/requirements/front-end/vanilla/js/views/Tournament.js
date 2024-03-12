// import '@css/tournament.css'
import AbstractView from "./AbstractView";
import DynamicTable from "@components/DynamicTable";
import ActionButton from "@components/ActionButton";
import NormalButton from '@components/NormalButton';
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';

export default class Tournament extends AbstractView {

	constructor() {
		super();

		this.createMatch = this.createMatch.bind(this);
		this.createTournament = this.createTournament.bind(this);
		this.caption = 'Active Tournaments';
		
		this.headers = ['Tournament Name', 'Host', 'Number of Players', 'Time Remaining', 'Tournament Type', 'Registration Mode', 'Action'];
		
		this.columnStyles = {
			tournamentName: { 
				'font-weight': '700',
			 	'vertical-align': 'middle;',
				'padding': '1rem',
			},
			host: {
				container: {
					'display': 'flex',
					'align-items': 'center',
				},
				name: {
					'color': 'blue',
					'margin-left': '1rem',
				},
				imageUrl: {
					'witdh': '50px',
					'height': '50px',
					'border-radius': '50%',
				}
			},
			action: {
				'vertical-align': 'middle;',
				'text-align': 'center',
				'cursor': 'pointer',
			}
		};
		
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
	                <dynamic-table></dynamic-table>
			</div>
		`;
	}

	async init() {
		await this.getTournamentList();
		

		const dynamicTable =  document.querySelector('dynamic-table');
		dynamicTable.setAttribute('data-title', this.caption);
		dynamicTable.setAttribute('data-headers', JSON.stringify(this.headers));
		dynamicTable.setAttribute('data-style', JSON.stringify(this.columnStyles));
		dynamicTable.setAttribute('data-rows', JSON.stringify(this.data));

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
			this.data = tournaments.map(tournament => ({
				tournamentName: tournament.tournament_name,
				host: tournament.host_id,
				numberOfPlayers: `${tournament.nbr_of_player}/${tournament.nbr_of_player}`,
				timeRemaining: '2:00', // Assuming a placeholder value
				tournamentType: tournament.tournament_type === 1 ? 'Single Elimination' : 'Other Type', // Adjust as necessary
				registrationMode: tournament.registration === 1 ? 'Open' : 'invitational', // Adjust as necessary
				action: 'Join',
			}));
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