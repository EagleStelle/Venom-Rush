const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const sounds = {
    snakeDie: document.getElementById('snakeDieSound'),
    aiEat: document.getElementById('aiEatSound'),
    specialAIEat: document.getElementById('specialAIEatSound'),
    specialPlayerEat: document.getElementById('specialPlayerEatSound'),
    playerEat: document.getElementById('playerEatSound'),
    playerWin: document.getElementById('playerWinSound'),
    aiWin: document.getElementById('aiWinSound'),
    draw: document.getElementById('drawSound')
  };
const bgmArray = [
    document.getElementById('bgm1'),
    document.getElementById('bgm2'),
    document.getElementById('bgm3'),
    document.getElementById('bgm4')
];

let selectedBGM;
let isBgmPlaying = false; // Add this variable to track BGM state
toggleBGMCheckbox.checked = false;

function playRandomBGM() {
    if (selectedBGM) {
        selectedBGM.pause();  // Pause the current song if there is one
        selectedBGM.removeEventListener('ended', playRandomBGM);  // Remove the previous event listener
    }

    selectedBGM = bgmArray[Math.floor(Math.random() * bgmArray.length)];  // Select a random BGM
    selectedBGM.addEventListener('ended', playRandomBGM);  // Listen for the 'ended' event

    selectedBGM.volume = 0.5;

    selectedBGM.play();
    isBgmPlaying = true;
}

toggleBGMCheckbox.addEventListener('change', () => {
    if (toggleBGMCheckbox.checked) {
        playRandomBGM();  // Play a random BGM
    } else {
        selectedBGM.pause();
        isBgmPlaying = false;
    }
});

const cellSize = 20;
const gridSize = canvas.width / cellSize;
const initialSnakeLength = 1; // Initial snake length

const playerSnake = {
    x: Math.floor(Math.random() * gridSize), // Randomized Spawn
    y: Math.floor(Math.random() * gridSize), // Randomized Spawn
    direction: 'right',
    length: initialSnakeLength,
    tail: [],
    score: 0 // Initialize player's score
};

const aiSnake = {
    x: Math.floor(Math.random() * gridSize), // Randomized Spawn
    y: Math.floor(Math.random() * gridSize), // Randomized Spawn
    direction: 'left',
    length: initialSnakeLength,
    tail: [],
    score: 0 // Initialize AI's score
};

const maxFruits = 5; // Maximum number of fruits on the screen
const totalDuration = 90; // Total countdown duration
let remainingTime = 90; // duration of the timer
let fruits = []; // Array to store fruit positions
let gameSpeed = 75;
gameSpeedSlider.addEventListener('input', () => {
    const newSpeed = parseInt(gameSpeedSlider.value);
    gameSpeed = (150 - newSpeed) + 1; // Invert the speed because higher values mean slower speed
});

let gameOver = false; // Add this variable to track game over state
function endGame() {
    if (gameOver) {
        return; // Prevent multiple calls
    }

    gameOver = true; // Set game over state

    // Pause BGM when the game is over
    if (isBgmPlaying) {
        selectedBGM.pause();
        isBgmPlaying = false;
    }

    let winner;
    if (playerSnake.score > aiSnake.score) {
        winner = 'Player';
        playerWinSound.play(); // Play the player win sound
    } else if (aiSnake.score > playerSnake.score) {
        winner = 'AI';
        aiWinSound.play(); // Play the AI win sound
    } else {
        winner = 'It\'s a draw';
        drawSound.play(); // Play the draw sound
    }

    // Set the popup message
    document.getElementById('popupMessage').textContent = `Game Over! Time is up. ${winner} wins!`;

    // Show the popup overlay
    const popupOverlay = document.getElementById('popupOverlay');
    popupOverlay.style.display = 'flex';

    // Optionally, you can reset the game when the "Try Again" button is clicked
    document.getElementById('tryAgainButton').addEventListener('click', resetGame);
}

