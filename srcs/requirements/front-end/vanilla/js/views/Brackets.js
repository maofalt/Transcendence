import AbstractComponent from "@components/AbstractComponent";
import styles from '@css/Brackets.css?raw';
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";

export default class Brackets extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		const urlParams = new URLSearchParams(window.location.search);
		const tournamentId = urlParams.get("tournament"); 

		// let test = document.createElement("div");
		// test.textContent = "HELLO WORLD!: " + tournamentId;

		// this.shadowRoot.appendChild(test);

		const createMatchesButton = document.createElement("button");
		createMatchesButton.textContent = "Create Matches";
		createMatchesButton.onclick = () => {
			this.createMatches(tournamentId);
		}

		const getDetailsButton = document.createElement("button");
		getDetailsButton.textContent = "Get Details";
		getDetailsButton.onclick = () => {
			this.getTournamentDetails(tournamentId);
		}

		this.shadowRoot.appendChild(createMatchesButton);
		this.shadowRoot.appendChild(getDetailsButton);

		// this.getTournamentDetails(tournamentId);
		// this.createMatches(tournamentId);
	}

	createMatches = async (tournamentId) => {
		console.log("details found!", tournamentId);
		
		await easyFetch(`/api/tournament/${tournamentId}/match-generator/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				"tournament_id": tournamentId,
			}),
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.ok) {
				displayPopup("Matches were created", 'success');
			}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
		});
	}
	
	getTournamentDetails = async (tournamentId) => {
		console.log("details found!", tournamentId);
		
		await easyFetch(`/api/tournament/${tournamentId}/matches/`)
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Empty Response');
			} else if (!response.ok) {
				throw new Error(body.error || JSON.stringify(body));
			} else if (response.status === 200) {
				displayPopup("Tournament Details Fetched", 'success');
			}
			let banana = document.createElement("div");
			banana.textContent = "Tournament Details!: " + JSON.stringify(body);
			this.shadowRoot.appendChild(banana);
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
		});
	}

}

customElements.define('tournament-brackets', Brackets);
