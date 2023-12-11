-- Table for player statistics
CREATE TABLE player_stats (
    user_id INT REFERENCES users(id),  -- Link to the user table
    wins INT DEFAULT 0,                -- Number of games won by the player
    losses INT DEFAULT 0,              -- Number of games lost by the player
    games_played INT DEFAULT 0,        -- Total number of games played
    -- Add any other relevant statistics here
);

-- Table for individual game sessions
CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,             -- Unique identifier for each game session
    player1_id INT REFERENCES users(id),  -- First player ID
    player2_id INT REFERENCES users(id),  -- Second player ID
    winner_id INT REFERENCES users(id),   -- ID of the winner (NULL if draw)
    player1_score INT,                 -- Score of the first player
    player2_score INT,                 -- Score of the second player
    game_duration INTERVAL,            -- Duration of the game
    game_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the game was played
    -- Additional details about the game can be added here
);

-- Table for tournaments (if applicable)
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,             -- Unique identifier for each tournament
    tournament_name VARCHAR(100),      -- Name of the tournament
    start_date TIMESTAMP,              -- Starting date and time of the tournament
    end_date TIMESTAMP,                -- Ending date and time of the tournament
    -- Additional details about the tournament can be added here
);

-- Table for tournament participants (if applicable)
CREATE TABLE tournament_participants (
    tournament_id INT REFERENCES tournaments(id),  -- Link to the tournaments table
    user_id INT REFERENCES users(id),              -- Link to the user table
    -- Additional details about participant's performance in the tournament can be added here
);

-- Table for tournament matches (if applicable)
CREATE TABLE tournament_matches (
    id SERIAL PRIMARY KEY,                          -- Unique identifier for each match in the tournament
    tournament_id INT REFERENCES tournaments(id),   -- Link to the tournaments table
    player1_id INT REFERENCES users(id),            -- First player ID in the match
    player2_id INT REFERENCES users(id),            -- Second player ID in the match
    winner_id INT REFERENCES users(id),             -- ID of the winner (NULL if draw)
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When the match was played
    -- Additional details about the match can be added here
);