import { fadeOut, fadeIn } from '@utils/jqueryUtils';

export const displayPopup = (message, infoType) => {
	let info = document.querySelector("#info");
	info.setAttribute('message', message);
	info.setAttribute('type', infoType);
	fadeIn(info);
	if (infoType != "error") {
		setTimeout(() => {
			fadeOut(info);
		}, 3000);
	}
}