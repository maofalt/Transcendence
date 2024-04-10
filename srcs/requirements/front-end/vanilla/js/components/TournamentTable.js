import BaseTable from "@components/BaseTable";
import AbstractView from "@views/AbstractView";
import ActionButton from "@components/ActionButton";
import NormalButton from '@components/NormalButton';
import HostAvatar from '@components/HostAvatar';
import NumberOfPlayers from '@components/NumberOfPlayers';
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';
import displayPopup from '@utils/displayPopup';


class TournamentTable extends BaseTable {
    constructor() {
        super();
        this.tournamentData = {};
        this.userName = '';
        this.setHeaders(['Tournament Name', 'Host', 'Number of Players', 'Players Per Match', 'Status', 'Action', 'Details']);
        this.applyColumnStyles = this.applyColumnStyles.bind(this);
        this.setTournamentData = this.setTournamentData.bind(this);
        this.parseTournamentData = this.parseTournamentData.bind(this); 
		this.createTournament = this.createTournament.bind(this);	
		this.joinTournament = this.joinTournament.bind(this);
		this.startTournament = this.startTournament.bind(this);
		this.unjoinTournament = this.unjoinTournament.bind(this);
		this.fetchTournamentData = this.fetchTournamentData.bind(this);
		this.fetchUserAvatar = this.fetchUserAvatar.bind(this);
    }

 
    //Method apply styles to the hable columns
    applyColumnStyles() {
        this.columnStyles = {
            tournamentName: {
                'font-weight': '700',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            host: {
                'display': 'block',
                'vertical-align': 'middle',
                'text-align': 'center',
                'color': '#008000',
            },
            nbrOfPlayersTournament: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            nbrOfPlayersMatch: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            state: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
            action: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
                'cursor': 'pointer',
            },
            details: {
                'align-items': 'center',
                'vertical-align': 'middle',
                'text-align': 'center',
            },
        };
    }

    async setTournamentData(tournamentData, userName) {
        this.tournamentData = tournamentData;
        this.userName = userName;
       
        this.sortTournaments();
        await this.parseTournamentData();
    }

    //Parse each tournament data and make the convenient api calls as wellas creaing buttons and events
    async parseTournamentData() {
        const tournaments = this.tournamentData;
        const userName = this.userName;
        let Styles = this.columnStyles;
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
                const tournamentNameElement = this.createStyledHTMLObject('div', tournament.tournament_name, Styles.tournamentName);

                // TOURNAMENST HOST 
                //trying tor ecover the name id and the picture
                const hostName = tournament.host_name;
                const hostAvatarElement = document.createElement('host-avatar');
                hostAvatarElement.setAttribute('name', hostName);
                
                const hostAvatar = await this.fetchUserAvatar(hostName);
                if (hostAvatar)
                    hostAvatarElement.setAttribute('avatar', hostAvatar);

                const hostElement = this.createStyledHTMLObject('div', hostAvatarElement, Styles.host);
                //const hostElement = this.createStyledHTMLObject('div', `${hostName}`, Styles.host);

                // TOURNAMENT PLAYERS OER TOURNAMENT AND PLACE AVAILABLE    
                const numberOfPlayersElement = this.createStyledHTMLObject('div', `${tournament.joined}/${tournament.nbr_of_player_total}`, Styles.nbrOfPlayersTournament);

                // TOURNAMENT PLAYER  PER MATCH!!
                const componentNbrOfPlayers = document.createElement('number-of-players');
                componentNbrOfPlayers.setAttribute('nbrOfPlayers', tournament.nbr_of_player_match);
                const numberOfPlayerPerMatch = this.createStyledHTMLObject('div', componentNbrOfPlayers, Styles.nbrOfPlayersMatch);

                // TOURNAMENT STATUS    
                const tournamentStatus = this.createStyledHTMLObject('div', `${tournament.state}`, Styles.state);

                // TOURNAMENT ACTION BUTTONS    
                //Join button on te action column to join corresponding tournament
                let buttonText = '';
                let buttonEvent = null;

                if (hostName === userName && tournament.state === 'waiting') {
                    buttonText = 'Start';
                    buttonEvent = async () =>  await this.startTournament(tournament.id);
                } else if (tournament.is_in_tournament && tournament.state === 'started') {
                    buttonText = 'Play';
                    buttonEvent = () => navigateTo('/play?matchID=' + tournament.setting.id);
                } else if (tournament.is_in_tournament && tournament.state === 'waiting') {
                    buttonText = 'Unjoin';
                    buttonEvent = async () => await this.unjoinTournament(tournament.tournament_name, tournament.id, userName);
                } else {
                    buttonText = 'Join';
                    buttonEvent = async () => await this.joinTournament(tournament.id);
                }
                const actionButtonElement = this.createStyledHTMLObject('button', buttonText, Styles.action);
                if (buttonEvent) {
                    actionButtonElement.onclick = buttonEvent;
                }

                // TOURNAMENT Details button to see the tournament state (either brackets and or results) opening th emodal
                const tournamentDetails = this.createStyledHTMLObject('button', '👁️', Styles.details);
                tournamentDetails.addEventListener('click', () => {
                    navigateTo(`/brackets?tournament=${tournament.id}`);
                });

                // Add the constructed row to the table
                this.addRow([
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
    }

    //Method to create a style HTMl object (e.g. a button)
    createStyledHTMLObject = (tagName, content, style) => {
        const element = document.createElement(tagName);
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }

        //Apply styles
        Object.assign(element.style, style);
        return element;
    }

    // Example method to add a row with dummy values and styled elements
    addDummyRow = () => {
        const tournamentName = this.createStyledHTMLObject('div', 'Tournament XYZ', '');
        const host = this.createStyledHTMLObject('div', 'Host Name', '');
        const numberOfPlayers = '32/64'; // Simple text example
        const timeRemaining = '10:00'; // Simple text example
        const tournamentType = 'Single Elimination'; // Simple text example
        const registrationMode = 'Open'; // Simple text example
        const joinButton = this.createStyledHTMLObject('button', 'Join', this.columnStyles.action);
        joinButton.addEventListener('click', () => console.log('Join clicked'));

        this.addRow([tournamentName, host, numberOfPlayers, timeRemaining, tournamentType, registrationMode, joinButton]);
    }

    //Method to sortTournaments
    sortTournaments() {
        this.tournamentData.sort((a, b) => {
            if (a.state === 'waiting' && (b.state === 'started' || b.state === 'ended')) return -1;
            if ((a.state === 'started' || a.state === 'ended') && b.state === 'waiting') return 1;
            return 0;
        });
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
			if (response.status >= 400) { 
				throw new Error('Failed to join tournament: ' + response.errorMessage);
			}
			displayPopup('Successfully joined the tournament!', 'success');
		} catch (error) {
			console.error('Error joining tournament:', error);
			displayPopup(error.message, 'error');
		}
		//fetch updated tournament row
		const updatedTournamentData = await this.fetchTournamentData(tournamentID);
		if (updatedTournamentData) {
			this.updateTournamentRowInView(tournamentID, updatedTournamentData);
		} else {
			console.error('Failed to fetch updated tournament data.');
		}

	}
	
