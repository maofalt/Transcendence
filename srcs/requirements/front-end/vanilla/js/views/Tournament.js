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

export default class Tournament extends AbstractView {

	constructor() {
		super();

		this.createTournament = this.createTournament.bind(this);	
		this.joinTournament = this.joinTournament.bind(this);	
		this.data = [];
	}

	async getHtml() {
		return `
			<div class="tournament">
				</div>
				<div class="action-button">
					<action-button 
						data-text="CREATE"
						id="createTournamentButton"
						>
					</action-button >
				</div>
	                <tournament-table id="tournamentTable"></tournament-table>
			</div>
		`;
	}

	async init() {
		await this.getTournamentList();
		
		const tournamentTable =  document.querySelector('tournament-table');

		const createTournamentButton = document.getElementById('createTournamentButton');
		createTournamentButton.addEventListener('click', this.createTournament);
		
	}

	async getTournamentList() { 
		try {
			const response = await makeApiRequest('/api/tournament/create-and-list/','GET');
			const tournaments = response.body;
			if (!tournaments) 
				throw new Error('Failed to get tournament list');
			// Transform the data
			if (tournaments.length === 0) {
				this.data = [];
				return;
			}

			const responseUser = await makeApiRequest('/api/user_management/auth/getUser', 'GET');
			const userName = responseUser.body.username;

			await tournamentTable.applyColumnStyles();
			let Styles = tournamentTable.columnStyles;
			
			// Map API data to table rows and add them to the table
			tournaments.forEach(async (tournament) => {
				const response = await makeApiRequest(`/api/tournament/${tournament.id}/participants/`, 'GET');
				const participants = response.body;
				console.log("PARTICIPANTS", participants);
				if (participants.players_username.includes(userName)) {
					tournament.is_in_tournament = true;
				} else {
					tournament.is_in_tournament = false;
				}
			// TOURNAMENT STYLES APPLIED
				const tournamentNameElement = tournamentTable.createStyledHTMLObject('div', tournament.tournament_name, Styles.tournamentName);

			//TOURNAMENST HOST 
				//trying tor ecover the name id and the picture
				const hostName = tournament.host_name;
				const hostAvatarElement = document.createElement('host-avatar');
				hostAvatarElement.setAttribute('name', hostName);
				//APi call to recover host picture

				const hostElement = tournamentTable.createStyledHTMLObject('div', hostAvatarElement, Styles.host);
				//const hostElement = tournamentTable.createStyledHTMLObject('div', `${hostName}`, Styles.host);
			
			//TOURNAMENT PLAYERS OER TOURNAMENT AND PLACE AVAILABLE	
				const numberOfPlayersElement = tournamentTable.createStyledHTMLObject('div', `${tournament.joined}/${tournament.nbr_of_player_total}`, Styles.nbrOfPlayersTournament);
			
			// TOURNAMENT PLAYER  PER MATCH!!
				const componentNbrOfPlayers = document.createElement('number-of-players');
				componentNbrOfPlayers.setAttribute('nbrOfPlayers', tournament.nbr_of_player_match);	
				const numberOfPlayerPerMatch = tournamentTable.createStyledHTMLObject('div', componentNbrOfPlayers, Styles.nbrOfPlayersMatch);
			
			//TOURNAMENT STATUS	
				const tournamentStatus = tournamentTable.createStyledHTMLObject('div', `${tournament.state}`, Styles.state);
			
			//TOURNAMENT ACTION BUTTONS	
				//Join button on te action column to join corresponding tournament
				let buttonText = '';
				let buttonEvent = null;
				
				if (hostName === userName && tournament.state === 'waiting') {
					console.log("TOURNAMENT IS WAITING", tournament);
					buttonText = 'Start';
					buttonEvent = async () => {
						const apiEndpoint = `/api/tournament/${tournament.id}/start/`;
						await makeApiRequest(apiEndpoint, 'POST');
					};
				} else if (tournament.is_in_tournament && tournament.state === 'started') {
					buttonText = 'Play';
					buttonEvent = () => navigateTo('/play?matchID=' + tournament.setting.id);
				} else if (tournament.is_in_tournament && tournament.state === 'waiting') {
					buttonText = 'Waiting';

				} else {
					buttonText = 'Join';
					buttonEvent = async () => await this.joinTournament(tournament.id);
				}
				const actionButtonElement = tournamentTable.createStyledHTMLObject('button', buttonText, Styles.action);				
				if (buttonEvent) {
					actionButtonElement.onclick = buttonEvent;
				}

			//TOURNAMENT Details button to see the tournament state (either brackets and or results) opening th emodal
				const tournamentDetails = tournamentTable.createStyledHTMLObject('button', '👁️', Styles.details);
				tournamentDetails.addEventListener('click', () => {
					navigateTo(`/brackets?tournament=${tournament.id}`);
					// console.log(`SOMEONE IS WATCHING 👁️ 👁️`);
				});

				//Add the constructed row to the table
				tournamentTable.addRow([
					tournamentNameElement,
					hostElement,
					numberOfPlayersElement,
					numberOfPlayerPerMatch,
					tournamentStatus,
					actionButtonElement,
					tournamentDetails
				]);
			});

		} catch (error) {
			console.error('Failed to get tournament list:', error);
		}
	}


	async createTournament() {
		navigateTo('/create-tournament');
	}

	async joinTournament(tournamentID) {
	
		try {
			const responseUser = await makeApiRequest(`/api/user_management/auth/getUser`,'GET');
			const userID = responseUser.body.user_id;
			const apiEndpoint = `/api/tournament/add-player/${tournamentID}/${userID}/`;
			const response = await makeApiRequest(apiEndpoint,'POST');
			//navigateTo('/play?matchID=' + response.body.matchID);
		} catch (error) {
			console.error('Failed to join tournament:', error);
		}
	}


}