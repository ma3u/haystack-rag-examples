// Game constants
const GRID_SIZE = 20; // Size of the grid cells
const BASE_GAME_SPEED = 300; // Base milliseconds between game updates (much slower start)
const CANVAS_WIDTH = window.innerWidth - 40; // Nearly full width of window
const CANVAS_HEIGHT = Math.min(700, window.innerHeight - 100); // Increased game field height
const GRID_WIDTH = Math.floor(CANVAS_WIDTH / GRID_SIZE);
const GRID_HEIGHT = Math.floor(CANVAS_HEIGHT / GRID_SIZE);
const MAX_LEVEL = 100;
const LEVEL_THRESHOLD = 50; // Points needed to complete a level

// Player colors
const PLAYER1_COLOR = '#4CAF50'; // Green
const PLAYER2_COLOR = '#2196F3'; // Blue

// Food types
const FOOD_TYPES = {
    HEALTHY: 'healthy',
    SWEET: 'sweet'
};

// Sound system using native Web Audio API and local sound files
const SOUNDS_CONFIG = {
    // Realistic local food sounds for better game experience
    vegetable_crunch: { 
        src: 'sounds/vegetable_crunch.mp3', 
        fallbackSrc: 'https://assets.coderrocketfuel.com/pomodoro-times-up.mp3',
        volume: 0.8 
    },
    fruit_bite: { 
        src: 'sounds/fruit_bite.mp3', 
        fallbackSrc: 'https://soundbible.com/grab.php?id=2218&type=mp3',
        volume: 0.8 
    },
    sweet_bite: { 
        src: 'sounds/boom.mp3', 
        fallbackSrc: 'https://soundbible.com/grab.php?id=2068&type=mp3',
        volume: 0.7 
    },
    burp: { 
        src: 'sounds/burp.mp3', // Burp sound
        fallbackSrc: 'https://www.soundjay.com/human/sounds/burp-1.mp3',
        volume: 0.8 
    },
    yuck: { 
        src: 'sounds/yuck.mp3', // Disgusted sound
        fallbackSrc: 'https://www.soundjay.com/human/sounds/man-exclamation-2.mp3',
        volume: 0.7 
    },
    fart: { 
        src: 'sounds/fart.mp3', // Fart sound
        fallbackSrc: 'https://www.soundjay.com/human/sounds/fart-01.mp3',
        volume: 0.6 
    },
    boom: { 
        src: 'sounds/boom.mp3', // Explosion sound
        fallbackSrc: 'https://www.soundjay.com/mechanical/sounds/explosion-02.mp3',
        volume: 0.8 
    }
};

// Improved sound system with proper preloading for better browser compatibility
const SOUNDS = {
    // Audio objects storage
    _audioElements: {},
    _fallbackElements: {},
    _initialized: false,
    _userInteracted: false,
    _preloaded: false,
    _preloadPromises: [],
    
    // Initialize sounds
    init: function() {
        console.log('Sound system initializing...');
        
        if (this._initialized) return;
        this._initialized = true;
        
        // Create audio elements and set up preloading
        for (const [id, config] of Object.entries(SOUNDS_CONFIG)) {
            console.log(`Setting up sound: ${id}`);
            const audio = new Audio();
            
            // Handle both simple and complex config formats
            if (typeof config === 'object') {
                audio.src = config.src;
                audio.volume = config.volume || 0.7;
                
                // Store fallback source if provided
                if (config.fallbackSrc) {
                    console.log(`Fallback source registered for ${id}`);
                    const fallbackAudio = new Audio();
                    fallbackAudio.src = config.fallbackSrc;
                    fallbackAudio.volume = config.volume || 0.7;
                    this._fallbackElements[id] = fallbackAudio;
                }
            } else {
                console.warn(`Invalid sound config for ${id}`);
                continue;
            }
            
            this._audioElements[id] = audio;
        }
        
        // Add interaction listeners to unlock audio
        const unlockAudio = () => {
            if (this._userInteracted) return;
            this._userInteracted = true;
            console.log('User interaction detected, unlocking audio...');
            
            // Play a silent sound to unlock audio on iOS and Safari
            const silentSound = new Audio();
            silentSound.play().catch(e => console.log('Silent sound failed but that\'s OK'));
            
            // Now is a good time to ensure all sounds are preloaded
            this.preloadAll();
            
            // Remove the listeners
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        
        // Add multiple event listeners to catch any user interaction
        document.addEventListener('click', unlockAudio);
        document.addEventListener('keydown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        
        console.log('Audio system initialized, ready for preloading');
        
        // Start preloading immediately
        this.preloadAll();
    },
    
    // Preload all sound assets
    preloadAll: function() {
        if (this._preloaded) return Promise.resolve();
        
        console.log('%c PRELOADING ALL SOUNDS ', 'background: #a0a; color: #fff; font-size: 12px;');
        this._preloaded = true;
        this._preloadPromises = [];
        
        // Preload main sounds
        for (const [id, audio] of Object.entries(this._audioElements)) {
            console.log(`Preloading sound: ${id}`);
            
            // Set event handlers
            audio.preload = 'auto';
            
            // Create a promise for this sound's loading
            const loadPromise = new Promise((resolve) => {
                // Set up event handlers
                audio.addEventListener('canplaythrough', () => {
                    console.log(`Sound ${id} preloaded successfully`);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`Error preloading sound ${id}:`, e);
                    resolve(); // Resolve anyway to not block other sounds
                }, { once: true });
                
                // Start loading
                audio.load();
                
                // For some browsers that don't fire events properly, add a timeout
                setTimeout(resolve, 3000);
            });
            
            this._preloadPromises.push(loadPromise);
        }
        
        // Preload fallback sounds
        for (const [id, audio] of Object.entries(this._fallbackElements)) {
            console.log(`Preloading fallback sound: ${id}`);
            audio.preload = 'auto';
            
            const loadPromise = new Promise((resolve) => {
                audio.addEventListener('canplaythrough', () => {
                    console.log(`Fallback sound ${id} preloaded successfully`);
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`Error preloading fallback sound ${id}:`, e);
                    resolve();
                }, { once: true });
                
                audio.load();
                setTimeout(resolve, 3000);
            });
            
            this._preloadPromises.push(loadPromise);
        }
        
        // Return a promise that resolves when all sounds are preloaded
        return Promise.all(this._preloadPromises).then(() => {
            console.log('%c ALL SOUNDS PRELOADED SUCCESSFULLY ', 'background: #0a0; color: #fff; font-size: 12px;');
            
            // If user has interacted, try to unlock sounds
            if (this._userInteracted) {
                this.unlockSounds();
            }
        }).catch(e => {
            console.warn('Some sounds failed to preload:', e);
        });
    },
    
    // Unlock sounds by playing them silently
    unlockSounds: function() {
        // Try to get all sounds ready by playing them silently
        for (const id in this._audioElements) {
            const sound = this._audioElements[id];
            const originalVolume = sound.volume;
            sound.volume = 0.001; // Nearly silent
            
            // Try to play and immediately pause to bypass restrictions
            sound.play()
                .then(() => {
                    sound.pause();
                    sound.currentTime = 0;
                    sound.volume = originalVolume;
                    console.log(`Sound ${id} unlocked`); 
                })
                .catch(e => console.log(`Couldn't unlock ${id} yet`));
        }
    },
    
    // Play a sound by its ID with fallback support
    play: function(id) {
        if (!this._initialized || !this._audioElements[id]) {
            console.log(`Can't play sound ${id}: not initialized or doesn't exist`);
            return;
        }
        
        try {
            // Create a new Audio instance for this playback to avoid conflicts
            let sound = new Audio(this._audioElements[id].src);
            sound.volume = this._audioElements[id].volume;
            
            // Try to play with error handling and fallback
            sound.play().catch(e => {
                console.warn(`Failed to play ${id}, trying fallback if available:`, e);
                
                // Try fallback source if available (for Chrome compatibility)
                if (this._fallbackElements[id]) {
                    console.log(`Using fallback source for ${id}`);
                    const fallbackSound = new Audio(this._fallbackElements[id].src);
                    fallbackSound.volume = this._fallbackElements[id].volume;
                    
                    fallbackSound.play().catch(fallbackErr => {
                        console.error(`Fallback sound also failed:`, fallbackErr);
                        
                        // Force user interaction flag to true for future attempts
                        this._userInteracted = true;
                    });
                } else {
                    // If we haven't detected user interaction, try to force unlock
                    if (!this._userInteracted) {
                        console.log('Forcing userInteracted flag to true for future attempts');
                        this._userInteracted = true;
                    }
                }
            });
        } catch (e) {
            console.warn(`Error playing sound ${id}:`, e);
        }
    }
};

