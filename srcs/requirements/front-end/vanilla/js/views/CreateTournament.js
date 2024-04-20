import '@css/CreateTournament.css'
import AbstractView from "./AbstractView";
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';
import Game from '@views/Game.js';
import GameView from '@views/GameView.js';
import { htmlToElement } from '@utils/htmlToElement';
import CustomButton from '@components/CustomButton.js';
import createTournamentHtml from '@html/createTournament.html?raw';
import easyFetch from '@utils/easyFetch';
import displayPopup from '@utils/displayPopup';

export default class CreateTournament extends AbstractView {

	constructor() {
		super();
		this.createGame = this.createGame.bind(this);
		this.getBasicGameSettings = this.getBasicGameSettings.bind(this);
		this.addPlayerDataToGameSettings = this.addPlayerDataToGameSettings.bind(this);
		this.getGameSettingsFromForm = this.getGameSettingsFromForm.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.scifiCharacters = [
			"Luke", "Leia", "Han", "Spock", "Kirk", "Picard",
			"Darth Vader", "Ripley", "Neo", "Trinity", "Morpheus", 
			"Terminator", "Mulder", "Scully", "HAL", "R2-D2",
			"C-3PO", "Gandalf", "Frodo", "Harry Potter"
		];
		
		this.funnyAdjectives = [
			"The Slow", "The Clumsy", "The Quirky", "The Silly", 
			"The Confused", "The Mysterious", "The Sassy",
			"The Geeky", "The Sleepy", "The Jumpy", "The Snarky",
			"The Curious", "The Grumpy", "The Shiny", "The Cosmic",
			"The Witty", "The Quaint", "The Zany", "The Unruly", 
			"The Cheerful"
		];
		
		// this.game = new Game();
		// document.getElementById('gameContainer').removeChild(this.game.shadowRoot.querySelector("#leave-button"));
	}
	
	async init() {
		try {
			// adding buttons to create the tournament and leave the page
			let tempDiv = document.getElementById('create-tournament');
			
			// create button
			let createButton = new CustomButton({content: "Create Tournament", action: true,
				style: {position: 'absolute', bottom: '30px', right: '3.3%', padding: "0px 30px"}});
			tempDiv.appendChild(createButton);
			createButton.onclick = (event) => this.handleSubmit(event);
			createButton.id = 'submitTournament';

			// leave button
			let leaveButton = new CustomButton({content: "< Leave",
				style: {position: 'absolute', bottom: '30px', left: '3.3%', padding: "0px 30px"}});
			tempDiv.appendChild(leaveButton);
			leaveButton.onclick = () => window.history.back();

			// Initialize the game with basic settings
			let basicGameSettings = await this.getBasicGameSettings();
			console.log('Initializing game with basic settings:', basicGameSettings);
			await this.initializeGame(basicGameSettings);

			let gameSettingsForm = document.getElementById('game-settings-form');
			gameSettingsForm.querySelectorAll('.input-tag').forEach(input => {
				input.addEventListener('change', async (event) => {
				event.preventDefault();
				console.log('Responding to form changes');

				// Get the game settings from the form
				let gameSettings = await this.getGameSettingsFromForm();
				console.log('Updating game with new settings:', gameSettings);
				// Re-initialize the game with new settings
				await this.initializeGame(gameSettings);
				});
			});
		} catch (error) {
		console.error('Failed to initialize CreateTournament:', error);
		}
	}

	// Helper method to initialize or update the game preview
	async initializeGame(gameSettings) {

		let matchID = await this.createGame(gameSettings);
		let gamePreviewPanel = document.getElementById('game-preview');
		// console.log('GAME PREVIEW PANEL', gamePreviewPanel);
		let width = gamePreviewPanel.offsetWidth;
		let height = gamePreviewPanel.offsetHeight - 100;

		console.log('Match ID:', matchID);
		// console.log("GAME CONTAINER SIZE",width, height);
		// Assuming the Game constructor or an update method can handle new settings
		// if (!this.game) {
		//   this.game = new Game(matchID, width, height);
		// } else {
		// if (this.game) {
		// 	this.game.cleanAll(matchID);
		// }
		// this.game = null;
		this.game = new Game(matchID, width, height);
		// this.game = new GameView(matchID, width, height);
		// this.game.id = 'game-view';
		let previewContainer = document.getElementById('preview-container')
		// console.log(previewContainer);
		if (previewContainer) {
			console.log("GAME CONTAINER", previewContainer);
			previewContainer.replaceChildren(this.game);
		} else {
			console.log("GAME CONTAINER NOT FOUND", previewContainer);
		}

		// hiding some elements in the game view
		// info : cannot simply remove them because then the game will not be able to update them and it will
		// just break.
		let gameContainer = document.querySelector("game-view").shadowRoot.getElementById("gameContainer");
		// let gameContainer = this.game.getElementById("gameContainer");
		gameContainer.querySelector("#count-down").style.display = "none"; // not displaying the count down
		gameContainer.querySelector("#leave-button").style.display = "none"; // not displaying the leave button
		console.log('Game initialized');
	}


	async createGame(gameSettings) {
		console.log('Create Game');
		try {
			const response = await makeApiRequest('/game-logic/createMatch','POST',gameSettings);
			console.log('Match created:', response.body);
				return response.body.matchID;
		} catch (error) {
			console.error('Failed to create match:', error);
		console.log("THIS IS THE ERROR ::::::::::",error);
				return error;
		}
	}
		
	async getHtml() {
		let htmlstuff = createTournamentHtml;
		var tempDiv = document.createElement('div');
		tempDiv.innerHTML = htmlstuff;

		let htmlElement = tempDiv;
		// htmlElement.querySelector('.game-showcase').innerHTML += await this.game.getHtml();
		// htmlElement.id = 'create-tournament';
		return htmlElement.innerHTML;
	}

