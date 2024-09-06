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

    const playersContainer = document.getElementById(location);
    playersContainer.innerHTML = '';

    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';

    const playerName = document.createElement('div');
    playerName.className = 'player-name';
    playerName.textContent = name;
    playerDiv.appendChild(playerName);

    const handsContainer = document.createElement('div');
    handsContainer.className = 'player-hands';

    hands.forEach((hand, index) => {
        const handDiv = document.createElement('div');
        handDiv.className = 'hand';
        
        if (hand.win === 1 && hand.cardValue == 21) {
            handDiv.style.border = '2px solid blue';
        } else if (hand.win === 1) {
            handDiv.style.border = '2px solid green';
        } else if (hand.win === 0) {
            handDiv.style.border = '2px solid red';
        } else if (hand.win === 2) {
            handDiv.style.border = '2px solid yellow';
        } else {
            handDiv.style.border = '2px solid white';
        }

        hand.cards.forEach(card => {
            const img = document.createElement('img');
            const cardKey = `${card[1]}_${card[0]}`;
            console.log(cardKey);
            img.src = `../Playing Cards/${imageMapping[cardKey]}`;
            img.alt = cardKey;
            img.className = 'card-image';
            handDiv.appendChild(img);
        });

        handsContainer.appendChild(handDiv);
    });

    playerDiv.appendChild(handsContainer);
    playersContainer.appendChild(playerDiv);
}

function dpo(name, hands, location) {
    console.log(name);
    console.log(hands);

    const playersContainer = document.getElementById(location);

    const playerDiv = document.createElement('div');
    playerDiv.className = 'otherPlayer';
    playerDiv.style.height = `${68 + 72 + (68 * (hands.length - 1))}px`;

    const playerName = document.createElement('div');
    playerName.className = 'otherPlayer-name';
    playerName.textContent = name;
    playerDiv.appendChild(playerName);

    const handsContainer = document.createElement('div');
    handsContainer.className = 'otherPlayer-hands';

    hands.forEach((hand, index) => {
        const handDiv = document.createElement('div');
        handDiv.className = 'hand';
        
        if (hand.win === 1 && hand.cardValue == 21) {
            handDiv.style.border = '2px solid blue';
        } else if (hand.win === 1) {
            handDiv.style.border = '2px solid green';
        } else if (hand.win === 0) {
            handDiv.style.border = '2px solid red';
        } else if (hand.win === 2) {
            handDiv.style.border = '2px solid yellow';
        } else {
            handDiv.style.border = '2px solid white';
        }

        hand.cards.forEach(card => {
            const img = document.createElement('img');
            const cardKey = `${card[1]}_${card[0]}`;
            console.log(cardKey);
            img.src = `../Playing Cards/${imageMapping[cardKey]}`;
            img.alt = cardKey;
            img.className = 'otherCard-image';
            handDiv.appendChild(img);
        });

        handsContainer.appendChild(handDiv);
    });

    playerDiv.appendChild(handsContainer);
    playersContainer.appendChild(playerDiv);
}

function displayDealer(dealer) {
    console.log(dealer.name);
    console.log(dealer.cards);

    const playersContainer = document.getElementById("dealer");
    playersContainer.innerHTML = '';
    
    const dealerDiv = document.createElement('div');
    dealerDiv.className = 'dealer';
    
    const dealerImage = document.createElement('img');
    dealerImage.src = '../Extra/dealer.png';
    dealerImage.alt = 'Dealer Image';
    dealerImage.style.width = '80px';
    dealerImage.style.height = 'auto';
    
    dealerDiv.appendChild(dealerImage);
    
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'dealer-cards';

    const handDiv = document.createElement('div');
    handDiv.className = 'hand';

    dealer.cards.forEach(card => {
        const img = document.createElement('img');
        const cardKey = `${card[1]}_${card[0]}`;
        console.log(cardKey);
        img.src = `../Playing Cards/${imageMapping[cardKey]}`;
        img.alt = cardKey;
        img.className = 'dealer-card-image';
        handDiv.appendChild(img);
    });
    
    if (dealer.cards.length == 1) {
        const img = document.createElement('img');
        const cardKey = `back.jpg`;
        console.log(cardKey);
        img.src = `../Extra/${cardKey}`;
        img.alt = cardKey;
        img.className = 'dealer-card-image';
        handDiv.appendChild(img);
    }

    cardsContainer.appendChild(handDiv);
    dealerDiv.appendChild(cardsContainer);
    playersContainer.appendChild(dealerDiv);
}

