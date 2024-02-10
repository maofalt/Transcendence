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

### WebSocket Connection


