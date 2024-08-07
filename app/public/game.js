console.log("working");
////////// Initialize Variables //////////

// buttons
let hit = document.getElementById("hit");
let stand = document.getElementById("stand");
let double = document.getElementById("double");
let buttons = document.getElementById("buttons");
let split = document.getElementById("split");
let insurance = document.getElementById("insurance");
let betReady = document.getElementById("betReady");
let sideBetReady = document.getElementById("sideBetReady");

// message fields
let message = document.getElementById("message");
let displayPlayer = document.getElementById("player");
let displayDealer = document.getElementById("dealer");

// bet div
let betDisplay = document.getElementById("betDisplay");
let sideBet = document.getElementById("sideBet"); //which side bet is selected
let sideBetValue = document.getElementById("sideBetValue"); //value of side bet
let sideMessage = document.getElementById("sideMessage"); //confirm bet was placed

let balance = document.getElementById("balance");

// server variables?
let deck;

function initDealer(){
    this.name = "dealer";
    this.cards = [];
    this.cardValue = 0;
    this.blackjack = false;
}
function initPlayer(name, balance){
    this.name = name;
    this.balance = balance;
    this.hands = [];
    this.handsDone = 0;
    this.insurance = false;
    this.bet = 0;
    this.sideBets = {"lucky": 0, "poker": 0, "pairs": 0};
    this.sideWon = {"lucky": 0, "poker": 0, "pairs": 0};
}

function initHand(){
    this.cards = [];
    this.cardValue = 0;
    this.done = false;
    this.win = 0;
    this.blackjack = false;
    this.doubleDown = false;
}


////////// Create Deck //////////

// Durstenfeld shuffle
function randomizeDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
}
function shuffle(numDecks){
    let suits = ["HEART", "SPADE", "DIAMOND", "CLUB"];
    let cards = ["ACE", "2", "3", "4", "5", "6", "7", "8", "9", "10", "JACK", "QUEEN", "KING"];
    deck = [];
    
    for (let i = 0; i < numDecks; i++){
        suits.forEach((suit) => {
            cards.forEach((card) => {
                deck.push([suit,card]);
            })
        });
    }
    randomizeDeck(deck);
    return (deck);
}

function getCardValue(cards){
    let cardValue = 0;
    let aces = 0;
    for (let i = 0; i < cards.length; i++){
        if((cards[i][1] === "JACK") || (cards[i][1] === "QUEEN") || (cards[i][1] === "KING")){
            cardValue += 10;
        } else if (cards[i][1] === "ACE"){
            cardValue += 11;
            aces += 1;
        } else {
            cardValue += parseInt(cards[i][1]);
        }
    }

    while (cardValue > 21 && aces > 0){
        cardValue -= 10;
        aces -= 1;
    }
    return cardValue;
}

function getCard(cards){
    cards.push(deck.pop());
    let value = getCardValue(cards);
    return value;
}

////////// Side Bets //////////

/*
Lucky Ladies - player's cards
Any 20	                                            4 to 1 
Suited 20	                                        9 to 1
Matched 20 (two identical cards)	                19 to 1
Queen of Hearts pair	                            125 to 1
Queen of Hearts pair with Dealer Blackjack	        1000 to 1

21 + 3 - player’s first two cards and the dealer’s face up card
Flush (same suit)                                   5 to 1
Straight (1, 2, 3)                                  10 to 1 
Three of a kind (same card face)                    30 to 1
Straight flush (same suit & 1, 2, 3)                40 to 1
Suited three of a kind (same suit , same card face) 100 to 1

Perfect Pairs - player's cards
Mixed pairs                                         5 to 1
Coloured pair                                       10 to 1
Perfect pair                                        30 to 1
*/

function checkCards(first, second) {
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) return false;
    }
    return true;
}

function checkBets(player, dealer) {
    let hand = player.hands[0];
    let hearts = ["HEART", "QUEEN"];
    let cards = [hand.cards[0], hand.cards[1], dealer.cards[0]];
    let red = ["HEART", "DIAMOND"];
    let black = ["CLUB", "SPADE"];

    //lucky ladies
    //check for hearts
    if (checkCards(cards[0], hearts) && checkCards(cards[1], hearts)) {
        player.sideWon["lucky"] = 125;
    }
    //check for identical 20
    else if (checkCards(cards[0], cards[1]) && (hand.cardValue === 20)) {
        player.sideWon["lucky"] = 19;
    }
    //check for suited 20
    else if (cards[0][0] === cards[1][0] && (hand.cardValue === 20)) {
        player.sideWon["lucky"] = 9;
    }
    //check for 20
    else if (hand.cardValue === 20) {
        player.sideWon["lucky"] = 4;
    }

    // 21 + 3
    //check for suited three of a kind
    if (checkCards(cards[0], cards[1]) && checkCards(cards[1], cards[2])) {
        player.sideWon["poker"] = 100;
    }
    //check for straight flush

    //check for three of a kind
    else if (cards.every(card => card[1] === cards[0][1])) {
        player.sideWon["poker"] = 30;
    }
    //check for straight

    //check for flush
    else if (cards.every(card => card[0] === cards[0][0])) {
        player.sideWon["poker"] = 5;
    }

    //Perfect Pairs
    //check for perfect pair
    if (checkCards(cards[0], cards[1])) {
        player.sideWon["pairs"] = 19;
    }
    //check for colored pair
    else if (cards[0][1] === cards[1][1] && ((red.includes(cards[0][0]) && red.includes(cards[1][0])) || (black.includes(cards[0][0]) && black.includes(cards[1][0])))) {
        player.sideWon["pairs"] = 10;
    }
    //check for mixed pair
    else if (cards[0][0] === cards[1][0]) {
        player.sideWon["pairs"] = 5;
    }
}

