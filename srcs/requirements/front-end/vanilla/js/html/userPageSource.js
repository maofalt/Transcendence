
export default `
<h1>{{ data.username }}'s profile</h1>

<p>Username: {{ data.username }}</p>
{% if data.avatar %}
	<p><img src="{{ data.avatar }}" alt="Avatar" width="30" height="30"></p>
{% else %}
	<p>No avatar available</p>
{% endif %}
<p>Email: {{ data.email }}</p>
<p>Playername: {{ data.playername }}</p>

<p>Friends: <a id="friendsLink" href="{% url 'account:friend' %}">{{ data.friends_count }}</a></p>

<h2>GameStats</h2>
<p>Game Player: {{ data.game_stats.user }}</p>
<p>Total Games Played: {{ data.game_stats.total_games_played }}</p>
<p>Games Won: {{ data.game_stats.games_won }}</p>
<p>Games Lost: {{ data.game_stats.games_lost }}</p>

<a id="profileUpdate" href="{% url 'account:profile_update' %}">Update Profile</a>
<p></p>
<a id="deleteAccountLink">Delete Account</a>
<p></p>
<button type="button" onclick="redirectToGameStatsPage()">GAME STATS TEST</button>

<div id="deleteAccountModal" style="display: none;">
	<p>If you delete your account, all of your data will be deleted permanently.</p>
	<p>Are you sure you want to delete your pong account?</p>
	<button onclick="confirmDeleteAccount()">Yes, I'm sure</button>
	<button onclick="cancelDeleteAccount()">No, I'll keep my account</button>
</div>

<div id="deleteConfirmationModal" style="display: none;">
	<p>Your account has been deleted successfully.</p>
	<p>Thank you for being part of our community.</p>
	<button onclick="redirectToHome()">Go to Home</button>
</div>
`;
