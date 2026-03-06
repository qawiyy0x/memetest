// --- Copy CA ---
const copyBtn = document.getElementById('copy-btn');
const caText = document.getElementById('ca-text').innerText;

if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(caText).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span style="color:white; font-size:12px;">Copied!</span>';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        });
    });
}

// --- BOOP EFFECT ---
const heroDog = document.getElementById('hero-dog');
if (heroDog) {
    heroDog.addEventListener('click', () => {
        // Simple shake animation on click
        heroDog.style.animation = 'none';
        setTimeout(() => {
            heroDog.style.transform = 'scale(0.9) rotate(-5deg)';
            setTimeout(() => {
                heroDog.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    heroDog.style.transform = 'scale(1) rotate(0deg)';
                    heroDog.style.animation = 'float 4s ease-in-out infinite';
                }, 100);
            }, 100);
        }, 10);
    });
}

// --- MEMORY GAME ---
const memoryBoard = document.getElementById('memory-board');
const resetMemBtn = document.getElementById('reset-memory');

const emojis = ['🐶', '🦴', '🐾', '🎀', '💖', '🥩'];
let cardsArray = [...emojis, ...emojis]; // Duplicate for pairs

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function createBoard() {
    memoryBoard.innerHTML = '';
    shuffle(cardsArray);
    cardsArray.forEach(emoji => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.framework = emoji;

        card.innerHTML = `
            <div class="front-face">${emoji}</div>
            <div class="back-face">?</div>
        `;
        card.addEventListener('click', flipCard);
        memoryBoard.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

if (resetMemBtn) {
    resetMemBtn.addEventListener('click', createBoard);
}

// Init Memory Game
if(memoryBoard) {
    createBoard();
}


// --- SNACK CATCHER GAME ---
const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-game');

let score = 0;
let isPlaying = false;
let playerX = 50; // percentage
let gameInterval;
let snacks = [];
const snackEmojis = ['🦴', '🥩', '🥓'];

function movePlayer(e) {
    if (!isPlaying) return;
    if (e.key === 'ArrowLeft' && playerX > 10) {
        playerX -= 5;
    } else if (e.key === 'ArrowRight' && playerX < 90) {
        playerX += 5;
    }
    player.style.left = playerX + '%';
}

function tapMove(e) {
    if(!isPlaying) return;
    const rect = gameArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2 && playerX > 10) {
        playerX -= 10;
    } else if (clickX >= rect.width / 2 && playerX < 90) {
        playerX += 10;
    }
    player.style.left = playerX + '%';
}

function spawnSnack() {
    if (!isPlaying) return;
    const snack = document.createElement('div');
    snack.classList.add('snack');
    snack.innerText = snackEmojis[Math.floor(Math.random() * snackEmojis.length)];
    snack.style.left = Math.random() * 90 + 5 + '%';
    snack.style.top = '-30px';
    gameArea.appendChild(snack);
    snacks.push({ el: snack, y: -30 });
}

function updateGame() {
    if (!isPlaying) return;

    for (let i = 0; i < snacks.length; i++) {
        let snackObj = snacks[i];
        snackObj.y += 3; // speed
        snackObj.el.style.top = snackObj.y + 'px';

        // Collision logic
        const snackRect = snackObj.el.getBoundingClientRect();
        const playerRect = player.getBoundingClientRect();

        if (
            snackRect.bottom >= playerRect.top &&
            snackRect.top <= playerRect.bottom &&
            snackRect.right >= playerRect.left &&
            snackRect.left <= playerRect.right
        ) {
            // Caught
            score += 10;
            scoreEl.innerText = score;
            snackObj.el.remove();
            snacks.splice(i, 1);
            i--;
        } else if (snackObj.y > gameArea.clientHeight) {
            // Missed
            snackObj.el.remove();
            snacks.splice(i, 1);
            i--;
        }
    }

    if (Math.random() < 0.05) { // spawn rate
        spawnSnack();
    }

    if(isPlaying) {
        requestAnimationFrame(updateGame);
    }
}

function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    scoreEl.innerText = score;
    startBtn.innerText = "Playing...";
    startBtn.disabled = true;
    snacks.forEach(s => s.el.remove());
    snacks = [];
    
    // Add event listeners for movement
    document.addEventListener('keydown', movePlayer);
    gameArea.addEventListener('pointerdown', tapMove);

    requestAnimationFrame(updateGame);

    // End game after 30 seconds
    setTimeout(() => {
        isPlaying = false;
        startBtn.innerText = "Start Catching";
        startBtn.disabled = false;
        document.removeEventListener('keydown', movePlayer);
        gameArea.removeEventListener('pointerdown', tapMove);
        alert(`Game Over! You caught ${score} points worth of snacks for Pibble.`);
    }, 30000);
}

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}
