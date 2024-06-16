const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 50;
const canvasWidth = 800;
const canvasHeight = 1000;
const imagePaths = Array.from({ length: 6 }, (_, i) => `${i}.png`);

const images = {};
const sounds = {
    start: new Audio('start.mp3'),
    eat: new Audio('eat.mp3'),
    gameOver: new Audio('gameover.mp3'),
    point: new Audio('point.mp3'),
    superpoint: new Audio('superpoint.mp3'),
    selfeat: new Audio('selfeat.mp3'),
    selfeat2: new Audio('selfeat2.mp3'),
    selfeat3: new Audio('selfeat3.mp3'),
};
const foodImage = new Image();
foodImage.src = "food.png";
const enemyImage = new Image();
enemyImage.src = "enemy.png";

let snake = [{ x: canvasWidth / 2, y: canvasHeight / 2 }];
let direction = { x: 0, y: 0 };
let food = spawnFood();
let enemy = null;
let points = 0;
let gameInterval;

document.addEventListener("keydown", changeDirection);

function preloadImages(paths, callback) {
    let loadedImages = 0;
    paths.forEach((path, index) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            images[index] = img;
            loadedImages++;
            if (loadedImages === paths.length) {
                callback();
            }
        };
    });
    foodImage.onload = callback;
    enemyImage.onload = callback;
}

function gameLoop() {
    if (isGameOver()) {
        clearInterval(gameInterval);
        const random = Math.random();

        if (random < 0.3) {
            sounds.selfeat.play();
        } else if (random < 0.6) {
            sounds.selfeat2.play();
        } else {
            sounds.selfeat3.play();
        }

        alert("Game Over");
        resetGame();
    } else {
        clearCanvas();
        moveSnake();
        drawSnake();
        drawFood();
        if (enemy) drawEnemy();
    }
}

function isGameOver() {
    const head = snake[0];
    // Check if head is out of canvas bounds
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        return true;
    }
    // Check if head collides with any part of the snake except the immediate next segment
    for (let i = 1; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    snake = [{ x: canvasWidth / 2, y: canvasHeight / 2 }];
    direction = { x: 0, y: 0 };
    food = spawnFood();
    enemy = null;
    points = 0;
    updateTitle();
    gameInterval = setInterval(gameLoop, 100);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x * tileSize, y: snake[0].y + direction.y * tileSize };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {

        food = spawnFood();
        enemy = null;  // Remove enemy when food is eaten
        points++;
        updateTitle();
        if (points % 20 === 0) {
            sounds.superpoint.play();
        }
        else if (points % 10 === 0) {
            sounds.point.play();
        } else {
            sounds.eat.play();

        }
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const img = images[index % imagePaths.length];
        ctx.drawImage(img, segment.x, segment.y, tileSize, tileSize);
    });
}

function drawFood() {
    ctx.drawImage(foodImage, food.x, food.y, tileSize, tileSize);
}

function drawEnemy() {
    if (enemy) {
        ctx.drawImage(enemyImage, enemy.x, enemy.y, tileSize, tileSize);
    }
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const goingUp = direction.y === -1;
    const goingDown = direction.y === 1;
    const goingRight = direction.x === 1;
    const goingLeft = direction.x === -1;

    if (keyPressed === 37 && !goingRight) {
        direction = { x: -1, y: 0 };
    }
    if (keyPressed === 38 && !goingDown) {
        direction = { x: 0, y: -1 };
    }
    if (keyPressed === 39 && !goingLeft) {
        direction = { x: 1, y: 0 };
    }
    if (keyPressed === 40 && !goingUp) {
        direction = { x: 0, y: 1 };
    }
}

function spawnFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * canvasWidth / tileSize) * tileSize;
        foodY = Math.floor(Math.random() * canvasHeight / tileSize) * tileSize;
    } while (isFoodOnSnake(foodX, foodY));

    return { x: foodX, y: foodY };
}

function isFoodOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function spawnEnemy() {
    let enemyX, enemyY;
    do {
        enemyX = Math.floor(Math.random() * canvasWidth / tileSize) * tileSize;
        enemyY = Math.floor(Math.random() * canvasHeight / tileSize) * tileSize;
    } while (isFoodOnSnake(enemyX, enemyY));

    return { x: enemyX, y: enemyY };
}

function updateTitle() {
    document.title = `Snake Game - Points: ${points}`;
}

preloadImages(imagePaths.concat(['food.png', 'enemy.png']), () => {
    sounds.start.play();
    gameInterval = setInterval(gameLoop, 100);
});
