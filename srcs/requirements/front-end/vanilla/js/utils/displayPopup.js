import anim from '@utils/animate.js';
import InfoPopup from '@components/InfoPopup';

export default function displayPopup(message, infoType, sticky=false, onClick=null) {
	let info = new InfoPopup();
	info.setAttribute('message', message);
	info.setAttribute('type', infoType);
	let container = document.querySelector("#popupContainer");
	container.appendChild(info);
	// anim.transition(info, [['transform', 'scale(0.5)', 'scale(1)'], ['opacity', 0, 1]]);
	anim.slideIn(info, 500, 'block');
	if (onClick) {
		info.onclick = () => {
			onClick(info);
			anim.slideOut(info, 500, true);
		}
	}
	if (!sticky) {
		setTimeout(() => {
			anim.slideOut(info, 500, true);
		}, 3000);
	}
	// // Check if the browser supports notifications
	// if ('Notification' in window) {
	// 	// Ask for permission
	// 	Notification.requestPermission().then(permission => {
	// 	if (permission === 'granted') {
	// 		// Create and show the notification
	// 		const notification = new Notification('Hello, world!', {
	// 			body: 'This is an example notification.',
	// 		});
	// 	}
	// 	});
	// }
}