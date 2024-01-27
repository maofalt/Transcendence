const vecs = require("./vectors");

function ballHitsWall(data) {
    let potentialHitPoint, futureHitPos, hitScaler;
    let ball, wall;

    ball = data.ball;
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        wall = data.field.walls[i];
        // if (ball.pos.getDistFrom(wall.pos) < ball.sp + ball.r) {
        potentialHitPoint = ball.pos.add(wall.dirToCenter.scale(-ball.r));
        futureHitPos = potentialHitPoint.add(ball.dir.scale(ball.sp));
        hitScaler = vecs.segmentsIntersect(
            potentialHitPoint,
            futureHitPos,
            wall.top,
            wall.bottom
        );
        if (hitScaler > 0) {
            let ballPath = futureHitPos.getDirFrom(potentialHitPoint).normalize();
            // ball.pos = futureHitPos.add(ballPath.scale(hitScaler)).add(wall.dirToCenter.scale(-ball.r));
            ball.dir = ball.dir.scale(-1);
            console.log("!!!!!!!!!!!!!!!!! COLLISION WESH !!!!!!!!!!!!!!");
            return true;
        }
        // }
    }
    return false;
}

function ballHitsPaddle(data) {
    let potentialHitPoint, futureHitPos, hitScaler;
    let ball, paddle;

    ball = data.ball;
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        paddle = data.players[i].paddle;
        // if (ball.pos.getDistFrom(paddle.pos) < ball.sp + ball.r) {
        potentialHitPoint = ball.pos.add(paddle.dirToCenter.scale(-ball.r));
        futureHitPos = potentialHitPoint.add(ball.dir.scale(ball.sp));
        hitScaler = vecs.segmentsIntersect(
            potentialHitPoint,
            futureHitPos,
            paddle.top,
            paddle.bottom
        );
        if (hitScaler > 0) {
            let ballPath = futureHitPos.getDirFrom(potentialHitPoint).normalize();
            ball.pos = potentialHitPoint.add(ballPath.scale(hitScaler)).add(paddle.dirToCenter.scale(ball.r));
            // ball.dir = ball.dir.scale(-1);
            ball.dir = paddle.pos.getDirFrom(ball.pos).normalize();
            console.log("!!!!!!!!!!!!!!!!! COLLISION WESH !!!!!!!!!!!!!!");
            return true;
        }
        // }
    }
    return false;
}

function updatePaddles(data) {
    let currPaddle = 0;

    // console.log('test');
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        currPaddle = data.players[i].paddle;
        // console.log(`
        // curr pad speed ${currPaddle.sp}
        // curr pad dir to top ${currPaddle.dir.scale(currPaddle.sp).x}, ${currPaddle.dir.scale(currPaddle.sp).y}`);
        currPaddle.pos = currPaddle.pos.add(currPaddle.dir.scale(currPaddle.sp));
        currPaddle.top = currPaddle.top.add(currPaddle.dir.scale(currPaddle.sp));
        currPaddle.bottom = currPaddle.bottom.add(currPaddle.dir.scale(currPaddle.sp));
    }
}

function updateBall(data) {
    if (!ballHitsWall(data) && !ballHitsPaddle(data)) {
        // console.log("PAS COLLISION");
        data.ball.pos = data.ball.pos.add(data.ball.dir.scale(data.ball.sp));
    }
    if (data.ball.pos.getDistFrom(new vecs.Vector(0, 0, 0)) > 25) {
        data.ball.pos = new vecs.Vector(0, 0, 0);
        data.ball.dir.x = data.ball.dir.x == 0 ? 1 : 0;
        data.ball.dir.y = data.ball.dir.y == 0 ? 1 : 0;
    }
    // else
        // console.log("COLLISION");
}

function updateData(data) {
    updatePaddles(data);
    updateBall(data);
}

module.exports = { updateData };