DROP DATABASE IF EXISTS csblackjack;
CREATE DATABASE csblackjack;
\c csblackjack
CREATE TABLE foo (
	id SERIAL PRIMARY KEY,
	datum TEXT
);
