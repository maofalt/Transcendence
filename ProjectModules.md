# Transcendence Project Modules
##### Listed below are all the modules we have completed for ft_transcendence with links to the pages in the subject where they are specified and to relevent files in which the requirements are fulfilled. Major and minor modules are denoted by `Major` and `Minor` respectively.

## Summary:
### [Mandatory Part](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=5):
- [Minimal technical requirements](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=6):
  - Built **with** backend => [Framework module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12) : `Django`
  - Frontend is pure vanilla Javascript (No libraries apart from `Bootstrap` and `ThreeJS`) => [Frontend module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12): `Bootstrap`, [Graphics module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=24): `ThreeJS`
  - Website is a `single-page application` => verify this by going to various pages and looking at the network tab in developer the console (use back and forward buttons)
  - Works with Google Chrome (Check for other browsers)
  - There should be **NO WARNINGS OR ERRORS** when browsing
  - Everything should be launched with `docker-compose up --build`

- [Game](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=7):
  - Both players should be able to use **the same keyboard** to play the Pong game => [Remote players module]() will only *"enhance"* this by adding remote players.
  - We have a **Tournament** => must clearly display who is playing who and the order of players.
  - **Registration system** is modified by [Standard User Management module]()
  - **Matchmaking system** must announce the next fight
  - All players must adhere to the same rules. e.g. Same paddle speed
  - Game must capture original *essence* of Pong (1972)
- [Security concerns](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=8)
  - Passwords in the database must be **hashed** => use strong hashing algorithm!
  - Protected aginst `SQL injections` + `XSS`
  - `HTTPS` for everything `ws` => `wss`
  - All user input should be **validated** in the backend (we can also implement frontend validation before backend validation for better UX)
  - **.env should not be stored publicly!**

### [Modules](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=9):
#### Web:
- `Major` Framework as a backend => `Django` [page 12](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12)
- `Minor` Frontend framework => `Bootstrap toolkit` [page 12](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12)
- `Minor` Use database for the backend => `PostgreSQL` [page 12](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12)
#### User Management:
- `Major` Standard user management: [page 13](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12)
  - Users can **signup**
  - Registered users can **login**
  - Users can choose a **username**
  - Users can **update** their information
  - Users can **upload** an avatar (default if none provided)
  - Users can **add friends** and see if they are **online**
  - User profiles have game stats: wins and losses
  - Each user has **Match History**: 1v1, dates... etc.
#### Gameplay and UX:
- `Major` Remote players [page 15](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=15)
