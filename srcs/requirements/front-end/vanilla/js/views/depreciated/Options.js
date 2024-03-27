import AbstractView from "../AbstractView";

export default class Options extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		return `
		<div class="card">
			<h1>Options</h1>
		</div>
		`;
	}

}