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
    const sortedRounds = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));

    // Container for rounds (columns)
    const roundsContainer = document.createElement('div');
    roundsContainer.classList.add('rounds-container');

    // Generate rounds and matches
    sortedRounds.forEach((round, index) => {
        const roundElement = document.createElement('div');
        roundElement.classList.add('round');

        const roundHeader = document.createElement('h3');
        roundHeader.textContent = `Round ${round}`;
        roundElement.appendChild(roundHeader);

        // Create a container for matches to apply the grid layout
        const matchesGridContainer = document.createElement('div');
        matchesGridContainer.classList.add('matches-grid-container');

        rounds[round].forEach((match, matchIndex) => {
            const matchContainer = document.createElement('div');
            matchContainer.classList.add('match-container');

            // Connect matches with a line in between them, except for the last one
            if (matchIndex < rounds[round].length - 1) {
                const connector = document.createElement('div');
                connector.classList.add('match-connector');
                matchContainer.appendChild(connector);
            }

            const matchElement = document.createElement('div');
            matchElement.classList.add('match-grid');

            match.players.forEach(player => {
                const playerElement = document.createElement('div');
                playerElement.classList.add('player-flex');
                playerElement.innerHTML = player.username === match.winner_username ? `<strong>${player.username}</strong>` : player.username;
                matchElement.appendChild(playerElement);
            });

            // Add a class to indicate winning match and apply styles accordingly
            if (match.winner_username && index < sortedRounds.length - 1) {
				const connector = document.createElement('div');
				connector.classList.add('match-connector');
				matchContainer.appendChild(connector);
			}

            matchContainer.appendChild(matchElement);
            matchesGridContainer.appendChild(matchContainer);
        });

        // For each round, except for the last one, add right connectors to winners
        if (index < sortedRounds.length - 1) {
            const rightConnectorsContainer = document.createElement('div');
            rightConnectorsContainer.classList.add('right-connectors-container');
            matchesGridContainer.appendChild(rightConnectorsContainer);
        }

        roundElement.appendChild(matchesGridContainer);
        roundsContainer.appendChild(roundElement);
    });

    bracketContainer.appendChild(roundsContainer);
    return bracketContainer;
}
function initializeTournamentBracket(data) {
    // Call the function to create the tournament bracket
    const bracket = createTournamentBracket(data);

    // Append the bracket to the DOM, assuming there's an element with an ID of 'bracketContainer'
    document.getElementById('bracketContainer').appendChild(bracket);

    // Adjust the height of the ::before pseudo-element after the bracket is rendered
    adjustPseudoElementHeight();
}

// Function to adjust the height of the ::before pseudo-element
function adjustPseudoElementHeight() {
    // Select the matches-grid-container
    const matchesGridContainers = document.querySelectorAll('.matches-grid-container');
    
    matchesGridContainers.forEach(container => {
        const matchGrids = container.querySelectorAll('.match-grid');
        let totalHeight = 0;
        matchGrids.forEach((grid, index) => {
            totalHeight += grid.offsetHeight / 2;
            // Add the gap for each match-grid except the last one
            if (index < matchGrids.length - 1) {
                // Assuming the gap is 30px as specified in your CSS
                totalHeight += 30; // Adjust this value if your gap size is different
            }
        });
        container.style.setProperty('--pseudo-before-height', `${totalHeight}px`);
    });
}

// Assuming your data is ready and stored in a variable named 'tournamentData'
document.addEventListener("DOMContentLoaded", function() {
    initializeTournamentBracket(tournamentData);
});


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
