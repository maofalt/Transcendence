import io from 'socket.io-client';
import isLoggedIn from '@utils/isLoggedIn';
import displayPopup from '@utils/displayPopup';
import { navigateTo } from '@utils/Router';

const hostname = window.location.hostname;
const protocol = 'wss';
const io_url = hostname.includes("github.dev") ? `${protocol}://${hostname}` : `${protocol}://${hostname}:9443`;

console.log(`Connecting to ${io_url}`);

let socket = null;

function initSocketConnection() {
	
	const accessToken = sessionStorage.getItem('accessToken');
	
	if (isLoggedIn()) {
		if (socket) {
			socket.disconnect();
		}

		socket = io(`${io_url}/notify`, {
			path: '/game-logic/socket.io',
			secure: hostname !== 'localhost',
			auth: { accessToken }
		});

		socket.on('new-match', (matchID) => {
			let sticky = true;
			// let onClick = () => window.location.href = `/play?matchID=${matchID}`;
			let onClick = () => navigateTo(`/play?matchID=${matchID}`);
			displayPopup('New Match! Click to join', 'info', sticky, onClick);
		});
	}
	return socket;
}

function refreshSocketConnection() {
	if (isLoggedIn() && (socket == null || socket.connected == false)) {
		initSocketConnection();
	}
}

export { socket, initSocketConnection, refreshSocketConnection };