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

        // Initial setup of the tournament table
        await this.setupTournamentTable(tournamentDiv);

        const leaveButton = new CustomButton({
            content: "< Back", action: false,
            style: {
                position: "absolute",
                bottom: "30px",
                left: "50px",
                padding: "0px 15px"
            }
        });
        leaveButton.onclick = () => navigateTo("/");
        tournamentDiv.appendChild(leaveButton);
    }

    async setupTournamentTable(tournamentDiv) {
        if (this.tournamentTable) {
            tournamentDiv.removeChild(this.tournamentTable);
        }

        this.tournamentTable = await this.getTournamentList();
        this.tournamentTable.setAttribute('id', 'tournamentTable');
        tournamentDiv.appendChild(this.tournamentTable);

        const createTournamentButton = this.tournamentTable.shadowRoot.getElementById('create-button');
        createTournamentButton.removeEventListener('click', this.createTournament);
        createTournamentButton.addEventListener('click', this.createTournament);

        const refreshTournamentButton = this.tournamentTable.shadowRoot.getElementById('refresh-button');
        refreshTournamentButton.addEventListener('click', () => this.setupTournamentTable(tournamentDiv));

		const manageTournamentButton = this.tournamentTable.shadowRoot.getElementById('manage-button');
		manageTournamentButton.addEventListener('click', () => { this.tournamentTable.filterByHost(); });
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