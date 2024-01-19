function updatePaddles(data) {
    let currPaddle = 0;

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        currPaddle = data.players[i].paddle;
        currPaddle.pos.add = currPaddle.pos.add(currPaddle.dir.scale(currPaddle.sp));
    }
}

function updateBall(data) {
    data.ball.pos = data.ball.pos.add(data.ball.dir.scale(data.ball.sp));
}

function updateData(data) {
    updatePaddles(data);
    updateBall(data);
}

function waitingLoop(data, io) {
    updateData(data);
    io.to("gameRoom").emit('render', data);
}

module.exports = { waitingLoop };