DROP DATABASE IF EXISTS csblackjack;
CREATE DATABASE csblackjack;

\c csblackjack

CREATE TABLE foo (
    id SERIAL PRIMARY KEY,
    datum TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    eth_address VARCHAR(42) UNIQUE NOT NULL,
    nickname VARCHAR(50) NOT NULL
);

CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);