// Foods database with calories and points
const FOODS = [
    // Vegetables - low calories, high points
    { name: 'Lettuce', emoji: '🥬', calories: 5, points: 25, type: FOOD_TYPES.HEALTHY },
    { name: 'Cucumber', emoji: '🥒', calories: 8, points: 22, type: FOOD_TYPES.HEALTHY },
    { name: 'Tomato', emoji: '🍅', calories: 18, points: 20, type: FOOD_TYPES.HEALTHY },
    { name: 'Broccoli', emoji: '🥦', calories: 20, points: 18, type: FOOD_TYPES.HEALTHY },
    { name: 'Carrot', emoji: '🥕', calories: 25, points: 16, type: FOOD_TYPES.HEALTHY },
    { name: 'Bell Pepper', emoji: '🫑', calories: 30, points: 15, type: FOOD_TYPES.HEALTHY },
    { name: 'Mushroom', emoji: '🍄', calories: 15, points: 20, type: FOOD_TYPES.HEALTHY },
    { name: 'Asparagus', emoji: '🌱', calories: 27, points: 15, type: FOOD_TYPES.HEALTHY },
    { name: 'Cabbage', emoji: '🥬', calories: 22, points: 17, type: FOOD_TYPES.HEALTHY },
    { name: 'Spinach', emoji: '🍃', calories: 7, points: 23, type: FOOD_TYPES.HEALTHY },
    { name: 'Onion', emoji: '🧅', calories: 40, points: 12, type: FOOD_TYPES.HEALTHY },
    { name: 'Garlic', emoji: '🧄', calories: 45, points: 10, type: FOOD_TYPES.HEALTHY },
    { name: 'Potato', emoji: '🥔', calories: 130, points: 5, type: FOOD_TYPES.HEALTHY },
    { name: 'Corn', emoji: '🌽', calories: 85, points: 8, type: FOOD_TYPES.HEALTHY },
    { name: 'Avocado', emoji: '🥑', calories: 160, points: 5, type: FOOD_TYPES.HEALTHY },
    
    // Fruits - medium calories, medium points
    { name: 'Apple', emoji: '🍎', calories: 52, points: 10, type: FOOD_TYPES.HEALTHY },
    { name: 'Banana', emoji: '🍌', calories: 105, points: 8, type: FOOD_TYPES.HEALTHY },
    { name: 'Orange', emoji: '🍊', calories: 45, points: 12, type: FOOD_TYPES.HEALTHY },
    { name: 'Strawberry', emoji: '🍓', calories: 30, points: 14, type: FOOD_TYPES.HEALTHY },
    { name: 'Grapes', emoji: '🍇', calories: 62, points: 10, type: FOOD_TYPES.HEALTHY },
    { name: 'Watermelon', emoji: '🍉', calories: 35, points: 13, type: FOOD_TYPES.HEALTHY },
    { name: 'Pineapple', emoji: '🍍', calories: 50, points: 11, type: FOOD_TYPES.HEALTHY },
    { name: 'Peach', emoji: '🍑', calories: 39, points: 12, type: FOOD_TYPES.HEALTHY },
    { name: 'Pear', emoji: '🍐', calories: 57, points: 9, type: FOOD_TYPES.HEALTHY },
    { name: 'Cherry', emoji: '🍒', calories: 50, points: 10, type: FOOD_TYPES.HEALTHY },
    { name: 'Kiwi', emoji: '🥝', calories: 42, points: 12, type: FOOD_TYPES.HEALTHY },
    { name: 'Mango', emoji: '🥭', calories: 60, points: 9, type: FOOD_TYPES.HEALTHY },
    { name: 'Blueberries', emoji: '🫐', calories: 40, points: 13, type: FOOD_TYPES.HEALTHY },
    { name: 'Coconut', emoji: '🥥', calories: 159, points: 5, type: FOOD_TYPES.HEALTHY },
    { name: 'Lemon', emoji: '🍋', calories: 22, points: 17, type: FOOD_TYPES.HEALTHY },
    
    // Sweets - high calories, negative effects
    { name: 'Candy', emoji: '🍬', calories: 400, points: -5, type: FOOD_TYPES.SWEET },
    { name: 'Chocolate', emoji: '🍫', calories: 550, points: -8, type: FOOD_TYPES.SWEET },
    { name: 'Ice Cream', emoji: '🍦', calories: 300, points: -4, type: FOOD_TYPES.SWEET },
    { name: 'Cake', emoji: '🍰', calories: 350, points: -6, type: FOOD_TYPES.SWEET },
    { name: 'Donut', emoji: '🍩', calories: 250, points: -3, type: FOOD_TYPES.SWEET },
    { name: 'Cookie', emoji: '🍪', calories: 200, points: -2, type: FOOD_TYPES.SWEET }
];

// Game variables
let snakeP1 = [];
let snakeP2 = [];
let foods = []; // Multiple foods on screen at once
let directionP1 = 'right';
let nextDirectionP1 = 'right';
let directionP2 = 'left';
let nextDirectionP2 = 'left';
let gameRunning = false;
let gameInterval;
let scoreP1 = 0;
let scoreP2 = 0;
let caloriesP1 = 0;
let caloriesP2 = 0;
let isPaused = false;
let winner = null;
let currentLevel = 1;
let speedMultiplier = 1.0;
let levelProgressP1 = 0;
let levelProgressP2 = 0;
let goodFoodCount = 0; // Counter for vegetables and fruits eaten
let speedP1 = 1.0;
let speedP2 = 1.0;
let snakeThicknessP1 = 1.0;
let snakeThicknessP2 = 1.0;
let lastFoodUpdateTime = 0;
let sweetProbability = 0.10; // 10% chance for a sweet
let fruitProbability = 0.30; // 30% chance for a fruit
let vegetableProbability = 0.60; // 60% chance for a vegetable
let currentFoodInfo = null;
let poops = []; // Array to store poop objects
let poopCooldown = false; // Cooldown for poop dropping to prevent too many at once
let lastPlayerMoved = 1; // Keep track of the last player that moved

