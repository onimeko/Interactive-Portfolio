/*
  SNAKE GAME
  ==========
  I use a grid based game loop with keyboard and touch input, collision detection, random
  food placement, score tracking, a localStorage best score, pause, and restart states.
*/

(() => {
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const scoreEl = document.getElementById('snakeScore');
  const bestEl = document.getElementById('snakeBest');
  const startButton = document.getElementById('snakeStart');
  const pauseButton = document.getElementById('snakePause');

  // 24 by 24 cells on a 720px canvas gives 30px per cell.
  const GRID_COUNT = 24;
  const CELL = canvas.width / GRID_COUNT;
  const START_SPEED = 135; // milliseconds between movement steps

  let snake;
  let food;
  let direction;
  let nextDirection;
  let directionQueue;
  let score;
  let running = false;
  let paused = false;
  let gameOver = false;
  let stepDelay = START_SPEED;
  let lastStep = 0;

  let best = Number(localStorage.getItem('jadaSnakeBest') || 0);
  bestEl.textContent = best;

  function resetGame() {
    snake = [
      { x: 11, y: 12 },
      { x: 10, y: 12 },
      { x: 9, y: 12 },
    ];

    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    directionQueue = [];
    score = 0;
    stepDelay = START_SPEED;
    paused = false;
    running = true;
    gameOver = false;
    scoreEl.textContent = '0';
    pauseButton.textContent = 'Pause';
    placeFood();
  }

  function placeFood() {
    // Food placement retries until it finds an unoccupied cell.
    do {
      food = {
        x: Math.floor(Math.random() * GRID_COUNT),
        y: Math.floor(Math.random() * GRID_COUNT),
      };
    } while (snake?.some((segment) => segment.x === food.x && segment.y === food.y));
  }

  function setDirection(x, y) {
    /*
      I buffer up to two quick direction changes so a valid mobile tap is not lost between
      movement ticks. Each new turn is checked against the last queued direction to prevent
      an immediate reversal into the snake.
    */
    const reference = directionQueue.length
      ? directionQueue[directionQueue.length - 1]
      : direction;

    if (x === -reference.x && y === -reference.y) return;
    if (x === reference.x && y === reference.y) return;

    // Two buffered turns support quick cornering without building a long input backlog.
    if (directionQueue.length < 2) directionQueue.push({ x, y });
  }

  function step() {
    if (directionQueue.length) {
      nextDirection = directionQueue.shift();
    }
    direction = nextDirection;

    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitWall = head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT;
    const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
      running = false;
      gameOver = true;
      return;
    }

    snake.unshift(head);

    const ateFood = head.x === food.x && head.y === food.y;
    if (ateFood) {
      score += 10;
      scoreEl.textContent = score;
      stepDelay = Math.max(65, START_SPEED - score * 0.55); // speed up gradually
      placeFood();

      if (score > best) {
        best = score;
        bestEl.textContent = best;
        localStorage.setItem('jadaSnakeBest', String(best));
      }
    } else {
      snake.pop(); // remove the tail unless food was eaten
    }
  }

  function drawRoundedCell(x, y, size, radius) {
    const px = x * CELL + (CELL - size) / 2;
    const py = y * CELL + (CELL - size) / 2;
    ctx.beginPath();
    ctx.roundRect(px, py, size, size, radius);
    ctx.fill();
  }

  function draw() {
    // Draw background.
    ctx.fillStyle = '#081322';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines.
    ctx.strokeStyle = 'rgba(120, 200, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i += 1) {
      const p = i * CELL;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(canvas.width, p); ctx.stroke();
    }

    // Draw food glow.
    ctx.save();
    ctx.shadowColor = '#ffc85c';
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffc85c';
    drawRoundedCell(food.x, food.y, CELL * 0.48, CELL * 0.18);
    ctx.restore();

    // Draw snake body.
    snake.forEach((segment, index) => {
      ctx.save();
      ctx.fillStyle = index === 0 ? '#b9e7ff' : '#78c8ff';
      ctx.shadowColor = index === 0 ? '#b9e7ff' : '#78c8ff';
      ctx.shadowBlur = index === 0 ? 16 : 6;
      drawRoundedCell(segment.x, segment.y, CELL * 0.72, CELL * 0.22);
      ctx.restore();
    });

    if (!running || paused) {
      ctx.fillStyle = 'rgba(7, 17, 31, 0.64)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f7fbff';
      ctx.font = '800 48px system-ui';
      ctx.fillText(gameOver ? 'GAME OVER' : paused ? 'PAUSED' : 'SNAKE', canvas.width / 2, canvas.height / 2 - 12);

      ctx.fillStyle = '#b9c8d8';
      ctx.font = '700 20px system-ui';
      const status = gameOver ? `Score ${score}   ·   Best ${best}` : paused ? `Score ${score}   ·   Best ${best}` : `Best ${best}`;
      ctx.fillText(status, canvas.width / 2, canvas.height / 2 + 30);

      ctx.fillStyle = '#8fa6ba';
      ctx.font = '500 18px system-ui';
      ctx.fillText(gameOver ? 'Press R or Start / Restart' : paused ? 'Press P to continue' : 'Press Start / Restart', canvas.width / 2, canvas.height / 2 + 68);
    }
  }

  function loop(timestamp) {
    if (running && !paused && timestamp - lastStep >= stepDelay) {
      step();
      lastStep = timestamp;
    }

    draw();
    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseButton.textContent = paused ? 'Continue' : 'Pause';
  }

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (movementKeys.includes(key)) event.preventDefault();

    if (key === 'w' || key === 'arrowup') setDirection(0, -1);
    if (key === 's' || key === 'arrowdown') setDirection(0, 1);
    if (key === 'a' || key === 'arrowleft') setDirection(-1, 0);
    if (key === 'd' || key === 'arrowright') setDirection(1, 0);
    if (key === 'p') togglePause();
    if (key === 'r') resetGame();
  }, { passive: false });

  startButton.addEventListener('click', resetGame);
  pauseButton.addEventListener('click', togglePause);

  document.querySelectorAll('[data-snake-dir]').forEach((button) => {
    const chooseDirection = (event) => {
      event.preventDefault();
      const dir = button.dataset.snakeDir;
      if (dir === 'up') setDirection(0, -1);
      if (dir === 'down') setDirection(0, 1);
      if (dir === 'left') setDirection(-1, 0);
      if (dir === 'right') setDirection(1, 0);
    };

    // Pointer events provide immediate touch input on modern mobile browsers.
    if (window.PointerEvent) {
      button.addEventListener('pointerdown', chooseDirection, { passive: false });
    } else {
      // Touch event fallback for older mobile browsers.
      button.addEventListener('touchstart', chooseDirection, { passive: false });
    }

    // Keyboard activation remains available for the touch control buttons.
    button.addEventListener('click', (event) => {
      if (event.detail === 0) chooseDirection(event);
    });
  });

  // Draw the initial board before the first start.
  resetGame();
  running = false;
  requestAnimationFrame(loop);
})();
