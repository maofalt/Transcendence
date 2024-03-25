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
		this.joinTournament = this.joinTournament.bind(this);	
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
		const createMatchButton = document.getElementById('createMatchButton');
		createMatchButton.addEventListener('click', this.createMatch);

		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		
	}

	async getTournamentList() { 
		try {
			const response = await makeApiRequest('/api/tournament/create-and-list/','GET');
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
				const numberOfPlayersElement = tournamentTable.createStyledHTMLObject('div', `${tournament.joined}/${tournament.nbr_of_player_total}`, {}); 
				const timeRemainingElement = tournamentTable.createStyledHTMLObject('div', `${tournament.registration_period_min}`, {});
				const tournamentTypeElement = tournamentTable.createStyledHTMLObject('div', `${tournament.tournament_type}`);
				const registrationModeElement = tournamentTable.createStyledHTMLObject('div', tournament.registration, {});
				const actionContainer = document.createElement('div');
				//container for all button actions 
				actionContainer.style.display = 'flex';
				actionContainer.style.justifyContent = 'space-around';
				//Join button on te action column to join corresponding tournament
				const joinButtonElement = document.createElement('button');
				joinButtonElement.textContent = 'Join';
				Object.assign(joinButtonElement.style, Styles.action);
				joinButtonElement.addEventListener('click', () => this.joinTournament(tournament.id));
				// Details button to see the tournament state (either brackets and or results)
				const viewButtonElement = document.createElement('button');
				viewButtonElement.innerHTML = '👁️';
				Object.assign(viewButtonElement.style, Styles.action);
				viewButtonElement.addEventListener('click', () => 
					console.log(`SOME IS WATCHING 👁️ 👁️ `)
					);

				actionContainer.appendChild(joinButtonElement);
				actionContainer.appendChild(viewButtonElement);
				// Add the constructed row to the table
				tournamentTable.addRow([
					tournamentNameElement, 
					hostElement, 
					numberOfPlayersElement, 
					timeRemainingElement, 
					tournamentTypeElement, 
					registrationModeElement, 
					actionContainer
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
			const response = await makeApiRequest('/game-logic/createMatch','POST',gameSettings);
			console.log('Match created:', response);
			navigateTo('/play?matchID=' + response.body.matchID);
		} catch (error) {
			console.error('Failed to create match:', error);
		}
	}

	async createTournament() {
		navigateTo('/create-tournament');
	}

	async joinTournament(tournamentID) {
	
		try {
			const responseUser = await makeApiRequest(`/api/user_management/auth/getUser`,'GET');
			console.log('User:', responseUser.body);
			const userID = responseUser.body.user_id;
			const apiEndpoint = `/api/tournament/add-player/${tournamentID}/${userID}/`;
			const response = await makeApiRequest(apiEndpoint,'POST');
			//navigateTo('/play?matchID=' + response.body.matchID);
		} catch (error) {
			console.error('Failed to join tournament:', error);
		}
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