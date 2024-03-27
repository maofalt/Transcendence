import AbstractView from "../AbstractView";

export default class Home extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		return `
		<div class="card">
			<h1>HOME</h1>
		</div>
		`;
	}

}