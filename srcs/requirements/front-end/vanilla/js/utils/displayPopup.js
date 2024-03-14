import { fadeOut, fadeIn } from '@utils/jqueryUtils';

export const displayPopup = (message, infoType) => {
	let info = document.querySelector("#info");
	info.setAttribute('message', message);
	info.setAttribute('type', infoType);
	fadeIn(info);
	// info.style.display = "block";
	setTimeout(() => {
		fadeOut(info);
		// info.style.display = "none";
	}, 3000);
}