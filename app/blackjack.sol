// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Blackjack {
    struct Player {
        uint256 balance;
        uint256 bet;
        uint256 sideBet;
        bool active;
        bool blackjack;
        bool doubleDown;
        bool split;
        bool insurance;
        bool isDealer;
    }

    mapping(address => Player) public players;
    address public dealer;
    uint256 public minBet = 0.01 ether;

    modifier onlyDealer() {
        require(msg.sender == dealer, "Only dealer can call this function");
        _;
    }

    constructor() {
        dealer = msg.sender;
    }

    function joinGame() public payable {
        require(msg.value >= minBet, "Insufficient bet amount to join game");
        players[msg.sender].balance += msg.value;
        players[msg.sender].active = true;
    }

    function placeBet(uint256 amount) public {
        require(players[msg.sender].active, "You need to join the game first");
        require(amount <= players[msg.sender].balance, "Insufficient balance to place bet");
        players[msg.sender].bet = amount;
        players[msg.sender].balance -= amount;
    }

    function placeSideBet(uint256 amount) public {
        require(players[msg.sender].active, "You need to join the game first");
        require(amount <= players[msg.sender].balance, "Insufficient balance to place side bet");
        players[msg.sender].sideBet = amount;
        players[msg.sender].balance -= amount;
    }

    function payoutWinnings(address player, uint256 amount) public onlyDealer {
        require(players[player].active, "Player is not active in the game");
        require(amount <= address(this).balance, "Insufficient contract balance to payout");
        players[player].balance += amount;
    }

    function withdrawBalance() public {
        require(players[msg.sender].balance > 0, "No balance to withdraw");
        uint256 amount = players[msg.sender].balance;
        players[msg.sender].balance = 0;
        payable(msg.sender).transfer(amount);
    }

    function resetGame(address player) public onlyDealer {
        players[player].bet = 0;
        players[player].sideBet = 0;
        players[player].active = false;
    }

    function getPlayerBalance(address player) public view returns (uint256) {
        return players[player].balance;
    }

    function getPlayerStatus(address player) public view returns (bool) {
        return players[player].active;
    }

    // Additional game logic functions (e.g., blackjack, split, insurance) can be added here
}
