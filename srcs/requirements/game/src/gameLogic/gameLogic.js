const settings = require('./gameSettings');
const objects = require('./gameObjects');
const collisions = require('./gameCollisions');

let data = objects.data;

function initBall() {
    data.ball.x = settings.ball.x;
    data.ball.y = settings.ball.y;
    data.ball.z = 0;
    data.ball.vX = settings.ball.vX;
    data.ball.vY = settings.ball.vY;
    data.ball.sp = settings.ball.sp;
    data.ball.r = settings.ball.r;
    // getRandomDir(ball);
}

function initPaddle(paddle, settingsPaddle) {
    paddle.x = settingsPaddle.x;
    paddle.y = settingsPaddle.y;
    paddle.vX = settingsPaddle.vX;
    paddle.vY = settingsPaddle.vY;
    paddle.sp = settingsPaddle.sp;
}

function initData() {
    initBall();
    initPaddle(data.paddle1, settings.paddle1);
    initPaddle(data.paddle2, settings.paddle2);
}

// vector calculations for ball dir
function normalizeBallDir() {
	let l = Math.sqrt(data.ball.vX * data.ball.vX + data.ball.vY * data.ball.vY);
	data.ball.vX /= l;
	data.ball.vY /= l;
	data.ball.vX *= data.ball.sp;
	data.ball.vY *= data.ball.sp;
}

function getRandomDir() {
	let signX = Math.random();
	let signY = Math.random();
	data.ball.vX = (Math.random()) * ((signX >= 0.5) ? 1 : -1);
	data.ball.vY = (Math.random()) * ((signY >= 0.5) ? 1 : -1);
	normalizeBallDir();
}

// collisions calculations
function calculateBallDir(paddleNbr) {
	let contactX = paddle1.x + paddle1.width;
	let contactY = ball.y;
	let paddleCenterX = paddle1.x - paddle1.width;
	let paddleCenterY = paddle1.y + paddle1.height / 2;

	if (paddleNbr == 2) {
		contactX = paddle2.x;
		contactY = ball.y;
		paddleCenterX = paddle2.x + paddle2.width * 2;
		paddleCenterY = paddle2.y + paddle2.height / 2;
	}

	ball.vX = contactX - paddleCenterX;
	ball.vY = contactY - paddleCenterY;
	normalizeBallDir();
}

function updateBall() {
    if (collisions.ballIsOut(data))
        return true;
    collisions.ballHitsWall(data.ball, data.field);
    collisions.ballHitsPaddle1(data.ball, data.paddle1);
    collisions.ballHitsPaddle2(data.ball, data.paddle2);
    data.ball.x += data.ball.vX;
    data.ball.y += data.ball.vY;
    return false;
}

function updatePaddle(paddle) {
    paddle.y += paddle.vY;
    paddle.y = ((paddle.y - paddle.height / 2 < -data.field.height / 2) ? -data.field.height / 2 + paddle.height / 2 : paddle.y);
    paddle.y = ((paddle.y + paddle.height / 2 > data.field.height / 2) ? data.field.height / 2 - paddle.height / 2 : paddle.y);
}

function updateData() {
    if (updateBall()) {
        console.log('ball update returned true');
        return true;
    }
    updatePaddle(data.paddle1);
    updatePaddle(data.paddle2);
    return false;
}

module.exports = { updateData, getRandomDir, initData };