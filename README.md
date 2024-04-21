# Transcendence Project Modules
##### Listed below are all the modules we have completed for ft_transcendence with links to the pages in the subject where they are specified and to relevent files in which the requirements are fulfilled. Major and minor modules are denoted by `Major` and `Minor` respectively.

### [Mandatory Part](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=5):
- [Minimal technical requirements](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=6):
  - Built **with** backend => [Framework module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12) : `Django`
  - Frontend is pure vanilla Javascript (No libraries apart from `Bootstrap` and `ThreeJS`) => [Frontend module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=12): `Bootstrap`, [Graphics module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=24): `ThreeJS`
  - Website is a `single-page application` => verify this by going to various pages and looking at the network tab in developer the console (use back and forward buttons)
  - Works with Google Chrome (Check for other browsers)
  - There should be **NO WARNINGS OR ERRORS** when browsing
  - Everything should be launched with `docker-compose up --build`

- [Game](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=7):
  - Both players should be able to use **the same keyboard** to play the Pong game ([Remote players module](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=15) will only *"enhance"* this by adding remote players).
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
- `Major` Multiple players [page 15](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=15)
- `Minor` Game Customization [page 15-16](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=15)
  - power-ups, attacks, or different maps => enhance gameplay experience
  - option to choose default game for simpler experience
  - User friendly menus for game customization
#### Cybersecurity:
- `Minor` GDPR Compliance, User Anonymization, Data Managment, and Account Deletion [page 19](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=19)
  - Allow users to request anonymization
  - Provide tools to manage data: ability to view, edit and delete personal information
  - Streamlined process for account deletion
- `Major` Two-Factor Auth (2FA) + JWT [page 20](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=20)
  - Require users to provide secondary verification
  - User-friendly setup process for 2FA enabling. With options for: SMS codes, authenticatior apps and email codes.
  - Use `JSON Web Tokens` (JWT) for for authentication. User sessions and access to resources should be managed securely
  - JWT tokens must be issued and validated securely!
#### Devops:
- `Major` Backend as Microservices [page 22](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=22)
  - Loosely-coupled microservices
  - Define clear boundaries between microservices
  - Implement microservice communication (REST or message queue)
  - Ensure that there is proper **seperation of concerns** between services
#### Graphics:
- `Major` Advanced 3D => `ThreeJS` [page 24](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=22)
#### Server-Side Pong:
- `Major` Server-Side Pong + API [page 27](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=22)
  - All login is on the server-side: ball movement, scoring, player interactions, etc.
  - Create API to interact with the game => allow partial usage via CLI
  - API endpoints: game initialization, player controls, and game state updates.
 
## TOTAL: 
### 8x `Major` + 4x `Minor` 
### = 7x `Major` (100%) + 1x `Major` (10%) + 4x `Minor` (20%) 
### = <ins>**130%**</ins>


## Potential `?`
#### Accessibility: `?` [page 25](https://cdn.intra.42.fr/pdf/pdf/118630/en.subject.pdf#page=25)
- `Minor` Support on all devices `?`
- `Minor` Expanding Browser Compatibility `?`

