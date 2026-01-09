class MemoryGame {
    constructor() {
        this.difficulty = 'medium';
        this.theme = 'gaming';
        this.cards = [];
        this.flippedCards = [];
        this.matches = 0;
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.totalPairs = 0;
        this.isProcessing = false;
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.stats = this.loadStats();
        this.highScores = this.loadHighScores();

        this.initializeElements();
        this.setupEventListeners();
        this.applyDarkMode();
        this.startNewGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.difficultySelect = document.getElementById('difficulty');
        this.themeSelect = document.getElementById('theme');
        this.newGameBtn = document.getElementById('new-game');
        this.resetBtn = document.getElementById('reset');
        this.darkModeToggle = document.getElementById('dark-mode-toggle');
        this.timerDisplay = document.getElementById('timer');
        this.movesDisplay = document.getElementById('moves');
        this.matchesDisplay = document.getElementById('matches');
        this.winModal = document.getElementById('win-modal');
        this.statsModal = document.getElementById('stats-modal');
        this.statsBtn = document.getElementById('stats-btn');
        this.playAgainBtn = document.getElementById('play-again');
        this.closeStatsBtn = document.getElementById('close-stats');
        this.finalTimeDisplay = document.getElementById('final-time');
        this.finalMovesDisplay = document.getElementById('final-moves');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.bestTimeDisplay = document.getElementById('best-time');
        this.bestMovesDisplay = document.getElementById('best-moves');
        this.newRecordBadge = document.getElementById('new-record');
        this.confettiCanvas = document.getElementById('confetti-canvas');
        
        // canvas setup
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
        
        this.updateHighScoresDisplay();
        this.updateStatsDisplay();
    }

    setupEventListeners() {
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });

        this.themeSelect.addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.startNewGame();
        });

        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.resetBtn.addEventListener('click', () => this.startNewGame());
        this.statsBtn.addEventListener('click', () => this.statsModal.classList.add('show'));
        this.closeStatsBtn.addEventListener('click', () => this.statsModal.classList.remove('show'));
        
        this.playAgainBtn.addEventListener('click', () => {
            this.winModal.classList.remove('show');
            this.startNewGame();
        });

        // Close modals on outside click
        this.winModal.addEventListener('click', (e) => {
            if (e.target === this.winModal) {
                this.winModal.classList.remove('show');
            }
        });

        this.statsModal.addEventListener('click', (e) => {
            if (e.target === this.statsModal) {
                this.statsModal.classList.remove('show');
            }
        });

        // Handle window resize for confetti canvas
        window.addEventListener('resize', () => {
            this.confettiCanvas.width = window.innerWidth;
            this.confettiCanvas.height = window.innerHeight;
        });
    }

    getDifficultyConfig() {
        const configs = {
            easy: { rows: 4, cols: 4, pairs: 8 },
            medium: { rows: 4, cols: 5, pairs: 10 },
            hard: { rows: 5, cols: 6, pairs: 15 }
        };
        return configs[this.difficulty];
    }

    getThemeEmojis() {
        const themes = {
            gaming: ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🥁', '🎲', '🎰', '🎳'],
            sports: ['🏀', '⚽', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '🏁', '🏆'],
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
            food: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯'],
            nature: ['🌿', '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌺', '🌸', '🌻', '🌷', '🌹', '🥀', '🌼', '🌲']
        };
        return themes[this.theme] || themes.gaming;
    }

    generateCardPairs() {
        const config = this.getDifficultyConfig();
        this.totalPairs = config.pairs;
        
        const emojis = this.getThemeEmojis();
        const selectedEmojis = emojis.slice(0, this.totalPairs);
        const pairs = [...selectedEmojis, ...selectedEmojis];
        
        return this.shuffleArray(pairs);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createCard(emoji, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;

        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = '?';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.textContent = emoji;

        card.appendChild(cardBack);
        card.appendChild(cardFront);

        card.addEventListener('click', () => this.handleCardClick(card));

        return card;
    }

    handleCardClick(card) {
        if (this.isProcessing) return;
        if (card.classList.contains('flipped')) return;
        if (card.classList.contains('matched')) return;
        if (this.flippedCards.length >= 2) return;

        // start timer when first card is clicked
        if (this.moves === 0 && !this.startTime) {
            this.startTimer();
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateMovesDisplay();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isProcessing = true;
        const [card1, card2] = this.flippedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            // match!
            setTimeout(() => {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.flippedCards = [];
                this.matches++;
                this.updateMatchesDisplay();
                this.updateProgress();
                this.isProcessing = false;

                if (this.matches === this.totalPairs) {
                    this.handleWin();
                }
            }, 500);
        } else {
            // wrong match, flip back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
                this.isProcessing = false;
            }, 1000);
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateMovesDisplay() {
        this.movesDisplay.textContent = this.moves;
    }

    updateMatchesDisplay() {
        this.matchesDisplay.textContent = `${this.matches} / ${this.totalPairs}`;
    }

    updateProgress() {
        const percentage = Math.round((this.matches / this.totalPairs) * 100);
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
    }

    handleWin() {
        this.stopTimer();
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        this.finalTimeDisplay.textContent = timeString;
        this.finalMovesDisplay.textContent = this.moves;

        // update stats
        if (!this.stats.gameStarted) {
            this.stats.gamesPlayed++;
            this.stats.gameStarted = true;
        }
        this.stats.gamesWon++;
        this.stats.totalMoves += this.moves;
        this.saveStats();

        // check if new record
        const currentBestTime = this.highScores[this.difficulty]?.bestTime || Infinity;
        const currentBestMoves = this.highScores[this.difficulty]?.bestMoves || Infinity;
        let newRecord = false;

        if (elapsed < currentBestTime || this.moves < currentBestMoves) {
            if (!this.highScores[this.difficulty]) {
                this.highScores[this.difficulty] = {};
            }
            if (elapsed < currentBestTime) {
                this.highScores[this.difficulty].bestTime = elapsed;
                newRecord = true;
            }
            if (this.moves < currentBestMoves) {
                this.highScores[this.difficulty].bestMoves = this.moves;
                newRecord = true;
            }
            this.saveHighScores();
            this.updateHighScoresDisplay();
        }

        if (newRecord) {
            this.newRecordBadge.style.display = 'block';
        } else {
            this.newRecordBadge.style.display = 'none';
        }

        // confetti time!
        this.launchConfetti();

        setTimeout(() => {
            this.winModal.classList.add('show');
            this.updateStatsDisplay();
        }, 500);
    }

    startNewGame() {
        this.stopTimer();
        this.cards = [];
        this.flippedCards = [];
        this.matches = 0;
        this.moves = 0;
        this.startTime = null;
        this.isProcessing = false;
        if (this.stats) {
            this.stats.gameStarted = false;
        }

        // clear the board
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${this.difficulty}`;

        // create new cards
        const cardPairs = this.generateCardPairs();
        cardPairs.forEach((emoji, index) => {
            const card = this.createCard(emoji, index);
            this.cards.push(card);
            this.gameBoard.appendChild(card);
        });

        // reset UI
        this.timerDisplay.textContent = '00:00';
        this.updateMovesDisplay();
        this.updateMatchesDisplay();
        this.updateProgress();
        this.newRecordBadge.style.display = 'none';

        this.winModal.classList.remove('show');
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.applyDarkMode();
        localStorage.setItem('darkMode', this.darkMode);
    }

    applyDarkMode() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            this.darkModeToggle.textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.darkModeToggle.textContent = '🌙';
        }
    }
    loadStats() {
        const saved = localStorage.getItem('gameStats');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            gamesWon: 0,
            totalMoves: 0
        };
    }

    saveStats() {
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }

    loadHighScores() {
        const saved = localStorage.getItem('highScores');
        return saved ? JSON.parse(saved) : {};
    }

    saveHighScores() {
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
    }

    updateHighScoresDisplay() {
        const scores = this.highScores[this.difficulty] || {};
        if (scores.bestTime) {
            const minutes = Math.floor(scores.bestTime / 60);
            const seconds = scores.bestTime % 60;
            this.bestTimeDisplay.textContent = 
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            this.bestTimeDisplay.textContent = '--:--';
        }
        this.bestMovesDisplay.textContent = scores.bestMoves || '--';
    }

    updateStatsDisplay() {
        document.getElementById('games-played').textContent = this.stats.gamesPlayed;
        document.getElementById('games-won').textContent = this.stats.gamesWon;
        const winRate = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) 
            : 0;
        document.getElementById('win-rate').textContent = `${winRate}%`;
        document.getElementById('total-moves').textContent = this.stats.totalMoves;
    }

    launchConfetti() {
        const ctx = this.confettiCanvas.getContext('2d');
        const particles = [];
        const particleCount = 150; // more confetti = more fun

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                size: Math.random() * 8 + 4,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            
            let activeParticles = 0;
            
            particles.forEach(particle => {
                if (particle.y < this.confettiCanvas.height) {
                    activeParticles++;
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.1; // gravity effect
                    particle.rotation += particle.rotationSpeed;

                    ctx.save();
                    ctx.translate(particle.x, particle.y);
                    ctx.rotate(particle.rotation);
                    ctx.fillStyle = particle.color;
                    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                    ctx.restore();
                }
            });

            if (activeParticles > 0) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
            }
        };

        animate();
    }
}

// start the game
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
