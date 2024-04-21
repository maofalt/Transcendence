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
    // console.log(latency + 'ms');
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



## `HTTP` User Management API

### Login:

This is the endpoint to login

```plaintext
POST /api/user_management/auth/login
```
`cookies` need to contain `csrftoken` given on get request to endpoint.

POST body must be in `application/x-www-form-urlencoded` containing:

```
csrfmiddlewaretoken: HE0RAsToQcfYzvU98c0bGCQoV0pMxCPRKFGFgbt4ngcYNRlK7OmJFDmfwy6B62F5
username: player1
password: Passw0rd1
```

Example Request Body:

```
csrfmiddlewaretoken=HE0RAsToQcfYzvU98c0bGCQoV0pMxCPRKFGFgbt4ngcYNRlK7OmJFDmfwy6B62F5&username=player1&password=Passw0rd1
```

If successful, returns `200` with success message and sets `jwt` in cookies

Example request: (note that it wont work with curl because of `csrf`)

```shell
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=player1&password=Passw0rd1' https://localhost:9443/api/user_management
```

Example Response Body:

```json
{
    "message": "Password Authentication successful",
    "user": {
        "id": 1,
        "password": "pbkdf2_sha256$720000$bGzLrHowwIKtEAZw6tMLX6$Rx7dH9th1qmhZUL2ZLoVpSyP+/p7lstZP/8FtqQ3jnE=",
        "last_login": "2024-02-20T16:38:58.447909Z",
        "is_superuser": false,
        "username": "player1",
        "first_name": "",
        "last_name": "",
        "email": "player1@gmail.com",
        "is_staff": false,
        "is_active": true,
        "date_joined": "2024-02-20T16:38:41.515835Z",
        "token": null,
        "playername": "PlayerOne",
        "is_online": false,
        "avatar": "/media/default_avatar.jpeg",
        "game_stats": 1,
        "groups": [],
        "user_permissions": [],
        "friends": []
    },
    "redirect_url": "/api/user_management/",
    "requires_2fa": true
}
```


### Logout

This is the endpoint to logout

```plaintext
POST /api/user_management/auth/logout
```
`cookies` need to contain `csrftoken` given on get request to endpoint.

POST body must be in `application/x-www-form-urlencoded` containing:

```
csrfmiddlewaretoken: U9SEahDeRpZQ2EHK25pVRxRdgnaNOG4ulLRRlbq9znDVtyQlOzNwPSRbJrAe5RVY
```

Example Request Body:

```
csrfmiddlewaretoken=U9SEahDeRpZQ2EHK25pVRxRdgnaNOG4ulLRRlbq9znDVtyQlOzNwPSRbJrAe5RVY
```

returns `302` 

Example request: (note that it wont work with curl because of `csrf`)

```shell
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'username=player1&password=Passw0rd1' https://localhost:9443/api/user_management
```


### Get Access Code

This is the endpoint to sond the 2fa code to the email

```plaintext
POST /api/user_management/auth/access_code
```
`cookies` need to contain `csrftoken` given on get request to endpoint.

POST body must be in `application/x-www-form-urlencoded` containing:
```
email=player@gmail.com
```

returns `200` OK  

Example request: (note that it wont work with curl because of `csrf`)

```shell
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'email=player@gmail.com' https://localhost:9443/api/user_management/auth/access_code
```
The response will have a set-cookie with the `sessionid` and the `csrftoken` 

Example response:

```json
{"success": true}
```


### Verify Access Code

This is the endpoint that will verify the access code

```plaintext
POST /api/user_management/auth/verify_code
```
`cookies` need to contain `csrftoken` given on get request to endpoint.

POST body must be in `application/x-www-form-urlencoded` containing:
```
email: player@gmail.com
one_time_code: 960029
context: signup
```

raw:
```
email=yoelridgway%40gmail.com&one_time_code=960029&context=signup
```
returns `200` OK with message and `csrf_token`

Example request: (note that it wont work with curl because of `csrf`)

```shell
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'email=yoelridgway%40gmail.com&one_time_code=960029&context=signup' https://localhost:9443/api/user_management/auth/verify_code
```
The response will have a set-cookie with the `sessionid` and the `csrftoken` 

Example response:

```json
{
    "success": true,
    "message": "One-time code verification successful",
    "csrf_token": "dWx8xM6A6OJW5o6ngq71kdZ4uSd45UIZEywlIGTvOMn1wifY2UvCiyZ2XWDvm5zt"
}
```


### Signup

