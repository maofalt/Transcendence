# API DOCS

## `HTTP` Game API

The game API is RESTfull and uses HTTP. It is used for creating matches and validating match settings. 

### Create Match

This endpoint creates a match with all the match settings including the players. Players are defined by their username (it must be the same username as defined by jisu when signing up). Create Match responds with the matchID to be used when connecting to the match websocket room.

```plaintext
POST /game-logic/createMatch
```

Example Body in ```JSON``` :

```json
{
    "gamemodeData": {
      "nbrOfPlayers": 6,
      "nbrOfRounds": 5,
      "timeLimit": 0
    },
    "fieldData": {
      "wallsFactor": 1,
      "sizeOfGoals": 20
    },
    "paddlesData": {
      "width": 2,
      "height": 12,
      "speed": 0.5
    },
    "ballData": {
      "speed": 0.7,
      "radius": 1,
      "color": "0xffffff"
    },
    "playersData": [
      {
        "accountID": "player1",
        "color": "0x0000ff"
      },
      {
        "accountID": "player2",
        "color": "0x00ff00"
      },
      {
        "accountID": "player3",
        "color": "0xff0000"
      },
      {
        "accountID": "player4",
        "color": "0xff00ff"
      },
      {
        "accountID": "player5",
        "color": "0x00ffff"
      },
      {
        "accountID": "player6",
        "color": "0xffff00"
      }
    ]
}
```

If successful, returns `200` status code and the `matchID` in json format which will then need to be in the query string when connecting to game backend

Example request:

```shell
curl -X POST -H "Content-Type: application/json" -d '@path/to/gameSettings.json' https://localhost:9443/game-logic/createMatch
```

Example response:

```json
{
    "matchID": "69"
}
```


## `WSS` Game WebSocket API

This API allows you to connect to a matchm send paddle movements and receive game updates with `WebSocket Secure`.

### Establish WebSocket Connection using `wss://`

```javascript
path: '/game-logic/socket.io',
query: 'matchID=${id}'
secure: true,
rejectUnauthorized: false,
transports: ['websocket']
```
Example wss url:

```plaintext
wss://localhost:9443/game-logic/socket.io/?matchID=69
```

### WebSocket Events

#### message: `generate`
Game State is sent in object `data` once after initial connection.
```javascript
// Socket.io example:
this.socket.on('generate', data => {
    // Generate scene and update it
});
```

#### message: `render`
Game State is sent in object `data` every 20ms.
```javascript
// Socket.io example:
this.socket.on('render', data => {
    // Update scene
});
```

#### message: `ping`
Array of size 2 with `[timestamp, latency]` is sent. `timestamp` should be sent back with message: `pong`, `latency` can be displayed for monitoring of WebSocket server ping.
```javascript
// Socket.io example:
this.socket.on('ping', ([timestamp, latency]) => {
    this.socket.emit('pong', timestamp);
    console.log(latency + 'ms');
});
```

#### message: `connection_error`
This is sent when there was an error with the initial connection. It is sent with `error` containing the error message.
```javascript
// Socket.io example:
this.socket.on('connect_error', (error) => {
    console.error("Socket connection error: ", error);
});
```

#### message: `error`
This is sent for all oher errors with `error` containing the error message.

```javascript
// Socket.io example:
this.socket.on('error', (error) => {
    console.error("Socket error: ", error);
});
```

### WebSocket Broadcasts

#### message: `moveUp`, `moveDown`, `dash`
Example Usage:
```javascript
handleKeyPress(event) {
    if (event.key == "w")
        this.socket.emit('moveUp');
    if (event.key == "s")
        this.socket.emit('moveDown');
    if (event.key == "d")
        this.socket.emit('dash');
};
```

#### message: `stop`
Example Usage:
```javascript
handleKeyRelease(event) {
    if (event.key == "w" || event.key == "s")
        this.socket.emit('stop');
};
```
