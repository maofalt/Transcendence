// // Import express libin the code and "app" will init the obj express
// const express = require('express');
// const app = express();

// app.use(express.json());

// //users.json file
// const users = require('./users.json')

// app.get('/users', (req,res) => { 
//     //here i need to integrate the database to takeauser list
//     res.status(200).json(users)
// });

// app.get('/users/:id', (req, res) => {
//     const id = parseInt( req.params.id );
//     const user = users.find(user => user.id === id);

//     // Manage if the user isnot find 
//     if (!user) {
//         return res.status(404).send('User not found');
//     }

//     res.status(200).json(user);
// });

// // To create a new user with POST
// app.post('/users', (req, res) => {
//     users.push(req.body);
//     res.status(200).json(users);
// });

// app.put('/users/:id', (req,res) => {    
//     const id = parseInt(req.params.id);  
//     let userIndex = users.findIndex(user => user.id === id);

//     if (userIndex === -1) {
//         return res.status(404).send('User not found');
//     }

//     users[userIndex] = {
//         ...users[userIndex],
//         ...req.body
//     }
    
//     res.status(200).json(users[userIndex]);
// });

// app.delete('/users/:id', (req,res) => {    
//     const id = parseInt(req.params.id);    
//     const userIndex = users.findIndex(user => user.id === id);

//     if (userIndex === -1) {
//         return res.status(404).send('User not found');
//     }

//     users.splice(userIndex, 1);
//     res.status(200).json(users)
// });

// // The server can listen the choosed port
// const PORT = 3001;
// app.listen(PORT, () => { 
//     console.log('Server is listen') });

//======================== Zach testing =======================//

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const WebSocket = require("ws");

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

server.listen(3001, () => console.log("Listening on port :3001"));