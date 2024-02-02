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
                // ball.dir = ball.dir.scale(-1);
                let dot = ball.dir.dotProduct(wall.dirToTop);
                let a = Math.acos(dot / ball.dir.mag * wall.dirToTop.mag);
                ball.dir = ball.dir.rotateAroundZ(2 * a);
                console.log("!!!!!!!!!!!!!!!!! COLLISION WALL WESH !!!!!!!!!!!!!!");
                return true;
            }
        }
    }
    return false;
}

function checkCorner(ball, corner) {
    let distToCorner, vecCornerDist, cornerHitPoint = 0;

    distToCorner = corner.sub(ball.pos).mag;
    if (distToCorner > ball.sp && distToCorner > ball.r)
        return false;
    if (distToCorner < ball.r) {
        ball.dir = ball.pos.getDirFrom(corner);
        return false;
    }
    // console.log(`!!!!!  ${distToCorner}  ${ball.dir.x}  !!!!!`);
    vecCornerDist = ball.dir.scale(distToCorner);
    cornerHitPoint = ball.pos.add(vecCornerDist);
    if (cornerHitPoint.getDistFrom(corner) < ball.r) {
        let cornerToHitPointDist = corner.sub(cornerHitPoint).mag;
        let scaler = Math.sqrt(ball.r ** 2 - cornerToHitPointDist ** 2);
        ball.pos = cornerHitPoint.add(ball.dir.scale(-scaler));
        ball.dir = ball.pos.getDirFrom(corner);
        return true;
    }
    return false;
}

function ballHitsPaddle(data) {
    let potentialHitPoint, futureHitPos, hitScaler;
    let ball, paddle;

    ball = data.ball;
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        paddle = data.players[i].paddle;
        if (ball.pos.getDistFrom(paddle.pos) < ball.sp + ball.r + paddle.h / 2) {
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
                ball.dir = ball.pos.getDirFrom(paddle.pos).normalize();
                console.log("!!!!!!!!!!!!!!!!! COLLISION WESH !!!!!!!!!!!!!!");
                return true;
            }
            potentialHitPoint = ball.pos.add(paddle.dirToTop.scale(-ball.r));
            futureHitPos = potentialHitPoint.add(ball.dir.scale(ball.sp));
            hitScaler = vecs.segmentsIntersect(
                potentialHitPoint,
                futureHitPos,
                paddle.top,
                paddle.topBack
            );
            if (hitScaler > 0) {
                let ballPath = futureHitPos.getDirFrom(potentialHitPoint).normalize();
                ball.pos = potentialHitPoint.add(ballPath.scale(hitScaler)).add(paddle.dirToTop.scale(ball.r));
                // ball.dir = ball.dir.scale(-1);
                ball.dir = ball.pos.getDirFrom(paddle.pos).normalize();
                console.log("!!!!!!!!!!!!!!!!! COLLISION WESH !!!!!!!!!!!!!!");
                return true;
            }
            potentialHitPoint = ball.pos.add(paddle.dirToTop.scale(ball.r));
            futureHitPos = potentialHitPoint.add(ball.dir.scale(ball.sp));
            hitScaler = vecs.segmentsIntersect(
                potentialHitPoint,
                futureHitPos,
                paddle.bottom,
                paddle.bottomBack
            );
            if (hitScaler > 0) {
                let ballPath = futureHitPos.getDirFrom(potentialHitPoint).normalize();
                ball.pos = potentialHitPoint.add(ballPath.scale(hitScaler)).add(paddle.dirToTop.scale(-ball.r));
                // ball.dir = ball.dir.scale(-1);
                ball.dir = ball.pos.getDirFrom(paddle.pos).normalize();
                console.log("!!!!!!!!!!!!!!!!! COLLISION WESH !!!!!!!!!!!!!!");
                return true;
            }
            if (checkCorner(ball, paddle.top))
                return true;
            if (checkCorner(ball, paddle.bottom))
                return true;
        }
    }
    return false;
}

function updatePaddles(data) {
    let currPaddle = 0;

    // console.log('test');
    for (let i=0; i<data.gamemode.nbrOfPlayers; i++) {
        currPaddle = data.players[i].paddle;
        let dir = currPaddle.dirToTop.scale(currPaddle.currSp);
        // console.log(`
        // curr pad speed ${currPaddle.sp}
        // curr pad dir to top ${currPaddle.dir.scale(currPaddle.sp).x}, ${currPaddle.dir.scale(currPaddle.sp).y}`);
        currPaddle.pos = currPaddle.pos.add(dir);
        currPaddle.top = currPaddle.top.add(dir);
        currPaddle.bottom = currPaddle.bottom.add(dir);
        currPaddle.topBack = currPaddle.topBack.add(dir);
        currPaddle.bottomBack = currPaddle.bottomBack.add(dir);
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
}

module.exports = { updateData };