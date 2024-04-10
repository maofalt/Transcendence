import '@css/tournament.css';
import AbstractView from "./AbstractView";
import DynamicTable from "@components/DynamicTable";
import TournamentTable from "@components/TournamentTable";
import ActionButton from "@components/ActionButton";
import NormalButton from '@components/NormalButton';
import HostAvatar from '@components/HostAvatar';
import NumberOfPlayers from '@components/NumberOfPlayers';
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';
import displayPopup from '@utils/displayPopup';


export default class Tournament extends AbstractView {

	constructor() {
		super();
		this.data = [];
	}

	getHtml() {
		return `
			<div class="tournament">
				<div class="action-button">
					<action-button 
						data-text="CREATE"
						id="createTournamentButton"
					</action-button>
				</div>
			</div>
		`;
	}

	async init() {
		
		this.tournamentTable = await this.getTournamentList();
		this.tournamentTable.setAttribute('id', 'tournamentTable');		
		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		const tournamentDiv = document.querySelector('.tournament');
		tournamentDiv.appendChild(this.tournamentTable);
	}

	async getTournamentList() { 
		//Create new table
		let tournamentTable = document.createElement('tournament-table');
		let tournaments = {};
		try {
			const response = await makeApiRequest('/api/tournament/create-and-list/','GET');
			tournaments = response.body;
			console.log(tournaments);
			if (!tournaments) 
			{	
				displayPopup('Action failed:', 'Failed to get tournament list');
				throw new Error('Failed to get tournament list');
			}
			if (tournaments.length === 0) {
				this.data = [];
				return;
			}
		} catch(error) {
			console.error('Fetching Tournaments Error: ', error);
		}

		let userName = '';
		try {
			const responseUser = await makeApiRequest('/api/user_management/auth/getUser', 'GET');
			userName = responseUser.body.username;
		} catch(error) {
			console.error('Fetching User Info Error: ', error);
		}

		tournamentTable.applyColumnStyles();
		await tournamentTable.setTournamentData(tournaments, userName);
			
		return tournamentTable;
	}
	


}