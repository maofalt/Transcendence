// Import necessary functions and libraries
// import { updateUserProfileUI } from '@views/LoginShadow';
export const userProfileElement = document.getElementById('userProfile');
import loginFriendsSource from '@views/loginFriendsSource';

// Define the ProfilePage class
export default class ProfilePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Retrieve userProfile data from sessionStorage
        const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));

        // Create userProfileElement
        const userProfileElement = document.createElement('div');
        userProfileElement.id = 'userProfile';
        userProfileElement.innerHTML = `
            <p>Username: ${userProfile.username}</p>
            <p>Playername: ${userProfile.playername}</p>
            <p>Email: ${userProfile.email}</p>
            <p>Friends: ${userProfile.friends_count} </p>
            <p>Total Played: ${userProfile.total_games_played} </p>
            <p>Won: ${userProfile.games_won} </p>
            <p>Lost: ${userProfile.games_lost} </p>
            ${userProfile.avatar ? `<img src="${userProfile.avatar}" alt="Avatar">` : ''}
        `;

        // Append userProfileElement to shadow DOM
        this.shadowRoot.appendChild(userProfileElement);
        // Create a link element
        const friendsLink = document.createElement('a');
        friendsLink.id = 'friendsLink';
        friendsLink.textContent = 'Friends';
        friendsLink.href = '/api/user_management/auth/friends';

        friendsLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the default link behavior (navigation)
            fetch('/api/user_management/auth/friends') // Fetch the HTML content of LoginFriends.js
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to fetch LoginFriends content');
                    }
                })
                .then(friends => {
                    console.log("injectting loginFriendsSource", friends);
                    // Inject the fetched HTML content into the shadow DOM
                    this.shadowRoot.innerHTML = loginFriendsSource;
                    history.pushState(null, null, friendsLink.href);

                })
                .catch(error => {
                    console.error('Error fetching LoginFriends content:', error);
                    // Handle error
                });
        });

        // Append friendsLink to shadow DOM
        this.shadowRoot.appendChild(friendsLink);
        
        // Create a link element
        const settingsLink = document.createElement('a');
        settingsLink.id = 'settingsLink';
        settingsLink.textContent = 'Settings';
        settingsLink.href = '/settings';

        // Append settingsLink to shadow DOM
        this.shadowRoot.appendChild(settingsLink);
        
    }
}

customElements.define('profile-page', ProfilePage);
