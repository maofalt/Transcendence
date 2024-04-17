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
import easyFetch from "@utils/easyFetch";
import CustomButton from '@components/CustomButton';
import Overlay from '../components/Overlay';

export default class Tournament extends AbstractView {

	constructor() {
		super();
		this.data = [];
		this.createTournament = this.createTournament.bind(this);
		//initialize the overlay
	}

	getHtml() {
		return `
			<h2 id="tournament-page-title">Tournaments</h2>
			<div class="tournament">
			</div>
		`;
	}

	async init() {
		const tournamentDiv = document.querySelector('.tournament');
        this.overlay = new Overlay({});
		this.overlay.id = "custom-overlay";
        tournamentDiv.appendChild(this.overlay);
		
		this.tournamentTable = await this.getTournamentList();
		this.tournamentTable.setAttribute('id', 'tournamentTable');
		tournamentDiv.appendChild(this.tournamentTable);

		const createTournamentButton = this.tournamentTable.shadowRoot.getElementById('create-button');
		createTournamentButton.addEventListener('click', this.createTournament);
		/*
		For Miguel :
		you can get any button by doing the following :
		this.tournamentTable.shadowRoot.getElementById('<button id>');
		
		IDs for each element:
		create : "create-button";
		manage : "manage-button";
		search : "search-button";
		search bar : "search-bar";
		refresh : "refresh-button";
		
		I left the event listener instead of doing
		button.onclick = () => functionToCall;
		because for some reason it didnt work. the event listener works fine, so...
		*/
		
		const leaveButton = new CustomButton({content: "< Back", action : false,
		style: {
			position: "absolute",
			bottom: "30px",
			left: "50px",
			padding: "0px 15px"
		}});
		leaveButton.onclick = () => navigateTo("/");
		tournamentDiv.appendChild(leaveButton);

		const refreshTournamentButton = this.tournamentTable.shadowRoot.getElementById('refresh-button');
		refreshTournamentButton.addEventListener('click', async () => {
			// Remove the existing tournament table from the DOM.
			const tournamentDiv = document.querySelector('.tournament');
			tournamentDiv.removeChild(this.tournamentTable);
			
			// Call the function to create a new tournament table.
			this.tournamentTable = await this.getTournamentList();
			this.tournamentTable.setAttribute('id', 'tournamentTable');
			
			// Re-append the new tournament table to the DOM.
			tournamentDiv.appendChild(this.tournamentTable);
		
			// Re-attach the event listener to the create button on the new table.
			const createTournamentButton = this.tournamentTable.shadowRoot.getElementById('create-button');
			createTournamentButton.removeEventListener('click', this.createTournament);
			createTournamentButton.addEventListener('click', this.createTournament);
		
		});

	}

	async getTournamentList() { 
		//Create new table
		let tournamentTable = document.getElementById('tournament-table') || document.createElement('tournament-table');
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
	
	async createTournament() {
		navigateTo('/create-tournament');
	}


}