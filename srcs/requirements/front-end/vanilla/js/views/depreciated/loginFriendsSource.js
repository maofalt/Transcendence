export default `
<h1>Friends List</h1>

<form method="get" action="{% url 'account:friends' %}">
  <input type="text" name="search" placeholder="Search by username">
  <button type="submit">Search</button>
</form>

<ul>
  {% for friend in friends %}
    <li>{{ friend.username }} / {{ friend.playername }}
      {% if friend.avatar %}
        <img src="{{ friend.avatar.url }}" alt="Avatar" width="30" height="30">
      {% else %}
        <p>No avatar available</p>
      {% endif %}
      {% if friend.is_online %}
        <span style="color: green;">On</span>
      {% else %}
        <span style="color: red;">Off</span>
      {% endif %}
      <span id="winRate{{ friend.pk }}" style="color: black;">Played: {{ friend.game_stats.total_games_played }}</span>
      <span id="winRateDisplay{{ friend.pk }}"></span>

      <script>
        // JavaScript function to calculate and display win rate
        function calculateWinRate(gamesWon, totalGamesPlayed, friendId) {
          var winRateSpan = document.getElementById('winRateDisplay' + friendId);
          var totalGamesPlayedSpan = document.getElementById('winRate' + friendId);

          if (totalGamesPlayed > 0) {
            var winRate = ((gamesWon / totalGamesPlayed) * 100).toFixed(2);
            winRateSpan.innerHTML = '<span style="color: green;">(' + winRate + '% win rate)</span>';
          } else {
            totalGamesPlayedSpan.innerHTML += '<span style="color: gray;">(No games played yet)</span>';
          }
        }

        // Call the function with friend's data
      calculateWinRate({{ friend.game_stats.games_won }}, {{ friend.game_stats.total_games_played }}, {{ friend.pk }});
      </script>
      <form id="removeFriend" method="post" action="{% url 'account:remove_friend' friend.pk %}">
        {% csrf_token %}
        <button type="button" id="removeFriendButton">Remove Friend</button>
      </form>
    </li>
  {% endfor %}
</ul>

{% if search_query %}
  <p>Search Results for "{{ search_query }}":</p>
  <ul>
    {% for result in search_results %}
      <li>{{ result.username }} / {{ result.playername }}
        {% if result.avatar %}
          <img src="{{ result.avatar.url }}" alt="Avatar" width="30" height="30">
        {% else %}
          <p>No avatar available</p>
        {% endif %}
        {% if result.is_online %}
          <span style="color: green;">On</span>
        {% else %}
          <span style="color: red;">Off</span>
        {% endif %}
          <form id="addFriend" method="post" action="{% url 'account:add_friend' result.pk %}">
          {% csrf_token %}
          <button type="button" id="addFriendButton">Add Friend</button>
        </form>
      </li>
    {% endfor %}
  </ul>
{% endif %}

<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

<script>
$(document).ready(function() {
    $('#addFriendButton').click(function() {
        $.ajax({
            type: 'POST',
            url: $('#addFriend').attr('action'),
            data: $('#addFriend').serialize(),
            success: function(response) {
                location.reload();
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
    $('#removeFriendButton').click(function() {
        $.ajax({
            type: 'POST',
            url: $('#removeFriend').attr('action'),
            data: $('#removeFriend').serialize(),
            success: function(response) {
                location.reload();
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
            }
        });
    });
});

</script>
`;
