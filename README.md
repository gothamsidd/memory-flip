# Memory Flip 🧠

A fun and interactive memory card matching game built with vanilla JavaScript. Match pairs of cards to test your memory skills!

## What's This?

I built this game to practice my JavaScript and DOM manipulation skills. It's a classic memory game where you flip cards to find matching pairs. The goal is to match all pairs in the least amount of moves and time possible.

## Features

- **Three Difficulty Levels**: Easy (4x4), Medium (4x5), and Hard (5x6) grids
- **Multiple Themes**: Choose from Gaming, Sports, Animals, Food, or Nature emoji sets
- **Progress Tracking**: Visual progress bar shows how close you are to completing the game
- **High Scores**: Best time and best moves are saved per difficulty level
- **Statistics**: Track your games played, wins, win rate, and total moves
- **Dark Mode**: Toggle between light and dark themes (your preference is saved)
- **Confetti Celebration**: Get a fun confetti animation when you win!
- **Responsive Design**: Works great on desktop, tablet, and mobile devices

## How to Play

1. Select your difficulty level and theme
2. Click on cards to flip them over
3. Try to remember where each card is
4. Match pairs by clicking two cards with the same emoji
5. Complete the game by matching all pairs!

## Getting Started

Just open `index.html` in your browser. No build process or dependencies needed - it's pure vanilla JavaScript, HTML, and CSS.

If you want to run it locally with a server:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## Project Structure

```
memory flip/
├── index.html      # Main HTML structure
├── styles.css      # All the styling and animations
├── script.js       # Game logic and functionality
└── README.md       # This file
```

## Technical Details

This project uses:
- **Vanilla JavaScript** (ES6+) - no frameworks or libraries
- **CSS3** for animations and responsive design
- **HTML5** Canvas API for the confetti effect
- **LocalStorage** to persist high scores and statistics
- **CSS Grid** for the card layout
- **CSS Custom Properties** for theming

## What I Learned

Building this helped me practice:
- DOM manipulation and event handling
- State management in vanilla JavaScript
- CSS animations and transitions
- LocalStorage API for data persistence
- Canvas API for custom animations
- Responsive design principles
- Code organization and structure

## Future Ideas

Some things I might add later:
- Sound effects for card flips and matches
- More difficulty levels
- Timer countdown mode
- Multiplayer support
- Leaderboard system
- More card themes

## License

Feel free to use this code for learning purposes or as a starting point for your own projects!

---

Enjoy the game! 🎮
