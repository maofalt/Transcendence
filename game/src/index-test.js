const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));


const wss = new WebSocket.Server({ server:server });

wss.on("connection", function connection(ws) {
    console.log("A new client connected!");
    ws.send("Welcome new Client!");

    //for one client
    ws.on("message", function incoming(message) {
        console.log("Recieved: %s", message);
        ws.send("Got your message : \"" + message + "\"");
    });

    // for several clients : loop through all of them
    // ws.on("message", function incoming(message) {
    //     console.log("Recieved: %s", message);

    //     wss.clients.forEach(function each(client) {
    //         if (client !== ws && client.readyState === WebSocket.OPEN) {
    //             client.send(message);
    //         }
    //     })
    // });
});

app.get("/", (req, res) => res.send("Hello World!"));
// app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

server.listen(3001, () => console.log("Listening on port :3001"));