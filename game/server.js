const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

// app.use(express.static('public/remote/'));
app.use(express.static('./public/local/'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

var playersNbr = 0;
const clients = new Map();

wss.on('connection', (ws) => {
    // playersNbr++;
    // const id = playersNbr;
    // const color = Math.floor(Math.random() * 360);
    // const metadata = { id, color };

    // clients.set(ws, metadata);

    console.log("New client connected ! ID : " + playersNbr);
    // ws.on('message', (messageAsString) => {
    //     const message = JSON.parse(messageAsString);
    //     const metadata = clients.get(ws);

    //     message.sender = metadata.id;
    //     message.color = metadata.color;
    //     const outbound = JSON.stringify(message);

    //     [...clients.keys()].forEach((client) => {
    //         client.send(outbound);
    //     });
    // });

    ws.on("close", () => {
        // clients.delete(ws);
        // playersNbr--;
        console.log("Connection closed");
    });
});