// DOM Elements
const canvas = document.getElementById('gameCanvas');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');
const scoreDisplayP1 = document.getElementById('scoreP1');
const scoreDisplayP2 = document.getElementById('scoreP2');
const caloriesDisplayP1 = document.getElementById('caloriesP1');
const caloriesDisplayP2 = document.getElementById('caloriesP2');
const startButton = document.getElementById('startButton');
// Next Level button removed in favor of automatic level progression
const winnerDisplay = document.getElementById('winnerDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const speedMultiplierDisplay = document.getElementById('speedMultiplier');
const foodInfoDisplay = document.getElementById('foodInfo');

// Add blinking effect to the canvas
function blinkCanvas(isLevelChange = false) {
    const canvas = document.getElementById('gameCanvas');
    
    // Remove any existing animation classes
    canvas.classList.remove('blink', 'blink-level');
    
    // Trigger a reflow to restart animation
    void canvas.offsetWidth;
    
    // Add the appropriate animation class
    if (isLevelChange) {
        canvas.classList.add('blink-level');
    } else {
        canvas.classList.add('blink');
    }
}

// Initialize game
function init() {
    console.log('Initializing game...');
    
    // Make sure the startButton element exists before adding event listener
    if (!startButton) {
        console.error('Start button not found in DOM!');
    } else {
        console.log('Start button found, adding event listener...');
        // Remove any existing event listeners to prevent duplicates
        startButton.removeEventListener('click', startGame);
        startButton.addEventListener('click', startGame);
        
        // Add direct onclick handler as backup
        startButton.onclick = function() {
            console.log('Start button clicked (via onclick)!');
            startGame();
        };
    }
    
    document.addEventListener('keydown', handleKeyPress);
    window.addEventListener('resize', handleWindowResize);
    updateLevelDisplay();
    
    try {
        // Initialize sounds with native Web Audio API
        initSounds();
        
        // Add click handler to the canvas to help unlock audio
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            console.log('Adding canvas click handler for audio unlocking');
            gameCanvas.addEventListener('click', function() {
                console.log('Canvas clicked - attempting to unlock audio');
                // Force the user interaction flag
                SOUNDS._userInteracted = true;
                
                // Try to play a test sound
                try {
                    // Create a temporary audio element
                    const unlockSound = new Audio();
                    unlockSound.src = SOUNDS_CONFIG.yummy.src;
                    unlockSound.volume = 0.01; // Very quiet
                    
                    unlockSound.play()
                        .then(() => {
                            console.log('Audio unlocked successfully!');
                            unlockSound.pause();
                            unlockSound.currentTime = 0;
                        })
                        .catch(e => {
                            console.log('Audio unlock attempt failed:', e);
                        });
                } catch (e) {
                    console.warn('Error in audio unlock attempt:', e);
                }
            });
        }
    } catch (e) {
        console.error('Error initializing sounds:', e);
        console.warn('Game will continue without sound effects');
    }
    
    console.log('Game initialization complete!');
}

// Initialize sounds with proper preloading - make it async and non-blocking
function initSounds() {
    console.log('%c SOUND INIT STARTED ', 'background: #aa0; color: #000; font-size: 12px;');
    
    // Initialize the sound system immediately
    try {
        console.log('Starting audio system initialization with preloading...');
        SOUNDS.init();
        console.log('%c SOUND INIT COMPLETE, PRELOADING IN PROGRESS ', 'background: #0a0; color: #fff; font-size: 12px;');
        
        // Create a loading indicator in the UI
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'soundLoadingIndicator';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.bottom = '10px';
        loadingIndicator.style.right = '10px';
        loadingIndicator.style.background = 'rgba(0,0,0,0.7)';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '5px 10px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.fontSize = '12px';
        loadingIndicator.style.zIndex = '1000';
        loadingIndicator.textContent = 'Loading sounds...';
        document.body.appendChild(loadingIndicator);
        
        // Wait for all sounds to be preloaded
        SOUNDS.preloadAll().then(() => {
            console.log('All sounds preloaded successfully');
            // Remove the loading indicator when done
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
            
            // Attempt to unlock sounds once preloaded
            if (SOUNDS._userInteracted) {
                SOUNDS.unlockSounds();
            }
        }).catch(e => {
            console.warn('Preloading completed with some issues:', e);
            // Remove the loading indicator even if there were issues
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        });
    } catch (e) {
        console.error('Error initializing sounds (non-critical):', e);
        console.log('Game will continue without sound effects');
    }
    
    // Return immediately to prevent blocking game start
    return true;
}

// Drop poop behind the snake that last moved
function dropPoop() {
    console.log('Dropping poop for player:', lastPlayerMoved);
    console.log('Current snake lengths - P1:', snakeP1.length, 'P2:', snakeP2.length);
    
    // Set a default player if lastPlayerMoved isn't properly set
    if (lastPlayerMoved !== 1 && lastPlayerMoved !== 2) {
        console.log('Invalid lastPlayerMoved value, defaulting to player 1');
        lastPlayerMoved = 1;
    }
    
    const snake = lastPlayerMoved === 1 ? snakeP1 : snakeP2;
    
    // Only allow poop drop if snake has minimum length
    if (snake.length < 5) {
        console.log('Snake too short to drop poop! Length:', snake.length);
        return;
    }
    
    // Get the last segment (tail) of the snake
    const tailSegment = snake[snake.length - 1];
    console.log('Tail segment position:', tailSegment);
    
    // Add poop at the tail position
    poops.push({
        x: tailSegment.x,
        y: tailSegment.y,
        player: lastPlayerMoved
    });
    console.log('Poop added at position:', tailSegment, 'Total poops:', poops.length);
    
    // Reduce snake thickness (don't go below 0.6)
    if (lastPlayerMoved === 1) {
        snakeThicknessP1 = Math.max(0.6, snakeThicknessP1 - 0.1);
        // Adjust speed to compensate for shorter snake (prevents it from getting faster)
        speedP1 = Math.max(0.7, speedP1 - 0.05);
    } else {
        snakeThicknessP2 = Math.max(0.6, snakeThicknessP2 - 0.1);
        // Adjust speed to compensate for shorter snake (prevents it from getting faster)
        speedP2 = Math.max(0.7, speedP2 - 0.05);
    }
    
    // Remove a segment from the snake's tail
    snake.pop();
    
    // Play fart sound with SoundJS
    SOUNDS.play('fart');
}

// Handle window resize
function handleWindowResize() {
    // Update canvas dimensions
    const newWidth = window.innerWidth - 40;
    const newHeight = Math.min(500, window.innerHeight - 150);
    
    // Only update if dimensions have changed significantly
    if (Math.abs(newWidth - CANVAS_WIDTH) > 50 || Math.abs(newHeight - CANVAS_HEIGHT) > 50) {
        location.reload(); // Reload the page to reinitialize with new dimensions
    }
}

