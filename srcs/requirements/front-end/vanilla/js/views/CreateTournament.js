import '@css/CreateTournament.css'
import AbstractView from "./AbstractView";
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';
import Game from '@views/Game.js';
import { htmlToElement } from '@utils/htmlToElement';
import CustomButton from '@components/CustomButton.js';


export default class CreateTournament extends AbstractView {

  constructor() {
      super();
      this.createGame = this.createGame.bind(this);
      this.getBasicGameSettings = this.getBasicGameSettings.bind(this);
      this.addPlayerDataToGameSettings = this.addPlayerDataToGameSettings.bind(this);
      this.getGameSettingsFromForm = this.getGameSettingsFromForm.bind(this);
      this.game = new Game();
  }
  
  async init() {
    try {

      // adding buttons to create the tournament and leave the page
      let tempDiv = document.getElementById('create-tournament');
      
      // create button
      let createButton = new CustomButton({content: "Create Tournament", action: true,
        style: {position: 'absolute', bottom: '30px', right: '3.3%', padding: "0px 30px"}});
      tempDiv.appendChild(createButton);
      createButton.onclick = () => this.handleSubmit.bind(this);
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
      gameSettingsForm.querySelectorAll('input').forEach(input => {
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
    if (this.game) {
      this.game.cleanAll(matchID);
    }
      this.game = null;
      this.game = await new Game(matchID, width, height);
      document.getElementById('gameContainer').innerHTML = '';
    // }
    await this.game.init(); // Make sure this can be safely called multiple times or after updating settings
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
    let htmlstuff = `
    <div id="create-tournament">
    <h1>Tournament Creation</h1>
    <section class="create-tournament">

      <div id="settings-container">
        <h2 id="settings-title">Tournament Settings</h2>

        <div id="settings-panels-container">

          <div class="settings-panel" id="tournament-settings">
            <h3 class="panel-title">Tournament</h3>
            <form id="tournament-form">

              <label for="tournament_name">Tournament Name:</label>
              <input type="text" 
                  id="tournament_name" 
                  name="tournament_name" 
                  required
                  placeholder="Enter tournament name">

              <label for="nbr_of_player_total">Number of Players:</label>
              <input 
                  type="range"
                  id="nbr_of_player_total" 
                  name="nbr_of_player_total" 
                  min="2" 
                  max="64"
                  step="1"
                  value="2"
                  required
                  oninput="this.nextElementSibling.value = this.value">

              <label for="registration_period_min">Registration Period (in minutes):</label>
              <input 
                type="number"
                id="registration_period_min"
                name="registration_period_min"
                min="1"
                max="30"
                step="1"
                value="30"
                required>

              <label for="host_id">Host ID:</label>
              <input
                type="number" 
                id="host_id" 
                name="host_id"
                value="1"
                required>

            </form>
          </div>
              
          <div class="settings-panel" id="game-settings">
            <h3 class="panel-title" id="game-settings-title">Games</h3>
            <form id="game-settings-form">

              <h3>Score & Players</h3>
              <div class="settings-card">
                <div class="setting-input">
                  <label for="nbr_of_players_per_match">Number of Players (2-8) :</label>
                  <input 
                    type="range" 
                    id="nbr_of_players_per_match"
                    name="nbr_of_players_per_match"
                    min="2"
                    max="8"
                    value="5"
                    step="1"
                    oninput="this.nextElementSibling.value = this.value">
                </div>

                <div class="setting-input">
                  <label for="nbr_of_rounds">Number of Rounds (1-10) :</label>
                  <input type="range" id="nbr_of_rounds" name="nbr_of_rounds" min="1" max="10" step="1" value="10">
                </div>
              </div>

              <h3>Field</h3>
              <div class="settings-card">
                <div class="setting-input">
                  <label for="walls_factor">Walls Size :</label>
                  <input type="range" id="walls_factor" name="walls_factor" min="0" max="2" step="0.1" value="0.7">
                </div>

                <div class="setting-input">
                  <label for="size_of_goals">Size of Goals :</label>
                  <input type="range" id="size_of_goals" name="size_of_goals" min="15" max="30" step="1" value="20">
                </div>
              </div>

              <h3>Paddles</h3>
              <div class="settings-card">
                <div class="setting-input">
                  <label for="paddle_height">Paddle Height :</label>
                  <input type="range" id="paddle_height" name="paddle_height" min="1" max="12" step="1" value="7">
                </div>

                <div class="setting-input">
                  <label for="paddle_speed">Paddle Speed :</label>
                  <input type="range" id="paddle_speed" name="paddle_speed" min="0.1" max="1" step="0.1" value="0.2">
                </div>
              </div>

              <h3>Ball</h3>
              <div class="settings-card">

                <div class="setting-input" id="ball-radius-input">
                  <label for="ball_radius">Ball Radius :</label>
                  <input type="range" id="ball_radius" name="ball_radius" min="0.5" max="7" step="0.1" value="1">
                </div>

                <div class="setting-input" id="ball-speed-input">
                  <label for="ball_speed">Ball Speed :</label>
                  <input type="number" id="ball_speed" name="ball_speed" min="0.1" max="1.1" step="0.1" value="0.3">
                </div>

                <div class="setting-input" id="ball_color-input">
                  <label for="ball_color">Ball Color :</label>
                  <input type="color" id="ball_color" name="ball_color" value="#ff0000">
                </div>
              </div>

              <div class="settings-card">

                <div class="setting-input" id="ball-model-input">
                  <label>Ball model :
                  <input list="models" id ="ball-model" name="ball-model"></label>
                  <datalist id="models">
                    <option value="none">
                    <option value="banana">
                    <option value="donut sucré au sucre">
                  </datalist>
                </div>

                <div class="setting-input" id="ball-texture-input">
                  <label>Ball texture :
                  <input list="textures" id ="ball-texture" name="ball-texture"></label>
                  <datalist id="textures">
                    <option value="none">
                    <option value="yridgway.jpg">
                    <option value="mklimina.jpg">
                    <option value="4kCeres.jpg">
                    <option value="4kPlanet.jpg">
                    <option value="1.8kVenus.jpg">
                    <option value="redSpace.jpg">
                  </datalist>
                </div>
              </div>

            </form>
          </div>
        </div>  
      </div>
      <div class="game-showcase" id="game-preview">
        <h2 id="settings-title">Preview</h2>
        <div id="three-js-container"></div>
      </div>
    </section>
    </div>
    `;
      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlstuff;

      let htmlElement = tempDiv;
      htmlElement.querySelector('.game-showcase').innerHTML += await this.game.getHtml();
      // htmlElement.id = 'create-tournament';
      return htmlElement.innerHTML;
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
          "model": document.getElementById('ball-model').value,
          "texture": document.getElementById('ball-texture').value
        },
        "playersData": [
        ]
      }
      await this.addPlayerDataToGameSettings(gameSettings, [], gameSettings.gamemodeData.nbrOfPlayers);
      console.log('Game settings from form:', gameSettings);
      return gameSettings;
		} catch (error) {
      console.log('ball color from form:', document.getElementById('ball_color').value);
			console.error('Failed to join tournament:', error);
		} 
    
  }

