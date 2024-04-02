import io from 'socket.io-client';
import isLoggedIn from './isLoggedIn';

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
		socket = io(`${io_url}`, {
			path: '/game-logic/socket.io',
			accessToken,
			secure: hostname !== 'localhost',
			rejectUnauthorized: false,
			transports: ['websocket'],
			auth: { accessToken }
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