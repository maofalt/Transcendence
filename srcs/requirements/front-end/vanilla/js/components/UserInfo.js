import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/UserInfo.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';

export default class UserInfo extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

        const pannel = new Pannel({title: "", dark: false, style: {width: "520px", height: "150px"}});
        pannel.id = "pannel";
        const ppContainer = new Pannel({title: "", dark: true, style: {width: "120px", height: "120px"}});
        ppContainer.id = "pp-container";

        pannel.shadowRoot.removeChild(pannel.shadowRoot.querySelector("#pannel-title"));
        ppContainer.shadowRoot.removeChild(ppContainer.shadowRoot.querySelector("#pannel-title"));
        
        ppContainer.style.setProperty("display", "flex");
        ppContainer.style.setProperty("justify-content", "center");

        const imgBox = document.createElement('div');
        this.setUpImageBox(imgBox);

        const userText = this.createUserText(options);
        const profilePicture = this.createProfilePicture(options);
        
        imgBox.appendChild(profilePicture);
        ppContainer.shadowRoot.appendChild(imgBox);
        pannel.shadowRoot.appendChild(ppContainer);
        pannel.shadowRoot.appendChild(userText);

        pannel.onmouseover = (e) => this.pannelHover(e, pannel, "pannel HOVERED !");
		pannel.onmouseleave = (e) => this.pannelLeave(e, pannel, "pannel LEFT !");

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}

		this.style.setProperty("font-family", "Anta");

        this.shadowRoot.appendChild(pannel);
	}

    createProfilePicture(options) {
        const profilePicture = new Image();
        profilePicture.id = "profile-picture";
        profilePicture.src = options.profilePicPath ? options.profilePicPath : "../js/assets/images/default-avatar.webp";
		profilePicture.style.setProperty("width", "100%");
		profilePicture.style.setProperty("height", "100%");
		profilePicture.style.setProperty("object-fit", "cover");
		profilePicture.style.setProperty("border-radius", "16px");
		profilePicture.style.setProperty("box-shadow", "0 0 20px rgba(0, 0, 0, 0.6)");
        return profilePicture;
    }

    createUserText(options) {
        const userText = document.createElement('div');
        userText.id = "user-text";
        userText.style.setProperty("width", "100%");
        userText.style.setProperty("height", "100%");
        userText.style.setProperty("padding", "5px 15px 5px 15px");
        userText.style.setProperty("flex", "3");
        userText.innerHTML = `
        <h2>${options.username}</h2>
        <p id="status">${options.status}</p>
        <p>${options.wins} W / ${options.losses} L</p>`;
        userText.querySelector('h2').style.setProperty("color", "rgba(0, 217, 255, 1)");
        // userText.querySelector('#status').style.setProperty("font-style", "italic");
        return userText;
    }

    setUpImageBox(imgBox) {
        imgBox.id = "img-box";
        imgBox.style.setProperty("width", "85%");
        imgBox.style.setProperty("height", "85%");
    }

    pannelHover = (e, pannel, arg) => {
		console.log(arg);
		pannel.style.setProperty("background", "rgba(0, 0, 0, 0.5)");
		pannel.style.setProperty("backdrop-filter", "blur(6px)");
        // pannel.style.setProperty("color", "rgba(0, 217, 255, 1)");
	}
    
	pannelLeave = (e, pannel, arg) => {
        console.log(arg);
		pannel.style.setProperty("background", "rgba(255, 255, 255, 0.1)");
		pannel.style.setProperty("backdrop-filter", "blur(16px)");
        // pannel.style.setProperty("color", "white");
	}

	// Implement other methods or properties as needed
}

customElements.define('user-info', UserInfo);