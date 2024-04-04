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
    tournamentHeader.textContent = `Tournament: ${data.tournament_name}`;
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

    const nbrSetting = data.nbr_player_setting;
    const minHeight = (nbrSetting * 27) + ((nbrSetting - 1) * 5 + 10);

    // Generate rounds and matches
    sortedRounds.forEach((round, index) => {
        const roundElement = document.createElement('div');
        roundElement.classList.add('round');

        const matchesForRound = rounds[round];
        const numberOfMatches = matchesForRound.length;
        const groupSize = Math.ceil(numberOfMatches / nbrSetting);
        let matchesAdded = 0;

        for (let i = 0; i < groupSize; i++) {
            const groupMatches = matchesForRound.slice(matchesAdded, matchesAdded + nbrSetting);
            const matchesGridContainer = document.createElement('div');
            matchesGridContainer.classList.add('matches-grid-container');
            const gap = 30 + (30 * index - 1);
            matchesGridContainer.style.gap = `${gap}px`; // Set the gap dynamically
            let tmp = nbrSetting < numberOfMatches ? nbrSetting : numberOfMatches;
            if (tmp == 1)
                tmp = 2;
            roundElement.style.setProperty('--pseudo-bridge', `${(minHeight + gap)*(tmp - 1)}px`);

            groupMatches.forEach((match, matchIndex) => {
                const matchContainer = document.createElement('div');
                if (matchIndex % nbrSetting === 0 && matchIndex != groupMatches.length - 1){
                    matchContainer.classList.add('group-separator');
                }
                matchContainer.classList.add('match-container');

                if (matchIndex < groupMatches.length - 1) {
                    const connector = document.createElement('div');
                    connector.classList.add('match-connector');
                    matchContainer.appendChild(connector);
                }

                const matchElement = document.createElement('div');
                matchElement.classList.add('match-grid');

                match.players.forEach(player => {
                    const playerElement = document.createElement('div');
                    playerElement.classList.add('player-flex');

                    const playerTextElement = document.createElement('span');
                    playerTextElement.textContent = player.username;

                    if (match.winner_username && match.winner_username !== player.username) {
                        playerTextElement.classList.add('non-winner');
                    }

                    if (player.username === match.winner_username) {
                        // playerTextElement.innerHTML = `<strong>${player.username}</strong>`;
                        if (match.final_match) {
                            playerTextElement.innerHTML = `<strong>${player.username}</strong>`;
                            playerTextElement.style.textShadow = "0 0 1px #ffffff, 0 0 8px #ffffff";
                        } else {
                            playerTextElement.classList.add('match-winner');
                            // playerTextElement.style.opacity = "0.7";
                            // playerTextElement.style.textShadow = "0 0 1px #ffffff, 0 0 8px #ffffff";
                        }
                    }
                    // if (player.username === match.winner_username) {
                    //     playerTextElement.innerHTML = `<strong>${player.username}</strong>`;
                    // }

                    playerElement.appendChild(playerTextElement);
                    matchElement.appendChild(playerElement);
                });

                matchContainer.appendChild(matchElement);
                matchesGridContainer.appendChild(matchContainer);
            });

            roundElement.appendChild(matchesGridContainer);

            // Add separator before the next group if it's not the last group
            if (i < groupSize - 1 ) {
                const separator = document.createElement('div');
                matchesGridContainer.appendChild(separator);
            }

            matchesAdded += nbrSetting;
        }

        roundsContainer.appendChild(roundElement);

        let roundHeight = (minHeight * (numberOfMatches - 1)) + (30 * (numberOfMatches - 1));
        roundElement.style.setProperty('--pseudo-before-height', `${roundHeight}px`);
        roundElement.style.setProperty('--pseudo-minHeight', `${minHeight}px`);
    });

    // display the final winner
    const finalRoundElement = document.createElement('div');
    finalRoundElement.classList.add('round');
    finalRoundElement.classList.add('final-round');

    const finalMatchElement = document.createElement('div');
    // finalMatchElement.classList.add('match-grid');

    const finalPlayerElement = document.createElement('div');
    finalPlayerElement.classList.add('player-flex');

    const finalPlayerTextElement = document.createElement('span');
    finalPlayerTextElement.textContent = `Final Winner: ${data.winner || "TBD"}`;
    finalPlayerTextElement.innerHTML = `<strong>${data.winner || "TBD"}</strong>`;
    finalPlayerElement.appendChild(finalPlayerTextElement);

    finalMatchElement.appendChild(finalPlayerElement);
    finalRoundElement.appendChild(finalMatchElement);
    roundsContainer.appendChild(finalRoundElement);

    finalRoundElement.style.setProperty('--pseudo-minHeight', `${minHeight}px`);
    
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
