import { fadeOut, fadeIn } from '@utils/jqueryUtils';
import InfoPopup from '@components/InfoPopup';

// export const displayPopup = (message, infoType) => {
// 	let info = document.querySelector("#info");
// 	info.setAttribute('message', message);
// 	info.setAttribute('type', infoType);
// 	fadeIn(info);
// 	if (infoType != "error") {
// 		setTimeout(() => {
// 			fadeOut(info);
// 		}, 3000);
// 	}
// }

export const displayPopup = (message, infoType) => {
	let info = new InfoPopup();
	info.setAttribute('message', message);
	info.setAttribute('type', infoType);
	let container = document.querySelector("#popupContainer");
	container.appendChild(info);
	fadeIn(info, 500);
	if (infoType != "error") {
		setTimeout(() => {
			// info.style.setProperty('position', 'absolute');
			// info.style.setProperty('z-index', '9999');
			fadeOut(info, 500, true);
		}, 3000);
	}
	// Check if the browser supports notifications
	if ('Notification' in window) {
		// Ask for permission
		Notification.requestPermission().then(permission => {
		if (permission === 'granted') {
			// Create and show the notification
			const notification = new Notification('Hello, world!', {
				body: 'This is an example notification.',
			});
		}
		});
	}
}