# Nutritional Snake Game

A competitive two-player Snake game with nutritional themes implemented in JavaScript, HTML, and CSS.

## Features

- Two-player competitive gameplay on a single keyboard
- Distinct colored snakes for each player (green and blue)
- Nutritional gameplay with different food types and effects
- Calorie and score tracking for each player
- Different food types: vegetables, fruits, and sweets with unique effects
- Multiple levels with increasing difficulty and speed
- Sound effects using CreateJS SoundJS library
- Strategic poop dropping mechanics
- Visual feedback with screen blinking effects
- Responsive design with clean, compact UI

## How to Play

1. Open `index.html` in your web browser
2. Click "Start Game" to begin
3. **Player 1 Controls** (Green Snake - Left side):
   - W: Move up
   - S: Move down
   - A: Move left
   - D: Move right
4. **Player 2 Controls** (Blue Snake - Right side):
   - ↑ (Up Arrow): Move up
   - ↓ (Down Arrow): Move down
   - ← (Left Arrow): Move left
   - → (Right Arrow): Move right
5. Space key functions:
   - Before game starts: Start the game
   - During gameplay: Drop poop behind the snake that last moved
   - Press multiple times to drop more poop
6. Press 'P' to pause/resume the game
7. Eat different foods for various effects:
   - 🥬 Vegetables: Low calories, high points (with "Yummy" sound)
   - 🍎 Fruits: Medium calories, medium points (with "Smack" sound)
   - 🍰 Sweets: High calories, negative points (with "Burp" sound)
8. The last player standing wins, or the player with the highest score!

## Game Rules

- If a player crashes into a wall, their own body, or the other player's snake, they lose
- Eating food affects your snake in different ways:
  - Vegetables: Good nutritional value, high points, grow longer
  - Fruits: Moderate nutritional value, moderate points, grow longer
  - Sweets: Bad nutritional value, negative points, slow down, fatten, and shorten your snake
- Poops can be strategically placed on the game field:
  - Press space to drop poop behind your snake (reduces snake length)
  - Players who hit poop lose points and shrink
  - Using space multiple times drops multiple poops
- Automatic level progression occurs after collecting 10 vegetables or fruits
  - Each level increases snake speeds and game difficulty
  - Screen blinks once when eating food and three times when advancing to a new level
- The surviving player is declared the winner, or the player with the highest score if time runs out

## Technical Details

- Canvas-based rendering for smooth graphics
- Responsive design with CSS for a compact, visible UI
- Game state management in JavaScript
- Collision detection between multiple game entities
- Sound management with CreateJS SoundJS library
- Visual feedback with CSS animations for blinking effects
- Dynamically adjusting difficulty with speed multipliers
- Color gradients for snake bodies
- Efficient game loop with adaptive timing

## Features Implemented

- ✅ Multiple food types with nutritional theme
- ✅ Sound effects for different game actions
- ✅ Progressive difficulty with multiple levels
- ✅ Strategic gameplay with poop dropping mechanic
- ✅ Visual feedback with blinking effects
- ✅ Compact UI with better visibility

## Possible Future Improvements

- Add power-ups like temporary invincibility or speed boosts
- Implement mobile touch controls for mobile play
- Add background music with volume controls
- Create an AI opponent for single-player mode
- Add online multiplayer support through WebSockets
- Implement customizable snake skins and game themes
