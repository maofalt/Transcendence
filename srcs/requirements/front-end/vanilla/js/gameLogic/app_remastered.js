
// importing personal code :
import lobbySettings from './lobbySettings';
import init from './init';
import debugDisp from './debugDisplay';
import render from './rendering';

let match = {};

let data;

let latency = 0;

function waitingLoop(matchID) {
	if (!match) {
		console.log("Match not found");
		// client.emit('error', 'Match not found');
		// client.disconnect();
		return ;
	}
	let string = JSON.stringify(match.gameState);
	let gameState = render.updateData(match.gameState);
	if (gameState == 1) {
		io.to(matchID).emit('destroy', match.gameState);
		io.to(matchID).emit('refresh', match.gameState);
	} else if (gameState == -1) {
		io.to(matchID).emit('destroy', match.gameState);
		clearInterval(match.gameInterval);
		// first, send the result of the match back;

		// then delete the match;
		matches.delete(matchID);
		return ;
	}
	// else if (gameState == 0) {
	io.to(matchID).emit('render', match.gameState);
}

function handleConnectionV2(client) {

	console.log("\nCLIENT CONNECTED\n");

	console.log('---DATA---\n', match.gameState, '\n---END---\n');
	client.emit('generate', match.gameState);
	
	match.gameInterval = setInterval(waitingLoop, 10, client.matchID);
	match.gameState.ball.dir.y = -1;
	match.gameState.ball.dir.x = 0.01;

	console.log(`Player connected with ID: ${client.playerID}`);

	// client.emit('generate', data);
	// debugDisp.displayData(match.gameState);
}

// Set up Socket.IO event handlers
io.on('connection', (client) => {
	//handle client connection and match init + players status
	console.log("\nclient:\n", client.decoded);
	handleConnectionV2(client);
	data = match.gameState;
});

// player controls
localmoveUp = () => {
	console.log(`client ${client.id} moving up`);
	let player = data.players[client.playerID];
	if (player && player.paddle && !player.paddle.dashSp) {
		player.paddle.currSp = player.paddle.sp;
	}
}

localmoveDown = () => {
	console.log(`client ${client.id} moving down`);
	let player = data.players[client.playerID];
	if (player && player.paddle && !player.paddle.dashSp) {
		player.paddle.currSp = -player.paddle.sp;
	}
}

localdash = () => {
	console.log(`client ${client.id} dashing`);
	let player = data.players[client.playerID];
	if (player && player.paddle && !player.paddle.dashSp) {
		if (player.paddle.currSp == 0) {
			// do something for this err case
			return ;
		}
		player.paddle.dashSp = player.paddle.currSp > 0 ? player.paddle.w * 1.5 : player.paddle.w * -1.5;
		// player.paddle.dashSp = player.paddle.w * 1.5 * (player.paddle.currSp > 0);
	}
}

localstop = () => {
	console.log(`client ${client.id} stopping`);
	let player = data.players[client.playerID];
	if (player && player.paddle && !player.paddle.dashing) {
		player.paddle.currSp = 0;
	}
}

// disconnect event
localdisconnect = () => {
	client.leave("gameRoom");
	data.connectedPlayers--;
	let player = data.players[client.playerID];
	if (player)
		player.connected = false;
	if (data.connectedPlayers < 1) {
		console.log("CLEARING INTERVAL");
		clearInterval(match.gameInterval);
		matches.delete(client.matchID);
		// delete data;
	}
	console.log(`Client disconnected with ID: ${client.id} (num clients: ${io.engine.clientsCount})`);
}

function generateMatchID(gameSettings) {
	// Convert request content to a string representation
	const string = JSON.stringify(gameSettings);
	// Use SHA-256 to hash the string
	return crypto.createHash('sha256').update(string).digest('hex');
}

// app.use(express.static('./public/remote/'));
initMatch = (gameSettings) => {
	// Convert game settings to game state
	const gameState = init.initLobby(gameSettings);
	
	console.log("\nMATCH CREATED\n");
	match = { gameState: gameState, gameInterval: 0 };
}

// module.exports = { io };