// Start the game
function startGame() {
    console.log('%c GAME START ATTEMPT ', 'background: #0a0; color: #fff; font-size: 12px;');
    console.log('Game variables state:', { 
        gameRunning, 
        snakeP1Length: snakeP1.length, 
        snakeP2Length: snakeP2.length,
        foodsCount: foods.length
    });
    
    // Debug all DOM elements
    console.log('DOM elements:', {
        canvas: document.getElementById('gameCanvas'),
        startButton: document.getElementById('startButton'),
        scoreP1: document.getElementById('scoreP1'),
        scoreP2: document.getElementById('scoreP2')
    });
    
    // Make sure canvas exists and is initialized
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Check canvas context
    try {
        const testCtx = canvas.getContext('2d');
        console.log('Canvas context obtained:', testCtx ? 'Success' : 'Failed');
    } catch (e) {
        console.error('Error getting canvas context:', e);
    }
    
    if (gameRunning) {
        console.log('Game was already running, clearing interval');
        clearInterval(gameInterval);
    }

    // Reset game state
    snakeP1 = [
        {x: Math.floor(GRID_WIDTH * 0.25), y: Math.floor(GRID_HEIGHT / 2)},
        {x: Math.floor(GRID_WIDTH * 0.25) - 1, y: Math.floor(GRID_HEIGHT / 2)},
        {x: Math.floor(GRID_WIDTH * 0.25) - 2, y: Math.floor(GRID_HEIGHT / 2)}
    ];
    
    snakeP2 = [
        {x: Math.floor(GRID_WIDTH * 0.75), y: Math.floor(GRID_HEIGHT / 2)},
        {x: Math.floor(GRID_WIDTH * 0.75) + 1, y: Math.floor(GRID_HEIGHT / 2)},
        {x: Math.floor(GRID_WIDTH * 0.75) + 2, y: Math.floor(GRID_HEIGHT / 2)}
    ];
    
    foods = [];
    createInitialFoods();
    
    directionP1 = 'right';
    nextDirectionP1 = 'right';
    directionP2 = 'left';
    nextDirectionP2 = 'left';
    gameRunning = true;
    isPaused = false;
    
    // Hide audio notice when game starts
    const audioNotice = document.getElementById('audioNotice');
    if (audioNotice) {
        audioNotice.style.display = 'none';
    }
    
    // Reset scores and stats
    scoreP1 = 0;
    scoreP2 = 0;
    caloriesP1 = 0;
    caloriesP2 = 0;
    winner = null;
    currentLevel = 1;
    levelProgressP1 = 0;
    levelProgressP2 = 0;
    speedP1 = 1.0;
    speedP2 = 1.0;
    snakeThicknessP1 = 1.0;
    snakeThicknessP2 = 1.0;
    speedMultiplier = 1.0;
    poopCooldown = false; // Reset poop cooldown
    
    // Update displays
    updateScoreDisplays();
    updateCalorieDisplays();
    updateLevelDisplay();
    winnerDisplay.textContent = '';
    // Next Level button no longer used - automatic progression now implemented
    foodInfoDisplay.textContent = 'Collect fruits and vegetables for points. Beware of sweets!';

    // Change button text
    startButton.textContent = 'Restart Game';

        // Start game loop with current level speed
    console.log('About to start game loop...');
    try {
        startGameLoop();
        console.log('%c GAME LOOP STARTED SUCCESSFULLY ', 'background: #0a0; color: #fff; font-size: 12px;');
    } catch (e) {
        console.error('Failed to start game loop:', e);
    }
}

// Update the level display
function updateLevelDisplay() {
    levelDisplay.textContent = currentLevel;
    speedMultiplierDisplay.textContent = speedMultiplier.toFixed(1);
}

// Start or restart the game loop with current speed
function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    // Calculate game speed based on level
    const gameSpeed = Math.max(BASE_GAME_SPEED - (currentLevel * 1.25), 50);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// Go to next level
function goToNextLevel() {
    if (currentLevel < MAX_LEVEL) {
        currentLevel++;
        speedMultiplier = 1 + ((currentLevel - 1) * 0.1); // 10% speed increase per level
        
        // Increase snake speeds for each level
        speedP1 = Math.min(2.0, 1.0 + (currentLevel - 1) * 0.05);
        speedP2 = Math.min(2.0, 1.0 + (currentLevel - 1) * 0.05);
        
        levelProgressP1 = 0;
        levelProgressP2 = 0;
        updateLevelDisplay();
        startGameLoop(); // Restart game loop with new speed
        
        // Triple blink effect for level change
        blinkCanvas(true);
        
        // Add more sweets at higher levels
        sweetProbability = Math.min(0.15 + (currentLevel * 0.003), 0.4);
        
        // Create new food for the new level
        createInitialFoods();
    }
}

// Helper to check if position overlaps with a snake
function isPositionOccupied(x, y) {
    // Check if position overlaps with any snake segment
    for (let segment of snakeP1) {
        if (segment.x === x && segment.y === y) return true;
    }
    
    for (let segment of snakeP2) {
        if (segment.x === x && segment.y === y) return true;
    }
    
    // Check if position overlaps with any existing food
    for (let existingFood of foods) {
        if (existingFood.x === x && existingFood.y === y) return true;
    }
    
    return false;
}

// Track if veggies are currently on board
let hasVegetableOnBoard = false;

// Create a single food item at random position
function createFood(forceVegetable = false, forceMiddle = false) {
    let maxAttempts = 50; // Prevent infinite loop
    let attempts = 0;
    
    let foodItem;
    let foodType;
    let createdTime = Date.now(); // Track when food was created for sweets timeout
    
    // Force vegetable if required or if none on board
    const vegetables = FOODS.filter(food => 
        food.type === FOOD_TYPES.HEALTHY && food.calories <= 50); // Low calorie = vegetable
    
    const fruits = FOODS.filter(food => 
        food.type === FOOD_TYPES.HEALTHY && food.calories > 50); // Higher calorie = fruit
    
    const sweets = FOODS.filter(food => food.type === FOOD_TYPES.SWEET);
    
    // Check if there's a vegetable already on the board
    const hasExistingVegetable = foods.some(f => 
        f.food.type === FOOD_TYPES.HEALTHY && f.food.calories <= 50
    );
    
    if (forceVegetable || !hasExistingVegetable) {
        // Must choose a vegetable if none are present or vegetable is forced
        foodItem = vegetables[Math.floor(Math.random() * vegetables.length)];
        foodType = 'vegetable';
    } else {
        // Use probabilities to determine food type
        const rand = Math.random();
        
        if (rand < sweetProbability) {
            // Sweet items (10%)
            foodItem = sweets[Math.floor(Math.random() * sweets.length)];
            foodType = 'sweet';
        } else if (rand < sweetProbability + fruitProbability) {
            // Fruits (30%)
            foodItem = fruits[Math.floor(Math.random() * fruits.length)];
            foodType = 'fruit';
        } else {
            // Vegetables (60%)
            foodItem = vegetables[Math.floor(Math.random() * vegetables.length)];
            foodType = 'vegetable';
        }
    }
    
    // Create in middle if forced or find a free position
    if (forceMiddle) {
        // Use the middle of the board
        return {
            x: Math.floor(GRID_WIDTH / 2),
            y: Math.floor(GRID_HEIGHT / 2),
            food: foodItem,
            createdTime: createdTime
        };
    }
    
    // Find a free position
    while (attempts < maxAttempts) {
        const x = Math.floor(Math.random() * GRID_WIDTH);
        const y = Math.floor(Math.random() * GRID_HEIGHT);
        
        if (!isPositionOccupied(x, y)) {
            return {
                x: x,
                y: y,
                food: foodItem,
                createdTime: createdTime
            };
        }
        
        attempts++;
    }
    
    // Fallback position if all attempts failed
    return {
        x: Math.floor(GRID_WIDTH / 2),
        y: Math.floor(GRID_HEIGHT / 2),
        food: foodItem,
        createdTime: createdTime
    };
}

