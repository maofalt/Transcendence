import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import AbstractComponent from "@components/AbstractComponent";
import AbstractView from "@views/AbstractView";
import homePageStyle from '@css/HomePage.css?raw';
import BigTitle from '@components/BigTitle';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";
import displayPopup from "@utils/displayPopup";
import UserInfo from "@components/UserInfo";
import isLoggedIn from "@utils/isLoggedIn";
import logOut from "@utils/logOut";
import fetchUserDetails from "@utils/fetchUserDetails";

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
		const profileButton = new CustomButton({content: "Profile", style: {margin: "15px 0px"}});
		// const loginButton = new CustomButton({content: "Login", style: {margin: "15px 0px"}});

		const menu = document.createElement('div');
		menu.id = "menu";

		menu.appendChild(playButton);
		// menu.appendChild(tournamentsButton);
		menu.appendChild(profileButton);
		// menu.appendChild(loginButton);

		this.addLater();

		this.shadowRoot.appendChild(menu);

		const errorButton = new CustomButton({
				content: "error", 
				style: {
					margin: "15px 0px",
					width: "150px",
				}
			});
		const infoButton = new CustomButton({
			content: "info", 
			style: {
				margin: "15px 0px",
				width: "150px",
			}
		});
		const successButton = new CustomButton({
			content: "success", 
			style: {
				margin: "15px 0px",
				width: "150px",
			}
		});

		// menu.appendChild(errorButton);
		// menu.appendChild(infoButton);
		// menu.appendChild(successButton);

		errorButton.onclick = () => displayPopup("this is error\nthis is a bit long message explaining things with lots of details.", "error");
		infoButton.onclick = () => displayPopup("this is info", "info");
		successButton.onclick = () => displayPopup("this is success", "success");

		playButton.onclick = () => navigateTo("/game");
		// tournamentsButton.onclick = () => navigateTo("/tournament");
		profileButton.onclick = () => navigateTo("/profile");

		// to add : method inside the user Info class that calls the navigate function corresponding
		// if user logged in : first button -> edit profile
		//						second button -> log out

		// if user not logged in : first button -> log in
		//							second button -> sign up
	}

	addLater = async () => {

		const userInfo = new UserInfo({});

		userInfo.style.setProperty("position", "absolute");
		userInfo.style.setProperty("bottom", "15px");
		userInfo.style.setProperty("right", "35px");

		this.shadowRoot.appendChild(userInfo);

		userInfo.onclick = () => navigateTo("/profile");

	}
}

customElements.define('home-page', HomePage);