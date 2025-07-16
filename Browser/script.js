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
let score = 0;
let audioMuted = false;



const $one = document.querySelector.bind(document);

// Selezione degli elementi HTML principali
const board = $one('#game-board');
const errorCounter = $one('#error-counter');
const scoreCounter = $one('#score-counter'); // Nuovo elemento
const resetScoreBtn = document.getElementById('reset-score-btn'); // Nuovo bottone
const highscoresList = document.getElementById('highscores-list');
const HIGHSCORES_KEY = 'memoryGameHighscores';
const MAX_HIGHSCORES = 10;
const resetHighscoresBtn = document.getElementById('reset-highscores-btn');
const victoryMessage = document.getElementById('victory-message');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const audioOnIcon = document.getElementById('audio-on-icon');
const audioOffIcon = document.getElementById('audio-off-icon');

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
function createBoard(showAll = false) {
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

    // Mostra tutte le card girate se richiesto (all'avvio)
    if (showAll) {
        lockBoard = true;
        const allCards = board.querySelectorAll('.card');
        allCards.forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            allCards.forEach(card => card.classList.remove('flipped'));
            lockBoard = false;
        }, 5000);
    }
}

// Funzione che gestisce il click su una carta
function onCardClick(e) {
    // Se il tabellone è bloccato esci dalla funzione
    if (lockBoard) return;
    const card = e.currentTarget;
    // Se la carta è già girata o abbinata, esci dalla funzione
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    // Seleziona la carta e aggiungi la classe 'flipped'
    card.classList.add('flipped');
    // Se è la prima carta selezionata, assegnala a firstCard
    if (!firstCard) {
        firstCard = card;
        return;
    }
    // Se è la seconda carta selezionata, assegnala a secondCard
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
                showVictoryMessage();
                // Riproduci il suono di vittoria dopo un ritardo di 2 secondi
                victoryAudio.currentTime = 0;
                victoryAudio.play();
                // Aggiorna la classifica solo alla vittoria
                updateHighscores(score);
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

// Funzione che mostra il messaggio di vittoria
function showVictoryMessage() {
    victoryMessage.classList.add('show');
}

// Funzione che nasconde il messaggio di vittoria
function hideVictoryMessage() {
    victoryMessage.classList.remove('show');
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
    hideVictoryMessage();
    createBoard(true); // Mostra simboli per 5 secondi all'avvio
    renderHighscores(); // Mostra la classifica all'avvio
}

// Funzione per aggiornare il punteggio visualizzato e salvarlo su localStorage
function updateScore() {
    scoreCounter.textContent = `Punteggio: ${score}`;
    localStorage.setItem('memoryGameScore', score);
}

// Funzione per aggiornare la classifica dei punteggi
// Aggiunge il nuovo punteggio se non è già presente, lo ordina e lo limita a 10 punteggi
function updateHighscores(newScore) {
    let highscores = JSON.parse(localStorage.getItem(HIGHSCORES_KEY)) || [];
    if (!highscores.includes(newScore)) {
        highscores.push(newScore);
    }
    highscores = highscores
        .filter(score => typeof score === 'number' && !isNaN(score))
        .sort((a, b) => b - a)
        .slice(0, MAX_HIGHSCORES);
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(highscores));
    renderHighscores();
}

// Funzione per rendere visibile la classifica dei punteggi
// Mostra i punteggi salvati in localStorage, riempiendo gli slot vuoti con '--'
function renderHighscores() {
    let highscores = JSON.parse(localStorage.getItem(HIGHSCORES_KEY)) || [];
    highscoresList.innerHTML = '';
    highscores.forEach((score, idx) => {
        const li = document.createElement('li');
        li.textContent = `${score}`;
        highscoresList.appendChild(li);
    });
    for (let i = highscores.length; i < MAX_HIGHSCORES; i++) {
        const li = document.createElement('li');
        li.textContent = '--';
        highscoresList.appendChild(li);
    }
}

// Funzione per aggiornare lo stato audio e l'icona
function setAudioMuted(muted) {
    audioMuted = muted;
    // Muta tutti gli oggetti audio
    Object.values(audioObjects).forEach(audio => audio.muted = muted);
    victoryAudio.muted = muted;
    errorAudio.muted = muted;
    // Aggiorna icona
    if (muted) {
        audioOnIcon.style.display = 'none';
        audioOffIcon.style.display = '';
    } else {
        audioOnIcon.style.display = '';
        audioOffIcon.style.display = 'none';
    }
}

// Gestione click bottone audio
audioToggleBtn.addEventListener('click', () => {
    setAudioMuted(!audioMuted);
});

// Gestione reset punteggio
resetScoreBtn.addEventListener('click', () => {
    score = 0;
    updateScore();
    localStorage.removeItem('memoryGameScore');
    errorCount = 0;
    errorCounter.textContent = 'Errori: 0';
    renderHighscores();
});

//Funzione reset punteggio
function resetScore() {
    score = 0;
    updateScore();
    localStorage.removeItem('memoryGameScore');
    errorCount = 0;
    errorCounter.textContent = 'Errori: 0';
    renderHighscores();
}

// Gestione reset record classifica
resetHighscoresBtn.addEventListener('click', () => {
    localStorage.removeItem(HIGHSCORES_KEY);
    renderHighscores();
});

//Aggiungi un evento per chiudere il messaggio di vittoria e ripristinare il gioco
victoryMessage.addEventListener('click', () => {
    hideVictoryMessage();
    initGame();
    resetScore()
});

// Avvia il gioco al caricamento della pagina
window.onload = () => {
    setAudioMuted(false); // audio attivo di default
    initGame();
};