// Create multiple foods to start the game
function createInitialFoods() {
    foods = [];
    
    // Start with just one vegetable in the middle
    foods.push(createFood(true, true)); // Force vegetable and place in middle
}

// Handle keyboard input for both players
function handleKeyPress(event) {
    // Log key press for debugging
    console.log(`Key pressed: ${event.key}`);
    
    // Prevent default behavior for arrow keys and space to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(event.key)) {
        event.preventDefault();
    }
    
    // Player 1 controls (WASD keys) - on the right side
    switch (event.key.toLowerCase()) {
        case 'w':
            if (directionP1 !== 'down') {
                nextDirectionP1 = 'up';
            }
            break;
        case 's':
            if (directionP1 !== 'up') {
                nextDirectionP1 = 'down';
            }
            break;
        case 'a':
            if (directionP1 !== 'right') {
                nextDirectionP1 = 'left';
            }
            break;
        case 'd':
            if (directionP1 !== 'left') {
                nextDirectionP1 = 'right';
            }
            break;
    }
    
    // Player 2 controls (Arrow keys) - on the left side
    switch (event.key) {
        case 'ArrowUp':
            if (directionP2 !== 'down') {
                nextDirectionP2 = 'up';
            }
            break;
        case 'ArrowDown':
            if (directionP2 !== 'up') {
                nextDirectionP2 = 'down';
            }
            break;
        case 'ArrowLeft':
            if (directionP2 !== 'right') {
                nextDirectionP2 = 'left';
            }
            break;
        case 'ArrowRight':
            if (directionP2 !== 'left') {
                nextDirectionP2 = 'right';
            }
            break;
    }
    
    // Special controls - E key for poop drop, space for game start/pause
    if (event.key === 'e' || event.key === 'E') {
        console.log('%c E KEY PRESSED FOR POOP ', 'background: #f0a; color: #fff; font-size: 12px;');
        console.log('Game state when E pressed:', { gameRunning, isPaused, lastPlayerMoved });
        
        if (gameRunning && !isPaused) {
            console.log('Game running and not paused, attempting to drop poop...');
            console.log('Last player moved:', lastPlayerMoved, 'Snake lengths - P1:', snakeP1.length, 'P2:', snakeP2.length);
            
            // Drop poop only when game is running and not paused and not in cooldown
            if (!poopCooldown) {
                // Force alternate if lastPlayerMoved is not set properly
                if (lastPlayerMoved !== 1 && lastPlayerMoved !== 2) {
                    console.log('Invalid lastPlayerMoved, defaulting to player 1');
                    lastPlayerMoved = 1;
                }
                
                dropPoop();
                
                // Set a short cooldown to prevent too rapid poop drops
                poopCooldown = true;
                setTimeout(() => {
                    poopCooldown = false;
                }, 300);
            } else {
                console.log('Poop on cooldown, cannot drop yet');
            }
        }
    } else if (event.key === ' ') {
        console.log('%c SPACE KEY PRESSED ', 'background: #f0a; color: #fff; font-size: 12px;');
        
        if (!gameRunning) {
            // Start the game if not already running
            startGame();
        } else {
            // Toggle pause if game is running
            togglePause();
        }
    } else if (event.key === 'p') { // Pause toggle with 'p' key
        togglePause();
    } else if (event.key === ' ') { // Poop drop with space key
        console.log('%c SPACE KEY PRESSED FOR POOP ', 'background: #f0a; color: #fff; font-size: 12px;');
        console.log('Game state when space pressed:', { gameRunning, isPaused, lastPlayerMoved });
        
        if (gameRunning && !isPaused) {
            console.log('Game running and not paused, attempting to drop poop...');
            console.log('Last player moved:', lastPlayerMoved, 'Snake lengths - P1:', snakeP1.length, 'P2:', snakeP2.length);
            
            // Drop poop only when game is running and not paused and not in cooldown
            if (!poopCooldown) {
                // Force alternate if lastPlayerMoved is not set properly
                if (lastPlayerMoved !== 1 && lastPlayerMoved !== 2) {
                    console.log('Invalid lastPlayerMoved, defaulting to player 1');
                    lastPlayerMoved = 1;
                }
                
                dropPoop();
                
                // Set a short cooldown to prevent too rapid poop drops
                poopCooldown = true;
                setTimeout(() => {
                    poopCooldown = false;
                }, 300);
            } else {
                console.log('Poop on cooldown, cannot drop yet');
            }
        }
    }
}

// Toggle game pause
function togglePause() {
    if (!gameRunning) return; // Do not allow pausing if the game hasn't started
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(gameInterval);
        drawPauseScreen();
    } else {
        startGameLoop(); // Restart the game loop
    }
}

// Draw pause notification
function drawPauseScreen() {
    // Create semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial'; // Increased font size
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.font = '16px Arial';
    ctx.fillText('Press P to Resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
}

// Update score displays
function updateScoreDisplays() {
    scoreDisplayP1.textContent = scoreP1;
    scoreDisplayP2.textContent = scoreP2;
}

// Update calorie displays
function updateCalorieDisplays() {
    caloriesDisplayP1.textContent = caloriesP1;
    caloriesDisplayP2.textContent = caloriesP2;
}

// Main game loop
function gameLoop() {
    directionP1 = nextDirectionP1;
    directionP2 = nextDirectionP2;
    moveSnakes();
    checkCollisions();
    updateFoods();
    checkLevelProgress();
    draw();
}

// Periodically add new foods
function updateFoods() {
    const now = Date.now();
    
    // Check for expired foods based on their type
    for (let i = foods.length - 1; i >= 0; i--) {
        const foodItem = foods[i];
        
        // Vegetables expire after 30 seconds
        if (foodItem.food.type === FOOD_TYPES.HEALTHY && foodItem.food.calories <= 50 && 
            (now - foodItem.createdTime > 30000)) { // 30 seconds for vegetables
            foods.splice(i, 1);
        }
        // Fruits expire after 60 seconds
        else if (foodItem.food.type === FOOD_TYPES.HEALTHY && foodItem.food.calories > 50 && 
            (now - foodItem.createdTime > 60000)) { // 60 seconds for fruits
            foods.splice(i, 1);
        }
        // Sweets stay forever (no expiration check)
    }
    
    // Add a new food every 5 seconds if less than 3 foods on screen
    if (now - lastFoodUpdateTime > 5000 && foods.length < 3) {
        // Check if we have a vegetable on the board
        const hasVegetable = foods.some(foodItem => 
            foodItem.food.type === FOOD_TYPES.HEALTHY && foodItem.food.calories <= 50
        );
        
        // If no vegetable, force one to be created
        if (!hasVegetable) {
            foods.push(createFood(true)); // Force vegetable
        } else {
            foods.push(createFood()); // Regular food with probabilities
        }
        
        lastFoodUpdateTime = now;
    }
}

// Check if either player has met the level threshold
function checkLevelProgress() {
    if (levelProgressP1 >= LEVEL_THRESHOLD || levelProgressP2 >= LEVEL_THRESHOLD) {
        if (currentLevel < MAX_LEVEL) {
            // Next level progression happens automatically now
            const leadPlayer = levelProgressP1 >= LEVEL_THRESHOLD ? 'Player 1' : 'Player 2';
            foodInfoDisplay.textContent = `${leadPlayer} reached the level threshold! Click "Next Level" to proceed.`;
        } else {
            foodInfoDisplay.textContent = `Maximum level reached! Keep playing to improve your score.`;
        }
    }
}

// Move both snakes in their current directions
function moveSnakes() {
    // Move player 1 snake with their speed
    if (gameRunning && snakeP1.length > 0) {
        // Only move on certain frames based on speed
        if (Math.random() < speedP1 / speedMultiplier) {
            moveSnake(snakeP1, directionP1, 1);
        }
    }
    
    // Move player 2 snake with their speed
    if (gameRunning && snakeP2.length > 0) {
        // Only move on certain frames based on speed
        if (Math.random() < speedP2 / speedMultiplier) {
            moveSnake(snakeP2, directionP2, 2);
        }
    }
}

// Move a specific snake
function moveSnake(snake, direction, playerNumber) {
    // Set the last player moved
    lastPlayerMoved = playerNumber;
    console.log('Player ' + playerNumber + ' moved, updated lastPlayerMoved =', lastPlayerMoved);
    
    // Create new head based on direction
    const head = Object.assign({}, snake[0]);
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }

    // Add new head to beginning of snake array
    snake.unshift(head);

    // Check if snake eats any food
    let foodEaten = false;
    for (let i = 0; i < foods.length; i++) {
        const foodItem = foods[i];
        if (head.x === foodItem.x && head.y === foodItem.y) {
            // Process food consumption based on type
            processFood(foodItem, playerNumber);
            
            // Remove the consumed food
            foods.splice(i, 1);
            foodEaten = true;
            break;
        }
    }
    
    if (!foodEaten) {
        // Remove tail if snake didn't eat food
        snake.pop();
    }
    
    // If there are less than 2 foods on the screen, create a new one
    if (foods.length < 2) {
        foods.push(createFood());
        lastFoodUpdateTime = Date.now();
    }
}

