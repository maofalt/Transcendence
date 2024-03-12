import '@css/CreateTournament.css'
import AbstractView from "./AbstractView";
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';
import Game from '@views/Game.js';
import { htmlToElement } from '@utils/htmlToElement';


export default class CreateTournament extends AbstractView {

  constructor() {
      super();
      //this.createTournament = this.createTournament.bind(this);
      //this.createSettings = this.createSettings.bind(this);
      this.createGame = this.createGame.bind(this);
      this.game = new Game();
  }
  
  async init() {
    // Initialize the game with basic settings
    let basicGameSettings = this.getBasicGameSettings();
    console.log('Initializing game with basic settings:', basicGameSettings);
    await this.initializeGame(basicGameSettings);

    let gameSettingsForm = document.getElementById('game-settings-form');
    gameSettingsForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', (event) => {
        event.preventDefault();
        console.log('Responding to form changes');
        
        // Get the game settings from the form
        let gameSettings = this.getGameSettingsFromForm();
        console.log('Updating game with new settings:', gameSettings);
        
        // Re-initialize the game with new settings
        this.initializeGame(gameSettings);
      });
    });
    //Attach even lsitener to the submit button
    const submitbutton = document.getElementById('submitTournament');
    if (submitbutton) {
      submitbutton.addEventListener('click', this.handleSubmit.bind(this));
    }
  }

