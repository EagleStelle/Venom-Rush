// Select the canvas and set up context
const canvas = document.querySelector('.game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 700;
canvas.height = 700;

// Cell size and initial position of the player snake
const cellSize = 20;
const playerSnake = {
    x: 10,
    y: 10,
    direction: 'right',
    tail: [{ x: 10, y: 10 }]
};

// Draw the player snake on the canvas
function drawPlayer() {
    ctx.fillStyle = 'white';
    playerSnake.tail.forEach(segment => {
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    });
}

// Update player position based on direction with boundary wrapping
function updatePlayerPosition() {
    const head = { ...playerSnake.tail[0] };

    // Move head in the direction of the snake
    switch (playerSnake.direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }

    // Implement boundary wrapping
    if (head.x < 0) head.x = canvas.width / cellSize - 1;
    if (head.x >= canvas.width / cellSize) head.x = 0;
    if (head.y < 0) head.y = canvas.height / cellSize - 1;
    if (head.y >= canvas.height / cellSize) head.y = 0;

    // Add new head position to the front of the tail array
    playerSnake.tail.unshift(head);
    playerSnake.tail.pop(); // Keep only one cell for now (initial length of 1)
}

// Handle keyboard input to control the snake
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp': if (playerSnake.direction !== 'down') playerSnake.direction = 'up'; break;
        case 'ArrowDown': if (playerSnake.direction !== 'up') playerSnake.direction = 'down'; break;
        case 'ArrowLeft': if (playerSnake.direction !== 'right') playerSnake.direction = 'left'; break;
        case 'ArrowRight': if (playerSnake.direction !== 'left') playerSnake.direction = 'right'; break;
    }
});

// Initial snake speed in milliseconds
let baseSpeed = 50;

// Main game loop with variable snake speed
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    updatePlayerPosition();
    drawPlayer();

    // Adjust snake speed based on length (slows down as it gets longer)
    snakeSpeed = baseSpeed + playerSnake.tail.length * 10; // Increase delay with length

    // Call gameLoop again with the updated snake speed
    setTimeout(gameLoop, snakeSpeed);
}

// Start the game loop on load
window.onload = gameLoop;
