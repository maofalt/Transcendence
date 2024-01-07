CREATE TABLE "match_setting" (
  "setting_id" integer PRIMARY KEY,
  "duration_sec" integer NOT NULL DEFAULT 210,
  "max_score" integer NOT NULL DEFAULT 5,
  "nbr_of_sets" integer NOT NULL DEFAULT 1,
  "paddle_speed" integer NOT NULL DEFAULT 10,
  "ball_speed" integer NOT NULL DEFAULT 10,
  "nbr_of_players" integer NOT NULL DEFAULT 2
);


CREATE TABLE "tournament_matches" (
  "match_id" integer PRIMARY KEY,
  "tournament_id" integer,
  "round_number" integer NOT NULL,
  "match_time" timestamp,
  "match_result" varchar(255)
);

CREATE TABLE "match_participants" (
  "match_id" integer,
  "player_id" integer,
  "is_winner" boolean,
  "participant_score" integer,
  PRIMARY KEY ("match_id", "player_id")
);

CREATE TABLE "tournament_settings_audit" (
  "audit_id" integer PRIMARY KEY,
  "tournament_id" integer,
  "changed_by" integer,
  "old_setting_id" integer,
  "new_setting_id" integer,
  "change_timestamp" timestamp DEFAULT (now())
);