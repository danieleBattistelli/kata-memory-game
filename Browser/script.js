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
let score = 0; // Nuova variabile punteggio

// Selezione degli elementi HTML principali

const board = document.getElementById('game-board');
const errorCounter = document.getElementById('error-counter');
const scoreCounter = document.getElementById('score-counter'); // Nuovo elemento
const victoryMessage = document.getElementById('victory-message');

// Mappa simboli -> suoni (assicurati che i file audio esistano nella cartella 'sounds')
const symbolSounds = {
    'img/mario.jpg': 'sounds/mario.mp3',
    'img/luigi.jpg': 'sounds/luigi.mp3',
    'img/peach.png': 'sounds/peach.mp3',
    'img/bowser.png': 'sounds/bowser.mp3',
    'img/yoshi.png': 'sounds/yoshi.mp3',
    'img/donkeykong.jpg': 'sounds/donkeykong.mp3',
    'img/link.png': 'sounds/link.mp3',
    'img/kirby.jpg': 'sounds/kirby.mp3'
};

// Precarica i suoni in oggetti Audio
const audioObjects = {};
for (const [symbol, soundPath] of Object.entries(symbolSounds)) {
    audioObjects[symbol] = new Audio(soundPath);
}

// Suono di vittoria
const victoryAudio = new Audio('sounds/mariovictory.mp3');
// Suono di errore
const errorAudio = new Audio('sounds/error.mp3');

// Funzione che crea il tabellone di gioco

function createBoard() {
    shuffle(cards);
    board.innerHTML = '';
    cards.forEach((symbol, idx) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.symbol = symbol;
        card.dataset.index = idx;

        //Inserimento del contenuto della carta
        card.innerHTML = `
            <div class="front">
            <img src="${symbol}" alt="personaggio" style="width:60px;height:60px;"></div>
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

        // Aggiorna punteggio per coppia trovata
        score += 10;
        updateScore();

        // Riproduci il suono associato al simbolo della coppia trovata
        const symbol = firstCard.dataset.symbol;
        if (audioObjects[symbol]) {
            // Riavvia il suono se già in riproduzione
            audioObjects[symbol].currentTime = 0;
            audioObjects[symbol].play();
        }

        resetTurn();

        // Se tutte le coppie sono state trovate, mostra il messaggio di vittoria
        if (matchedPairs === symbols.length) {

            setTimeout(() => {
                victoryMessage.style.display = 'block';
                // Riproduci il suono di vittoria dopo un ritardo di 2 secondi
                victoryAudio.currentTime = 0;
                victoryAudio.play();
            }, 2000);
        }

    } else {

        // Se le carte sono diverse, aumenta il contatore errori e gira le carte dopo 1 secondo

        errorCount++;
        errorCounter.textContent = `Errori: ${errorCount}`;
        // Aggiorna punteggio per errore
        score -= 1;
        updateScore();

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            // Riproduci il suono di errore
            errorAudio.currentTime = 0;
            errorAudio.play();
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
    // Recupera il punteggio da localStorage, se presente
    const savedScore = localStorage.getItem('memoryGameScore');
    score = savedScore !== null ? parseInt(savedScore, 10) : 0;
    errorCounter.textContent = 'Errori: 0';
    updateScore(); // Aggiorna visualizzazione punteggio
    victoryMessage.style.display = 'none';
    createBoard();
}

// Funzione per aggiornare il punteggio visualizzato e salvarlo su localStorage

function updateScore() {
    scoreCounter.textContent = `Punteggio: ${score}`;
    localStorage.setItem('memoryGameScore', score);
}

// Avvia il gioco al caricamento della pagina

window.onload = initGame;