  // Add dummy players data in gameSetting depending on the number of players
  async addPlayerDataToGameSettings(gameSettings, playerNames=[], nbrOfPlayers=3) {

    let colorList = ['0x0000ff', '0xff0000', '0x00ff00', '0x00ffff', '0xff00ff', '0xffff00', '0xff00a0', '0xffa000']
    try {
			const responseUser = await makeApiRequest(`/api/user_management/auth/getUser`,'GET');
			console.log('User  tata:', responseUser.body);
			
      const userName = responseUser.body.username;
      playerNames.push(userName);
      let dummyPlayeName = 'playerdesd';
      let dummyPlayerColor = '0x00ff00';
  
      while (playerNames.length < nbrOfPlayers){
        playerNames.push(dummyPlayeName + playerNames.length);
      }
      let i = 0;
      playerNames.forEach((playerName) => {
        let dummyPlayer = {
          "accountID": playerName,
          "color": colorList[i % colorList.length - 1],
        }
        console.log(colorList[i % colorList.length - 1]);
        gameSettings.playersData.push(dummyPlayer);
        i++;
      });
      console.log('Game settings automaticallysadadasdadad:', gameSettings);
		} catch (error) {
			console.error('Failed to join tournament:', error);
		}
  }

  async getBasicGameSettings() {
    try {
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
        "playersData": [
        ]
      };
      await this.addPlayerDataToGameSettings(gameSettings);
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
      nbr_of_player_match: nbr_of_player_match,
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