This is the endpoint that will verify the access code

```plaintext
POST 3/api/user_management/auth/signup
```
`cookies` need to contain `csrftoken` and `sessionid` given on get request to login endpoint.

POST body must be in `application/x-www-form-urlencoded` containing:
```
csrfmiddlewaretoken: BElrVdZWVMe739faEBIRobmbaZ9sNc6Q2gkE67MRDKScu3oLq56smwm9D3zT4nXk
username: player1
password: Passw0rd1
confirm_password: Passw0rd1
playername: Player1
signupEmail: player@gmail.com
access_code: 960029
```

raw:
```
csrfmiddlewaretoken=BElrVdZWVMe739faEBIRobmbaZ9sNc6Q2gkE67MRDKScu3oLq56smwm9D3zT4nXk&username=player1&password=pass7890&confirm_password=pass7890&playername=Player1&signupEmail=yoelridgway%40gmail.com&access_code=960029
```
returns `200` OK with message and `csrf_token`

Example request: (note that it wont work with curl because of `csrf`)

```shell
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d 'csrfmiddlewaretoken=BElrVdZWVMe739faEBIRobmbaZ9sNc6Q2gkE67MRDKScu3oLq56smwm9D3zT4nXk&username=player1&password=pass7890&confirm_password=pass7890&playername=Player1&signupEmail=yoelridgway%40gmail.com&access_code=960029
p' https://localhost:9443/api/user_management/auth/verify_code
```

Example response:

```json
{"success": true}
```


## `HTTP` Tournament API

### Create Tournament

This endpoint creates a tournament and returns `success` if it was created and adds it to the database
The Tournament API allows the creation and management of game tournaments. Below is a detailed explanation of each attribute within the Tournament model, followed by an example JSON representation of a Tournament object.

#### Attributes:
- tournament_id: A unique identifier for the tournament. This is an auto-incremented field and serves as the primary key.
- tournament_name: The name of the tournament. This is a string up to 255 characters and is unique across all tournaments.
- game_type: A foreign key linking to the GameType model. It identifies the type of game for the tournament. 
- created_at: The date and time when the tournament was created. This is automatically set when a tournament is created.
- nbr_of_players: The number of players participating in the tournament. It must be between 2 and 8, inclusive.
- tournament_type: A foreign key linking to the TournamentType model. It specifies the type of the tournament based on the type_id from the TournamentType model.
- registration: A foreign key linking to the RegistrationType model, indicating the type of registration based on the type_id from the RegistrationType model.
- setting: A foreign key to the MatchSetting model, specifying the match settings using the setting_id.
registration_period_min: The minimum registration period for the tournament, in minutes. The default value is 15.
- host_id: An integer representing the host's identifier.

## MatchSetting API
The MatchSetting API facilitates the customization of match parameters. Below are the attribute descriptions and a JSON example.

#### Attributes:
- setting_id: A unique identifier for the match setting, auto-incremented and used as the primary key.
- duration_sec: The duration of the match in seconds. It must be between 60 (1 minute) and 300 (5 minutes).
- max_score: The maximum score a player can achieve in a match. It is constrained between 1 and 10.
- walls_factor: A setting that determines the influence of walls in a game, with valid values ranging from 0 to 2.
- size_of_goals: The size of the goals in the game. This value must be between 15 and 30.
- paddle_height: The height of the paddles used in the game, with a minimum of 1 and a maximum of 12.
- paddle_speed: The speed of the paddles, ranging from 0.1 to 2.
- ball_speed: The speed of the ball, also ranging from 0.1 to 2.
- ball_radius: The radius of the ball, constrained between 0.5 and 7.

```plaintext
POST /api/tournament/create-and-list/
```

Example Body in ```JSON``` :

```json
{
  "tournament_name": "Example Tournament",
  "nbr_of_player": 4,
  "game_type": 1,
  "tournament_type": 1,
  "registration": 1,
  "registration_period_min": 30,
  "host_id": 1,
  "setting": {
    "duration_sec": 300,
    "max_score": 10,
    "walls_factor": 0,
    "size_of_goals": 20,
    "paddle_height": 1,
    "paddle_speed": 0.7,
    "ball_speed": 0.8,
    "ball_radius": 1
  }
}

```

If successful, returns `200` status code and `success` in json

Example request:

```shell
curl -X POST -H "Content-Type: application/json" -d '@path/to/tournamentSettings.json' https://localhost:9443/api/tournament/create-and-list
```

Responds with the same body that was sent
