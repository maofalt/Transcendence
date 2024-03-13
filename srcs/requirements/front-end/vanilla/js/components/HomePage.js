import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "./AbstractComponent";
import AbstractView from "@views/AbstractView";
import homePageStyle from '@css/HomePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";
import UserInfo from "./UserInfo";

export default class HomePage extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = homePageStyle;
		this.shadowRoot.appendChild(styleEl);

		// let div = document.createElement('div');
		const title = new BigTitle({content: "Cosmic<br>Pong", style: {width: "500px"}});
		title.style.setProperty("margin-left", "42px");
		// title.style.setProperty("text-justify", "center");
		this.shadowRoot.appendChild(title);
		title.shadowRoot.querySelector('p').style.setProperty('margin', '50px');
	
		const playButton = new CustomButton({content: "Play", action: true, style: {margin: "15px 0px"}});
		const tournamentsButton = new CustomButton({content: "Tournaments", style: {margin: "15px 0px"}});
		// const optionsButton = new CustomButton({content: "Options", style: {margin: "15px 0px"}});
		const loginButton = new CustomButton({content: "Login", style: {margin: "15px 0px"}});

		const menu = document.createElement('div');
		menu.id = "menu";

		menu.appendChild(playButton);
		menu.appendChild(tournamentsButton);
		// menu.appendChild(optionsButton);
		menu.appendChild(loginButton);

		// const footerContainer = document.createElement('div');
		// footerContainer.id = "footerContainer";
		// // footerContainer.style.setProperty("border", "1px red solid");

		// const userInfo = new Pannel({title: " ", dark: true, style: {width: "550px", height: "150px"}});
		// userInfo.id = "userInfo";
		// userInfo.shadowRoot.removeChild(userInfo.shadowRoot.querySelector("#pannel-title"));

		// const profilePicture = new Pannel({title: " ", dark: false, style: {width: "120px", height: "120px"}});
		// profilePicture.id = "profilePicture";
		// profilePicture.shadowRoot.removeChild(profilePicture.shadowRoot.querySelector("#pannel-title"));

		// const userText = document.createElement('div');
		// userText.id = 'userText';
		// // userText.style.setProperty("border", "1px blue solid");
		// userText.style.setProperty("flex", "2");
		// userText.style.setProperty("height", "100%");

		// userInfo.shadowRoot.appendChild(profilePicture);
		// userInfo.shadowRoot.appendChild(userText);

		// footerContainer.appendChild(userInfo);

		const userInfo = new UserInfo({profilePicPath: "", username: "Banana", status: "online", wins: "999", losses: "0"});
		userInfo.style.setProperty("position", "absolute");
		userInfo.style.setProperty("bottom", "15px");
		userInfo.style.setProperty("left", "35px");

		this.shadowRoot.appendChild(menu);
		// this.shadowRoot.appendChild(footer);
		this.shadowRoot.appendChild(userInfo);
		// this.shadowRoot.appendChild(div);
		// this.shadowRoot.appendChild(footer);

		playButton.onclick = () => navigateTo("/game");
		tournamentsButton.onclick = () => navigateTo("/tournament");
		// optionsButton.onclick = () => navigateTo("/options");
		loginButton.onclick = () => navigateTo("/login");
		// this.shadowRoot.appendChild(footerContainer);
	}
}

customElements.define('home-page', HomePage);