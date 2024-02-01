import AbstractView from "./AbstractView";
import DynamicTable from "../components/DynamicTable";

export default class Tournament extends AbstractView {

	async getHtml() {
		await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds
		return `
			<div class="card">
				<h1>Tournament</h1>
				<dynamic-table></dynamic-table>
			</div>
		`;
	}
}