// Process food consumption effects
function processFood(foodItem, playerNumber) {
    const food = foodItem.food;
    const isPlayer1 = playerNumber === 1;
    const pointsToAdd = food.points;
    const caloriesToAdd = food.calories;
    
    // Play appropriate realistic sound based on food type
    if (food.type === FOOD_TYPES.HEALTHY) {
        // For vegetables (low calorie healthy food)
        if (food.calories <= 50) {
            // Reset the vegetable flag so a new vegetable will be generated
            hasVegetableOnBoard = false;
            
            // Play realistic vegetable crunch sound
            SOUNDS.play('vegetable_crunch');
        } else {
            // Play realistic fruit bite sound for fruits
            SOUNDS.play('fruit_bite');
        }
    } else if (food.type === FOOD_TYPES.SWEET) {
        // Play realistic sweet bite sound first
        SOUNDS.play('sweet_bite');
        
        // Then play the burp sound after a slight delay
        setTimeout(() => {
            SOUNDS.play('burp');
        }, 300);
    }
    
    // Update score, calories and progress
    if (isPlayer1) {
        scoreP1 += pointsToAdd;
        caloriesP1 += caloriesToAdd;
        levelProgressP1 += Math.max(1, pointsToAdd); // Always progress at least 1 point
    } else {
        scoreP2 += pointsToAdd;
        caloriesP2 += caloriesToAdd;
        levelProgressP2 += Math.max(1, pointsToAdd); // Always progress at least 1 point
    }
    
    // Count vegetables and fruits for level progression
    if (food.type === FOOD_TYPES.VEGETABLE || food.type === FOOD_TYPES.FRUIT) {
        goodFoodCount++;
        
        // Automatically go to next level after every 10 vegetables or fruits
        if (goodFoodCount >= 10) {
            goodFoodCount = 0; // Reset counter
            if (currentLevel < MAX_LEVEL) {
                goToNextLevel();
            }
        }
    }
    
    // Blink screen when food is eaten
    blinkCanvas(false);
    
    // Update displays
    updateScoreDisplays();
    updateCalorieDisplays();
    
    // Show food info
    const playerName = isPlayer1 ? 'Player 1' : 'Player 2';
    foodInfoDisplay.textContent = `${playerName} ate ${food.emoji} ${food.name}: ${caloriesToAdd} calories, ${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} points`;
    
    // Apply food effects based on type
    if (food.type === FOOD_TYPES.SWEET) {
        // Sweet effects: slow down, shorten, and fatten the snake
        applyNegativeEffects(playerNumber);
    }
}

// Apply negative effects from eating sweets
function applyNegativeEffects(playerNumber) {
    if (playerNumber === 1) {
        // Slow down
        speedP1 = Math.max(0.5, speedP1 - 0.1);
        
        // Fatten
        snakeThicknessP1 = Math.min(2.0, snakeThicknessP1 + 0.2);
        
        // Shorten - remove up to 2 segments if the snake is long enough
        if (snakeP1.length > 3) {
            const segmentsToRemove = Math.min(2, snakeP1.length - 3);
            for (let i = 0; i < segmentsToRemove; i++) {
                snakeP1.pop();
            }
        }
    } else {
        // Slow down
        speedP2 = Math.max(0.5, speedP2 - 0.1);
        
        // Fatten
        snakeThicknessP2 = Math.min(2.0, snakeThicknessP2 + 0.2);
        
        // Shorten - remove up to 2 segments if the snake is long enough
        if (snakeP2.length > 3) {
            const segmentsToRemove = Math.min(2, snakeP2.length - 3);
            for (let i = 0; i < segmentsToRemove; i++) {
                snakeP2.pop();
            }
        }
    }
}

// Check for all types of collisions
function checkCollisions() {
    // Skip if any snake is empty (already eliminated)
    if (snakeP1.length === 0 || snakeP2.length === 0) return;
    
    // Player 1 collisions
    if (checkPlayerCollision(snakeP1, snakeP2, 1)) return;
    
    // Player 2 collisions
    checkPlayerCollision(snakeP2, snakeP1, 2);
}

// Check collision for a specific player
function checkPlayerCollision(playerSnake, otherSnake, playerNumber) {
    const head = playerSnake[0];
    
    // Check for wall collision
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        declareWinner(playerNumber === 1 ? 2 : 1);
        return true;
    }
    
    // Check for self collision (starting from 4th segment)
    for (let i = 4; i < playerSnake.length; i++) {
        if (head.x === playerSnake[i].x && head.y === playerSnake[i].y) {
            declareWinner(playerNumber === 1 ? 2 : 1);
            return true;
        }
    }
    
    // Check for collision with other snake
    for (let segment of otherSnake) {
        if (head.x === segment.x && head.y === segment.y) {
            declareWinner(playerNumber === 1 ? 2 : 1);
            return true;
        }
    }
    
    // Check for poop collision
    for (let i = 0; i < poops.length; i++) {
        if (head.x === poops[i].x && head.y === poops[i].y) {
            // Apply penalty and play sound
            if (playerNumber === 1) {
                scoreP1 = Math.max(0, scoreP1 - 1000);
                updateScoreDisplays();
            } else {
                scoreP2 = Math.max(0, scoreP2 - 1000);
                updateScoreDisplays();
            }
            
            // Play yuck sound using SoundJS
            SOUNDS.play('yuck');
            
            // Remove the poop
            poops.splice(i, 1);
            return false; // Don't end the game, just apply penalty
        }
    }
    
    return false;
}

