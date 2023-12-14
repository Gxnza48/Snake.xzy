document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const backgroundImage = new Image();
    backgroundImage.src = 'grass_background.png';

    const gridSize = 20;
    let snakeSize = 1; // Tamaño inicial de la serpiente
    let foodSize = gridSize; // Tamaño de la manzana normal
    const powerUpSize = 40; // Puedes ajustar este valor según tus preferencias

    let snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
    let food = { x: 0, y: 0 };
    let powerUps = [];
    let direction = 'RIGHT';
    let snakeSpeed = 100;
    let canChangeDirection = true;
    let gameOver = false;
    let isPaused = false;
    let score = 0;
    let startTime;

    const overlay = document.getElementById('overlay');
    const playAgainButton = document.getElementById('play-again');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time-display');

    playAgainButton.addEventListener('click', () => {
        resetGame();
        overlay.style.display = 'none';
        requestAnimationFrame(gameLoop);
    });

    let lastTime;

    const powerUpImages = {
        1: 'images/cherry.png',
        2: 'images/lemon.png',
        3: 'images/blueberry.png',
    };

    function update() {
        if (!gameOver && !isPaused) {
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            moveSnake(deltaTime);
            checkCollision();
            draw();
            canChangeDirection = true;

            if (!startTime) {
                startTime = currentTime;
            }

            const elapsedTime = Math.floor((currentTime - startTime) / 1000);
            timeDisplay.textContent = elapsedTime;

            requestAnimationFrame(update);
        }
    }

    function drawSnake() {
        snake.forEach(segment => {
            ctx.fillStyle = '#9400D3'; // Color violeta
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        });
    }

    function drawFood() {
        ctx.fillStyle = '#FF0000'; // Color rojo
        ctx.fillRect(food.x, food.y, foodSize, foodSize);
    }

    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            const img = new Image();
            img.src = powerUpImages[powerUp.type];
            ctx.drawImage(img, powerUp.x, powerUp.y, powerUpSize, powerUpSize);
        });
    }

    function drawGrid() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawGrid();
        drawSnake();
        drawFood();
        drawPowerUps();
    }

    function moveSnake(deltaTime) {
        let x = snake[0].x;
        let y = snake[0].y;
      
        if (direction === 'RIGHT') x += snakeSpeed * deltaTime;
        if (direction === 'LEFT') x -= snakeSpeed * deltaTime;
        if (direction === 'UP') y -= snakeSpeed * deltaTime;
        if (direction === 'DOWN') y += snakeSpeed * deltaTime;
      
        // Verificar colisión con los bordes
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
          gameOver = true;
          showGameOverOverlay();
          return;
        }
      
        snake.unshift({ x, y });
      
        if (Math.abs(x - food.x) < gridSize && Math.abs(y - food.y) < gridSize) {
          generateFood();
          generatePowerUp();
          score++;
          scoreDisplay.textContent = score;
        } else {
          snake.pop();
        }
      
        checkPowerUps();
      }

    function generateFood() {
        const maxX = Math.floor(canvas.width / gridSize);
        const maxY = Math.floor(canvas.height / gridSize);

        food.x = Math.floor(Math.random() * maxX) * gridSize;
        food.y = Math.floor(Math.random() * maxY) * gridSize;

        // Cambiar el tamaño de la manzana (ajusta el valor según tus preferencias)
        foodSize = gridSize;
    }

    function generatePowerUp() {
        const random = Math.random();
        let powerUpType;

        if (random < 0.4) {
            powerUpType = 1; // Duplicación
        } else if (random < 0.85) {
            powerUpType = 2; // Velocidad
        } else {
            powerUpType = 3; // Lentitud
        }

        const maxX = Math.floor((canvas.width - powerUpSize) / gridSize);
        const maxY = Math.floor((canvas.height - powerUpSize) / gridSize);

        const powerUp = {
            x: Math.floor(Math.random() * maxX) * gridSize,
            y: Math.floor(Math.random() * maxY) * gridSize,
            type: powerUpType,
        };

        powerUps.push(powerUp);
    }

    function checkPowerUps() {
        for (let i = powerUps.length - 1; i >= 0; i--) {
            const powerUp = powerUps[i];
            if (
                snake[0].x < powerUp.x + powerUpSize &&
                snake[0].x + gridSize > powerUp.x &&
                snake[0].y < powerUp.y + powerUpSize &&
                snake[0].y + gridSize > powerUp.y
            ) {
                applyPowerUp(powerUp.type);
                powerUps.splice(i, 1);
            }
        }
    }

    function applyPowerUp(type) {
        switch (type) {
            case 1:
                snake.push(...Array.from({ length: 3 }, () => ({ x: -100, y: -100 })));
                break;
            case 2:
                increaseSpeed();
                break;
            case 3:
                decreaseSpeed();
                break;
        }
    }

    function increaseSpeed() {
        snakeSpeed += 10;
    }

    function decreaseSpeed() {
        snakeSpeed -= 10;
        if (snakeSpeed < 10) snakeSpeed = 10; // Asegurar que no sea menor que 10
    }

    function checkCollision() {
        const head = snake[0];

        if (
            head.x < 0 ||
            head.x >= canvas.width ||
            head.y < 0 ||
            head.y >= canvas.height ||
            collisionWithItself()
        ) {
            gameOver = true;
            showGameOverOverlay();
        }
    }

    function collisionWithItself() {
        const head = snake[0];
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    function showGameOverOverlay() {
        overlay.style.display = 'flex';
        document.getElementById('finalTime').textContent = timeDisplay.textContent;
    }

    function resetGame() {
        snake = [{ x: canvas.width / 2, y: canvas.height / 2 }];
        powerUps = [];
        direction = 'RIGHT';
        snakeSpeed = 100;
        canChangeDirection = true;
        gameOver = false;
        isPaused = false;
        score = 0;
        scoreDisplay.textContent = score;
        startTime = undefined;
        timeDisplay.textContent = '0';
        generateFood();
    }

    function gameLoop() {
        lastTime = Date.now();
        requestAnimationFrame(update);
    }

    function onKeyDown(event) {
        if (canChangeDirection) {
            switch (event.key) {
                case 'w':
                    if (direction !== 'DOWN') {
                        direction = 'UP';
                    }
                    break;
                case 'a':
                    if (direction !== 'RIGHT') {
                        direction = 'LEFT';
                    }
                    break;
                case 's':
                    if (direction !== 'UP') {
                        direction = 'DOWN';
                    }
                    break;
                case 'd':
                    if (direction !== 'LEFT') {
                        direction = 'RIGHT';
                    }
                    break;
                case 'Escape':
                    pauseGame();
                    break;
            }
            canChangeDirection = false;
        }
    }

    function pauseGame() {
        if (!gameOver) {
            isPaused = !isPaused;
            overlay.style.display = isPaused ? 'flex' : 'none';
        }
    }

    canvas.addEventListener('click', function (event) {
        if (gameOver && !isPaused) {
            const clickX = event.clientX - canvas.getBoundingClientRect().left;
            const clickY = event.clientY - canvas.getBoundingClientRect().top;

            if (
                clickX >= 0 &&
                clickX <= canvas.width &&
                clickY >= 0 &&
                clickY <= canvas.height
            ) {
                resetGame();
                overlay.style.display = 'none';
                requestAnimationFrame(gameLoop);
            }
        }
    });

    generateFood();
    gameLoop();

    document.addEventListener('keydown', onKeyDown);
});