function resetGame() {
    gameOver = false; // Reset game over state

    // Hide the popup overlay
    const popupOverlay = document.getElementById('popupOverlay');
    popupOverlay.style.display = 'none';

    // Reset your game state and variables here
    remainingTime = totalDuration;
    resetSnake(playerSnake);
    playerSnake.score = 0;
    resetSnake(aiSnake);
    aiSnake.score = 0;

    // Resume BGM if it was playing before
    if (!isBgmPlaying && toggleBGMCheckbox.checked) {
        playRandomBGM();
        selectedBGM.play();
        isBgmPlaying = true;
    }

    // Start the game again
    update();
    updateTimer();
}

// Update the updateTimer function
function updateTimer() {
    if (gameOver) {
        return; // Stop updating the timer if the game is over
    }

    // Decrease remaining time
    remainingTime--;

    // Update the width of the countdown fill
    const countdownFill = document.getElementById('countdownFill');
    if (!countdownFill) {
        console.error('Error: countdownFill element not found.');
        return;
    }

    const fillWidth = (remainingTime / totalDuration) * 100;
    countdownFill.style.width = fillWidth + '%';

    // Check if time is up
    if (remainingTime < 0) {
        // End the game
        endGame();
        return; // Stop further processing
    }

    // Continue the update loop
    setTimeout(() => {
        requestAnimationFrame(() => updateTimer());
    }, 1000);
}

function getRandomDirection() {
    const directions = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
}

function randomFruitPosition() {
    while (fruits.length < maxFruits) {
        // Check if there's already a special fruit on the screen
        const hasSpecialFruit = fruits.some(fruit => fruit.isSpecial);

        // If there's no special fruit, generate one with a certain probability
        if (!hasSpecialFruit && Math.random() < 0.1) { // Adjust the probability
            let newFruit;

            // Generate a special fruit closer to the AI snake
            const proximityThreshold = 3; // Adjust this value for desired proximity
            const randomDirection = getRandomDirection();

            newFruit = {
                x: aiSnake.x,
                y: aiSnake.y,
                isSpecial: true,
            };

            // Move the special fruit away from the AI snake in a random direction
            for (let i = 0; i < proximityThreshold; i++) {
                switch (randomDirection) {
                    case 'up':
                        newFruit.y = (newFruit.y - 1 + gridSize) % gridSize;
                        break;
                    case 'down':
                        newFruit.y = (newFruit.y + 1) % gridSize;
                        break;
                    case 'left':
                        newFruit.x = (newFruit.x - 1 + gridSize) % gridSize;
                        break;
                    case 'right':
                        newFruit.x = (newFruit.x + 1) % gridSize;
                        break;
                }
            }

            // Check if the special fruit position overlaps with any snake
            const overlapWithPlayerSnake = (
                playerSnake.x === newFruit.x && playerSnake.y === newFruit.y
            );

            const overlapWithAISnake = fruits.some(fruit => (
                (fruit.x === newFruit.x && fruit.y === newFruit.y) ||
                aiSnake.tail.some(segment => segment.x === newFruit.x && segment.y === newFruit.y) ||
                playerSnake.tail.some(segment => segment.x === newFruit.x && segment.y === newFruit.y)
            ));

            if (!overlapWithPlayerSnake && !overlapWithAISnake) {
                fruits.push(newFruit);
            }
        } else {
            // Generate a regular fruit
            let newFruit;
            do {
                newFruit = {
                    x: Math.floor(Math.random() * gridSize),
                    y: Math.floor(Math.random() * gridSize),
                    isSpecial: false,
                };
            } while (
                aiSnake.tail.some(segment => segment.x === newFruit.x && segment.y === newFruit.y) ||
                playerSnake.tail.some(segment => segment.x === newFruit.x && segment.y === newFruit.y)
            );

            fruits.push(newFruit);
        }

        // Remove excess fruits if there are more than maxFruits
        if (fruits.length > maxFruits) {
            fruits.shift();
        }
    }
}


function drawFruits() {
    fruits.forEach(fruit => {
        ctx.fillStyle = fruit.isSpecial ? 'gold' : 'coral'; // Adjust color for special fruit
        ctx.fillRect(fruit.x * cellSize, fruit.y * cellSize, cellSize, cellSize);
    });
}

function drawSnake(snake, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < snake.tail.length; i++) {
        ctx.fillRect(snake.tail[i].x * cellSize, snake.tail[i].y * cellSize, cellSize, cellSize);
    }
    ctx.fillRect(snake.x * cellSize, snake.y * cellSize, cellSize, cellSize);
}

