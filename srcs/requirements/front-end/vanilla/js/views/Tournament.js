import '@css/tournament.css'
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

		this.createTournament = this.createTournament.bind(this);	
		this.joinTournament = this.joinTournament.bind(this);	
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
		
		const tournamentTable = await this.getTournamentList();
		tournamentTable.setAttribute('id', 'tournamentTable');		
		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		const tournamentDiv = document.querySelector('.tournament');
		tournamentDiv.appendChild(tournamentTable);
	}

	async getTournamentList() { 
		//Create new table
		let tournamentTable = document.createElement('tournament-table');
		
		try {
			const response = await makeApiRequest('/api/tournament/create-and-list/','GET');
			let tournaments = response.body;
			if (!tournaments) 
			{	
				displayPopup('Action failed:', 'Failed to get tournament list');
				throw new Error('Failed to get tournament list');
			}
			if (tournaments.length === 0) {
				this.data = [];
				return;
			}
	
			const responseUser = await makeApiRequest('/api/user_management/auth/getUser', 'GET');
			const userName = responseUser.body.username;
	
			await tournamentTable.applyColumnStyles();
			let Styles = tournamentTable.columnStyles;
			
			// Sort tournaments by state: 'waiting' first, then 'started', and finally 'ended'
			tournaments.sort((a, b) => {
				if (a.state === 'waiting' && (b.state === 'started' || b.state === 'ended')) return -1;
				if ((a.state === 'started' || a.state === 'ended') && b.state === 'waiting') return 1;
				return 0;
			});

			// Map API data to table rows and add them to the table
			for (let i = 0; i < tournaments.length; i++) {
				const tournament = tournaments[i];
				try {
					const response = await makeApiRequest(`/api/tournament/${tournament.id}/participants/`, 'GET');
					const participants = response.body;

					if (participants.players_username.includes(userName)) {
						tournament.is_in_tournament = true;
					} else {
						tournament.is_in_tournament = false;
					}
					// TOURNAMENT STYLES APPLIED
					const tournamentNameElement = tournamentTable.createStyledHTMLObject('div', tournament.tournament_name, Styles.tournamentName);
	
					// TOURNAMENST HOST 
					//trying tor ecover the name id and the picture
					const hostName = tournament.host_name;
					const hostAvatarElement = document.createElement('host-avatar');
					hostAvatarElement.setAttribute('name', hostName);
					//APi call to recover host picture
	
					const hostElement = tournamentTable.createStyledHTMLObject('div', hostAvatarElement, Styles.host);
					//const hostElement = tournamentTable.createStyledHTMLObject('div', `${hostName}`, Styles.host);
	
					// TOURNAMENT PLAYERS OER TOURNAMENT AND PLACE AVAILABLE    
					const numberOfPlayersElement = tournamentTable.createStyledHTMLObject('div', `${tournament.joined}/${tournament.nbr_of_player_total}`, Styles.nbrOfPlayersTournament);
	
					// TOURNAMENT PLAYER  PER MATCH!!
					const componentNbrOfPlayers = document.createElement('number-of-players');
					componentNbrOfPlayers.setAttribute('nbrOfPlayers', tournament.nbr_of_player_match);
					const numberOfPlayerPerMatch = tournamentTable.createStyledHTMLObject('div', componentNbrOfPlayers, Styles.nbrOfPlayersMatch);
	
					// TOURNAMENT STATUS    
					const tournamentStatus = tournamentTable.createStyledHTMLObject('div', `${tournament.state}`, Styles.state);
	
					// TOURNAMENT ACTION BUTTONS    
					//Join button on te action column to join corresponding tournament
					let buttonText = '';
					let buttonEvent = null;
	
					if (hostName === userName && tournament.state === 'waiting') {
						buttonText = 'Start';
						buttonEvent = async () => {
							const apiEndpoint = `/api/tournament/${tournament.id}/start/`;
							await makeApiRequest(apiEndpoint, 'POST');
						};
					} else if (tournament.is_in_tournament && tournament.state === 'started') {
						buttonText = 'Play';
						buttonEvent = () => navigateTo('/play?matchID=' + tournament.setting.id);
					} else if (tournament.is_in_tournament && tournament.state === 'waiting') {
						buttonText = 'Unjoin';
						// ADD UNJOIN ENDPOINT HERE
					} else {
						buttonText = 'Join';
						buttonEvent = async () => await this.joinTournament(tournament.id);
					}
					const actionButtonElement = tournamentTable.createStyledHTMLObject('button', buttonText, Styles.action);
					if (buttonEvent) {
						actionButtonElement.onclick = buttonEvent;
					}
	
					// TOURNAMENT Details button to see the tournament state (either brackets and or results) opening th emodal
					const tournamentDetails = tournamentTable.createStyledHTMLObject('button', '👁️', Styles.details);
					tournamentDetails.addEventListener('click', () => {
						navigateTo(`/brackets?tournament=${tournament.id}`);
					});
	
					// Add the constructed row to the table
					tournamentTable.addRow([
						tournamentNameElement,
						hostElement,
						numberOfPlayersElement,
						numberOfPlayerPerMatch,
						tournamentStatus,
						actionButtonElement,
						tournamentDetails
					]);
				} catch (error) {
					console.error('Failed to get tournament list:', error);
					displayPopup('Action failed:', error);
				}
			}
			
		} catch (error) {
			console.error('Error:', error);
			
		}
		return tournamentTable;
	}
	
	async createTournament() {
		navigateTo('/create-tournament');
	}

	async joinTournament(tournamentID) {
		let userID;
	
		// Attempt to fetch user details
		try {
			const responseUser = await makeApiRequest(`/api/user_management/auth/getUser`, 'GET');
			if (responseUser.status >= 400) { 
				throw new Error('Failed to fetch user details.');
			}
			userID = responseUser.body.user_id;
		} catch (error) {
			console.error('Error fetching user details:', error);
			displayPopup(error.message, 'error');
			return;
		}
		// Attempt to add player to tournament
		try {
			const apiEndpoint = `/api/tournament/add-player/${tournamentID}/${userID}/`;
			const response = await makeApiRequest(apiEndpoint, 'POST');
			console.log(response);
			if (response.status >= 400) { 
				throw new Error('Failed to join tournament: ' + response.errorMessage);
			}
			displayPopup('Successfully joined the tournament!', 'success');
			//navigateTo('/play?matchID=' + response.body.matchID); // Assuming navigation is desired on success
		} catch (error) {
			console.error('Error joining tournament:', error);
			displayPopup(error.message, 'error');
		}
	}
	

}