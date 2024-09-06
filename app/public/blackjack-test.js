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

// message fields
let message = document.getElementById("message");

// bet div
let betDisplay = document.getElementById("betDisplay");
let sideBet = document.getElementById("sideBet"); //which side bet is selected
let sideBetValue = document.getElementById("sideBetValue"); //value of side bet
let sideMessage = document.getElementById("sideMessage"); //confirm bet was placed

let balance = document.getElementById("balance");
const undoButton = document.getElementById('undoButton');
const imageButtons = document.querySelectorAll('.image-button');
const mainBetButton = document.getElementById('mainBetButton');
const sideBetButton = document.getElementById('sideBetButton');
const mainBetSection = document.getElementById('mainBetSection');
const sideBetSection = document.getElementById('sideBetSection');
const sideBetSelect = document.getElementById('sideBet');
const sideBetContainers = document.querySelectorAll('.side-bet-options');

// server variables?
let deck;
const imageMapping = {
    "2_HEART": "2_of_hearts.png",
    "3_HEART": "3_of_hearts.png",
    "4_HEART": "4_of_hearts.png",
    "5_HEART": "5_of_hearts.png",
    "6_HEART": "6_of_hearts.png",
    "7_HEART": "7_of_hearts.png",
    "8_HEART": "8_of_hearts.png",
    "9_HEART": "9_of_hearts.png",
    "10_HEART": "10_of_hearts.png",
    "JACK_HEART": "jack_of_hearts.png",
    "QUEEN_HEART": "queen_of_hearts.png",
    "KING_HEART": "king_of_hearts.png",
    "ACE_HEART": "ace_of_hearts.png",
    
    "2_DIAMOND": "2_of_diamonds.png",
    "3_DIAMOND": "3_of_diamonds.png",
    "4_DIAMOND": "4_of_diamonds.png",
    "5_DIAMOND": "5_of_diamonds.png",
    "6_DIAMOND": "6_of_diamonds.png",
    "7_DIAMOND": "7_of_diamonds.png",
    "8_DIAMOND": "8_of_diamonds.png",
    "9_DIAMOND": "9_of_diamonds.png",
    "10_DIAMOND": "10_of_diamonds.png",
    "JACK_DIAMOND": "jack_of_diamonds.png",
    "QUEEN_DIAMOND": "queen_of_diamonds.png",
    "KING_DIAMOND": "king_of_diamonds.png",
    "ACE_DIAMOND": "ace_of_diamonds.png",
    
    "2_CLUB": "2_of_clubs.png",
    "3_CLUB": "3_of_clubs.png",
    "4_CLUB": "4_of_clubs.png",
    "5_CLUB": "5_of_clubs.png",
    "6_CLUB": "6_of_clubs.png",
    "7_CLUB": "7_of_clubs.png",
    "8_CLUB": "8_of_clubs.png",
    "9_CLUB": "9_of_clubs.png",
    "10_CLUB": "10_of_clubs.png",
    "JACK_CLUB": "jack_of_clubs.png",
    "QUEEN_CLUB": "queen_of_clubs.png",
    "KING_CLUB": "king_of_clubs.png",
    "ACE_CLUB": "ace_of_clubs.png",
    
    "2_SPADE": "2_of_spades.png",
    "3_SPADE": "3_of_spades.png",
    "4_SPADE": "4_of_spades.png",
    "5_SPADE": "5_of_spades.png",
    "6_SPADE": "6_of_spades.png",
    "7_SPADE": "7_of_spades.png",
    "8_SPADE": "8_of_spades.png",
    "9_SPADE": "9_of_spades.png",
    "10_SPADE": "10_of_spades.png",
    "JACK_SPADE": "jack_of_spades.png",
    "QUEEN_SPADE": "queen_of_spades.png",
    "KING_SPADE": "king_of_spades.png",
    "ACE_SPADE": "ace_of_spades.png"
};

