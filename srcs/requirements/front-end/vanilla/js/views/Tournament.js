import '@css/tournament.css'
import AbstractView from "./AbstractView";
import DynamicTable from "../components/DynamicTable";
import ActionButton from "../components/ActionButton";
import { makeApiRequest } from '@utils/makeApiRequest.js';

export default class Tournament extends AbstractView {

	constructor() {
		super();

		this.createMatch = this.createMatch.bind(this);
		this.caption = 'Active Tournaments';
		
		this.headers = ['Tournament Name', 'Host', 'Number of Players', 'Time Remaining', 'Tournament Type', 'Registration Mode', 'Action'];
		
		this.columnStyles = {
			tournamentName: { 
				'font-weight': '700',
			 	'vertical-align': 'middle;',
				'padding': '1rem'
			},
			host: {
				container: {
					'display': 'flex',
					'align-items': 'center'
				},
				name: {
					'color': 'blue',
					'margin-left': '1rem'
				},
				imageUrl: {
					'witdh': '50px',
					'height': '50px',
					'border-radius': '50%'
				}
			},
			action: {
				'vertical-align': 'middle;',
				'text-align': 'center',
				'cursor': 'pointer'
			}
		};
		
		this.data= [
			{	
				tournamentName: 'Tournament 1',
				host: {
					name: "<a href='https://profile.intra.42.fr/users/motero' class='host-link'>Host 1 Name</a>",
					imageUrl: "<a href='https://cdn.intra.42.fr/users/f49a1258c4dc41d9f9e02192cc9c5e63/motero.JPG' class='host-image'>"
				},
				numberOfPlayers: '2/4',
				timeRemaining: '2:00',
				tournamentType: 'Single Elimination',
				registrationMode: 'Open',
				action: 'Join'
			},
			{	
				tournamentName: 'Tournament 2',
				host: 'Host 2',
				numberOfPlayers: '5/4',
				timeRemaining: '2:00',
				tournamentType: 'Single Elimination',
				registrationMode: 'Open',
				action: 'Join'
			},
			{	
				tournamentName: 'Tournament 2',
				host: 'Host 2',
				numberOfPlayers: '5/4',
				timeRemaining: '2:00',
				tournamentType: 'Single Elimination',
				registrationMode: 'Open',
				action: 'Join'
			},
		];
	}

	async getHtml() {
		//await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 3 seconds
		return `
			<div class="card">
			    <action-button 
                    data-text="Play Now"
					id="createMatchButton">
                </action-button>
                <dynamic-table></dynamic-table>
			</div>
		`;
	}

	async init() {
		const dynamicTable =  document.querySelector('dynamic-table');
		dynamicTable.setAttribute('data-title', this.caption);
		dynamicTable.setAttribute('data-headers', JSON.stringify(this.headers));
		dynamicTable.setAttribute('data-style', JSON.stringify(this.columnStyles));
		dynamicTable.setAttribute('data-rows', JSON.stringify(this.data));

		const createMatchButton = document.getElementById('createMatchButton');
		createMatchButton.addEventListener('click', this.createMatch);
	}

	async createMatch() {
		console.log('Create Match');
		const gameSettings = this.getGameSettings();
		try {
			const response = await makeApiRequest('https://localhost:9443/game-logic/createMatch','POST',gameSettings);
			console.log('Match created:', response.body);
		} catch (error) {
			console.error('Failed to create match:', error);
		}
	}

	getGameSettings() {
		return {
			"gamemodeData": {
			  "nbrOfPlayers": 6,
			  "nbrOfRounds": 5,
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
			  "color": "0xffffff"
			},
			"playersData": [
			  {
				"accountID": "player1",
				"color": "0x0000ff"
			  },
			  {
				"accountID": "player2",
				"color": "0x00ff00"
			  },
			  {
				"accountID": "player3",
				"color": "0xff0000"
			  },
			  {
				"accountID": "player4",
				"color": "0xff00ff"
			  },
			  {
				"accountID": "player5",
				"color": "0x00ffff"
			  },
			  {
				"accountID": "player6",
				"color": "0xffff00"
			  }
			]
		};
	}
}