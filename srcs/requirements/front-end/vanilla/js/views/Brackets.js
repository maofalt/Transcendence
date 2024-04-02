import AbstractComponent from "@components/AbstractComponent";
import styles from '@css/Brackets.css?raw';
import easyFetch from "@utils/easyFetch";

export default class Brackets extends AbstractComponent {
	constructor(options = {}) {
		super();

		const styleEl = document.createElement('style');
		styleEl.textContent = styles;
		this.shadowRoot.appendChild(styleEl);

        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get("tournament"); 

        // let test = document.createElement("div");
        // test.textContent = "HELLO WORLD!: " + tournamentId;

		this.shadowRoot.appendChild(test);

        this.getTournamentDetails(tournamentId);
	}

    getTournamentDetails = async (tournamentId) => {
        console.log("details found!", tournamentId);
        let tournamentDetails = await easyFetch(`/api/user_management/auth/${endpoint}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(formData)
		})
		.then(res => {
			let response = res.response;
			let body = res.body;

		// 	if (!response || !body) {
		// 		throw new Error('Empty Response');
		// 	} else if (!response.ok) {
		// 		throw new Error(body.error || JSON.stringify(body));
		// 	} else if (response.status === 200) {
		// 			// displayPopup(body.message || JSON.stringify(body), 'success');
		// 		} else {
		// 			displayPopup(body.error || JSON.stringify(body), 'error');
		// 		}
		// 	} else {
		// 		displayPopup(body.error || JSON.stringify(body), 'error');
		// 	}
		})
		.catch(error => {
			displayPopup(`Request Failed: ${error}`, 'error');
		});
        this.shadowRoot.appendChild(banana);
	}

}


customElements.define('tournament-brackets', Brackets);