function resetSnake(snake) {
    snake.length = initialSnakeLength;
    snake.tail = [];
    
    // Ensure the snake doesn't respawn on a fruit
    do {
        snake.x = Math.floor(Math.random() * gridSize);
        snake.y = Math.floor(Math.random() * gridSize);
    } while (fruits.some(fruit => fruit.x === snake.x && fruit.y === snake.y));

    snake.score -= 10; // Decrease the score by 10 when the snake dies
    if (snake.score < 0) {
        snake.score = 0; // Ensure the score is not negative
    }
    snakeDieSound.play();
}

function checkCollision(snake) {
    // Check if the snake collided with the wall
    if (
        snake.x < 0 || snake.x >= gridSize ||
        snake.y < 0 || snake.y >= gridSize
    ) {
        resetSnake(snake);
        return;
    }

    // Check if the snake collided with itself
    for (let i = 0; i < snake.tail.length; i++) {
        if (snake.x === snake.tail[i].x && snake.y === snake.tail[i].y) {
            resetSnake(snake);
            return;
        }
    }

    // Check if the snake collided with the other snake's body
    const otherSnake = (snake === playerSnake) ? aiSnake : playerSnake;
    for (let i = 0; i < otherSnake.tail.length; i++) {
        if (snake.x === otherSnake.tail[i].x && snake.y === otherSnake.tail[i].y) {
            resetSnake(snake);
            return;
        }
    }

    // Check if the snake collided with the other snake's head
    if (snake === playerSnake && aiSnake.x === playerSnake.x && aiSnake.y === playerSnake.y) {
        resetSnake(playerSnake);
        return;
    } else if (snake === aiSnake && playerSnake.x === aiSnake.x && playerSnake.y === aiSnake.y) {
        resetSnake(aiSnake);
        return;
    }
}

// A* Pathfinding Algorithm
function findPath(start, end, avoidPositions, allowTeleport) {
    const grid = new Array(gridSize).fill(null).map(() => new Array(gridSize).fill(0));

    avoidPositions.forEach(({ x, y }) => {
        grid[y][x] = 1; // Mark occupied positions as obstacles
    });

    const openList = [];
    const closedList = [];

    const startNode = { x: start.x, y: start.y, g: 0, h: 0, f: 0, parent: null };
    openList.push(startNode);

    while (openList.length > 0) {
        let currentNode = openList[0];
        let currentIndex = 0;

        openList.forEach((node, index) => {
            if (node.f < currentNode.f) {
                currentNode = node;
                currentIndex = index;
            }
        });

        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        if (currentNode.x === end.x && currentNode.y === end.y) {
            const path = [];
            let current = currentNode;
            while (current !== null) {
                path.unshift({ x: current.x, y: current.y });
                current = current.parent;
            }
            return path;
        }

        const neighbors = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const neighborX = currentNode.x + i;
                const neighborY = currentNode.y + j;

                if (
                    (allowTeleport || (neighborX >= 0 && neighborX < gridSize && neighborY >= 0 && neighborY < gridSize)) &&
                    !grid[neighborY][neighborX] &&
                    !(i !== 0 && j !== 0) // Allow only horizontal and vertical movement, no diagonal
                ) {
                    neighbors.push({ x: neighborX, y: neighborY });
                }
            }
        }

        neighbors.forEach((neighbor) => {
            if (closedList.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                return;
            }

            const gScore = currentNode.g + 1;
            const alreadyInOpenList = openList.some((node) => node.x === neighbor.x && node.y === neighbor.y);

            if (!alreadyInOpenList || gScore < neighbor.g) {
                const neighborNode = {
                    x: neighbor.x,
                    y: neighbor.y,
                    g: gScore,
                    h: Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y),
                    f: gScore + Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y),
                    parent: currentNode,
                };

                if (!alreadyInOpenList) {
                    openList.push(neighborNode);
                }
            }
        });
    }

    // No path found
    return [];
}