function dp(name, hands, location) {
    console.log(name);
    console.log(hands);

    // Get the image container element
    const playersContainer = document.getElementById(location);
    playersContainer.innerHTML = '';

    // Create player container
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';

    // Create and add player name
    const playerName = document.createElement('div');
    playerName.className = 'player-name';
    playerName.textContent = name;
    playerDiv.appendChild(playerName);

    // Create and add player hands
    const handsContainer = document.createElement('div');
    handsContainer.className = 'player-hands';

    hands.forEach((hand, index) => {
        // Create a container for the hand
        const handDiv = document.createElement('div');
        handDiv.className = 'hand';
        
        if (hand.win === 1 && hand.cardValue == 21) {
            handDiv.style.border = '2px solid blue';
        } else if (hand.win === 1){
            handDiv.style.border = '2px solid green';
        } else if (hand.win === 0) {
            handDiv.style.border = '2px solid red';
        } else if (hand.win === 2) {
            handDiv.style.border = '2px solid yellow';
        } else{
            handDiv.style.border = '2px solid white';
        }

        // Add cards to the hand
        hand.cards.forEach(card => {
            const img = document.createElement('img');
            const cardKey = `${card[1]}_${card[0]}`;
            console.log(cardKey);
            img.src = `Playing Cards/${imageMapping[cardKey]}`; // Adjust path as needed
            img.alt = cardKey;
            img.className = 'card-image'; // Add a class for card images if needed
            handDiv.appendChild(img);
        });

        // Append the hand to the hands container
        handsContainer.appendChild(handDiv);
    });

    // Append the hands container to the player container
    playerDiv.appendChild(handsContainer);

    // Append the player container to the main container
    playersContainer.appendChild(playerDiv);
}
function dpo(name, hands, location) {
    console.log(name);
    console.log(hands);

    // Get the image container element
    const playersContainer = document.getElementById(location);

    // Create player container
    const playerDiv = document.createElement('div');
    playerDiv.className = 'otherPlayer';

    // Create and add player name
    const playerName = document.createElement('div');
    playerName.className = 'otherPlayer-name';
    playerName.textContent = name;
    playerDiv.appendChild(playerName);

    // Create and add player hands
    const handsContainer = document.createElement('div');
    handsContainer.className = 'otherPlayer-hands';

    hands.forEach((hand, index) => {
        // Create a container for the hand
        const handDiv = document.createElement('div');
        handDiv.className = 'hand';
        
        if (hand.win === 1 && hand.cardValue == 21) {
            handDiv.style.border = '2px solid blue';
        } else if (hand.win === 1){
            handDiv.style.border = '2px solid green';
        } else if (hand.win === 0) {
            handDiv.style.border = '2px solid red';
        } else if (hand.win === 2) {
            handDiv.style.border = '2px solid yellow';
        } else{
            handDiv.style.border = '2px solid white';
        }

        // Add cards to the hand
        hand.cards.forEach(card => {
            const img = document.createElement('img');
            const cardKey = `${card[1]}_${card[0]}`;
            console.log(cardKey);
            img.src = `Playing Cards/${imageMapping[cardKey]}`; // Adjust path as needed
            img.alt = cardKey;
            img.className = 'otherCard-image'; // Add a class for card images if needed
            handDiv.appendChild(img);
        });

        // Append the hand to the hands container
        handsContainer.appendChild(handDiv);
    });

    // Append the hands container to the player container
    playerDiv.appendChild(handsContainer);

    // Append the player container to the main container
    playersContainer.appendChild(playerDiv);
}

