const { Vector } = require("./vectors");
const vecs = require("./vectors");

function ballHitsWall(data) {
    let potentialHitPoint, futureHitPos, hitScaler;
    let ball, wall;

    ball = data.ball;
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        wall = data.field.walls[i];
        if (ball.pos.getDistFrom(wall.pos) < ball.sp + ball.r + wall.h / 2) {
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
                let dot = ball.dir.dotProduct(wall.dirToTop);
                let a = Math.acos(dot / ball.dir.mag * wall.dirToTop.mag);
                ball.dir = ball.dir.rotateAroundZ(2 * a);
                return true;
            }
        }
    }
    return false;
}

function checkCorner(ball, corner, center) {
    let distToCorner, vecCornerDist, cornerHitPoint = 0;

    distToCorner = corner.sub(ball.pos).mag;
    if (distToCorner > ball.sp && distToCorner > ball.r)
        return false;
    if (distToCorner < ball.r) {
        ball.dir = ball.pos.getDirFrom(center);
        return false;
    }
    vecCornerDist = ball.dir.scale(distToCorner);
    cornerHitPoint = ball.pos.add(vecCornerDist);
    if (cornerHitPoint.getDistFrom(corner) < ball.r) {
        let cornerToHitPointDist = corner.sub(cornerHitPoint).mag;
        let scaler = Math.sqrt(ball.r ** 2 - cornerToHitPointDist ** 2);
        ball.pos = cornerHitPoint.add(ball.dir.scale(-scaler));
        ball.dir = ball.pos.getDirFrom(center);
        return true;
    }
    return false;
}

function ballHitsPaddleSide (paddle, ball, segP1, segP2, scaledNormalVec) {
    let potentialHitPoint, futureHitPos, hitScaler;

    potentialHitPoint = ball.pos.sub(scaledNormalVec);
    futureHitPos = potentialHitPoint.add(ball.dir.scale(ball.sp));
    hitScaler = vecs.segmentsIntersect(
        potentialHitPoint,
        futureHitPos,
        segP1,
        segP2
    );
    if (hitScaler > 0) {
        let ballPath = futureHitPos.getDirFrom(potentialHitPoint).normalize();
        ball.pos = potentialHitPoint.add(ballPath.scale(hitScaler)).add(scaledNormalVec);
        ball.dir = ball.pos.getDirFrom(paddle.pos).normalize();
        return true;
    }
}

function ballHitsPaddle(data) {
    // let potentialHitPoint, futureHitPos, hitScaler;
    let ball, paddle;

    ball = data.ball;
	for (let player of Object.values(data.players)) {
        paddle = player.paddle;
        if (ball.pos.getDistFrom(paddle.pos) < ball.sp + ball.r + paddle.h / 2) {
            // if (ballHitsPaddleCenter(paddle, ball) ||
            //     ballHitsPaddleTop(paddle, ball) || 
            //     ballHitsPaddleBottom(paddle, ball)) {
            //     return true;
            // }
            if (ballHitsPaddleSide(paddle, ball, paddle.top, paddle.bottom, paddle.dirToCenter.scale(ball.r)) ||
                ballHitsPaddleSide(paddle, ball, paddle.top, paddle.topBack, paddle.dirToTop.scale(ball.r)) ||
                ballHitsPaddleSide(paddle, ball, paddle.bottom, paddle.bottomBack, paddle.dirToTop.scale(-ball.r))) {
                return true;
            }
            if (checkCorner(ball, paddle.top, paddle.pos))
                return true;
            if (checkCorner(ball, paddle.bottom, paddle.pos))
                return true;
        }
    }
    return false;
}

function updatePaddlesPoints(currPaddle, dir) {
    currPaddle.pos = currPaddle.pos.add(dir);
    currPaddle.top = currPaddle.top.add(dir);
    currPaddle.bottom = currPaddle.bottom.add(dir);
    currPaddle.topBack = currPaddle.topBack.add(dir);
    currPaddle.bottomBack = currPaddle.bottomBack.add(dir);
}

function resetPaddlePoints(paddle) {
    paddle.top = paddle.pos.add(paddle.dirToTop.scale(paddle.h / 2));
    paddle.top = paddle.top.add(paddle.dirToCenter.scale(paddle.w / 2));
    paddle.bottom = paddle.pos.add(paddle.dirToTop.scale(-paddle.h / 2));
    paddle.bottom = paddle.bottom.add(paddle.dirToCenter.scale(paddle.w / 2));
    paddle.topBack = paddle.top.add(paddle.dirToCenter.scale(-paddle.w));
    paddle.bottomBack = paddle.bottom.add(paddle.dirToCenter.scale(-paddle.w));
}

function handleDash(currPaddle) {
    if (currPaddle.dashSp != 0) {
        currPaddle.dashFrameCounter++;
        if (currPaddle.dashFrameCounter == 5) {
            currPaddle.dashSp = 0;
            currPaddle.dashFrameCounter = 0;
        }
    }
}

function updatePaddles(data) {
    let currPaddle = 0;

    // console.log('test');
	for (let player of Object.values(data.players)) {
        currPaddle = player.paddle;
        let dir = 0;
        
        dir = (currPaddle.dashSp != 0) ? currPaddle.dirToTop.scale(currPaddle.dashSp) : currPaddle.dirToTop.scale(currPaddle.currSp);
        // console.log(`
        // curr pad speed ${currPaddle.sp}
        // curr pad dir to top ${currPaddle.dir.scale(currPaddle.sp).x}, ${currPaddle.dir.scale(currPaddle.sp).y}`);
        updatePaddlesPoints(currPaddle, dir);
        handleDash(currPaddle);

        let vecToStart = currPaddle.pos.sub(currPaddle.startingPos);
        let limitDist = (data.field.goalsSize - currPaddle.h - currPaddle.w) / 1;

        if (vecToStart.mag > limitDist) {
            vecToStart = vecToStart.normalize();
            dir = vecToStart.scale(limitDist);
            currPaddle.pos = currPaddle.startingPos.add(vecToStart.scale(limitDist));
            resetPaddlePoints(currPaddle);
        }
    }
}

function updateBall(data) {
    if (!ballHitsWall(data) && !ballHitsPaddle(data)) {
        // console.log("PAS COLLISION");
        data.ball.pos = data.ball.pos.add(data.ball.dir.scale(data.ball.sp));
    }
    if (data.ball.pos.getDistFrom(new Vector(0, 0, 0)) > 70) {
        data.ball.pos = new Vector(0, 0, 0);
        // data.ball.dir.x = data.ball.dir.x == 0 ? 1 : 0;
        // data.ball.dir.y = data.ball.dir.y == 0 ? 1 : 0;
    }
    // else
        // console.log("COLLISION");
}

function updateData(data) {
    updatePaddles(data);
    updateBall(data);
    // checkForScoring(data);
}

module.exports = { updateData };