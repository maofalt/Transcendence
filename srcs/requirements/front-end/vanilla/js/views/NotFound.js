import AbstractView from "./AbstractView";

export default class NotFound extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		return `
		<div class="card">
			<h1>404 Not Found</h1>
		</div>
		`;
	}

}