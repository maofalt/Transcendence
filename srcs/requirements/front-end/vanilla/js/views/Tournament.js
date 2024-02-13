import AbstractView from "./AbstractView";
// import DynamicTable from "../components/DynamicTable";

export default class Tournament extends AbstractView {
	constructor(element) {
		super(element);
		// this.dynamicTable = new DynamicTable();
	}

	async getHtml() {
		// await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds
		console.log("path: ", document.location.origin);
		history.replaceState(null, null, document.location.origin + '/api/tournament/create-and-list/');
		window.location.href = document.location.origin + '/api/tournament/create-and-list/';
		return `
			<div class="card">
				<h1>Tournament</h1>
				<div id="dynamic-table-container"></div>
			</div>
		`;
	}

	async init() {
		// document.getElementById('dynamic-table-container').appendChild(this.dynamicTable.render());
	}

	async destroy() {
		// if (this.dynamicTable)
			// this.dynamicTable.destroy();
	}

}