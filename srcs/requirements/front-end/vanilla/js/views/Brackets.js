// Import statements (Make sure the paths match your project structure)
import AbstractComponent from "@components/AbstractComponent";
import styles from '@css/Brackets.css?raw';
import easyFetch from "@utils/easyFetch";
import displayPopup from "@utils/displayPopup";

function createTournamentBracket(data) {
    const bracketContainer = document.createElement('div');
    bracketContainer.classList.add('tournament-bracket');

    // Tournament header
    const tournamentHeader = document.createElement('h2');
    tournamentHeader.textContent = `Tournament: ${data.tournament_name} - Overall Winner: ${data.winner || "TBD"}`;
    bracketContainer.appendChild(tournamentHeader);

    // Group matches by round_number
    const rounds = data.matches.reduce((acc, match) => {
        acc[match.round_number] = acc[match.round_number] || [];
        acc[match.round_number].push(match);
        return acc;
    }, {});

    // Sort rounds
    const sortedRounds = Object.keys(rounds).sort((a, b) => a - b);

    // Container for rounds (columns)
    const roundsContainer = document.createElement('div');
    roundsContainer.classList.add('rounds-container');

    // Generate rounds and matches
    sortedRounds.forEach(round => {
        const roundElement = document.createElement('div');
        roundElement.classList.add('round');

        const roundHeader = document.createElement('h3');
        roundHeader.textContent = `Round ${round}`;
        roundElement.appendChild(roundHeader);

        rounds[round].forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.classList.add('match-grid');

            match.players.forEach(player => {
                const playerElement = document.createElement('div');
                playerElement.classList.add('player-flex');
                playerElement.innerHTML = player.username === match.winner_username ? `<strong>${player.username}</strong>` : player.username;
                matchElement.appendChild(playerElement);
            });

            roundElement.appendChild(matchElement);
        });

        roundsContainer.appendChild(roundElement);
    });

    bracketContainer.appendChild(roundsContainer);
    return bracketContainer;
}


// Brackets class extending AbstractComponent
export default class Brackets extends AbstractComponent {
    constructor(options = {}) {
        super();

        // Attach styles
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        this.shadowRoot.appendChild(styleEl);

        // Buttons and their functionality
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get("tournament");

        const createMatchesButton = document.createElement("button");
        createMatchesButton.textContent = "Create Matches";
        createMatchesButton.onclick = () => this.createMatches(tournamentId);

        const getDetailsButton = document.createElement("button");
        getDetailsButton.textContent = "Get Details";
        getDetailsButton.onclick = () => this.getTournamentDetails(tournamentId);

        this.shadowRoot.append(createMatchesButton, getDetailsButton);
    }

    createMatches = async (tournamentId) => {
        try {
            const res = await easyFetch(`/api/tournament/${tournamentId}/match-generator/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "tournament_id": tournamentId }),
            });
            if (res.response.ok) {
                displayPopup("Matches were created", 'success');
            } else {
                throw new Error(res.body.error || JSON.stringify(res.body));
            }
        } catch (error) {
            displayPopup(`Request Failed: ${error}`, 'error');
        }
    };

    getTournamentDetails = async (tournamentId) => {
        try {
            const res = await easyFetch(`/api/tournament/${tournamentId}/matches/`);
            if (res.response.ok) {
                displayPopup("Tournament Details Fetched", 'success');
                this.renderTournamentBracket(res.body);
            } else {
                throw new Error(res.body.error || JSON.stringify(res.body));
            }
        } catch (error) {
            displayPopup(`Request Failed: ${error}`, 'error');
        }
    };

    renderTournamentBracket = (tournamentData) => {
        const tournamentBracket = createTournamentBracket(tournamentData);
        this.shadowRoot.appendChild(tournamentBracket);
    };
}

// Define the custom element
customElements.define('tournament-brackets', Brackets);
