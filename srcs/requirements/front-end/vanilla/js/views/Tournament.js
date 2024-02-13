import AbstractView from "./AbstractView";
import DynamicTable from "../components/DynamicTable";

export default class Tournament extends AbstractView {

	constructor() {
		super();
		this.caption = 'Active Tournaments';
		this.headers = ['Tournament Name', 'Host', 'Number of Players', 'Time Remaining', 'Tournament Type', 'Registration Mode', 'Action'];
		this.data= [
			{tournamentName: 'Tournament 1', host: 'Host 1', numberOfPlayers: '2/4', timeRemaining: '2:00', tournamentType: 'Single Elimination', registrationMode: 'Open', action: 'Join'},
			{tournamentName: 'Tournament 2', host: 'Host 2', numberOfPlayers: '5/4', timeRemaining: '2:00', tournamentType: 'Single Elimination', registrationMode: 'Open', action: 'Join'},
			{tournamentName: 'Tournament 2', host: 'Host 2', numberOfPlayers: '5/4', timeRemaining: '2:00', tournamentType: 'Single Elimination', registrationMode: 'Open', action: 'Join'},
		];
	}

	async getHtml() {
		await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds
		return `
			<div class="card">
				<h1>Tournament</h1>
				<dynamic-table></dynamic-table>
			</div>
		`;
	}

	async init() {
		const dynamicTable =  document.querySelector('dynamic-table');
		dynamicTable.setAttribute('data-title', this.caption);
		dynamicTable.setAttribute('data-headers', JSON.stringify(this.headers));
		dynamicTable.setAttribute('data-rows', JSON.stringify(this.data));
	}
}