function updateSide() {
    console.log(player.sideBets);
    document.getElementById('luckyB').textContent = `Lucky Ladies: ${player.sideBets["lucky"]}`;
    document.getElementById('pokerB').textContent = `21+3: ${player.sideBets["poker"]}`;
    document.getElementById('pairsB').textContent = `Perfect Pairs: ${player.sideBets["pairs"]}`;
}

let mainBetTotal = 0;
let sideBetTotal = 0;

document.addEventListener('DOMContentLoaded', () => {
    let history = [];
    let currentSideBet = null;

    function updateMainBetTotal(amount) {
        mainBetTotal += amount;
        document.getElementById('mainBetBalance').textContent = `Bet: ${mainBetTotal}`;
        history.push({ type: 'main', amount });
    }

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

    function handleImageButtonClick(event) {
        const amount = parseFloat(event.target.getAttribute('data-value'));
        if (mainBetSection.style.display !== 'none') {
            updateMainBetTotal(amount);
        } else if (currentSideBet) {
            updateSideBetTotal(amount);
        }
    }

    document.querySelectorAll('.image-button').forEach(image => {
        image.addEventListener('click', handleImageButtonClick);
    });
    document.getElementById('mainBetButton').style.display = 'none';

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

    function showSideBetOptions() {
        const selectedBet = sideBetSelect.value;
        currentSideBet = selectedBet;

        const sideBetContainers = document.querySelectorAll('.side-bet-options');
        sideBetContainers.forEach(container => {
            container.style.display = 'none';
        });

        if (selectedBet) {
            document.getElementById('sideBetImageContainer').style.display = 'block';
        }
    }

    mainBetButton.addEventListener('click', () => {
        switchBetSection(true);
    });

    sideBetButton.addEventListener('click', () => {
        switchBetSection(false);
    });

    sideBetSelect.addEventListener('change', showSideBetOptions);

    undoButton.addEventListener('click', () => {
        undoLastAction();
    });
});

function initPlayer(name, balance){
    this.name = name;
    this.balance = balance;
    this.hands = [];
    this.handsDone = 0;
    this.insurance = false;
    this.bet = 0;
    this.betWon = 0;
    this.sideBets = {"lucky": 0, "poker": 0, "pairs": 0};
    this.sideWon = {"lucky": 0, "poker": 0, "pairs": 0};
    this.winningsHistory = [];
}

