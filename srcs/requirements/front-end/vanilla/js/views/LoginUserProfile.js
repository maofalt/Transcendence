// Import necessary functions and libraries
// import { updateUserProfileUI } from '@views/LoginShadow';
export const userProfileElement = document.getElementById('userProfile');
import loginFriendsSource from '@views/loginFriendsSource';


// Define the ProfilePage class
export default class LoginUserProfile extends HTMLElement {
    
    constructor() {
        console.log("constructor called()");

        super();
        this.attachShadow({ mode: 'open' });
        console.log("constructor called-end()");
        

    }
    connectedCallback() {
        console.log("Profile connectedCallback called");

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

        // friendsLink.addEventListener('click', (event) => {
        //     event.preventDefault(); // Prevent the default link behavior (navigation)
        //     fetch('/api/user_management/auth/friends') // Fetch the HTML content of LoginFriends.js
        //         .then(response => {
        //             if (response.ok) {
        //                 return response.json();
        //             } else {
        //                 throw new Error('Failed to fetch LoginFriends content');
        //             }
        //         })
        //         .then(friends => {
        //             console.log("injecting loginFriendsSource", friends);
        //             // Inject the fetched HTML content into the shadow DOM
        //             this.shadowRoot.innerHTML = loginFriendsSource;
        //             history.pushState(null, null, friendsLink.href);

        //         })
        //         .catch(error => {
        //             console.error('Error fetching LoginFriends content:', error);
        //             // Handle error
        //         });
        // });

        // Append friendsLink to shadow DOM
        this.shadowRoot.appendChild(friendsLink);
        


        function handleSettingsClick(event) {
            event.preventDefault(); // Prevent the default link behavior (navigation)
            
            // Create a container element for the settings menu
            const settingsMenu = document.createElement('div');
            settingsMenu.id = 'settingsMenu';
            
            // Create buttons for each setting option
            const updatePasswordBtn = document.createElement('button');
            updatePasswordBtn.textContent = 'Update Password';
            updatePasswordBtn.addEventListener('click', () => {
                // Code to handle updating password goes here
                alert('Updating Password');
            });
            
            const updateProfileBtn = document.createElement('button');
            updateProfileBtn.textContent = 'Update Profile';
            updateProfileBtn.addEventListener('click', () => {
                // Code to handle updating profile goes here
                alert('Updating Profile');
            });
            
            const deleteAccountBtn = document.createElement('button');
            deleteAccountBtn.textContent = 'Delete Account';
            deleteAccountBtn.addEventListener('click', () => {
                // Code to handle deleting account goes here
                alert('Deleting Account');
            });

            const twoFASettingBtn = document.createElement('button');
            twoFASettingBtn.textContent = '2FA Settings';
            twoFASettingBtn.addEventListener('click', () => {
                // Code to handle deleting account goes here
                alert('2FA options');
            });
            
            // Append buttons to the settings menu
            settingsMenu.appendChild(updatePasswordBtn);
            settingsMenu.appendChild(updateProfileBtn);
            settingsMenu.appendChild(deleteAccountBtn);
            settingsMenu.appendChild(twoFASettingBtn);
            // Append the settings menu to the document body
            document.body.appendChild(settingsMenu);
        }

        // Create a link element
        const settingsLink = document.createElement('a');
        settingsLink.id = 'settingsLink';
        settingsLink.textContent = 'Settings';
        // settingsLink.href = '/api/user_management/auth/settings';
        // settingsLink.addEventListener('click', handleSettingsClick);
        // Append settingsLink to shadow DOM
        this.shadowRoot.appendChild(settingsLink); 
    }
    
    // Method to get the HTML content of the shadow DOM
    async getHtml() {
        // Return the shadow DOM content
        return this.shadowRoot.innerHTML;
    }
}
//     connectedCallback() {
//         console.log("P-connectedCallback called()");

//         // Retrieve userProfile data from sessionStorage
//         const userProfile = JSON.parse(sessionStorage.getItem('userProfile'));

//         if (userProfile) {
//             this.renderUserProfile(userProfile);
//             console.log("render with: ", userProfile);
//         } else {
//             console.error('User profile not found');
//         }
//     }
//     renderUserProfile(userProfile) {
//         console.log("renderUserProfile called ", );

//         // Create userProfileElement
//         const userProfileElement = document.createElement('div');
//         userProfileElement.id = 'userProfile';
//         userProfileElement.innerHTML = `
//             <p>Username: ${userProfile.username}</p>
//             <p>Playername: ${userProfile.playername}</p>
//             <p>Email: ${userProfile.email}</p>
//             <p>Friends: ${userProfile.friends_count} </p>
//             <p>Total Played: ${userProfile.total_games_played} </p>
//             <p>Won: ${userProfile.games_won} </p>
//             <p>Lost: ${userProfile.games_lost} </p>
//             ${userProfile.avatar ? `<img src="${userProfile.avatar}" alt="Avatar">` : ''}
//         `;

//         // Create a link element for friends
//         const friendsLink = document.createElement('a');
//         friendsLink.id = 'friendsLink';
//         friendsLink.textContent = 'Friends';
//         friendsLink.href = '/api/user_management/auth/friends';

//         // Append friendsLink to shadow DOM
//         this.shadowRoot.appendChild(friendsLink);

//         // Create a link element for settings
//         const settingsLink = document.createElement('a');
//         settingsLink.id = 'settingsLink';
//         settingsLink.textContent = 'Settings';
//         // settingsLink.href = '/api/user_management/auth/settings';
//         // settingsLink.addEventListener('click', handleSettingsClick);
//         // Append settingsLink to shadow DOM
//         this.shadowRoot.appendChild(settingsLink);

//         // Append userProfileElement to shadow DOM
//         this.shadowRoot.appendChild(userProfileElement);
//     }

//     // Method to get the HTML content of the shadow DOM
//     async getHtml() {
//         // Return the shadow DOM content
//         return this.shadowRoot.innerHTML;
//     }
// }

customElements.define('login-user-profile', LoginUserProfile);

    

// customElements.define('profile-page', ProfilePage);

