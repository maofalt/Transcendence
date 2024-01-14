import AbstractView from "./AbstractView";

export default class Home extends AbstractView {
	constructor(element) {
		super(element);
	}

	async getHtml() {
		return `
		<div class="card">
			<button class="fdf" id="counter" type="button">click me!</button>
		</div>
		`;
	}

}