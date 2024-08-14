function initDealer() {
    return {
        name: "dealer",
        cards: [],
        cardValue: 0,
        blackjack: false
    };
}
function initPlayer(name, balance) {
    return {
        name: name,
        balance: balance,
        done: false,
        ready: "no",
        hands: [],
        handsDone: 0,
        insurance: false,
        bet: 0,
        sideBets: {"lucky": 0, "poker": 0, "pairs": 0},
        sideWon: {"lucky": 0, "poker": 0, "pairs": 0}
    };
}

function initHand() {
    return {
        cards: [],
        cardValue: 0,
        done: false,
        win: 0,
        blackjack: false,
        doubleDown: false
    };
}

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
function Game(player, balance){
    this.dealer = initDealer();
    this.player = initPlayer(player, balance);
}

function dealerHand(dealer, deck){
    //start the dealer's hand
    dealer.cards.push(deck.pop());
    //dealer.cards = [["SPADE", "ACE"]];
    dealer.cardValue = getCardValue(dealer.cards);
    return dealer;
}

module.exports = {
    getCard, getCardValue, randomizeDeck, shuffle, initDealer, initHand, initPlayer, Game, dealerHand
};