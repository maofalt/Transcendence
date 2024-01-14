import AbstractView from "./AbstractView";

export default class Tournament extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		await new Promise(resolve => setTimeout(resolve, 500)); // Wait for 3 seconds
		return `
			<div class="card">
				<h1>Tournament</h1>
			</div>
		`;
	}

}