function initHand(){
    this.cards = [];
    this.cardValue = 0;
    this.done = false;
    this.win = -1;
    this.blackjack = false;
    this.doubleDown = false;
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

function newHand(player, cards){
    //hide / unhide
    buttons.style.display = "block";
    double.style.display = "block";
    betDisplay.style.display = "none";
    console.log(cards);

    player.hands = [];
    player.hands.push (new initHand());
    let hand = player.hands[0];
    hand.cards = cards;
    hand.cardValue = getCardValue(hand.cards);

    //check for blackjack
    if (hand.cardValue >= 21){
        endTurn (player);
        return;
    }
    //check for split
    if((hand.cards[0][1] === hand.cards[1][1]) && hand.cards.length == 2){
        split.style.display = "";
    } else split.style.display = "none";

    dp(player.name, player.hands, "player");
    console.log(player.bet);

    return;
}

////////// Payout //////////

function payout(player,dealer){
    let balance = 0;
    // check if dealer's second card is a face card and player has insurance
    if (dealer.cards.length != 0){
        if (((dealer.cards[1][1] === "JACK") || (dealer.cards[1][1] === "QUEEN") || (dealer.cards[1][1] === "KING")) && (player.insurance)){
            // player original bet + 0.5 bet -> 2:1 bet is * 3
            balance += (player.bet * 3);
            console.log(JSON.stringify("insurance"));
    }}

    // check side bets
    for ([betVal, value] of Object.entries(player.sideBets)){
        if (!((player.sideWon[betVal] * value) === 0)) console.log(JSON.stringify("bet won"));
        balance += (player.sideWon[betVal] * value);
    }

    //check each hand for a win
    if (!(player.hands.length === 0)){
        for (let i = 0; i < player.hands.length; i++){
            console.log(player.hands[i]);
            //blackjack
            if (player.hands[i].blackjack){
               balance += (2.5 * player.bet);
                console.log(JSON.stringify("blackjack"));
            }
            //win
            else if (player.hands[i].win === 1) {
                if(player.hands[i].doubleDown){
                    balance += (4 * player.bet);
                    console.log(JSON.stringify("win double"));
                }
                else {
                    balance += (2 * player.bet);
                    console.log(JSON.stringify("win"));
                }
            }
            //draw
            else if (player.hands[i].win === 2){
                if(player.hands[i].doubleDown){
                    balance += (2 * player.bet);
                    console.log(JSON.stringify("draw double"));
                }
                else {
                    balance += (1 * player.bet);
                    console.log(JSON.stringify("draw"));
                }
            }
            //loss
            else console.log(JSON.stringify("lose"));
    }}
    player.balance += balance;
    player.betWon = balance;
    player.winningsHistory.push({
        date: new Date().toLocaleString(),
        balance: player.balance
    });
    sendWin(player);
    console.log(balance, player.balance, player.betWon, player.bet);

    return;
}

////////// Reset //////////

function reset(player){
    document.getElementById('mainBetBalance').textContent = `Bet: 0`;
    mainBetTotal = 0;
    sideBetTotal = 0;
    //hide/unhide
    buttons.style.display = "none";
    split.style.display = "none";
    insurance.style.display = "none";
    betDisplay.style.display = "";


    balance.textContent = ' Balance: ' + player.balance;
    //reset everything
    player.hands = [];
    player.handsDone = 0;
    player.insurance = false;
    player.bet = 0;
    player.betWon = 0;
    player.win = -1;
    player.sideBets = {"lucky": 0, "poker": 0, "pairs": 0};
    player.sideWon = {"lucky": 0, "poker": 0, "pairs": 0};
    player.winningsHistory = []

    updateSide();
    return;
}

////////// Hit Functions //////////

function hitFunction(player, card){
    console.log(player.bet);
    let value = 0;
    let hand = player.hands[player.handsDone];
    console.log(hand);
    hand.cards.push(card);

    //add a new card to active hand
    value = getCardValue(hand.cards);
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

hit.addEventListener('click', async () => {
    socket.emit("askForCard", [socket.id , player.name]);
    socket.once('card', (data) => {
        let card = data;
        console.log(player.bet);
        console.log(card);
        hitFunction(player,card);
        
        if(player.bet !== 0) sendHand(player);
        sendUpdate(player,"hit");
    });
});
////////// End Turn //////////

function checkWin (hand, dealer){
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


async function endTurn(player){
    //mark hand as done
    console.log(player);
    player.hands[player.handsDone].done = true;
    player.handsDone += 1;

    //if not all hands are done, hit the next hand
    if (!(player.handsDone === player.hands.length)){
        socket.emit("askForCard", [socket.id , player.name]);
        socket.once('card', (data) => {
            let card = data;
            console.log(card);
            hitFunction(player,card);
        });  
    //else end the turn, check for a win, and reset hand
    } else {
        socket.emit("done", [player.name]);
        socket.once('end', (data) => {
            // send the finished hand first, then wait for dealer
            console.log(data);
            dealer = data;
            console.log(dealer);
            displayDealer(dealer);            
            for (let i = 0; i < player.hands.length; i++){
                checkWin(player.hands[i], dealer);
                dp(player.name, player.hands, "player");
            }
            console.log(JSON.stringify(player));
            payout(player, dealer);
            sendWin(player);
            console.log(JSON.stringify(player));
            sendUpdate(player.name, "done")
            reset(player);
        });  

        
    }
}

////////// Stand Functions //////////

stand.addEventListener("click", () => {
    endTurn(player);
})

////////// Bet Functions //////////

betReady.addEventListener("click", () => {
    console.log(JSON.stringify(player));
    player.bet = mainBetTotal;
    let totalBet = mainBetTotal + sideBetTotal;
    sendBet(player, totalBet);
    console.log(player);

    socket.emit("playerReady", [player.name]);
    
    // Listen for the server's response
    socket.once('playerData', (data) => {
        console.log(data);
        players = data[0];
        dealer = data[1];
        displayDealer(dealer)
        Object.keys(players).forEach(p => {
            if (players[p].name === player.name) {
                newHand(player, players[p].cards[0]);
                checkBets(player, dealer);
                
                // Check for insurance
                console.log(dealer);
                if (dealer.cards[0][1] === "ACE") {
                    insurance.style.display = "";
                }
            }
        });
        sendUpdate(player,"bet");
    });
    console.log(JSON.stringify(player));
    return;
    })

////////// Double Functions //////////

double.addEventListener("click", async () => {
    socket.emit("askForCard", [socket.id , player.name]);
    socket.once('card', (data) => {
        console.log(data);
            let card  = data;
            //minus bet, hit, if turn not done, end turn
            let hand = player.hands[player.handsDone];
            player.balance -= player.bet;
            sendBet(player, player.bet);
            hand.doubleDown = true;
            hitFunction(player, card);
            if (!hand.done) endTurn(player);
            sendHand(player);
            sendUpdate(player,"double");
        });
    
    return;
})

////////// Split Functions //////////


split.addEventListener("click", async ()=>{
    socket.emit("askForCard", [socket.id , player.name]);
    socket.once('card', (data) => {
        let card  = data;
        //create a new hand with one card in each hand
        player.hands.push(new initHand());
        player.hands[player.hands.length - 1].cards.push(player.hands[player.handsDone].cards.pop());
        let first = player.hands[player.handsDone];
        let second = player.hands[player.hands.length - 1];
        first.cardValue = getCardValue(first.cards);
        second.cardValue = getCardValue(second.cards);
        
        // add logic if split cards are aces, add one card to each and end both turns
        player.balance -= player.bet;
        hitFunction(player, card);
        sendBet(player, player.bet);

        dp(player.name, player.hands, "player");
        sendHand(player);
        sendUpdate(player,"split");
    });
    return;
})

////////// Insurance Functions //////////

insurance.addEventListener("click", ()=>{
    player.insurance = true;
    let val = player.bet / 2;
    player.balance -= val;
    sendBet(player, val);
    insurance.style.display = "none";
})


function sendBet(player, bet){
    socket.emit('bet', [bet, player.name]);
}

function sendWin(player){
    socket.emit('win', [player.betWon, player.name]);
}

function sendHand(player){
    let cards = [];
    for (let i=0; i < player.hands.length; i++){
        cards.push(player.hands[i].cards);
    }
    console.log(cards);
    socket.emit('hand', [player.name, cards]);
}

function sendDone(player){
    socket.emit('done', [player.name]);
}
function sendUpdate(player,update){
    socket.emit("update", [player.name, update]);
    appendUpdate(player.name, update);
}
