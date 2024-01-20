function updatePaddles(data) {
    let currPaddle = 0;

    console.log('test');
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        currPaddle = data.players[i].paddle;
        // console.log(`
        // curr pad speed ${currPaddle.sp}
        // curr pad dir to top ${currPaddle.dir.scale(currPaddle.sp).x}, ${currPaddle.dir.scale(currPaddle.sp).y}`);
        currPaddle.pos = currPaddle.pos.add(currPaddle.dir.scale(currPaddle.sp));
    }
}

function updateBall(data) {
    data.ball.pos = data.ball.pos.add(data.ball.dir.scale(data.ball.sp));
}

function updateData(data) {
    updatePaddles(data);
    // updateBall(data);
}

module.exports = { updateData };