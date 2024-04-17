import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "../components/AbstractComponent";
import AbstractView from "@views/AbstractView";
import style from '@css/PlayMenu.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";

export default class PlayMenu extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = style;
		this.shadowRoot.appendChild(styleEl);

		let classicPong = new Pannel({title: "Local", style: {padding: "18px 0", height: "400px"}});
		let customGame = new Pannel({title: "Tournaments", style: {padding: "18px 0", height: "400px"}});
		let bigTitle = new BigTitle({content: "Cosmic<br>Pong"});

		const menu = document.createElement('div');
		menu.id = "menu";

		this.setupPannel(classicPong, 
			"Play a game of classic Pong with a friend, on the same keyboard.",
			"public/assets/images/screenShot_normalGameBetter.png",
			() => navigateTo("/basic"));
		this.setupPannel(customGame, 
			"Create your own Tournaments and personalize your gaming experience.",
			"public/assets/images/screenShot_customGame.png",
			() => navigateTo("/tournament"));

		menu.appendChild(classicPong);
        menu.appendChild(customGame);

		const goBack = new CustomButton({content: "< Back", style: {padding: "0px 20px", position: "absolute", left: "50px", bottom: "30px"}});
		goBack.onclick = () => window.history.back();

		this.shadowRoot.appendChild(goBack);
        this.shadowRoot.appendChild(bigTitle);
        this.shadowRoot.appendChild(menu);
	}

	setupPannel(pannel, descText, imageUrl, onClick) {
		const desc = document.createElement('p');
		desc.innerHTML = descText;
		desc.style.setProperty("font-size", "20px");
		desc.style.setProperty("padding", "0");
		desc.style.setProperty("margin", "0");
		desc.style.setProperty("margin-top", "4%");
	
		const container = document.createElement('div');
		container.style.setProperty("width", "70%");
		container.style.setProperty("height", "60%");
		// container.style.setProperty("border", "1px red solid");

		const imgContainer = document.createElement('div');
		imgContainer.className = "imgContainer";
		imgContainer.style.setProperty("width", "100%");
		imgContainer.style.setProperty("height", "90%");
		// imgContainer.style.setProperty("border", "1px yellow solid");
		
		const image = document.createElement('img');
		image.src = imageUrl; // Replace with your image path
		image.style.setProperty("width", "100%");
		image.style.setProperty("height", "100%");
		image.style.setProperty("object-fit", "cover");
		image.style.setProperty("border-radius", "20px");
		// image.style.setProperty("border", "1px solid rgba(255, 255, 255, 0.1)");
		image.style.setProperty("box-shadow", "0 0 20px rgba(0, 0, 0, 0.6)");

		imgContainer.appendChild(image);
		container.appendChild(imgContainer);
		container.appendChild(desc);

		pannel.shadowRoot.appendChild(container);

		pannel.onmouseover = (e) => this.pannelHover(e, pannel, "pannel HOVERED !");
		pannel.onmouseleave = (e) => this.pannelLeave(e, pannel, "pannel LEFT !");

		pannel.onclick = onClick;
	}

	pannelHover = (e, pannel, arg) => {
		console.log(arg);
		pannel.style.setProperty("background", "rgba(0, 0, 0, 0.5)");
		pannel.style.setProperty("backdrop-filter", "blur(6px)");
		// pannel.shadowRoot.querySelector("img").style.setProperty("width", "200px");
	}

	pannelLeave = (e, pannel, arg) => {
		console.log(arg);
		pannel.style.setProperty("background", "rgba(255, 255, 255, 0.1)");
		pannel.style.setProperty("backdrop-filter", "blur(16px)");
	}
}

customElements.define('play-menu', PlayMenu);