// Helper method to initialize or update the game preview
  async initializeGame(gameSettings) {
    console.log('Create/Update Game with settings:', gameSettings);
    let matchID = await this.createGame(gameSettings);
    console.log('Match ID:', matchID);
  
    // Assuming the Game constructor or an update method can handle new settings
    if (!this.game) {
      this.game = new Game(matchID, 500, 830);
    } else {
      this.game.destroy();
      this.game = new Game(matchID, 500, 830);  
      document.getElementById('gameContainer').innerHTML = '';
    }
    await this.game.init(); // Make sure this can be safely called multiple times or after updating settings
    console.log('Game initialized');
  }


  async createGame(gameSettings) {
	  console.log('Create Game');
	  //const gameSettings = this.getGameSettings();
	  try {
	  	const response = await makeApiRequest('/game-logic/createMatch','POST',gameSettings);
	  	console.log('Match created:', response.body);
            return response.body.matchID;
	  } catch (error) {
	  	console.error('Failed to create match:', error);
            return '';
	  }
	}
    

  
  async getHtml() {
    // Fetching tournament types
    const tournamentTypes = await makeApiRequest('/api/tournament/tournament-types/', 'GET');
    const tournamentTypeOptionsHtml = tournamentTypes.body.map(type => `<option value="${type.type_id}">${type.type_name}</option>`).join('');
    // Fetching registration types
    const registrationTypes = await makeApiRequest('/api/tournament/registration-types/', 'GET');
    const registrationTypeOptionsHtml = registrationTypes.body.map(type => `<option value="${type.type_id}">${type.type_name}</option>`).join('');  
    console.log ('registrationTypeOptionsHtml:', registrationTypeOptionsHtml);
    
    
    let htmlstuff = `
          <section class="create-tournament">
              <button type="submit" id="submitTournament">Create Tournament</button>
              <div 
                  class="tournament-settings">
                  <h2>Tournament</h2>
                  <form 
                      id="tournament-form"
                      style="display: flex; flex-direction: column; gap: 1rem;"
                      <label for="tournament_name">Tournament Name:</label>
                      <input type="text" 
                          id="tournament_name" 
                          name="tournament_name" 
                          required
                          placeholder="Enter tournament name">
                      <label for="nbr_of_players_per_tournament">Number of Players:</label>
                      <input 
                          type="range" 
                          id="nbr_of_players_per_tournament" 
                          name="nbr_of_player" 
                          min="2" 
                          max="100"
                          value="2"
                          required
                          oninput="this.nextElementSibling.value = this.value">
                      <label for="game_type">Game Type:</label>
                      <div class="switch">
                          <input
                            type="number"
                            id="game_type"
                            name="game_type"
                            value="1"
                            required>
                          <span class="slider round"></span>
                      </div>
                      <label for="tournament_type">Tournament Type:</label>
                      <select id="tournament_type" name="tournament_type">
                          ${tournamentTypeOptionsHtml}
                      </select>
                      <label for="registration">Registration:</label>
                      <select id="registration" name="registration">
                          ${registrationTypeOptionsHtml}
                      </select>
                      <label for="registration_period_min">Registration Period (in minutes):</label>
                      <input 
                        type="number"
                        id="registration_period_min"
                        name="registration_period_min"
                        min="1"
                        value="30"
                        required>

                      <label for="host_id">Host ID:</label>
                      <input
                        type="number" 
                        id="host_id" 
                        name="host_id"
                        value="1"
                        required>

                      <label for="game_type">Host ID:</label>
                      <input
                        type="number" 
                        id="game_type" 
                        name="game_type"
                        value="1"
                        required>
              </form>
              </div>                
              <div class="game-settings">
                  <h2>Game</h2>
                  <form 
                  id="game-settings-form"
                  style="display: flex; flex-direction: column;">
                    <label for="game_type">Game Type:</label>
                    <label class="switch">
                      <input type="checkbox" id="game_type">
                      <span class="slider round"></span>
                    </label>
                    <label for="nbr_of_players_per_match">Number of Players (2-30):</label>
                    <input 
                      type="range" 
                      id="nbr_of_players_per_match"
                      name="nbr_of_players_per_match"
                      min="2" 
                      max="30" 
                      value="5"
                      oninput="this.nextElementSibling.value = this.value">
                      >
                    <label for="nbr_of_rounds">Number of Rounds:</label>
                    <input type="range" id="nbr_of_rounds" name="nbr_of_rounds" min="1" max="10" value="10">
                    <label for="time_limit">Time Limit (minutes):</label>
                    <input type="number" id="time_limit" name="time_limit" min="1" max="5" value="0">
                    <h3>Field Data</h3>
                      <label for="walls_factor">Walls Factor (0-2):</label>
                      <input type="range" id="walls_factor" name="walls_factor" min="0" max="2" step="0.1" value="0.7">
                      <label for="size_of_goals">Size of Goals (15-30):</label>
                      <input type="range" id="size_of_goals" name="size_of_goals" min="15" max="30" value="15">
                    <h3>Paddles Data</h3>
                      <label for="paddle_width">Paddle Width (1-12):</label>
                      <input type="range" id="paddle_width" name="paddle_widht" min="1" max="12" value="1">
                      <label for="paddle_height">Paddle Height (1-12):</label>
                      <input type="range" id="paddle_height" name="paddle_height" min="1" max="12" value="10">
                      <label for="paddle_speed">Paddle Speed (1-12):</label>
                      <input type="range" id="paddle_speed" name="paddle_speed" min="0.05" max="1" value="0.3">
                    <h3>Ball Data</h3>
                      <label for="ball_speed">Ball Speed:</label>
                      <input type="number" id="ball_speed" name="ball_speed" step="0.1" value="0.7">
                      <label for="ball_radius">Ball Radius (0.5-7):</label>
                      <input type="range" id="ball_radius" name="ball_radius" min="0.5" max="7" step="0.1" value="1">
                      <label for="ball_color">Ball Color:</label>
                      <input type="color" id="ball_color" name="ball_color" value="#ff0000">
                  </form>
              </div>                
              <div class="game-showcase">
                  <h2>Preview</h2>
                  <div id="three-js-container"></div>
              </div>                
          </section>
      `;
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlstuff;
      let htmlElement = tempDiv;
      htmlElement.querySelector('.game-showcase').innerHTML = await this.game.getHtml();
      return htmlElement.innerHTML;
  }


  getGameSettingsFromForm() {
    let gameSettings = {
      "gamemodeData": {
        "nbrOfPlayers": parseInt(document.getElementById('nbr_of_players_per_match').value, 10),
        "nbrOfRounds": parseInt(document.getElementById('nbr_of_rounds').value, 10),
        "timeLimit": parseInt(document.getElementById('time_limit').value, 10)
      },
      "fieldData": {
        "wallsFactor": parseFloat(document.getElementById('walls_factor').value),
        "sizeOfGoals": parseInt(document.getElementById('size_of_goals').value, 10)
      },
      "paddlesData": {
        "width": parseInt(document.getElementById('paddle_width').value, 10),
        "height": parseInt(document.getElementById('paddle_height').value, 10),
        "speed": parseFloat(document.getElementById('paddle_speed').value)
      },
      "ballData": {
        "speed": parseFloat(document.getElementById('ball_speed').value),
        "radius": parseFloat(document.getElementById('ball_radius').value),
        "color": document.getElementById('ball_color').value
      },
      "playersData": [
        {
          "accountID": "motero",
          "color": "0x0000ff"
        },
      ]
    }
    console.log('Game settings from form recovered');
    // Add dummy players data in gameSetting depending on the number of players
    let nbr_of_players = gameSettings.gamemodeData.nbrOfPlayers;
    let dummyPlayeName = 'banana';
    let dummyPlayerColor = '0x00ff00';
    for (let i = 1; i < nbr_of_players; i++) {
      let dummyPlayer = {
        "accountID": dummyPlayeName + i,
        "color": dummyPlayerColor
      }
      gameSettings.playersData.push(dummyPlayer);
    }
    console.log('Game settings automatically:', gameSettings);
    
    return gameSettings;
  }

  getBasicGameSettings() {
	  let gameSettings = {
	  	"gamemodeData": {
	  	  "nbrOfPlayers": 3,
	  	  "nbrOfRounds": 1,
	  	  "timeLimit": 0
	  	},
	  	"fieldData": {
	  	  "wallsFactor": 1,
	  	  "sizeOfGoals": 20
	  	},
	  	"paddlesData": {
	  	  "width": 0,
	  	  "height": 12,
	  	  "speed": 1
	  	},
	  	"ballData": {
	  	  "speed": 0.5,
	  	  "radius": 3,
	  	  "color": "0xf00fff"
	  	},
	  	"playersData": [
	  	  {
	  		"accountID": "motero",
	  		"color": "0x0000ff"
	  	  },
	  	  {
	  		"accountID": "tata2",
	  		"color": "0x00ff00"
	  	  },
	  	  {
	  		"accountID": "tata3",
	  		"color": "0x00ff00"
	  	  }
	  	]
	  };
    return gameSettings;
	}

  async handleSubmit(event) {
    event.preventDefault();

    //Collect data fom the tournamet settings form
    const tournamentData =  new FormData(document.getElementById('tournament-form'));
    const tournamentSettings = Object.fromEntries(tournamentData.entries());

    //Collect data from the game settings form
    const gameData = new FormData(document.getElementById('game-settings-form'));
    const gameSettings = Object.fromEntries(gameData.entries());

    // Combine data from both forms
    const tournamentAndGameSettings = {
      ...tournamentSettings,
      setting:{  ...gameSettings }
    };

    console.log('Submitting tournament:', tournamentAndGameSettings);
    try {
      const response = await makeApiRequest('/api/tournament/create-and-list/', 'POST', tournamentAndGameSettings);
    } catch (error) {
      console.error('Failed to create tournament:', error);
    }
  }
  
}