function displayDealer(dealer) {
    console.log(dealer.name);
    console.log(dealer.cards);

    const playersContainer = document.getElementById("dealer");
    playersContainer.innerHTML = '';
    
    // Create dealer container
    const dealerDiv = document.createElement('div');
    dealerDiv.className = 'dealer';
    
    // Create and add dealer image
    const dealerImage = document.createElement('img');
    dealerImage.src = 'Extra/dealer.png'; // Replace with the path to your image
    dealerImage.alt = 'Dealer Image'; // Alternative text for the image
    dealerImage.style.width = '80px'; // Example style
    dealerImage.style.height = 'auto'; // Maintain aspect ratio
    
    // Append the image to the dealer container
    dealerDiv.appendChild(dealerImage);
    
    // Append the dealer container to the playersContainer
    playersContainer.appendChild(dealerDiv);
    

    // Create and add dealer's cards
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'dealer-cards';

    // Create a container for the single hand of the dealer
    const handDiv = document.createElement('div');
    handDiv.className = 'hand';

    // Add cards to the hand
    dealer.cards.forEach(card => {
        const img = document.createElement('img');
        const cardKey = `${card[1]}_${card[0]}`;
        console.log(cardKey);
        img.src = `Playing Cards/${imageMapping[cardKey]}`; // Adjust path as needed
        img.alt = cardKey;
        img.className = 'dealer-card-image'; // Add a class for card images if needed
        handDiv.appendChild(img);
    });
    if (dealer.cards.length == 1){
            const img = document.createElement('img');
            const cardKey = `back.jpg`;
            console.log(cardKey);
            img.src = `Extra/${cardKey}`; // Adjust path as needed
            img.alt = cardKey;
            img.className = 'dealer-card-image'; // Add a class for card images if needed
            handDiv.appendChild(img);
    }

    // Append the hand to the cards container
    cardsContainer.appendChild(handDiv);

    // Append the cards container to the dealer div
    dealerDiv.appendChild(cardsContainer);

    // Append the dealer div to the main container
    playersContainer.appendChild(dealerDiv);
}
function updateSide(){
    document.getElementById('luckyB').textContent = `Lucky Ladies: ${player.sideBets["lucky"]}`;
    document.getElementById('pokerB').textContent = `21+3: ${player.sideBets["poker"]}`;
    document.getElementById('pairsB').textContent = `Perfect Pairs: ${player.sideBets["pairs"]}`;

}
let mainBetTotal = 0;
let sideBetTotal = 0;
document.addEventListener('DOMContentLoaded', () => {
    let history = [];
    let currentSideBet = null;

    // Helper function to update main bet total
    function updateMainBetTotal(amount) {
        mainBetTotal += amount;
        document.getElementById('mainBetBalance').textContent = `Bet: ${mainBetTotal}`;
        history.push({ type: 'main', amount });
    }
    // Helper function to update side bet total
    function updateSideBetTotal(amount) {
        if (currentSideBet) {
            player.sideBets[currentSideBet] += amount;
            player.balance -= amount;
            sideBetTotal += amount;
            history.push({ type: 'side', betType: currentSideBet, amount });
            updateSide();
            console.log(player.sideBets);
        }
    }

    // Function to undo the last action
    function undoLastAction() {
        if (history.length === 0) return;

        const lastAction = history.pop();
        if (lastAction.type === 'main') {
            mainBetTotal -= lastAction.amount;
            document.getElementById('mainBetBalance').textContent = `Bet: ${mainBetTotal}`;
        } else if (lastAction.type === 'side') {
            if (lastAction.betType) {
                player.sideBets[lastAction.betType] -= lastAction.amount;
                sideBetTotal -= lastAction.amount;
                updateSide();
            }
        }
    }

    // Function to handle image button clicks
    function handleImageButtonClick(event) {
        const amount = parseFloat(event.target.getAttribute('data-value'));
        if (mainBetSection.style.display !== 'none') {
            updateMainBetTotal(amount);
        } else if (currentSideBet) {
            updateSideBetTotal(amount);
        }
    }

    // Add event listeners to image buttons in both main and side bet sections
    document.querySelectorAll('.image-button').forEach(image => {
        image.addEventListener('click', handleImageButtonClick);
    });
    document.getElementById('mainBetButton').style.display = 'none';
    // Function to switch between bet sections
    function switchBetSection(isMainBet) {
        if (isMainBet) {
            mainBetSection.style.display = 'block';
            document.getElementById('mainBetButton').style.display = 'none';
            sideBetSection.style.display = 'none';
            document.getElementById('sideBetButton').style.display = 'block';
        } else {
            mainBetSection.style.display = 'none';
            document.getElementById('mainBetButton').style.display = 'block';
            sideBetSection.style.display = 'block';
            document.getElementById('sideBetButton').style.display = 'none';
        }
    }

    // Function to show the correct side bet options based on selected side bet
    function showSideBetOptions() {
        const selectedBet = sideBetSelect.value;
        currentSideBet = selectedBet;  // Track the current side bet

        const sideBetContainers = document.querySelectorAll('.side-bet-options');
        sideBetContainers.forEach(container => {
            container.style.display = 'none';
        });

        if (selectedBet) {
            document.getElementById('sideBetImageContainer').style.display = 'block';
        }
    }

    // Event listeners for bet type buttons
    mainBetButton.addEventListener('click', () => {
        switchBetSection(true);
    });

    sideBetButton.addEventListener('click', () => {
        switchBetSection(false);
    });

    // Event listener for side bet select change
    sideBetSelect.addEventListener('change', showSideBetOptions);

    // Event listener for undo button
    undoButton.addEventListener('click', () => {
        undoLastAction();
    });
});



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
    this.win = -1;
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
    dp(player.name, player.hands, "player");

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

    dp(player.name, player.hands, "player");
    displayDealer(dealer)
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
    document.getElementById('mainBetBalance').textContent = `Bet: 0`;
    mainBetTotal = 0;
    sideBetTotal = 0;
    document.getElementById('otherPlayers').style.display = 'none'
    //hide/unhide
    buttons.style.display = "none";
    split.style.display = "none";
    insurance.style.display = "none";
    betDisplay.style.display = "";

    //payout
    payout(player,dealer);

    balance.textContent = ' Balance: ' + player.balance;

    //reset everything
    player.hands = [];
    player.handsDone = 0;
    player.insurance = false;
    player.sideBets = {"lucky": 0, "pairs": 0, "poker":0};
    player.sideWon = {"lucky": 0, "pairs": 0, "poker":0};
    player.bet = 0;
    
    updateSide();

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
    dp(player.name, player.hands, "player");

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
    }
    //check for dealer bust
    else if ((hand.cardValue < 21) && (dealer.cardValue > 21)) {
        hand.win = 1;
    }
    //check if player > dealer and player <= 21
    else if ((hand.cardValue > dealer.cardValue) && (hand.cardValue <= 21)) {
        hand.win = 1;
    }
    //check if player == dealer, and nobody busts
    else if ((hand.cardValue === dealer.cardValue) && (dealer.cardValue <= 21)) {
        hand.win = 2;
    }
    else {
        hand.win = 0;
    }
    return;
}