////////// New Hand //////////

function newHand(player, dealer){
    //hide / unhide
    buttons.style.display = "block";
    double.style.display = "block";
    betDisplay.style.display = "none";
    message.textContent = "";

    //reshuffle when low enough
    if (deck.length < 30) deck = shuffle(3);

    //start the player's hand
    player.hands = [new initHand()];
    let hand = player.hands[0];
    hand.cards.push(deck.pop());
    hand.cards.push(deck.pop());
    //hand.cards = [["HEART", "QUEEN"], ["HEART", "QUEEN"]];
    hand.cardValue = getCardValue(hand.cards);

    //start the dealer's hand
    dealer.cards.push(deck.pop());
    //dealer.cards = [["SPADE", "ACE"]];
    dealer.cardValue = getCardValue(dealer.cards);

    //check which side bets were won
    checkBets(player,dealer);

    console.log(JSON.stringify(player));
    console.log(JSON.stringify(player));

    //check for blackjack
    if (hand.cardValue === 21){
        //finish the turn
        endTurn (player);
        return;
    }
    //check for split
    if(hand.cards[0][1] === hand.cards[1][1]){
        split.style.display = "";
    }
    //check for insurance
    if(dealer.cards[0][1] === "ACE"){
        insurance.style.display = "";
    }

    displayPlayer.textContent = hand.cards;
    displayDealer.textContent = dealer.cards;
    return;
}

////////// Payout //////////

function payout(player,dealer){
    // check if dealer's second card is a face card and player has insurance
    if (dealer.cards.length != 0){
        if (((dealer.cards[1][1] === "JACK") || (dealer.cards[1][1] === "QUEEN") || (dealer.cards[1][1] === "KING")) && (player.insurance)){
            // player original bet + 0.5 bet -> 2:1 bet is * 3
            player.balance += (player.bet * 3);
            console.log(JSON.stringify("insurance"));
    }}

    // check side bets
    for ([betVal, value] of Object.entries(player.sideBets)){
        if (!((player.sideWon[betVal] * value) === 0)) console.log(JSON.stringify("bet won"));
        player.balance += (player.sideWon[betVal] * value);
    }

    //check each hand for a win
    if (!(player.hands.length === 0)){
        for (let i = 0; i < player.hands.length; i++){
            console.log(player.hands[i]);
            //blackjack
            if (player.hands[i].blackjack){
                player.balance += (2.5 * player.bet);
                console.log(JSON.stringify("blackjack"));
            }
            //win
            else if (player.hands[i].win === 1) {
                if(player.hands[i].doubleDown){
                    player.balance += (4 * player.bet);
                    console.log(JSON.stringify("win double"));
                }
                else {
                    player.balance += (2 * player.bet);
                    console.log(JSON.stringify("win"));
                }
            }
            //draw
            else if (player.hands[i].win === 2){
                if(player.hands[i].doubleDown){
                    player.balance += (2 * player.bet);
                    console.log(JSON.stringify("draw double"));
                }
                else {
                    player.balance += (1 * player.bet);
                    console.log(JSON.stringify("draw"));
                }
            }
            //loss
            else console.log(JSON.stringify("lose"));
    }}

    return;
}

////////// Reset //////////

function reset(player,dealer){
    //hide/unhide
    buttons.style.display = "none";
    split.style.display = "none";
    insurance.style.display = "none";
    betDisplay.style.display = "";
    sideMessage.textContent = "";

    //payout
    payout(player,dealer);

    balance.textContent = player.balance;

    //reset everything
    player.hands = [];
    player.handsDone = 0;
    player.insurance = false;
    player.sideBets = {"lucky": 0, "pairs": 0, "poker":0};
    player.sideWon = {"lucky": 0, "pairs": 0, "poker":0};
    player.bet = 0;

    dealer.cards = [];
    dealer.cardValue = 0;
    dealer.blackjack = false;

    return;
}

