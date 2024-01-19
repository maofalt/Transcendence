function updatePaddles(data) {
    let currPaddle = 0;

    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        currPaddle = data.players[i].paddle;
        currPaddle.pos = currPaddle.pos.add(currPaddle.dirToTop.scale(currPaddle.sp));
    }
}

function updateBall(data) {
    data.ball.pos = data.ball.pos.add(data.ball.dir.scale(data.ball.sp));
}

function updateData(data) {
    updatePaddles(data);
    updateBall(data);
}

module.exports = { updateData };