function findClosestFruit(snake, fruits) {
    const avoidPositions = snake.tail.concat(playerSnake.tail, { x: playerSnake.x, y: playerSnake.y });
    let closestFruit = null;
    let shortestDistance = gridSize * 2; // Initialize to a value greater than possible distance

    fruits.forEach(fruit => {
        const fruitPath = findPath({ x: snake.x, y: snake.y }, fruit, avoidPositions);
        const isSpecial = fruit.isSpecial || false;

        // Adjust the weight based on whether it's a special fruit or not
        const distanceWeight = isSpecial ? 0.8 : 1.0;

        if (fruitPath.length * distanceWeight < shortestDistance) {
            // Check if the closest fruit is 1 cell away from the player snake's body
            const isOneCellAway = playerSnake.tail.some(segment => (
                Math.abs(segment.x - fruit.x) === 1 && segment.y === fruit.y
            )) || playerSnake.tail.some(segment => (
                Math.abs(segment.y - fruit.y) === 1 && segment.x === fruit.x
            ));

            if (!isOneCellAway) {
                closestFruit = { ...fruit, isSpecial };
                shortestDistance = fruitPath.length * distanceWeight;
            }
        }
    });

    return closestFruit;
}

function moveAISnake() {
    const avoidPositions = aiSnake.tail.concat(playerSnake.tail);

    // Check if AI snake is longer than player snake and both scores are larger
    if (aiSnake.length > playerSnake.length && aiSnake.score > playerSnake.score) {
        const playerHead = { x: playerSnake.x, y: playerSnake.y };
        const playerPath = findPath({ x: aiSnake.x, y: aiSnake.y }, playerHead, avoidPositions, false);

        // Check if there's a valid path to the player
        if (playerPath.length > 1) {
            const nextStep = playerPath[1];

            const dx = nextStep.x - aiSnake.x;
            const dy = nextStep.y - aiSnake.y;

            if (Math.abs(dx) >= Math.abs(dy)) {
                aiSnake.direction = dx > 0 ? 'right' : 'left';
            } else {
                aiSnake.direction = dy > 0 ? 'down' : 'up';
            }

            return; // Exit the function to prioritize pursuing the player
        }
    }

    // If no direct path to the player or conditions not met, then pursue the closest fruit
    const closestFruit = findClosestFruit(aiSnake, fruits);

    if (closestFruit) {
        const aiPath = findPath({ x: aiSnake.x, y: aiSnake.y }, closestFruit, avoidPositions, false);

        // Check if there's a valid path to the closest fruit
        if (aiPath.length > 1) {
            const nextStep = aiPath[1];

            const dx = nextStep.x - aiSnake.x;
            const dy = nextStep.y - aiSnake.y;

            if (Math.abs(dx) >= Math.abs(dy)) {
                aiSnake.direction = dx > 0 ? 'right' : 'left';
            } else {
                aiSnake.direction = dy > 0 ? 'down' : 'up';
            }
        }
    }
}