function endDealer(dealer){
    //if dealer value > 17, keep getting cards
    while (dealer.cardValue < 17){
        dealer.cards.push(deck.pop());
        //dealer.cards.push(["HEART","KING"]);
        dealer.cardValue = getCardValue(dealer.cards);
        displayDealer(dealer)
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
            dp(player.name, player.hands, "player");
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
    player.bet = mainBetTotal;
    player.balance -= player.bet;
    balance.textContent = ' Balance: ' + player.balance;
    newHand(player, dealer);
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

    dp(player.name, player.hands, "player");
    return;
})

////////// Insurance Functions //////////

insurance.addEventListener("click", ()=>{
    player.insurance = true;
    player.balance -= (player.bet / 2);
    insurance.style.display = "none";
})

// Manage chat messages
let sendMessageButton = document.getElementById("send-message");
let messageInput = document.getElementById("message-input");
let messagesDiv = document.getElementById("messages");

// Append messages to the chat
function appendMessage(name, message) {
    let item = document.createElement("div");
    item.textContent = `${name}: ${message}`;
    messagesDiv.appendChild(item);
}

sendMessageButton.addEventListener("click", () => {
    let message = messageInput.value;
    if (message === "") {
        return;
    }
    appendMessage(player.name, message);
    messageInput.value = "";
});

messageInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessageButton.click();
    }
});

////////// Setup //////////

let dealer = new initDealer();
let player = new initPlayer("wilber", 500);
console.log(JSON.stringify(player));
deck = shuffle(6);
reset(player,dealer);

let fakies = [
    {
        "name": "Alice",
        "balance": 1000,
        "hands": [
            {
                "cards": [["HEART", "10"], ["CLUB", "7"]],
                "cardValue": 17,
                "done": false,
                "win": -1,
                "blackjack": false,
                "doubleDown": false
            },
        ],
        "handsDone": 1,
        "insurance": false,
        "bet": 50,
        "sideBets": {"lucky": 10, "pairs": 5, "poker": 0},
        "sideWon": {"lucky": 0, "pairs": 0, "poker": 0}
    },
    {
        "name": "Bob",
        "balance": 500,
        "hands": [
            {
                "cards": [["SPADE", "KING"], ["HEART", "5"]],
                "cardValue": 15,
                "done": false,
                "win": -1,
                "blackjack": false,
                "doubleDown": false
            },
        ],
        "handsDone": 0,
        "insurance": false,
        "bet": 30,
        "sideBets": {"lucky": 0, "pairs": 0, "poker": 10},
        "sideWon": {"lucky": 0, "pairs": 0, "poker": 0}
    },
    {
        "name": "Charlie",
        "balance": 750,
        "hands": [
            {
                "cards": [["DIAMOND", "8"], ["CLUB", "8"]],
                "cardValue": 16,
                "done": false,
                "win": -1,
                "blackjack": false,
                "doubleDown": false
            }
        ],
        "handsDone": 0,
        "insurance": false,
        "bet": 40,
        "sideBets": {"lucky": 5, "pairs": 0, "poker": 0},
        "sideWon": {"lucky": 0, "pairs": 0, "poker": 0}
    }
]
    document.getElementById('chat').style.display = 'none'
dpo(fakies[0].name, fakies[0].hands, "otherPlayers");
dpo(fakies[1].name, fakies[1].hands, "otherPlayers");
dpo(fakies[2].name, fakies[2].hands, "otherPlayers");
console.log(fakies[0].name);
console.log(fakies[0].hands);