	async startTournament(tournamentID) {
		try {
			const apiEndpoint = `/api/tournament/${tournamentID}/start/`;
			const response = await makeApiRequest(apiEndpoint, 'POST');
			if (response.status >= 400) { 
				throw new Error('Failed to start tournament: ' + response.errorMessage);
			}
			displayPopup('Successfully started the tournament!', 'success');
		} catch (error) {
			console.error('Error starting tournament:', error);
			displayPopup(error.message, 'error');
		}
		//fetch updated tournament row
		const updatedTournamentData = await this.fetchTournamentData(tournamentID);
		if (updatedTournamentData) {
			this.updateTournamentRowInView(tournamentID, updatedTournamentData);
		} else {
			console.error('Failed to fetch updated tournament data.');
		}
	}

	async unjoinTournament(tournamentName, tournamentID, userName) {
		try {
			const apiEndpoint = `/api/tournament/unjoin/${tournamentID}/${userName}/`;
			const response = await makeApiRequest(apiEndpoint, 'POST');
			if (response.status >= 400) { 
				throw new Error('Failed to unjoin ' + tournamentName + ' tournament: ' + response.errorMessage);
			}
			displayPopup('Successfully unjoined the ' + tournamentName + ' tournament!', 'success');
		} catch (error) {
			console.error('Error unjoining ' + tournamentName + ' tournament:', error);
			displayPopup(error.message, 'error');
		}
		//fetch updated tournament row
		const updatedTournamentData = await this.fetchTournamentData(tournamentID);
		if (updatedTournamentData) {
			this.updateTournamentRowInView(tournamentID, updatedTournamentData);
		} else {
			console.error('Failed to fetch updated tournament data.');
		}
	}

	async fetchTournamentData(tournamentID) {
		try {
			const response = await makeApiRequest(`/api/tournament/${tournamentID}/tournament`, 'GET');
			console.log(response.body);
			if (response.status >= 400) {
				throw new Error('Failed to fetch tournament data: ' + response.errorMessage);
			}
			return response.body;
		} catch (error) {
			console.error('Error fetching tournament data:', error);
			displayPopup(error.message, 'error');
			return null;
		}
		
	}

	async fetchUserAvatar(username) {
		try {
			const response = await makeApiRequest(`/api/user_management/auth/detail/${username}`, 'GET');
			if (response.status >= 400) { 
				throw new Error('Failed to fetch user avatar.');
			}
			let avatar = response.body.avatar;
			const src = "/api/user_management" + avatar;
			return src;
		} catch (error) {
			console.error('Error fetching user avatar:', error);
			return null;
		}
	}

}

customElements.define('tournament-table', TournamentTable);
export default TournamentTable;