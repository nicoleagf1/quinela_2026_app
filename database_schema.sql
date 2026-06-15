-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    stage VARCHAR(30) NOT NULL, -- e.g., 'Group Stage', 'Round of 32', 'Final'
    home_team VARCHAR(50) NOT NULL,
    away_team VARCHAR(50) NOT NULL,
    home_team_flag VARCHAR(255),
    away_team_flag VARCHAR(255),
    kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
    home_score_actual INT DEFAULT NULL,
    away_score_actual INT DEFAULT NULL,
    winner_team VARCHAR(50) DEFAULT NULL,
    prediction_deadline TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: predictions
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    home_score_predicted INT NOT NULL CHECK (home_score_predicted >= 0),
    away_score_predicted INT NOT NULL CHECK (away_score_predicted >= 0),
    points_awarded INT DEFAULT 0,
    is_calculated BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_match_prediction UNIQUE(user_id, match_id)
);

-- Table: leaderboards
CREATE TABLE leaderboards (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_points INT DEFAULT 0,
    exact_matches_count INT DEFAULT 0,
    outcome_matches_count INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Database Indices for Optimization
CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX idx_predictions_lookup ON predictions(user_id, match_id);
CREATE INDEX idx_leaderboards_ranking ON leaderboards(total_points DESC, exact_matches_count DESC);