// Declare winner and end game
function declareWinner(winnerNumber) {
    clearInterval(gameInterval);
    gameRunning = false;
    winner = winnerNumber;
    
    // Play boom sound
    SOUNDS.play('boom');
    
    // Update winner display
    winnerDisplay.textContent = `Player ${winnerNumber} wins!`;
    
    // Draw game over screen with animation
    drawWinnerScreen(winnerNumber);
    
    // Change button text
    startButton.textContent = 'Play Again';
}

// Draw animated winner screen with huge text
function drawWinnerScreen(winnerNumber) {
    // Create semi-transparent background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const winnerColor = winnerNumber === 1 ? PLAYER1_COLOR : PLAYER2_COLOR;
    
    // Use much larger font for winner announcement
    const fontSize = Math.min(120, CANVAS_WIDTH / 10); // Scale font to screen width
    
    // Draw HUGE winner announcement
    ctx.fillStyle = winnerColor;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Center the text perfectly
    const winnerText = `PLAYER ${winnerNumber}`;
    ctx.fillText(winnerText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    
    // Add glow effect with multiple strokes
    ctx.strokeStyle = 'white';
    for (let i = 1; i <= 5; i++) {
        ctx.lineWidth = i * 2;
        ctx.strokeText(winnerText, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    }
    
    // Add score details in smaller text
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    
    // Position score display below the main announcement
    const scoreY = CANVAS_HEIGHT / 4 + fontSize + 20;
    
    // Display detailed score information
    ctx.fillText(`Player 1: ${scoreP1} points, ${caloriesP1} calories`, CANVAS_WIDTH / 2, scoreY);
    ctx.fillText(`Player 2: ${scoreP2} points, ${caloriesP2} calories`, CANVAS_WIDTH / 2, scoreY + 30);
    ctx.fillText(`Level Reached: ${currentLevel}`, CANVAS_WIDTH / 2, scoreY + 60);
    
    // Show nutritional message
    ctx.font = '16px Arial';
    const lowestCaloriesPlayer = caloriesP1 <= caloriesP2 ? 1 : 2;
    ctx.fillText(`Player ${lowestCaloriesPlayer} had the healthier diet with fewer calories!`, 
                CANVAS_WIDTH / 2, scoreY + 90);
}

// Draw game elements
function draw() {
    // Clear canvas with light background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw division line in middle
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    
    // Draw foods
    drawFoods();
    
    // Draw poops
    drawPoops();
    
    // Draw player 1 snake with thickness
    drawSnake(snakeP1, PLAYER1_COLOR, snakeThicknessP1);
    
    // Draw player 2 snake with thickness
    drawSnake(snakeP2, PLAYER2_COLOR, snakeThicknessP2);
    
    // Optional: Draw grid
    // drawGrid();
}

// Draw all poops on the canvas
function drawPoops() {
    poops.forEach(poop => {
        const x = poop.x * GRID_SIZE;
        const y = poop.y * GRID_SIZE;
        
        // Brown background for poop
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, GRID_SIZE - 1, GRID_SIZE - 1);
        
        // Draw poop emoji
        ctx.font = `${GRID_SIZE * 0.7}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText('💩', x + GRID_SIZE / 2, y + GRID_SIZE / 2);
    });
}

// Draw all food items with emojis
function drawFoods() {
    foods.forEach(foodItem => {
        const x = foodItem.x * GRID_SIZE;
        const y = foodItem.y * GRID_SIZE;
        
        // Draw food background based on type - made larger to fit doubled food
        if (foodItem.food.type === FOOD_TYPES.SWEET) {
            // Draw sweet foods with a pink background
            ctx.fillStyle = '#FF80AB';
        } else {
            // Draw healthy foods with a light green background
            ctx.fillStyle = '#C8E6C9';
        }
        
        // Expand the background to fit larger food and calories
        const extraSize = 6; // Extra pixels to expand background
        ctx.fillRect(x - extraSize/2, y - extraSize/2, GRID_SIZE + extraSize - 1, GRID_SIZE + extraSize - 1);
        
        // Draw food emoji - doubled size
        ctx.font = `${GRID_SIZE * 1.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        ctx.fillText(
            foodItem.food.emoji, 
            x + GRID_SIZE / 2, 
            y + GRID_SIZE / 2 - 4 // Adjusted position for larger emoji with calories below
        );
        
        // Draw calorie count with gray background
        const calorieText = `${foodItem.food.calories}`;
        // Prepare for doubled size calorie text
        ctx.font = `${GRID_SIZE * 0.7}px Arial`; // Doubled size for calorie text
        const calTextWidth = ctx.measureText(calorieText).width;
        
        // Draw gray background for calories - adjusted for larger text
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.fillRect(
            x + GRID_SIZE / 2 - calTextWidth/2, 
            y + GRID_SIZE / 2 + 4,
            calTextWidth * 1.1, 
            GRID_SIZE * 0.7 // Doubled height for calorie background
        );
        
        // Draw calorie count - doubled size
        ctx.fillStyle = '#000';
        ctx.fillText(
            calorieText, 
            x + GRID_SIZE / 2, 
            y + GRID_SIZE / 2 + 12 // Adjusted position below the emoji for larger text
        );
    });
}

// Draw a specific snake
function drawSnake(snake, headColor, thickness = 1.0) {
    if (snake.length === 0) return; // Skip if snake is empty
    
    // Calculate actual size based on thickness
    const size = (GRID_SIZE - 1) * thickness;
    
    // Draw each segment of the snake
    for (let i = 0; i < snake.length; i++) {
        // Calculate the offset to center the snake in the grid cell
        const offset = (GRID_SIZE - size) / 2;
        const x = snake[i].x * GRID_SIZE + offset;
        const y = snake[i].y * GRID_SIZE + offset;
        
        // Determine if segment is head, tail, or body
        if (i === 0) { // Head
            // Set the head color
            ctx.fillStyle = headColor;
            
            // Draw the head as a rounded rectangle
            drawRoundedRect(x, y, size, size, size / 3);
            
            // Draw eyes
            const eyeSize = size / 5;
            const eyeOffset = size / 3;
            ctx.fillStyle = '#fff';
            
            // Determine eye position based on direction
            const prevSegment = snake[1];
            const direction = getDirection(snake[0], prevSegment);
            
            let eyeX1, eyeY1, eyeX2, eyeY2;
            
            switch(direction) {
                case 'right':
                    eyeX1 = x + size - eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + size - eyeOffset;
                    eyeY2 = y + size - eyeOffset;
                    break;
                case 'left':
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + eyeOffset;
                    eyeY2 = y + size - eyeOffset;
                    break;
                case 'up':
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + eyeOffset;
                    eyeX2 = x + size - eyeOffset;
                    eyeY2 = y + eyeOffset;
                    break;
                case 'down':
                    eyeX1 = x + eyeOffset;
                    eyeY1 = y + size - eyeOffset;
                    eyeX2 = x + size - eyeOffset;
                    eyeY2 = y + size - eyeOffset;
                    break;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw pupils
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (i === snake.length - 1) { // Tail
            // Determine tail direction
            const prevSegment = snake[i - 1];
            const direction = getDirection(prevSegment, snake[i]);
            
            // Base tail color (lighter than body)
            const baseColor = headColor === PLAYER1_COLOR ? 
                {r: 76, g: 175, b: 80} : // Green base
                {r: 33, g: 150, b: 243};  // Blue base
            
            // Make tail lighter
            const r = Math.floor(baseColor.r + (255 - baseColor.r) * 0.5);
            const g = Math.floor(baseColor.g + (255 - baseColor.g) * 0.5);
            const b = Math.floor(baseColor.b + (255 - baseColor.b) * 0.5);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Draw a small triangle for the tail
            ctx.beginPath();
            
            switch(direction) {
                case 'right':
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + size);
                    ctx.lineTo(x + size, y + size / 2);
                    break;
                case 'left':
                    ctx.moveTo(x + size, y);
                    ctx.lineTo(x + size, y + size);
                    ctx.lineTo(x, y + size / 2);
                    break;
                case 'up':
                    ctx.moveTo(x, y + size);
                    ctx.lineTo(x + size, y + size);
                    ctx.lineTo(x + size / 2, y);
                    break;
                case 'down':
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + size, y);
                    ctx.lineTo(x + size / 2, y + size);
                    break;
            }
            
            ctx.closePath();
            ctx.fill();
            
        } else { // Body
            // Create gradient color for body segments
            const baseColor = headColor === PLAYER1_COLOR ? 
                {r: 76, g: 175, b: 80} : // Green base for Player 1
                {r: 33, g: 150, b: 243};  // Blue base for Player 2
            
            // Gradually fade color based on position
            const fadeFactor = Math.min(0.3, i * 0.02);
            const r = Math.floor(baseColor.r + (255 - baseColor.r) * fadeFactor);
            const g = Math.floor(baseColor.g + (255 - baseColor.g) * fadeFactor);
            const b = Math.floor(baseColor.b + (255 - baseColor.b) * fadeFactor);
            
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            // Determine if this is a corner or straight body segment
            const prev = snake[i - 1];
            const next = snake[i + 1];
            
            if (isCorner(prev, snake[i], next)) {
                // Draw a circle for corners
                ctx.beginPath();
                ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Draw a rounded rectangle for straight segments
                drawRoundedRect(x, y, size, size, size / 5);
            }
        }
    }
}

// Helper function to draw rounded rectangle
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Helper function to determine direction between two segments
function getDirection(segment1, segment2) {
    // For head: direction FROM segment2 TO segment1
    // For tail: direction FROM segment1 TO segment2
    if (segment1.x < segment2.x) return 'right';
    if (segment1.x > segment2.x) return 'left';
    if (segment1.y < segment2.y) return 'down';
    if (segment1.y > segment2.y) return 'up';
    return 'right'; // Default
}

// Helper function to check if a segment is a corner
function isCorner(prev, current, next) {
    return (prev.x !== next.x && prev.y !== next.y);
}

// Draw grid lines (optional)
function drawGrid() {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

// Initialize the game when the page loads
window.onload = function() {
    console.log('%c WINDOW LOADED ', 'background: #00a; color: #fff; font-size: 12px;');
    
    // Debug DOM state
    console.log('Initial DOM state:', {
        docReady: document.readyState,
        gameCanvas: document.getElementById('gameCanvas'),
        startButton: document.getElementById('startButton'),
        bodyChildren: document.body.childNodes.length
    });
    
    // Ensure all required objects are defined
    window.snakeGameDebug = {
        startAttempts: 0,
        initialized: false
    };
    
    // Add event listener for DOMContentLoaded as a backup
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOMContentLoaded fired - this is a backup initialization');
        if (!window.snakeGameDebug.initialized) {
            initializeGame();
        }
    });
    
    // Primary initialization path - only initialize, don't start the game
    initializeGame();
    
    // Make sure the game is not running initially
    gameRunning = false;
    clearInterval(gameInterval);
    
    // Draw initial welcome screen
    drawWelcomeScreen();
};

// Draw welcome screen with game instructions
function drawWelcomeScreen() {
    // Clear canvas with light background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw title text
    ctx.fillStyle = '#4CAF50'; // Green
    const fontSize = Math.min(60, CANVAS_WIDTH / 15);
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NUTRITIONAL SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    
    // Add glow effect to title
    ctx.strokeStyle = '#2196F3'; // Blue
    ctx.lineWidth = 2;
    ctx.strokeText('NUTRITIONAL SNAKE', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    
    // Draw instructions
    ctx.fillStyle = '#333';
    ctx.font = '18px Arial';
    ctx.fillText('Player 1: Use WASD keys', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);
    ctx.fillText('Player 2: Use Arrow keys', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
    ctx.fillText('Collect healthy food for points', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText('Avoid sweets and collisions', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.fillText('Press "E" key to drop poop (costs health)', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    ctx.fillText('Press Space to pause/resume the game', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
    ctx.fillText('Complete levels by collecting 10 fruits/vegetables', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);
    
    // Add start game prompt
    ctx.fillStyle = '#2196F3';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Press "Start Game" button or Space to begin!', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 3/4 + 30);
}

// Primary initialization function - only initialize the game, don't start it
function initializeGame() {
    console.log('Initializing game...');
    window.snakeGameDebug.startAttempts++;
    window.snakeGameDebug.initialized = true;
    
    try {
        // Initialize basic game components
        init();
        console.log('Init completed successfully');
        
        // Initialize canvas and event listeners but don't start the game
        console.log('Additional debug info:', {
            gameRunning,
            startButtonExists: !!document.getElementById('startButton'),
            canvasExists: !!document.getElementById('gameCanvas')
        });
        
        // Make sure game is initialized but not running
        gameRunning = false;
        winner = null;
        
        // Set up start button correctly (don't auto-start)
        const startBtn = document.getElementById('startButton');
        if (startBtn) {
            console.log('Setting up start button correctly...');
            startBtn.textContent = 'Start Game';
            
            // Remove any existing click listeners to avoid multiple bindings
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);
            
            // Add proper click listener
            newStartBtn.addEventListener('click', function() {
                if (!gameRunning || winner) {
                    startGame();
                } else {
                    togglePause();
                }
            });
        }
    } catch (e) {
        console.error('Critical error during initialization:', e);
        // Still initialize but don't start
        gameRunning = false;
    }
}

// Emergency initialization function - only setup, don't start the game
function forceGameStart() {
    console.log('%c EMERGENCY GAME INITIALIZATION ', 'background: #f00; color: #fff; font-size: 12px;');
    try {
        // Reset critical game elements but don't start
        gameRunning = false;
        isPaused = false;
        resetGame();
        snakeP1 = [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }];
        snakeP2 = [{ x: 20, y: 10 }, { x: 19, y: 10 }, { x: 18, y: 10 }];
        createInitialFoods();
        
        // Failsafe for canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                console.log('Canvas and context verified');
                // Clear canvas
                context.fillStyle = '#f8f9fa';
                context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                
                // Draw welcome screen
                drawWelcomeScreen();
            }
        }
        
        // Ensure game loop is not running
        if (gameInterval) clearInterval(gameInterval);
        
        // Update UI to reflect game is not running
        const startButton = document.getElementById('startButton');
        if (startButton) startButton.textContent = 'Start Game';
        
        console.log('%c EMERGENCY INIT COMPLETE ', 'background: #aa0; color: #fff; font-size: 12px;');
    } catch (e) {
        console.error('Critical error in emergency init:', e);
    }
}

// Add diagnostic function for console use
window.debugSnakeGame = function() {
    return {
        gameRunning,
        snakeP1,
        snakeP2,
        foods,
        canvas: document.getElementById('gameCanvas'),
        startButton: document.getElementById('startButton'),
        startGame: startGame,
        init: init
    };
};
