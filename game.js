// SaharaGame v2.1.0 - Modular Stable Engine
class SaharaGame {
    constructor() {
        console.log("SaharaGame: Constructor starting...");
        this.grid = [];
        this.selectedTiles = [];
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.currentLevel = 1;
        this.unlockedLevels = parseInt(localStorage.getItem('sahara_unlocked')) || 1;
        this.isDark = localStorage.getItem('sahara_theme') === 'dark';
        this.sfxVolume = parseFloat(localStorage.getItem('sahara_sfx')) || 0.65;
        this.totalScore = parseInt(localStorage.getItem('sahara_total_score')) || 0;

        this.spoolColors = ['#c2652a', '#8c3c3c', '#78706a', '#e08850', '#d47070', '#5a6e5a', '#3c4b8c', '#8c3c78'];
        this.audioCtx = null;

        // Force initialization when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 10);
        }
    }

    init() {
        console.log("SaharaGame: Initializing components...");
        try {
            // Views
            this.views = {
                game: document.getElementById('view-game'),
                levels: document.getElementById('view-levels'),
                leaderboard: document.getElementById('view-leaderboard'),
                settings: document.getElementById('view-settings')
            };

            // Main elements
            this.navItems = document.querySelectorAll('.nav-item');
            this.gridElement = document.getElementById('game-grid');
            this.scoreElement = document.getElementById('game-score');
            this.timerElement = document.getElementById('game-timer');
            this.levelLabel = document.getElementById('current-level-label');

            if (!this.gridElement) throw new Error("Critical: #game-grid not found!");

            this.initListeners();
            this.initTheme();
            this.startLevel(this.currentLevel);
            this.renderLevels();
            this.renderLeaderboard();
            
            console.log("SaharaGame: Fully initialized.");
        } catch (err) {
            console.error("SaharaGame Init Error:", err);
            alert("Game load error. Check console.");
        }
    }

    initListeners() {
        if (this.navItems) {
            this.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const viewId = item.dataset.view;
                    if (viewId) this.switchView(viewId);
                });
            });
        }

        const shuffleBtn = document.getElementById('shuffle-btn');
        if (shuffleBtn) shuffleBtn.onclick = () => this.shuffleGrid();

        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.onclick = () => this.undoMove();
        
        const slider = document.getElementById('sfx-vol-slider');
        if (slider) {
            slider.oninput = (e) => {
                this.sfxVolume = e.target.value / 100;
                const volLabel = document.getElementById('sfx-vol-label');
                if (volLabel) volLabel.textContent = e.target.value + '%';
                localStorage.setItem('sahara_sfx', this.sfxVolume);
            };
        }

        const lightBtn = document.getElementById('theme-light');
        if (lightBtn) lightBtn.onclick = () => this.setTheme(false);

        const darkBtn = document.getElementById('theme-dark');
        if (darkBtn) darkBtn.onclick = () => this.setTheme(true);

        const resetBtn = document.getElementById('reset-progress');
        if (resetBtn) resetBtn.onclick = () => this.resetProgress();
    }

    initTheme() {
        this.setTheme(this.isDark);
    }

    setTheme(dark) {
        this.isDark = dark;
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.classList.toggle('light', !dark);
        localStorage.setItem('sahara_theme', dark ? 'dark' : 'light');
        
        const lBtn = document.getElementById('theme-light');
        const dBtn = document.getElementById('theme-dark');
        if (lBtn && dBtn) {
            if (dark) {
                dBtn.classList.add('border-primary');
                dBtn.classList.remove('border-stone-800');
                lBtn.classList.remove('border-primary');
                lBtn.classList.add('border-outline-variant');
            } else {
                lBtn.classList.add('border-primary');
                lBtn.classList.remove('border-outline-variant');
                dBtn.classList.remove('border-primary');
                dBtn.classList.add('border-stone-800');
            }
        }
    }

    switchView(id) {
        console.log("Switching view to:", id);
        Object.keys(this.views).forEach(k => {
            if (this.views[k]) this.views[k].classList.toggle('hidden', k !== id);
        });
        
        this.navItems.forEach(item => {
            const isActive = item.dataset.view === id;
            item.classList.toggle('text-primary', isActive);
            item.classList.toggle('border-t-2', isActive);
            item.classList.toggle('border-primary', isActive);
            item.classList.toggle('text-stone-400', !isActive);
            const icon = item.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = isActive ? "'FILL' 1" : "'FILL' 0";
        });

        if (id === 'levels') this.renderLevels();
        if (id === 'leaderboard') this.renderLeaderboard();
        if (id === 'game' && !this.timerInterval) this.startTimer();
    }

    startLevel(levelNum) {
        console.log("Starting Level:", levelNum);
        this.currentLevel = levelNum;
        if (this.levelLabel) this.levelLabel.textContent = `Level ${levelNum.toString().padStart(2, '0')}`;
        
        // Growth logic: Level n -> (n+1)x(n+1)
        let side = levelNum + 1;
        let cols = side;
        let rows = side;
        if ((cols * rows) % 2 !== 0) {
            rows++; 
        }
        
        this.cols = cols;
        this.rows = rows;
        this.initGrid(cols, rows);
        this.resetTimer();
    }

    initGrid(cols, rows) {
        this.grid = [];
        this.selectedTiles = [];
        
        if (!this.gridElement) return;

        // Force grid layout
        this.gridElement.style.display = 'grid';
        this.gridElement.style.setProperty('--grid-cols', cols);
        this.gridElement.style.setProperty('--grid-rows', rows);
        this.gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        const total = cols * rows;
        let pairs = [];
        for (let i = 0; i < total / 2; i++) {
            const color = this.spoolColors[i % this.spoolColors.length];
            pairs.push(color, color);
        }
        pairs.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < total; i++) {
            this.grid.push({ 
                id: i, 
                color: pairs[i], 
                matched: false, 
                flipped: false 
            });
        }
        this.renderGrid();
    }

    renderGrid() {
        if (!this.gridElement) return;
        this.gridElement.innerHTML = '';
        
        this.grid.forEach(tile => {
            const card = document.createElement('div');
            card.className = `aspect-square rounded-lg flex items-center justify-center border border-outline-variant/20 dark:border-stone-800 cursor-pointer transition-all duration-300 ${tile.matched ? 'opacity-20' : 'bg-white dark:bg-stone-800 shadow-sm hover:scale-105'}`;
            
            if (tile.flipped && !tile.matched) {
                card.classList.add('grid-tile-active');
                card.innerHTML = `<div class="w-[60%] h-[60%] rounded-full shadow-inner animate-fade-in" style="background-color: ${tile.color}"></div>`;
            } else if (tile.matched) {
                card.innerHTML = `<div class="w-[30%] h-[30%] rounded-full opacity-40" style="background-color: ${tile.color}"></div>`;
            } else {
                card.innerHTML = `<span class="material-symbols-outlined text-stone-200 dark:text-stone-700 text-xs md:text-base">adjust</span>`;
            }

            card.onclick = (e) => {
                e.stopPropagation();
                this.handleTileClick(tile);
            };
            this.gridElement.appendChild(card);
        });
    }

    handleTileClick(tile) {
        if (tile.matched || tile.flipped || this.selectedTiles.length >= 2) return;
        
        tile.flipped = true;
        this.selectedTiles.push(tile);
        this.renderGrid();
        this.playSfx(220 + (this.selectedTiles.length * 110)); 

        if (this.selectedTiles.length === 2) {
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        const [a, b] = this.selectedTiles;
        if (a && b && a.color === b.color) {
            a.matched = b.matched = true;
            this.score += 100 * this.currentLevel;
            if (this.scoreElement) this.scoreElement.textContent = `Score: ${this.score}`;
            this.playSfx(880); 
            if (this.grid.every(t => t.matched)) this.win();
        } else if (a && b) {
            a.flipped = b.flipped = false;
            this.playSfx(110); 
        }
        this.selectedTiles = [];
        this.renderGrid();
    }

    win() {
        this.totalScore += this.score;
        localStorage.setItem('sahara_total_score', this.totalScore);
        if (this.currentLevel === this.unlockedLevels) {
            this.unlockedLevels++;
            localStorage.setItem('sahara_unlocked', this.unlockedLevels);
        }
        
        setTimeout(() => {
            alert(`Level ${this.currentLevel} Woven!`);
            if (this.currentLevel < 20) {
                this.startLevel(this.currentLevel + 1);
            } else {
                this.switchView('levels');
            }
        }, 300);
    }

    shuffleGrid() {
        const unmatched = this.grid.filter(t => !t.matched);
        const colors = unmatched.map(t => t.color).sort(() => Math.random() - 0.5);
        unmatched.forEach((t, i) => { 
            t.color = colors[i]; 
            t.flipped = false; 
        });
        this.renderGrid();
    }

    undoMove() {
        this.grid.forEach(t => { if (!t.matched) t.flipped = false; });
        this.selectedTiles = [];
        this.renderGrid();
    }

    renderLevels() {
        const g = document.getElementById('levels-grid');
        if (!g) return;
        g.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const open = i <= this.unlockedLevels;
            const b = document.createElement('button');
            b.className = `aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${i === this.currentLevel ? 'border-primary bg-white dark:bg-stone-800 scale-105 shadow-xl' : open ? 'border-outline-variant bg-white/50 dark:bg-stone-900/50 opacity-80' : 'border-outline-variant opacity-30 cursor-not-allowed'}`;
            b.innerHTML = `<span class="font-headline text-2xl md:text-4xl ${i === this.currentLevel ? 'text-primary' : 'text-stone-500'}">${i}</span>`;
            if (open) {
                b.onclick = () => { 
                    this.startLevel(i); 
                    this.switchView('game'); 
                };
            }
            g.appendChild(b);
        }
    }

    renderLeaderboard() {
        const l = document.getElementById('leaderboard-list');
        if (!l) return;
        l.innerHTML = '';
        const userScoreDisplay = document.getElementById('user-total-score');
        if (userScoreDisplay) userScoreDisplay.textContent = this.totalScore;
        
        const bots = [
            {n:'Amara',s:12500,l:10},
            {n:'Elias',s:10200,l:8},
            {n:'Julian',s:8900,l:7}
        ];
        
        bots.forEach(p => {
            const d = document.createElement('div');
            d.className = 'bg-white dark:bg-stone-900/50 p-4 rounded-xl flex justify-between items-center border border-outline-variant/30';
            d.innerHTML = `<div><h4 class="font-bold">${p.n}</h4><p class="text-[10px] uppercase opacity-50">Level ${p.l}</p></div><div class="text-right"><p class="font-bold text-primary">${p.s}</p><p class="text-[10px] uppercase opacity-50">Pts</p></div>`;
            l.appendChild(d);
        });
    }

    resetTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timer = 0;
        this.updateTimerDisplay();
        this.startTimer();
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        if (!this.timerElement) return;
        const m = Math.floor(this.timer/60).toString().padStart(2,'0');
        const s = (this.timer%60).toString().padStart(2,'0');
        this.timerElement.textContent = `${m}:${s}`;
    }

    playSfx(freq = 440) {
        try {
            if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const o = this.audioCtx.createOscillator();
            const g = this.audioCtx.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
            o.frequency.exponentialRampToValueAtTime(freq * 2, this.audioCtx.currentTime + 0.1);
            g.gain.setValueAtTime(this.sfxVolume, this.audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.2);
            o.connect(g); 
            g.connect(this.audioCtx.destination);
            o.start(); 
            o.stop(this.audioCtx.currentTime + 0.2);
        } catch (e) {
            console.warn("Audio Context failed", e);
        }
    }

    resetProgress() { 
        if (confirm('Are you sure you want to unravel all your progress?')) { 
            localStorage.clear(); 
            location.reload(); 
        } 
    }
}

// Global instantiation
window.saharaGame = new SaharaGame();
