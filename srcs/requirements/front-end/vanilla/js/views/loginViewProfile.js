import { getCookie } from "@utils/getCookie";

document.addEventListener("DOMContentLoaded", function() {
    // Function to render user data
    function renderUserData(data) {
        document.title = `${data.username}'s profile`;

        document.getElementById('username').textContent = data.username;
        if (data.avatar) {
            document.getElementById('avatar').src = data.avatar;
        } else {
            document.getElementById('avatar').style.display = 'none';
            document.getElementById('no-avatar').style.display = 'block';
        }
        document.getElementById('email').textContent = data.email;
        document.getElementById('playername').textContent = data.playername;
        document.getElementById('friends-count').textContent = data.friends_count;

        // GameStats
        document.getElementById('game-player').textContent = data.game_stats.user;
        document.getElementById('total-games-played').textContent = data.game_stats.total_games_played;
        document.getElementById('games-won').textContent = data.game_stats.games_won;
        document.getElementById('games-lost').textContent = data.game_stats.games_lost;
    }

    // Fetch user data
    fetch('/api/user_management/auth/detail') // Update this with your actual endpoint
        .then(response => response.json())
        .then(data => renderUserData(data))
        .catch(error => console.error('Error fetching user data:', error));

    // Event listener for delete account link
    document.getElementById('deleteAccountLink').addEventListener('click', function() {
        document.getElementById('deleteAccountModal').style.display = 'block';
    });

    // Event listener for confirm delete account button
    document.getElementById('confirmDeleteAccount').addEventListener('click', function() {
        document.getElementById('deleteAccountModal').style.display = 'none';

        // Send AJAX request to delete account
        fetch('/api/user_management/auth/delete_account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Account deleted successfully');
                document.getElementById('deleteConfirmationModal').style.display = 'block';
            } else {
                console.error('Error deleting account:', data.error);
            }
        })
        .catch(error => console.error('Error deleting account:', error));
    });

    // Event listener for cancel delete account button
    document.getElementById('cancelDeleteAccount').addEventListener('click', function() {
        document.getElementById('deleteAccountModal').style.display = 'none';
    });

    // Event listener for redirect to home button in delete confirmation modal
    document.getElementById('redirectToHome').addEventListener('click', function() {
        window.location.href = '/home'; // Update this with your actual home URL
    });
});