	async generateMatchID(gameSettings) {
		const encoder = new TextEncoder();
		const data = encoder.encode(JSON.stringify(gameSettings));
		const buffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(buffer));
		const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
		return hashHex;
	}

	async getGameSettingsFromForm() {
		
		try {
			let gameSettings = {
				"gamemodeData": {
					"nbrOfPlayers": parseInt(document.getElementById('nbr_of_players_per_match').value),
					"nbrOfRounds": parseInt(document.getElementById('nbr_of_rounds').value),
					"timeLimit": 5,
					"gameType": 0
				},
				"fieldData": {
					"wallsFactor": parseFloat(document.getElementById('walls_factor').value),
					"sizeOfGoals": parseInt(document.getElementById('size_of_goals').value)
				},
				"paddlesData": {
					"width": 1,
					"height": parseInt(document.getElementById('paddle_height').value),
					"speed": parseFloat(document.getElementById('paddle_speed').value)
				},
				"ballData": {
					"speed": parseFloat(document.getElementById('ball_speed').value),
					"radius": parseFloat(document.getElementById('ball_radius').value),
					"color": document.getElementById('ball_color').value,
					"model": document.getElementById('ball_model').value,
					"texture": document.getElementById('ball_texture').value
				},
				"playersData": []
			}
			await this.addPlayerDataToGameSettings(gameSettings, [], gameSettings.gamemodeData.nbrOfPlayers);
			console.log('Game settings from form:', gameSettings);
			return gameSettings;
		} catch (error) {
			console.log('ball color from form:', document.getElementById('ball_color').value);
			console.error('Failed to join tournament:', error);
		}
		
	}

	async addPlayerDataToGameSettings(gameSettings, playerNames=[], nbrOfPlayers=3) {
		let colorList = ['0x0000ff', '0xff0000', '0x00ff00', '0x00ffff', '0xff00ff', '0xffff00', '0xff00a0', '0xffa000'];
	
		try {
			const responseUser = await makeApiRequest(`/api/user_management/auth/getUser`, 'GET');
			const userName = responseUser.body.username;
			playerNames.push(userName);
	
			// Ensure there are enough player names according to the number of players needed
			while (playerNames.length < nbrOfPlayers) {
				const randomChar = this.scifiCharacters[Math.floor(Math.random() * this.scifiCharacters.length)];
				const randomAdj = this.funnyAdjectives[Math.floor(Math.random() * this.funnyAdjectives.length)];
				playerNames.push(`${randomChar} ${randomAdj}`);
			}
	
			playerNames.forEach((playerName, i) => {
				let dummyPlayer = {
					"accountID": playerName,
					"color": colorList[i % colorList.length],
				};
				gameSettings.playersData.push(dummyPlayer);
			});
			console.log('Game settings with sci-fi character names:', gameSettings);
		} catch (error) {
			console.error('Failed to add player data to game settings:', error);
		}
	}
	

	async getBasicGameSettings() {
		let gameSettings = {
			"gamemodeData": {
				"nbrOfPlayers": 3,
				"nbrOfRounds": 10,
				"timeLimit": 0,
			},
			"fieldData": {
				"wallsFactor": 0.3,
				"sizeOfGoals": 30
			},
			"paddlesData": {
				"width": 1,
				"height": 7,
				"speed": 0.2
			},
			"ballData": {
				"speed": 0.3,
				"radius": 1,
				"color": "0xffffff",
				"model": "",
				"texture": ""
			},
			"playersData": []
		};
		try {
			await this.addPlayerDataToGameSettings(gameSettings);
			// gameSettings.match_id = await this.generateMatchID(gameSettings);
			return gameSettings;
		} catch (error) {
			console.error('Failed to get user:', error);
		}
	}

	async handleSubmit(event) {
		event.preventDefault();

		//Collect data fom the tournamet settings form
		const tournamentData =  new FormData(document.getElementById('tournament-form'));
		const tournamentSettings = Object.fromEntries(tournamentData.entries());

		//Collect data from the game settings form
		const gameData = new FormData(document.getElementById('game-settings-form'));
		const gameSettings = Object.fromEntries(gameData.entries());

		// Extract nbr_of_player_match from gameSettings
		const nbr_of_player_match = gameSettings['nbr_of_players_per_match'];

		// Combine data from both forms
		const tournamentAndGameSettings = {
		...tournamentSettings,
		registration_period_min: 15,
		nbr_of_player_match: nbr_of_player_match,
		setting:{  ...gameSettings }
		};

		console.log('Submitting tournament:', tournamentAndGameSettings);
		easyFetch('/api/tournament/create-and-list/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: tournamentAndGameSettings
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

			if (!response || !body) {
				throw new Error('Response is null');
			} else if (response.ok) {
				displayPopup('Tournament created', 'info');
				navigateTo('/tournament');
			} else if (response.status === 400) {
				this.highlightInvalidFields(body);
				displayPopup(Object.values(body)[0], 'error');
			} else {
				displayPopup(body.error || JSON.stringify(body), 'error');
			}
		})
		.catch(error => {
			displayPopup(error.message || error, 'error');
			console.error('Failed to create tournament:', error);
		});
	}

	highlightInvalidFields = (error) => {
		const errorKeys = Object.keys(error);
		console.log(errorKeys[0]);
		console.log("highlighting invalid fields")
		const inputs = document.querySelectorAll('input');
		inputs.forEach(input => {
			if (errorKeys.includes(input.name))
				input.style.border = '2px solid red';
			else
				input.style.border = '';
		});
	}
}