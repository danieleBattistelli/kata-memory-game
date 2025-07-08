// Array di percorsi immagini che rappresentano personaggi Nintendo

const symbols = [
    'img/mario.jpg',
    'img/luigi.jpg',
    'img/peach.png',
    'img/bowser.png',
    'img/yoshi.png',
    'img/donkeykong.jpg',
    'img/link.png',
    'img/kirby.jpg'
];

const cards = [...symbols, ...symbols]; // 8 coppie = 16 carte

// Funzione per mescolare le carte usando l'algoritmo di Fisher-Yates

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Variabili di stato per il gioco

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let errorCount = 0;
let matchedPairs = 0;

// Selezione degli elementi HTML principali

const board = document.getElementById('game-board');
const errorCounter = document.getElementById('error-counter');
const victoryMessage = document.getElementById('victory-message');

// Funzione che crea il tabellone di gioco

function createBoard() {
    shuffle(cards);
    board.innerHTML = '';
    cards.forEach((symbol, idx) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = symbol;
        card.dataset.index = idx;

        // Usa un'immagine invece di una emoji
        card.innerHTML = `
            <div class="front"><img src="${symbol}" alt="personaggio" style="width:60px;height:60px;"></div>
            <div class="back">?</div>
        `;

        card.addEventListener('click', onCardClick);
        board.appendChild(card);
    });
}

// Funzione che gestisce il click su una carta

function onCardClick(e) {
    if (lockBoard) return;

    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    lockBoard = true;

    // Se le due carte selezionate sono uguali

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedPairs++;
        resetTurn();

        // Se tutte le coppie sono state trovate, mostra il messaggio di vittoria

        if (matchedPairs === symbols.length) {
            victoryMessage.style.display = 'block';
        }

    } else {

        // Se le carte sono diverse, aumenta il contatore errori e gira le carte dopo 1 secondo

        errorCount++;
        errorCounter.textContent = `Errori: ${errorCount}`;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetTurn();
        }, 1000);
    }
}

// Funzione che resetta il turno

function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// Funzione che inizializza il gioco

function initGame() {
    errorCount = 0;
    matchedPairs = 0;
    errorCounter.textContent = 'Errori: 0';
    victoryMessage.style.display = 'none';
    createBoard();
}

// Avvia il gioco al caricamento della pagina

window.onload = initGame;
