import '@css/CreateTournament.css'
import AbstractView from "./AbstractView";
import { makeApiRequest } from '@utils/makeApiRequest.js';
import { navigateTo } from '@utils/Router.js';


export default class CreateTournament extends AbstractView {

    constructor() {
        super();
        //this.createTournament = this.createTournament.bind(this);
        //this.createSettings = this.createSettings.bind(this);
    }

    async getHtml() {
        return `
            <section class="create-tournament">
                <button type="submit">Create Tournament</button>
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

                        <label for="nbr_of_players">Number of Players:</label>
                        <input 
                            type="range" 
                            id="nbr_of_players" 
                            name="nbr_of_players" 
                            min="2" 
                            max="8" 
                            value="2"
                            required
                            oninput="this.nextElementSibling.value = this.value">

                        <label for="game_type">Game Type:</label>
                        <div class="switch">
                            <input type="checkbox" id="game_type" name="game_type">
                            <span class="slider round"></span>
                        </div>

                        <label for="tournament_type">Tournament Type:</label>
                        <select id="tournament_type" name="tournament_type">
                            <!-- Options will be dynamically filled -->
                        </select>

                        <label for="registration">Registration:</label>
                        <select id="registration" name="registration">
                            <!-- Options will be dynamically filled -->
                        </select>

                        <label for="registration_period_min">Registration Period (in minutes):</label>
                        <input type="number" id="registration_period_min" name="registration_period_min" min="1" required>

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

                      <label for="nbr_of_players">Number of Players (2-8):</label>
                      <input type="range" id="nbr_of_players" name="nbr_of_players" min="2" max="8" value="5">

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
                      <label for="paddle_height">Paddle Height (1-12):</label>
                      <input type="range" id="paddle_height" name="paddle_height" min="1" max="12" value="10">

                      <h3>Ball Data</h3>
                      <label for="ball_speed">Ball Speed:</label>
                      <input type="number" id="ball_speed" name="ball_speed" step="0.1" value="0.7">

                      <label for="ball_radius">Ball Radius (0.5-7):</label>
                      <input type="range" id="ball_radius" name="ball_radius" min="0.5" max="7" step="0.1" value="1">
                    </form>
                </div>                
                <div class="game-showcase">
                    <h2>Preview</h2>
                    <div id="three-js-container"></div>
                </div>                
            </section>
        `;
    }

}