////////// Hit Functions //////////

function hitFunction(player){
    let value = 0;
    let hand = player.hands[player.handsDone];

    //add a new card to active hand
    value = getCard(hand.cards);
    hand.cardValue = value;
    displayPlayer.textContent = hand.cards;

    //no more double down
    if(hand.cards.length > 2){
        double.style.display = "none";
    }

    //add code to take off insurance after first turn

    //check if bust or blackjack
    if (value >= 21){
        endTurn (player);
    }

    //check for split
    if((hand.cards[0][1] === hand.cards[1][1])){
        if ((hand.cards.length === 2)) split.style.display = "";
        else split.style.display = "none";
    }

    console.log(JSON.stringify(player));
    return;
} 

hit.addEventListener("click", () => {
    hitFunction(player);
})

////////// End Turn //////////

function checkWin (hand){
    //check for blackjack
    if ((hand.cardValue == 21) && !(dealer.cardValue === 21)) {
        hand.win = 1;
        hand.blackjack = true;
        message.textContent = "Blackjack!";
    }
    //check for dealer bust
    else if ((hand.cardValue < 21) && (dealer.cardValue > 21)) {
        hand.win = 1;
        message.textContent = "Win";
    }
    //check if player > dealer and player <= 21
    else if ((hand.cardValue > dealer.cardValue) && (hand.cardValue <= 21)) {
        hand.win = 1;
        message.textContent = "Win";
    }
    //check if player == dealer, and nobody busts
    else if ((hand.cardValue === dealer.cardValue) && (dealer.cardValue <= 21)) {
        hand.win = 2;
        message.textContent = "Draw";
    }
    else {
        hand.win = 0;
        message.textContent = "Lose";
    }
    return;
}

function endDealer(dealer){
    //if dealer value > 17, keep getting cards
    while (dealer.cardValue < 17){
        dealer.cards.push(deck.pop());
        //dealer.cards.push(["HEART","KING"]);
        dealer.cardValue = getCardValue(dealer.cards);
        displayDealer.textContent = dealer.cards;
    }
    //check for dealer blackjack
    if (dealer.cardValue === 21) dealer.blackjack = true;
    console.log(JSON.stringify(dealer));
    return;
}

function endTurn(player){
    //mark hand as done
    player.hands[player.handsDone].done = true;
    player.handsDone += 1;

    //if not all hands are done, hit the next hand
    if (!(player.handsDone === player.hands.length)) hitFunction(player);
    //else end the turn, check for a win, and reset hand
    else {
        endDealer(dealer);
        for (let i = 0; i < player.hands.length; i++){
            checkWin(player.hands[i]);
        }
        console.log(JSON.stringify(player));
        reset(player,dealer);
    }
}

////////// Stand Functions //////////

stand.addEventListener("click", () => {
    endTurn(player);
})

////////// Bet Functions //////////

betReady.addEventListener("click", () => {
    let betVal = document.getElementById("betValue"); //normal bet
    player.bet = betVal.value;
    player.balance -= player.bet;
    newHand(player, dealer);
    return;
})

sideBetReady.addEventListener("click", () => {
    //check if side bet exists, and enter into object
    if (player.sideBets.hasOwnProperty(sideBet.value)){
        player.sideBets[sideBet.value] = sideBetValue.value;
    }
    sideMessage.textContent = "Side Bet " + sideBet.value + " confirmed for " + sideBetValue.value;
    player.balance -= sideBetValue.value;
    return;
})

////////// Double Functions //////////

double.addEventListener("click", () => {
    //minus bet, hit, if turn not done, end turn
    let hand = player.hands[player.handsDone];
    player.balance -= player.bet;
    hand.doubleDown = true;
    hitFunction(player);
    if (!hand.done) endTurn(player);
    return;
})

////////// Split Functions //////////


split.addEventListener("click", ()=>{
    split.style.display = "none";

    //create a new hand with one card in each hand
    player.hands.push(new initHand());
    player.hands[player.hands.length - 1].cards.push(player.hands[player.handsDone].cards.pop());
    let first = player.hands[player.handsDone];
    let second = player.hands[player.hands.length - 1];
    first.cardValue = getCardValue(first.cards);
    second.cardValue = getCardValue(second.cards);
    
    // add logic if split cards are aces, add one card to each and end both turns
    player.balance -= player.bet;
    hitFunction(player);

    displayPlayer.textContent = first.cards;
    return;
})

////////// Insurance Functions //////////

insurance.addEventListener("click", ()=>{
    player.insurance = true;
    player.balance -= (player.bet / 2);
    insurance.style.display = "none";
})

////////// Setup //////////

let dealer = new initDealer();
let player = new initPlayer("player", 500);
console.log(JSON.stringify(player));
deck = shuffle(2);
reset(player,dealer);