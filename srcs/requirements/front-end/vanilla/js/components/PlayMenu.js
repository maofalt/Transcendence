import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/PlayMenu.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from "./Pannel";

export default class PlayMenu extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		const ClassicPong = new Pannel({content: "Classic Pong"});
		const OnlineRoom = new Pannel({content: "Custom Game"});
		const Tournaments = new Pannel({content: "Tournaments"});

		ClassicPong.onmouseover = (e) => this.darkenPannel(e, ClassicPong);
		ClassicPong.onmouseleave = (e) => this.lightenPannel(e, ClassicPong);
		OnlineRoom.onmouseover = (e) => this.darkenPannel(e, OnlineRoom);
		OnlineRoom.onmouseleave = (e) => this.lightenPannel(e, OnlineRoom);
		Tournaments.onmouseover = (e) => this.darkenPannel(e, Tournaments);
		Tournaments.onmouseleave = (e) => this.lightenPannel(e, Tournaments);



		ClassicPong.shadowRoot.querySelector('#container').style.width = "100%";
		OnlineRoom.shadowRoot.querySelector('#container').style.width = "100%";
		Tournaments.shadowRoot.querySelector('#container').style.width = "100%";

		const div = document.createElement('div');
		div.id = "page";
		div.appendChild(ClassicPong);
		div.appendChild(OnlineRoom);
		div.appendChild(Tournaments);
		this.shadowRoot.appendChild(div);
	}

	darkenPannel = (e, obj) => {
		let div = obj.shadowRoot.querySelector("div");
		div.style.background = "rgba(0, 0, 0, 0.7)";
		div.style.borderRadius = "20px";
		div.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)";
		div.style.backdropFilter = "blur(12px)";
		div.style.color = "rgb(0, 217, 255)";
	};

	lightenPannel = (e, obj) => {
		let div = obj.shadowRoot.querySelector("div");
		div.style.background = "rgba(255, 255, 255, 0.1)";
		div.style.borderRadius = "20px";
		div.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.1)";
		div.style.backdropFilter = "blur(16px)";
		div.style.color = "white";
	};

	// Implement other methods or properties as needed
}

customElements.define('play-menu', PlayMenu);