function update() {
    // Move player's snake
    switch (playerSnake.direction) {
        case 'up':
            playerSnake.y = (playerSnake.y - 1 + gridSize) % gridSize;
            break;
        case 'down':
            playerSnake.y = (playerSnake.y + 1) % gridSize;
            break;
        case 'left':
            playerSnake.x = (playerSnake.x - 1 + gridSize) % gridSize;
            break;
        case 'right':
            playerSnake.x = (playerSnake.x + 1) % gridSize;
            break;
    }

    // Move AI snake
    switch (aiSnake.direction) {
        case 'up':
            aiSnake.y = (aiSnake.y - 1 + gridSize) % gridSize;
            break;
        case 'down':
            aiSnake.y = (aiSnake.y + 1) % gridSize;
            break;
        case 'left':
            aiSnake.x = (aiSnake.x - 1 + gridSize) % gridSize;
            break;
        case 'right':
            aiSnake.x = (aiSnake.x + 1) % gridSize;
            break;
    }

    // Check for collisions
    checkCollision(playerSnake);
    checkCollision(aiSnake);

    moveAISnake(); // Call AI movement logic

    // Check if player's snake ate the fruit
    for (let i = 0; i < fruits.length; i++) {
        const fruit = fruits[i];
        if (playerSnake.x === fruit.x && playerSnake.y === fruit.y) {
            let scoreToAdd = fruit.isSpecial ? Math.floor(Math.random() * 4) + 2 : 1; // Score between 2 and 5 for special fruit
            playerSnake.length += scoreToAdd; // Adjust length based on the score
            playerSnake.score += scoreToAdd; // Adjust score based on the score
            fruits.splice(i, 1); // Remove the eaten fruit
            randomFruitPosition(); // Generate a new fruit
            if (fruit.isSpecial) {
                specialPlayerEatSound.play(); // Play the special fruit sound
            } else {
                playerEatSound.play();
            }
        }
    }

    // Check if AI snake ate the fruit
    for (let i = 0; i < fruits.length; i++) {
        const fruit = fruits[i];
        if (aiSnake.x === fruit.x && aiSnake.y === fruit.y) {
            let scoreToAdd = fruit.isSpecial ? Math.floor(Math.random() * 4) + 2 : 1; // Score between 2 and 5 for special fruit
            aiSnake.length += scoreToAdd; // Adjust length based on the score
            aiSnake.score += scoreToAdd; // Adjust score based on the score
            fruits.splice(i, 1); // Remove the eaten fruit
            randomFruitPosition(); // Generate a new fruit
            if (fruit.isSpecial) {
                specialAIEatSound.play(); // Play the special fruit sound
                specialAIEatSound.volume = 0.5;
            } else {
                aiEatSound.play();
            }
        }
    }

    // Update the player's snake tail
    playerSnake.tail.unshift({ x: playerSnake.x, y: playerSnake.y });
    if (playerSnake.tail.length > playerSnake.length) {
        playerSnake.tail.pop();
    }

    // Update AI snake tail
    aiSnake.tail.unshift({ x: aiSnake.x, y: aiSnake.y });
    if (aiSnake.tail.length > aiSnake.length) {
        aiSnake.tail.pop();
    }

    // Update and display scores
    document.getElementById('playerScore').textContent = `Player: ${playerSnake.score}`;
    document.getElementById('aiScore').textContent = `AI: ${aiSnake.score}`;

    // Redraw the game
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFruits();
    drawSnake(playerSnake, 'violet');
    drawSnake(aiSnake, 'pink');
    if (gameOver) {
        return; // Stop further processing if the game is over
    }
    setTimeout(() => {
        requestAnimationFrame(() => update());
    }, gameSpeed);
}


const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (keys['ArrowUp'] && playerSnake.direction !== 'down') {
        playerSnake.direction = 'up';
    } else if (keys['ArrowDown'] && playerSnake.direction !== 'up') {
        playerSnake.direction = 'down';
    } else if (keys['ArrowLeft'] && playerSnake.direction !== 'right') {
        playerSnake.direction = 'left';
    } else if (keys['ArrowRight'] && playerSnake.direction !== 'left') {
        playerSnake.direction = 'right';
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

const buttonsPressed = {};

document.getElementById('upButton').addEventListener('mousedown', () => {
    buttonsPressed['up'] = true;
    if (buttonsPressed['up'] && playerSnake.direction !== 'down') {
        playerSnake.direction = 'up';
    }
});

document.getElementById('downButton').addEventListener('mousedown', () => {
    buttonsPressed['down'] = true;
    if (buttonsPressed['down'] && playerSnake.direction !== 'up') {
        playerSnake.direction = 'down';
    }
});

document.getElementById('leftButton').addEventListener('mousedown', () => {
    buttonsPressed['left'] = true;
    if (buttonsPressed['left'] && playerSnake.direction !== 'right') {
        playerSnake.direction = 'left';
    }
});

document.getElementById('rightButton').addEventListener('mousedown', () => {
    buttonsPressed['right'] = true;
    if (buttonsPressed['right'] && playerSnake.direction !== 'left') {
        playerSnake.direction = 'right';
    }
});

// Add corresponding mouseup events to release the button
document.getElementById('upButton').addEventListener('mouseup', () => {
    buttonsPressed['up'] = false;
});

document.getElementById('downButton').addEventListener('mouseup', () => {
    buttonsPressed['down'] = false;
});

document.getElementById('leftButton').addEventListener('mouseup', () => {
    buttonsPressed['left'] = false;
});

document.getElementById('rightButton').addEventListener('mouseup', () => {
    buttonsPressed['right'] = false;
});

// Start the game with a random fruit
randomFruitPosition();
update();
updateTimer(); // Add this line to update the timer