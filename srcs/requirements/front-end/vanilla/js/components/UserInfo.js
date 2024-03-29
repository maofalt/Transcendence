import { createElement } from "@utils/createElement";
import { htmlToElement } from "@utils/htmlToElement";
import styles from '@css/UserInfo.css?raw';
import AbstractComponent from '@components/AbstractComponent';
import Pannel from '@components/Pannel';
import CustomButton from '@components/CustomButton';
import { navigateTo } from "@utils/Router";
import isLoggedIn from "@utils/isLoggedIn";
import fetchUserDetails from "@utils/fetchUserDetails";
import logOut from "@utils/logOut";

export default class UserInfo extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

		this.addLater(options);
	}

	async addLater(options) {
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

		const details = await fetchUserDetails();

        const userText = this.createUserText(details);
        const profilePicture = this.createProfilePicture(details);
        
        imgBox.appendChild(profilePicture);
        ppContainer.shadowRoot.appendChild(imgBox);
        pannel.shadowRoot.appendChild(ppContainer);
        pannel.shadowRoot.appendChild(userText);

        this.createButtons(options, pannel);

        pannel.onmouseover = (e) => this.pannelHover(e, pannel, "pannel HOVERED !");
		pannel.onmouseleave = (e) => this.pannelLeave(e, pannel, "pannel LEFT !");

		if (options.style) {
			for (const [key, value] of Object.entries(options.style)) {
				console.log(key);
				console.log(value);
				this.shadowRoot.host.style.setProperty(key, value);
			}
		}

		// this.style.setProperty("font-family", "Anta");

        this.shadowRoot.appendChild(pannel);
	}

    createProfilePicture(options) {
        const profilePicture = new Image();
        profilePicture.id = "profile-picture";
        profilePicture.src = options.avatar ? options.avatar : "../js/assets/images/default-avatar.webp";
		profilePicture.style.setProperty("width", "100%");
		profilePicture.style.setProperty("height", "100%");
		profilePicture.style.setProperty("object-fit", "cover");
		profilePicture.style.setProperty("border-radius", "16px");
		profilePicture.style.setProperty("box-shadow", "0 0 20px rgba(0, 0, 0, 0.6)");
        return profilePicture;
    }

    createUserText(options) {
        let statusColor;
		if (options.status == "online") {
			statusColor = "green";
		} else if (options.status == "in game") {
			statusColor = "orange";
		} else
			statusColor = "red";

        const userText = document.createElement('div');
        userText.id = "user-text";
        userText.style.setProperty("width", "100%");
        userText.style.setProperty("height", "100%");
        userText.style.setProperty("padding", "5px 15px 5px 15px");
        userText.style.setProperty("flex", "1");
        userText.innerHTML = `
        <style>
            h2 {
                margin: 15px 0px;
                padding: 0px;
            }
            p {
                margin: 10px 0px;
                padding: 0px;
            }
            #status {
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: row;
                align-items: center;
                color: ${statusColor};
            }
            #status-circle {
                width: 15px;
                height: 15px;
                margin-right: 5px;
                background-color: ${statusColor};
                border-radius: 50%;
            }
            #status-circle p {
                margin: 0;
                padding: 0;
            }
        </style>
        <h2>${options.username ? options.username : "Guest"}</h2>
        <div id="status">
            <div id="status-circle"></div>
            <p>${options.status ? options.status : "offline"}</p>
        </div>
        <p>${options.wins ? options.wins: "-"} W / ${options.losses ? options.losses: "-"} L</p>`;
        userText.querySelector('h2').style.setProperty("color", "rgba(0, 217, 255, 1)");
        // userText.querySelector('#status').style.setProperty("font-style", "italic");
        return userText;
    }

    createButtons(options, pannel) {
        let button1, button2;
		let style = {display: "block", margin: "15px 0px"};

		if (isLoggedIn()) {
			button1 = new CustomButton({content: "Edit", action: true, style});
			button1.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/edit-profile");
			};
			button2 = new CustomButton({content: "Log out", style});
			button2.onclick = (e) => {
				e.stopPropagation();
				logOut();
			};
		} else {
			button1 = new CustomButton({content: "Log in", action: true, style});
			button1.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/login");
			};
	
			button2 = new CustomButton({content: "Sign up", style});
			button2.onclick = (e) => {
				e.stopPropagation();
				navigateTo("/signup");
			};
		}

        const container = document.createElement("div");
        container.id = "button-container";
        container.appendChild(button1);
        container.appendChild(button2);
        container.style.setProperty("margin", "0px 15px 0px 15px");
        container.style.setProperty("flex", "1");
        pannel.shadowRoot.appendChild(container);
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

/* To add :
- Buttons Edit and Log out
- Add an option if user not logged : Buttons in home page are : log in / sign up on this block;
Which will also make it so that they cant access the profile pannel.
*/

customElements.define('user-info', UserInfo);